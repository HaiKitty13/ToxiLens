
import html
import re
import emoji

from app.schemas import AnnotatorMetadata

EMOJI_LANG = "id"

EMOTICON_DICT = {
    ":)": "senyum",
    ":-)": "senyum",
    "(:": "senyum",
    ":]": "senyum",
    "=)": "senyum",
    ":d": "tertawa",
    ":-d": "tertawa",
    "xd": "tertawa",
    "wkwk": "tertawa",
    ":(": "sedih",
    ":-(": "sedih",
    "):": "sedih",
    ":'(": "menangis",
    ";)": "berkedip",
    ";-)": "berkedip",
    ":p": "menjulurkan lidah",
    ":-p": "menjulurkan lidah",
    ":o": "terkejut",
    ":-o": "terkejut",
    ":/": "ragu",
    ":-/": "ragu",
    ">:(": "marah",
    "-_-": "kesal",
    "<3": "cinta",
    "</3": "patah hati",
}

EMOTICON_RE = re.compile(
    r"(?<!\S)("
    + "|".join(
        re.escape(k)
        for k in sorted(EMOTICON_DICT, key=len, reverse=True)
    )
    + r")(?!\S)",
    flags=re.IGNORECASE,
)


def convert_emoticons(text: str) -> str:
    return EMOTICON_RE.sub(
        lambda m: f" {EMOTICON_DICT[m.group(1).lower()]} ",
        text
    )


def convert_emojis(text: str) -> str:
    text = emoji.demojize(
        text,
        delimiters=("<<", ">>"),
        language=EMOJI_LANG
    )

    return re.sub(
        r"<<([^<>]+)>>",
        lambda m: " " + m.group(1).replace("_", " ") + " ",
        text
    )


def preprocess_text(text: str, lowercase: bool = True) -> str:
    """
    Reproducible text preprocessing.
    Harus sama dengan preprocessing saat training.
    """

    if not isinstance(text, str):
        return ""

    # 1. Decode HTML entities dan hapus HTML tags
    text = html.unescape(text)
    text = re.sub(r"<[^>]+>", " ", text)

    # 2. Remove username
    text = re.sub(r"@\w+", "", text)

    # 3. Remove URL
    text = re.sub(r"http\S+|www\.\S+", "", text)

    # 4. Convert emoticons
    text = convert_emoticons(text)

    # 5. Convert emojis
    text = convert_emojis(text)

    # 6. Remove numbers
    text = re.sub(r"\d+", "", text)

    # 7. Remove unwanted symbols (keep .,!?)
    text = re.sub(r"[^\w\s.,!?]", " ", text)

    # 8. Normalize repeated characters
    text = re.sub(r"(.)\1{2,}", r"\1\1", text)

    # 9. Lowercase
    if lowercase:
        text = text.lower()

    # 10. Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    return text


def format_metadata_text(metadata, mode: str) -> str:
    if isinstance(metadata, dict):
        metadata_dict = metadata
    else:
        metadata_dict = metadata.model_dump()

    if mode == "metadata":
        return (
            f"Domisili: "
            f"{metadata_dict.get('domisili') or ''}."
        )

    if mode == "metadata_full":
        return (
            f"Polarisasi: {metadata_dict.get('polarized') or ''}. "
            f"Etnis: {metadata_dict.get('ethnicity') or ''}. "
            f"Agama: {metadata_dict.get('religion') or ''}. "
            f"Disabilitas: {metadata_dict.get('disability') or ''}. "
            f"LGBT: {metadata_dict.get('lgbt') or ''}. "
            f"Gender: {metadata_dict.get('gender') or ''}. "
            f"Usia: {metadata_dict.get('age') or ''}. "
            f"Domisili: {metadata_dict.get('domisili') or ''}. "
            f"Pendidikan: {metadata_dict.get('pendidikan_terakhir') or ''}. "
            f"Pekerjaan: {metadata_dict.get('status_pekerjaan') or ''}. "
            f"Preferensi politik: "
            f"{metadata_dict.get('president_vote_leaning') or ''}."
        )

    raise ValueError(f"Mode metadata tidak dikenal: {mode}")


def prepare_input(
    text: str,
    mode: str,
    metadata=None
):
    processed_text = preprocess_text(text)

    if mode == "text_only":
        return processed_text, None

    if mode in ["metadata", "metadata_full"]:
        if metadata is None:
            raise ValueError("Metadata wajib diisi.")

        metadata_text = format_metadata_text(
            metadata,
            mode
        )

        return metadata_text, processed_text

    raise ValueError(f"Mode di utils tidak dikenal: {mode}")
