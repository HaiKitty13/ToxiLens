
from functools import lru_cache

import pandas as pd
from datasets import load_dataset
from app.config import settings

BASE_URL = f"https://huggingface.co/datasets/{settings.REPO}/resolve/main"

DATA_FILES = {
    "tweets": f"{BASE_URL}/data_thesis_full.csv",
    "annotators": f"{BASE_URL}/annotator_demographic.csv",
    "combined": f"{BASE_URL}/dataset_exploded_with_metadata.csv",
}

@lru_cache(maxsize=1)
def load_all_datasets():

    tweets = load_dataset(
        "csv",
        data_files=DATA_FILES["tweets"],
        split="train"
    ).to_pandas()

    annotators = load_dataset(
        "csv",
        data_files=DATA_FILES["annotators"],
        split="train"
    ).to_pandas()

    combined = load_dataset(
        "csv",
        data_files=DATA_FILES["combined"],
        split="train"
    ).to_pandas()

    return {
        "tweets": tweets,
        "annotators": annotators,
        "combined": combined,
    }


def get_column(df, candidates):
    """Find the first matching column."""

    lookup = {str(col).lower(): col for col in df.columns}

    for candidate in candidates:
        if candidate.lower() in lookup:
            return lookup[candidate.lower()]

    return None


def get_dataset_profile():
    datasets = load_all_datasets()

    result = {}

    for name, df in datasets.items():
        result[name] = {
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "columns": df.columns.tolist(),
        }

    return result


def get_dataset_summary():
    datasets = load_all_datasets()

    tweets = datasets["tweets"]
    annotators = datasets["annotators"]
    combined = datasets["combined"]

    tweet_id = get_column(
        tweets,
        ["tweet_id", "id", "text_id"]
    )

    return {
        "total_tweets": (
            int(tweets[tweet_id].nunique())
            if tweet_id else len(tweets)
        ),
        "total_annotators": len(annotators),
        "total_original_rows": len(tweets),
        "total_annotator_rows": len(annotators),
        "total_combined_rows": len(combined),
    }


def get_toxicity_distribution():
    datasets = load_all_datasets()
    df = datasets["tweets"]

    label_col = get_column(
        df,
        ["toxicity", "toxic", "label", "is_toxic"]
    )

    if not label_col:
        return {
            "available": False,
            "message": "Toxicity column not found."
        }

    counts = df[label_col].value_counts(dropna=False)

    return {
        "available": True,
        "column": label_col,
        "distribution": [
            {
                "label": str(label),
                "count": int(count)
            }
            for label, count in counts.items()
        ]
    }


def get_category_distribution():
    df = load_all_datasets()["tweets"]

    categories = [
        "insults",
        "identity_attack",
        "polarized",
        "threat_incitement_to_violence",
        "profanity_obscenity",
        "sexually_explicit",
    ]

    # Case-insensitive column matching
    lookup = {str(col).lower(): col for col in df.columns}

    available = [
        lookup[c]
        for c in categories
        if c in lookup
    ]

    if not available:
        return {
            "available": False,
            "message": "Category columns not found."
        }

    results = []

    for col in available:
        values = df[col]

        # Handle multi-label / binary columns
        normalized = values.astype(str).str.lower().str.strip()

        if normalized.isin(
            ["0", "1", "true", "false", "yes", "no"]
        ).all():
            count = normalized.isin(
                ["1", "true", "yes"]
            ).sum()
        else:
            count = values.notna().sum()

        results.append({
            "category": col,
            "count": int(count)
        })

    return {
        "available": True,
        "distribution": results
    }


def get_annotator_demographics():
    df = load_all_datasets()["annotators"]

    metadata_columns = [
        "ethnicity",
        "religion",
        "disability",
        "lgbt",
        "gender",
        "age",
        "domisili",
        "education",
        "work",
    ]

    lookup = {str(col).lower(): col for col in df.columns}

    results = {}

    for name in metadata_columns:
        col = lookup.get(name)

        if col is None:
            continue

        counts = df[col].fillna("Unknown").value_counts()

        results[name] = [
            {
                "label": str(label),
                "count": int(count)
            }
            for label, count in counts.items()
        ]

    return results


def get_dataset_preview(limit=10):
    df = load_all_datasets()["tweets"]

    # Avoid exposing every metadata column in the preview
    preferred = [
        "tweet_id",
        "text",
        "tweet",
        "cleaned_text",
        "toxicity",
        "label",
    ]

    lookup = {str(col).lower(): col for col in df.columns}

    selected = []
    for col in preferred:
        actual = lookup.get(col)
        if actual and actual not in selected:
            selected.append(actual)

    if not selected:
        selected = df.columns[:5].tolist()

    return df[selected].head(limit).fillna("").to_dict(
        orient="records"
    )
