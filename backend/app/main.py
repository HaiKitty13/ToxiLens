
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import (
    PredictionRequest,
    TextOnlyPredictionRequest,
    MetadataPredictionRequest,
    MetadataFullPredictionRequest,
)
from app.model_service import model_service


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "ToxiLens API - Indonesian Toxicity Detection "
        "using Two-Stage Classification."
    ),
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)


# =========================================
# CORS
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =========================================
# GENERAL ENDPOINTS
# =========================================

@app.get("/", tags=["General"])
def root():
    return {
        "message": "Welcome to ToxiLens API",
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/health", tags=["General"])
def health_check():
    return {
        "status": "healthy",
        "device": str(model_service.device),
        "loaded_models": list(model_service.models.keys())
    }


# =========================================
# SHARED PREDICTION HANDLERS
# =========================================

def get_metadata(request, mode):
    """
    Metadata hanya diambil jika mode metadata.
    Text-only tidak membutuhkan atribut metadata.
    """

    if mode == "metadata":
        metadata = getattr(request, "metadata", None)

        if metadata is None:
            raise HTTPException(
                status_code=400,
                detail="Metadata wajib diisi."
            )

        # Pydantic model -> dictionary
        # if hasattr(metadata, "model_dump"):
        #     return metadata.model_dump()

        if isinstance(metadata, dict):
            return metadata

        return metadata

    return None


def run_full_prediction(request, mode):
    try:
        metadata = get_metadata(request, mode)

        result = model_service.predict(
            text=request.text,
            mode=mode,
            metadata=metadata
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


# =========================================
# TEXT-ONLY ENDPOINTS
# =========================================

@app.post(
    "/api/v1/predict/text-only",
    tags=["Text-only"],
    summary="Full Text-only Prediction"
)
def predict_text_only(
    request: TextOnlyPredictionRequest
):
    return run_full_prediction(
        request,
        mode="text_only"
    )


@app.post(
    "/api/v1/predict/text-only/stage1",
    tags=["Text-only"],
    summary="Text-only Stage 1"
)
def predict_text_only_stage1(
    request: TextOnlyPredictionRequest
):
    return run_stage1_prediction(
        request,
        mode="text_only"
    )


@app.post(
    "/api/v1/predict/text-only/stage2",
    tags=["Text-only"],
    summary="Text-only Stage 2"
)
def predict_text_only_stage2(
    request: TextOnlyPredictionRequest
):
    return run_stage2_prediction(
        request,
        mode="text_only"
    )


# =========================================
# METADATA ENDPOINTS
# =========================================

@app.post(
    "/api/v1/predict/metadata",
    tags=["Metadata"],
    summary="Domicile Metadata Prediction"
)
def predict_metadata(
    request: MetadataPredictionRequest
):
    return run_full_prediction(
        request,
        mode="metadata"
    )


@app.post(
    "/api/v1/predict/metadata/stage1",
    tags=["Metadata"],
    summary="Metadata Stage 1"
)
def predict_metadata_stage1(
    request: MetadataPredictionRequest
):
    return run_stage1_prediction(
        request,
        mode="metadata"
    )


@app.post(
    "/api/v1/predict/metadata/stage2",
    tags=["Metadata"],
    summary="Metadata Stage 2"
)
def predict_metadata_stage2(
    request: MetadataPredictionRequest
):
    return run_stage2_prediction(
        request,
        mode="metadata"
    )


# =========================================
# METADATA FULL ENDPOINTS
# =========================================
@app.post(
        "/api/v1/predict/metadata-full",
        tags=["Metadata-Full"],
        summary="Full Metadata Prediction"
        )
def predict_metadata_full(
    request: MetadataFullPredictionRequest
):
    try:
        return model_service.predict(
            text=request.text,
            mode="metadata_full",
            metadata=request.metadata
        )

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )