from fastapi import APIRouter, HTTPException, Query

from app.services.eda_service import (
    DEMOGRAPHIC_FIELDS,
    get_eda_overview,
    get_eda_toxicity,
    get_eda_categories,
    get_eda_label_correlation,
    get_eda_text_length,
    get_eda_top_words,
    get_eda_topics,
    get_eda_agreement,
    get_eda_demographics,
    get_eda_demographics_toxicity,
    get_eda_demographics_toxicity_all,
    get_eda_demographic_topic,
    get_eda_annotators,
    get_eda_annotations,
)

router = APIRouter(
    prefix="/api/eda",
    tags=["Exploratory Data Analysis"]
)

ALLOWED_FIELDS = set(DEMOGRAPHIC_FIELDS)


# =========================================================
# HELPERS
# =========================================================

def _run(func, error_message, *args, **kwargs):
    """Jalankan fungsi service dan ubah exception menjadi HTTP 500."""
    try:
        return func(*args, **kwargs)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"{error_message}: {str(e)}"
        )


def _validate_field(field: str):
    if field not in ALLOWED_FIELDS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid field. Allowed fields: {sorted(ALLOWED_FIELDS)}"
        )


# =========================================================
# 1. OVERVIEW & KESIAPAN DATA TRAINING
# =========================================================

@router.get("/overview")
def eda_overview():
    """
    Dataset overview:
    - Total tweets, annotators, annotations
    - Distribusi jumlah anotator per tweet
    - Kecocokan demografi anotator
    - Kesiapan data training (tie, spam, data layak pakai, imbalance)
    """
    return _run(get_eda_overview, "Failed to retrieve EDA overview")


# =========================================================
# 2. TOXICITY & KATEGORI
# =========================================================

@router.get("/toxicity")
def eda_toxicity():
    """
    Distribusi toxicity:
    - Level anotasi (setiap suara)
    - Level tweet (majority voting) + breakdown status tie
    """
    return _run(get_eda_toxicity, "Failed to retrieve toxicity distribution")


@router.get("/categories")
def eda_categories():
    """
    Distribusi kategori ujaran kebencian (polarized, insults, identity attack,
    profanity, threat, sexually explicit) + flag konteks
    (noise/spam, related to election 2024).
    """
    return _run(get_eda_categories, "Failed to retrieve category distribution")


@router.get("/label-correlation")
def eda_label_correlation():
    """Korelasi (phi) antar label di level tweet, untuk heatmap."""
    return _run(get_eda_label_correlation, "Failed to retrieve label correlation")


# =========================================================
# 3. KARAKTERISTIK TEKS
# =========================================================

@router.get("/text-length")
def eda_text_length(
    bins: int = Query(default=20, ge=5, le=50),
):
    """Distribusi panjang teks (jumlah kata): keseluruhan, toxic, dan non-toxic."""
    return _run(get_eda_text_length, "Failed to retrieve text length analysis", bins=bins)


@router.get("/top-words")
def eda_top_words(
    top_n: int = Query(default=15, ge=5, le=50),
):
    """Kata paling sering muncul pada tweet toxic vs non-toxic."""
    return _run(get_eda_top_words, "Failed to retrieve top words", top_n=top_n)


# =========================================================
# 4. TOPIK VS TOXICITY
# =========================================================

@router.get("/topics")
def eda_topics():
    """Jumlah tweet dan toxic rate per topik (level anotasi dan tweet)."""
    return _run(get_eda_topics, "Failed to retrieve topic analysis")


# =========================================================
# 5. AGREEMENT ANTAR ANOTATOR
# =========================================================

@router.get("/agreement")
def eda_agreement():
    """
    Inter-annotator agreement per label:
    - Unanimous / majority / tie
    - Krippendorff's alpha + interpretasi
    """
    return _run(get_eda_agreement, "Failed to retrieve annotator agreement")


# =========================================================
# 6. DEMOGRAFI ANOTATOR
# =========================================================

@router.get("/demographics")
def eda_demographics():
    """Distribusi demografi anotator (gender, agama, etnis, usia, dll.)."""
    return _run(get_eda_demographics, "Failed to retrieve demographics")


# =========================================================
# 7. BIAS ANOTATOR
# =========================================================

@router.get("/demographics/toxicity")
def eda_demographics_toxicity(
    field: str = Query(
        ...,
        description="Field demografi yang dianalisis",
        examples=["gender", "religion", "ethnicity", "age"]
    )
):
    """
    Hubungan demografi anotator dengan label toxicity.

    Per grup: toxic rate, selisih dari rata-rata, disagreement rate
    (menyimpang dari mayoritas anotator lain), dan uji chi-square + Cramer's V.

    Contoh: /api/eda/demographics/toxicity?field=gender
    """
    _validate_field(field)
    return _run(
        get_eda_demographics_toxicity,
        "Failed to retrieve demographic toxicity analysis",
        field,
    )


@router.get("/demographics/toxicity/summary")
def eda_demographics_toxicity_summary():
    """Ringkasan semua field demografi: field mana yang paling berasosiasi dengan toxicity."""
    return _run(
        get_eda_demographics_toxicity_all,
        "Failed to retrieve demographic summary",
    )


@router.get("/demographics/topic")
def eda_demographic_topic(
    field: str = Query(
        ...,
        description="Field demografi yang dianalisis",
        examples=["gender", "religion"]
    ),
    min_votes: int = Query(default=20, ge=1, le=500),
):
    """
    Heatmap toxic rate: grup demografi x topik.
    Sel dengan suara < min_votes dikembalikan sebagai null.

    Contoh: /api/eda/demographics/topic?field=religion&min_votes=20
    """
    _validate_field(field)
    return _run(
        get_eda_demographic_topic,
        "Failed to retrieve demographic-topic analysis",
        field,
        min_votes=min_votes,
    )


@router.get("/annotators")
def eda_annotators(
    min_annotations: int = Query(default=20, ge=1, le=1000),
    top_n: int = Query(default=10, ge=1, le=50),
):
    """
    Profil perilaku anotator individu:
    - Histogram toxic rate dan disagreement rate
    - Anotator paling toxic / paling permisif / paling menyimpang
    - Data scatter (toxic rate vs disagreement rate)
    """
    return _run(
        get_eda_annotators,
        "Failed to retrieve annotator analysis",
        min_annotations=min_annotations,
        top_n=top_n,
    )


# =========================================================
# 8. PREVIEW DATA ANOTASI
# =========================================================

@router.get("/annotations")
def eda_annotations(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    text_id: str | None = Query(default=None),
    annotator_id: str | None = Query(default=None),
):
    """
    Data level anotasi (teks, anotator, demografi, label per anotator).
    Mendukung filter text_id dan annotator_id.
    """
    return _run(
        get_eda_annotations,
        "Failed to retrieve annotation data",
        limit=limit,
        offset=offset,
        text_id=text_id,
        annotator_id=annotator_id,
    )