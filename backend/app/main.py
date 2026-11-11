
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.services.model_service import model_service
from app.routes.model_routes import router as model_router
from app.routes.dataset_routes import router as dataset
from app.routes.eda_routes import router as eda_router

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
# ROUTERS
# =========================================

app.include_router(model_router)
app.include_router(dataset)
app.include_router(eda_router)


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
