
from fastapi import APIRouter, HTTPException

from app.schemas import (
    TextOnlyPredictionRequest,
    MetadataPredictionRequest,
    MetadataFullPredictionRequest,
)

from app.services.model_service import model_service


router = APIRouter(
    prefix="/api/v1",
    tags=["Prediction"]
)


# =========================================
# SHARED HELPERS
# =========================================

def get_metadata(request, mode):

    if mode == "metadata":
        metadata = getattr(request, "metadata", None)

        if metadata is None:
            raise HTTPException(
                status_code=400,
                detail="Metadata wajib diisi."
            )

        if isinstance(metadata, dict):
            return metadata

        return metadata

    return None


def handle_prediction(func, request, mode, **kwargs):
    try:
        metadata = get_metadata(request, mode)

        result = func(
            text=request.text,
            mode=mode,
            metadata=metadata,
            **kwargs
        )

        return result

    except HTTPException:
        raise

    except RuntimeError as error:
        raise HTTPException(
            status_code=503,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


def run_full_prediction(request, mode, model_family=None):
    try:
        metadata = get_metadata(request, mode)

        result = model_service.predict(
            text=request.text,
            mode=mode,
            metadata=metadata,
            **(
                {"model_family": model_family}
                if model_family else {}
            )
        )

        return {
            "text": request.text,
            "mode": mode,
            "stage1": result["stage1"],
            "stage2": result["stage2"]
        }

    except HTTPException:
        raise

    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error))

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


def run_stage1_prediction(request, mode):
    try:
        metadata = get_metadata(request, mode)

        result = model_service.predict_stage1(
            text=request.text,
            mode=mode,
            metadata=metadata
        )

        return {
            "text": request.text,
            "mode": mode,
            "stage1": result
        }

    except HTTPException:
        raise

    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error))

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


def run_stage2_prediction(request, mode):
    try:
        metadata = get_metadata(request, mode)

        result = model_service.predict_stage2(
            text=request.text,
            mode=mode,
            metadata=metadata
        )

        return {
            "text": request.text,
            "mode": mode,
            "stage2": result
        }

    except HTTPException:
        raise

    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error))

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# =========================================
# INDOBERTWEET ENDPOINTS
# =========================================

@router.post("/predict/text-only", tags=["IndoBERTweet"])
def predict_text_only(request: TextOnlyPredictionRequest):
    return run_full_prediction(request, mode="text_only")


@router.post("/predict/text-only/stage1", tags=["IndoBERTweet"])
def predict_text_only_stage1(request: TextOnlyPredictionRequest):
    return run_stage1_prediction(request, mode="text_only")


@router.post("/predict/text-only/stage2", tags=["IndoBERTweet"])
def predict_text_only_stage2(request: TextOnlyPredictionRequest):
    return run_stage2_prediction(request, mode="text_only")


@router.post("/predict/metadata", tags=["IndoBERTweet"])
def predict_metadata(request: MetadataPredictionRequest):
    return run_full_prediction(request, mode="metadata")


@router.post("/predict/metadata/stage1", tags=["IndoBERTweet"])
def predict_metadata_stage1(request: MetadataPredictionRequest):
    return run_stage1_prediction(request, mode="metadata")


@router.post("/predict/metadata/stage2", tags=["IndoBERTweet"])
def predict_metadata_stage2(request: MetadataPredictionRequest):
    return run_stage2_prediction(request, mode="metadata")


@router.post("/predict/metadata-full", tags=["IndoBERTweet"])
def predict_metadata_full(request: MetadataFullPredictionRequest):
    try:
        return model_service.predict(
            text=request.text,
            mode="metadata_full",
            metadata=request.metadata
        )

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# =========================================
# NUSABERT ENDPOINTS
# =========================================

@router.post("/nusabert/predict/text-only", tags=["NusaBERT"])
def predict_nusabert_text_only(request: TextOnlyPredictionRequest):
    return run_full_prediction(
        request,
        mode="text_only",
        model_family="nusabert"
    )


@router.post("/nusabert/predict/metadata-full", tags=["NusaBERT"])
def predict_nusabert_metadata(request: MetadataFullPredictionRequest):
    try:
        return model_service.predict(
            text=request.text,
            mode="metadata_full",
            metadata=request.metadata,
            model_family="nusabert"
        )

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@router.post("/nusabert/predict/metadata-domicile", tags=["NusaBERT"])
def predict_nusabert_metadata_domicile(
    request: MetadataPredictionRequest
):
    return run_full_prediction(
        request,
        mode="metadata",
        model_family="nusabert"
    )
