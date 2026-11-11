
from fastapi import APIRouter, Query, HTTPException

from app.services.dataset_service import (
    get_dataset_profile,
    get_dataset_summary,
    get_toxicity_distribution,
    get_category_distribution,
    get_annotator_demographics,
    get_dataset_preview,
)

router = APIRouter(
    prefix="/api/dataset",
    tags=["Dataset"]
)


@router.get("/profile")
def dataset_profile():
    try:
        return get_dataset_profile()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
def dataset_summary():
    try:
        return get_dataset_summary()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/toxicity")
def toxicity_distribution():
    try:
        return get_toxicity_distribution()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/categories")
def category_distribution():
    try:
        return get_category_distribution()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/demographics")
def annotator_demographics():
    try:
        return get_annotator_demographics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preview")
def dataset_preview(
    limit: int = Query(default=10, ge=1, le=50)
):
    try:
        return {
            "data": get_dataset_preview(limit)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
