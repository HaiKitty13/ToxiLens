import torch

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification
)

from app.config import settings
from app.utils import prepare_input

class ModelService:

    def __init__(self):
        self.device = self._get_device()

        # Cache model dan tokenizer
        self.models = {}
        self.tokenizers = {}

        self.stage2_labels = [
            "insults",
            "identity_attack",
            "threat_incitement_to_violence",
            "profanity_obscenity",
            "sexually_explicit"
        ]

    def _get_device(self):
        if settings.MODEL_DEVICE == "cpu":
            return torch.device("cpu")

        if settings.MODEL_DEVICE == "cuda":
            if not torch.cuda.is_available():
                raise RuntimeError(
                    "CUDA diminta, tetapi GPU tidak tersedia."
                )

            return torch.device("cuda")

        # Auto device
        if torch.cuda.is_available():
            return torch.device("cuda")

        return torch.device("cpu")

    def _get_model_id(self, model_key: str):
        model_ids = settings.MODEL_IDS

        if model_key not in model_ids:
            raise ValueError(
                f"Model key tidak dikenal: {model_key}"
            )

        return model_ids[model_key]
    
    def _get_model_key(
        self,
        mode: str,
        stage: int,
        model_family: str = "indobertweet"
    ):
        valid_families = ["indobertweet", "nusabert"]

        valid_modes = [
            "text_only",
            "metadata_full",
            "metadata"
        ]

        if model_family not in valid_families:
            raise ValueError(
                f"Model family tidak dikenal: {model_family}"
            )

        if mode not in valid_modes:
            raise ValueError(f"Mode tidak dikenal: {mode}")

        if model_family == "indobertweet":
            return f"{mode}_s{stage}"

        return f"nusabert_{mode}_s{stage}"

    def load_model(self, model_key: str):
        """
        Load model hanya ketika diperlukan.
        Model yang sudah dimuat akan disimpan di cache.
        """

        if model_key in self.models:
            return (
                self.models[model_key],
                self.tokenizers[model_key]
            )

        model_id = self._get_model_id(model_key)

        print(f"Loading model: {model_id}")

        tokenizer = AutoTokenizer.from_pretrained(
            model_id,
            token=settings.HF_TOKEN or None
        )

        model = AutoModelForSequenceClassification.from_pretrained(
            model_id,
            token=settings.HF_TOKEN or None
        )

        model.to(self.device)
        model.eval()

        self.tokenizers[model_key] = tokenizer
        self.models[model_key] = model

        print(f"Model loaded successfully: {model_id}")
        print(f"Device: {self.device}")

        return model, tokenizer

    def _get_input_text(
        self,
        text: str,
        mode: str,
        metadata=None
    ):
        """
        Melakukan preprocessing sesuai mode.

        Text-only:
            (processed_text, None)

        Metadata:
            (metadata_text, processed_text)
        """

        return prepare_input(
            text=text,
            mode=mode,
            metadata=metadata
        )

    def _prepare_tokens(
        self,
        tokenizer,
        first_input: str,
        second_input: str = None,
        mode: str = "text_only"
    ):
        """
        Tokenisasi input.

        Text-only:
            tokenizer(processed_text)

        Metadata:
            tokenizer(metadata_text, processed_text)
        """

        if mode == "text_only":

            tokens = tokenizer(
                first_input,
                padding="max_length",
                truncation=True,
                max_length=settings.MAX_LENGTH,
                return_tensors="pt"
            )

        elif mode == "metadata" or mode == "metadata_full":

            if second_input is None:
                raise ValueError(
                    "Text kedua wajib diisi untuk mode metadata."
                )

            tokens = tokenizer(
                first_input,
                second_input,
                padding="max_length",
                truncation="only_second",
                max_length=settings.MAX_LENGTH,
                return_tensors="pt"
            )

        else:
            raise ValueError(
                f"Mode tidak dikenal: {mode}"
            )

        return {
            key: value.to(self.device)
            for key, value in tokens.items()
        }

    def _tokenize(
        self,
        tokenizer,
        text: str,
        mode: str,
        metadata=None
    ):
        """
        Preprocessing + tokenisasi dalam satu fungsi.
        """

        first_input, second_input = self._get_input_text(
            text=text,
            mode=mode,
            metadata=metadata
        )

        return self._prepare_tokens(
            tokenizer=tokenizer,
            first_input=first_input,
            second_input=second_input,
            mode=mode
        )

    @torch.inference_mode()
    def predict_stage1(
        self,
        text: str,
        mode: str,
        metadata=None,
        model_family: str = "indobertweet"
    ):
        """
        Stage 1:
        Binary classification:
        non-toxic vs toxic.
        """

        model_key = self._get_model_key(
            mode,
            1,
            model_family
        )

        model, tokenizer = self.load_model(model_key)

        tokens = self._tokenize(
            tokenizer=tokenizer,
            text=text,
            mode=mode,
            metadata=metadata
        )

        outputs = model(**tokens)

        probabilities = torch.softmax(
            outputs.logits,
            dim=-1
        )[0]

        toxic_index = settings.TOXIC_LABEL_INDEX
        non_toxic_index = 1 - toxic_index

        if len(probabilities) != 2:
            raise ValueError(
                "Stage 1 harus memiliki tepat 2 output."
            )

        if toxic_index not in [0, 1]:
            raise ValueError(
                "TOXIC_LABEL_INDEX harus bernilai 0 atau 1."
            )

        toxic_probability = probabilities[toxic_index].item()

        prediction = (
            "toxic"
            if toxic_probability >= 0.5
            else "non-toxic"
        )

        confidence_index = (
            toxic_index
            if prediction == "toxic"
            else non_toxic_index
        )

        return {
            "prediction": prediction,
            "confidence": float(
                probabilities[confidence_index].item()
            ),
            "probabilities": {
                "non_toxic": float(
                    probabilities[non_toxic_index].item()
                ),
                "toxic": float(toxic_probability)
            }
        }

    @torch.inference_mode()
    def predict_stage2(
        self,
        text: str,
        mode: str,
        metadata=None,
        model_family: str = "indobertweet"
    ):
        """
        Stage 2:
        Multi-label classification.
        Menggunakan sigmoid untuk setiap kategori.
        """

        model_key = self._get_model_key(
            mode,
            2,
            model_family
        )

        model, tokenizer = self.load_model(model_key)

        tokens = self._tokenize(
            tokenizer=tokenizer,
            text=text,
            mode=mode,
            metadata=metadata
        )

        outputs = model(**tokens)

        probabilities = torch.sigmoid(
            outputs.logits
        )[0]

        if len(probabilities) != len(self.stage2_labels):
            raise ValueError(
                "Jumlah output Stage 2 tidak sama dengan jumlah label. "
                f"Output model: {len(probabilities)}, "
                f"label: {len(self.stage2_labels)}."
            )

        probability_result = {}
        predictions = []

        for index, label in enumerate(self.stage2_labels):

            probability = float(
                probabilities[index].item()
            )

            probability_result[label] = probability

            if probability >= settings.STAGE2_THRESHOLD:
                predictions.append(label)

        return {
            "predictions": predictions,
            "probabilities": probability_result
        }

    def predict(
        self,
        text: str,
        mode: str,
        metadata=None,
        model_family: str = "indobertweet"
    ):

        valid_families = ["indobertweet", "nusabert"]

        valid_modes = [
            "text_only",
            "metadata",
            "metadata_full"
        ]

        if model_family not in valid_families:
            raise ValueError(
                f"Model family tidak dikenal: {model_family}"
            )

        if mode not in valid_modes:
            raise ValueError(
                f"Mode predict tidak dikenal: {mode}"
            )

        if mode in ["metadata", "metadata_full"] and metadata is None:
            raise ValueError(
                "Metadata wajib diisi untuk mode metadata."
            )

        # Stage 1
        stage1_result = self.predict_stage1(
            text=text,
            mode=mode,
            metadata=metadata,
            model_family=model_family
        )

        # Jika non-toxic, Stage 2 tidak dijalankan
        if stage1_result["prediction"] == "non-toxic":
            return {
                "stage1": stage1_result,
                "stage2": None
            }

        # Jika toxic, lanjut Stage 2
        stage2_result = self.predict_stage2(
            text=text,
            mode=mode,
            metadata=metadata,
            model_family=model_family
        )

        return {
            "stage1": stage1_result,
            "stage2": stage2_result
        }

# Satu instance service untuk digunakan oleh API
model_service = ModelService()
