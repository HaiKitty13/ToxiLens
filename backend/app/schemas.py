from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

class AnnotatorMetadata(BaseModel):
    ethnicity: str
    religion: str
    disability: str
    lgbt: str
    gender: str
    age: str
    domisili: str
    pendidikan_terakhir: str
    status_pekerjaan: str
    president_vote_leaning: str


class TextOnlyPredictionRequest(BaseModel):
    text: str

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "text": "Dasar bodoh, kamu tidak pantas berada di sini!"
            }
        }
    )


class MetadataPredictionRequest(BaseModel):
    text: str
    metadata: AnnotatorMetadataDomicile

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "text": "Dasar bodoh, kamu tidak pantas berada di sini!",
                "metadata": {
                    "domisili": "Jabodetabek"
                }
            }
        }
    )

class MetadataFullPredictionRequest(BaseModel):
    text: str
    metadata: AnnotatorMetadata

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "text": "Dasar bodoh, kamu tidak pantas berada di sini!",
                "metadata": {
                    "ethnicity": "Jawa",
                    "religion": "Islam",
                    "disability": "no",
                    "lgbt": "no",
                    "gender": "F",
                    "age": "20",
                    "domisili": "Jakarta",
                    "pendidikan_terakhir": "Sarjana(S1)",
                    "status_pekerjaan": "Bekerja",
                    "president_vote_leaning": "1"
                }
            }
        }
    )

class AnnotatorMetadataDomicile(BaseModel):
    domisili: Optional[str] = None


class PredictionRequest(BaseModel):
    text: str = Field(..., min_length=1)
    mode: Literal["metadata", "text_only"] = "metadata"
    metadata: Optional[AnnotatorMetadata] = None


class Stage1Request(BaseModel):
    text: str = Field(..., min_length=1)
    mode: Literal["metadata", "text_only"] = "metadata"
    metadata: Optional[AnnotatorMetadata] = None


class Stage2Request(BaseModel):
    text: str = Field(..., min_length=1)
    mode: Literal["metadata", "text_only"] = "metadata"
    metadata: Optional[AnnotatorMetadata] = None


class Stage1Response(BaseModel):
    text: str
    mode: str
    prediction: str
    confidence: float
    probabilities: dict


class Stage2Response(BaseModel):
    text: str
    mode: str
    predictions: list
    probabilities: dict


class FullPredictionResponse(BaseModel):
    text: str
    mode: str
    stage1: dict
    stage2: Optional[dict] = None