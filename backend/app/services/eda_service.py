import ast
import re
from collections import Counter
from functools import lru_cache

import numpy as np
import pandas as pd

from app.services.dataset_service import load_all_datasets

try:
    from scipy.stats import chi2_contingency
except ImportError:  # scipy opsional
    chi2_contingency = None


# =========================================================
# CONFIGURATION
# =========================================================

# Label biner target utama
TARGET_COLUMN = "toxicity"

# Kategori ujaran kebencian (sub-label)
CATEGORY_COLUMNS = [
    "profanity_obscenity",
    "threat_incitement_to_violence",
    "insults",
    "identity_attack",
    "sexually_explicit",
]

# Flag konteks (bukan kategori kebencian, tapi penting untuk filtering data)
FLAG_COLUMNS = [
    "is_noise_or_spam_text",
    "related_to_election_2024",
]

ANNOTATION_COLUMNS = list(
    dict.fromkeys([TARGET_COLUMN, *CATEGORY_COLUMNS, *FLAG_COLUMNS])
)

DEMOGRAPHIC_FIELDS = [
    "ethnicity",
    "religion",
    "disability",
    "lgbt",
    "gender",
    "age",
    "domisili",
    "education",
    "work",
    "vote_leaning",
]

# Nama kolom asli di annotator_demographic.csv -> nama yang dipakai API
ANNOTATOR_COLUMN_RENAME = {
    "pendidikan terakhir": "education",
    "status pekerjaan": "work",
    "president vote leaning": "vote_leaning",
}

# Penyeragaman nilai demografi
VALUE_NORMALIZATION = {
    "ethnicity": {"Balinese": "Bali"},
    "vote_leaning": {
        "1": "Paslon 1",
        "2": "Paslon 2",
        "3": "Paslon 3",
        "-": "Tidak diketahui",
        "Golput": "Golput",
    },
}

LABEL_NAMES = {0: "non-toxic", 1: "toxic"}

# Minimal jumlah suara agar sebuah grup dianggap cukup untuk dibandingkan
MIN_GROUP_VOTES = 30
# Minimal jumlah anotator berbeda dalam satu grup (1-2 orang tidak cukup untuk klaim bias)
MIN_GROUP_ANNOTATORS = 3

STOPWORDS = {
    "yang", "dan", "di", "ke", "dari", "ini", "itu", "dengan", "untuk", "pada",
    "adalah", "dalam", "juga", "tidak", "ga", "gak", "nggak", "yg", "dr", "utk",
    "ada", "akan", "atau", "saya", "aku", "kamu", "dia", "mereka", "kita", "nya",
    "sudah", "udah", "bisa", "karena", "jadi", "kalau", "kalo", "aja", "saja",
    "lagi", "sih", "deh", "dong", "lah", "kan", "nih", "tu", "si", "mau", "se",
    "user", "rt", "http", "https", "co", "amp", "https_co",
}


# =========================================================
# HELPERS
# =========================================================

def parse_list(value):
    """Ubah string list Python ("['7', '15']") menjadi list."""
    if isinstance(value, (list, np.ndarray)):
        return list(value)
    if value is None:
        return []
    if isinstance(value, float) and pd.isna(value):
        return []
    try:
        result = ast.literal_eval(str(value))
        return result if isinstance(result, list) else [result]
    except (ValueError, SyntaxError):
        # String list rusak, mis. "['20', '5', 33']" -> ambil angkanya saja
        return re.findall(r"\d+", str(value))


def _parse_annotator_ids(value):
    """Return (list_id, apakah_list_rusak_dan_diperbaiki)."""
    try:
        result = ast.literal_eval(str(value))
        items = result if isinstance(result, list) else [result]
        return [normalize_id(x) for x in items], False
    except (ValueError, SyntaxError):
        return re.findall(r"\d+", str(value)), True


def normalize_id(value):
    if value is None or pd.isna(value):
        return None
    return str(value).strip()


def normalize_label(value):
    """Normalisasi nilai anotasi menjadi 0 / 1 / None."""
    if value is None:
        return None
    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        return None

    value = str(value).strip().lower()
    if value in ("0", "0.0", "false", "no"):
        return 0
    if value in ("1", "1.0", "true", "yes"):
        return 1
    return None


def find_column(df, candidates):
    lookup = {str(c).strip().lower(): c for c in df.columns}
    for cand in candidates:
        if cand.lower() in lookup:
            return lookup[cand.lower()]
    return None


def _num(value, digits=2):
    """Float aman untuk JSON (NaN -> None)."""
    if value is None:
        return None
    try:
        if pd.isna(value):
            return None
    except (TypeError, ValueError):
        return None
    return round(float(value), digits)


def _pct(part, total, digits=2):
    return round(part / total * 100, digits) if total else 0


def get_binary_label_name(value):
    try:
        return LABEL_NAMES.get(int(value), "unknown")
    except (TypeError, ValueError):
        return "unknown"


def distribution(series):
    counts = series.fillna("Unknown").value_counts(dropna=False)
    return [{"label": str(k), "count": int(v)} for k, v in counts.items()]


def _group_series(df, col):
    s = df[col]

    if col.lower() == "age":
        num = pd.to_numeric(s, errors="coerce")
        if num.notna().mean() > 0.6:
            bins = [0, 17, 24, 34, 44, 54, 200]
            labels = ["<18", "18-24", "25-34", "35-44", "45-54", "55+"]
            binned = pd.cut(num, bins=bins, labels=labels).astype(object)
            return binned.where(num.notna(), "Unknown").astype(str)

    return s.astype(object).where(s.notna(), "Unknown").astype(str)


def _interpret_alpha(alpha):
    """Interpretasi Krippendorff's alpha (Landis-Koch / Krippendorff)."""
    if alpha is None:
        return "tidak dapat dihitung"
    if alpha < 0:
        return "di bawah kebetulan"
    if alpha < 0.2:
        return "sangat rendah"
    if alpha < 0.4:
        return "rendah"
    if alpha < 0.6:
        return "sedang"
    if alpha < 0.8:
        return "baik"
    return "sangat baik"


def _krippendorff_alpha_binary(df, col):
    """
    Krippendorff's alpha (nominal) untuk label biner dengan jumlah anotator
    yang bisa berbeda per tweet dan nilai kosong.
    """
    sub = df[["text_id", col]].dropna()
    if sub.empty:
        return None

    g = sub.groupby("text_id")[col].agg(n1="sum", m="count")
    g = g[g["m"] >= 2]
    if g.empty:
        return None

    n0 = g["m"] - g["n1"]
    n_total = g["m"].sum()
    total_1 = g["n1"].sum()
    total_0 = n_total - total_1

    if total_0 == 0 or total_1 == 0 or n_total < 2:
        return None

    observed = 2 * (g["n1"] * n0 / (g["m"] - 1)).sum() / n_total
    expected = 2 * total_0 * total_1 / (n_total * (n_total - 1))

    return float(1 - observed / expected)


def _chi_square(grouped_counts):
    """
    grouped_counts: DataFrame dengan kolom toxic_votes, non_toxic_votes.
    Return chi2, p-value, dan Cramer's V.
    """
    if chi2_contingency is None:
        return None

    table = grouped_counts[["toxic_votes", "non_toxic_votes"]].to_numpy()
    table = table[table.sum(axis=1) > 0]

    if table.shape[0] < 2 or table[:, 0].sum() == 0 or table[:, 1].sum() == 0:
        return None

    chi2, p, dof, _ = chi2_contingency(table)
    n = table.sum()
    cramers_v = float(np.sqrt(chi2 / (n * (min(table.shape) - 1))))

    return {
        "chi2": _num(chi2, 3),
        "p_value": float(p),
        "dof": int(dof),
        "cramers_v": _num(cramers_v, 4),
        "significant": bool(p < 0.05),
    }


# =========================================================
# 1. DATASET LEVEL ANOTASI (tweet x anotator)
# =========================================================

@lru_cache(maxsize=1)
def _build_annotation_bundle():
    """
    Satu baris = satu tweet + satu anotator + label-labelnya,
    lalu di-join dengan metadata demografi anotator.

    Return (dataframe, data_quality_report).

    Baris yang panjang list labelnya tidak sama dengan jumlah anotator TIDAK
    membuat proses gagal: karena tidak diketahui anotator mana yang labelnya
    hilang, label kolom tsb untuk tweet itu dikosongkan (NaN) dan dicatat
    di data_quality.
    """
    datasets = load_all_datasets()
    tweets = datasets["tweets"].copy()
    annotators = datasets["annotators"].copy()

    for col in ("text_id", "annotators_id", "text"):
        if col not in tweets.columns:
            raise ValueError(f"Kolom wajib '{col}' tidak ada di dataset tweets.")

    available = [c for c in ANNOTATION_COLUMNS if c in tweets.columns]

    quality = {
        "malformed_annotator_lists": 0,
        "misaligned_tweets": 0,
        "misaligned_by_column": {c: 0 for c in available},
        "affected_text_ids": [],
    }

    records = []

    for _, row in tweets.iterrows():
        annotator_ids, repaired = _parse_annotator_ids(row["annotators_id"])
        if repaired:
            quality["malformed_annotator_lists"] += 1

        parsed = {}
        misaligned = False

        for c in available:
            values = parse_list(row[c])
            if len(values) != len(annotator_ids):
                quality["misaligned_by_column"][c] += 1
                misaligned = True
                values = [None] * len(annotator_ids)
            parsed[c] = values

        if misaligned:
            quality["misaligned_tweets"] += 1
            if len(quality["affected_text_ids"]) < 20:
                quality["affected_text_ids"].append(str(row["text_id"]))

        for i, annotator_id in enumerate(annotator_ids):
            if annotator_id is None:
                continue

            record = {
                "text_id": str(row["text_id"]),
                "annotator_id": annotator_id,
                "text": row["text"],
                "cleaned_text": row.get("cleaned_text"),
                "topic": row.get("topic"),
            }
            for c, values in parsed.items():
                record[c] = normalize_label(values[i])
            records.append(record)

    df = pd.DataFrame(records)
    if df.empty:
        raise ValueError("Tidak ada record anotasi yang berhasil dibuat.")

    for c in available:
        df[c] = pd.to_numeric(df[c], errors="coerce")

    df["topic"] = df["topic"].fillna("UNKNOWN")

    # ---- Demografi anotator ----
    annotators = annotators.rename(
        columns={k: v for k, v in ANNOTATOR_COLUMN_RENAME.items() if k in annotators.columns}
    )

    # Rapikan spasi di nilai teks (mis. gender "M " vs "M")
    for c in annotators.columns:
        if pd.api.types.is_string_dtype(annotators[c]) or annotators[c].dtype == object:
            annotators[c] = annotators[c].map(
                lambda v: v.strip() if isinstance(v, str) else v
            )

    for field, mapping in VALUE_NORMALIZATION.items():
        if field in annotators.columns:
            annotators[field] = annotators[field].map(
                lambda v, m=mapping: m.get(str(v), v) if pd.notna(v) else v
            )

    id_col = find_column(annotators, ["annotator_id", "annotators_id", "id"])
    if id_col is None:
        raise ValueError("Kolom ID anotator tidak ditemukan di dataset annotator.")

    annotators[id_col] = annotators[id_col].apply(normalize_id)
    if annotators[id_col].duplicated().any():
        raise ValueError("Ada ID anotator duplikat di dataset annotator.")

    df = df.merge(
        annotators,
        left_on="annotator_id",
        right_on=id_col,
        how="left",
        suffixes=("", "_demographic"),
        validate="many_to_one",
        indicator=True,
    )
    df["demographic_matched"] = df["_merge"] == "both"
    df = df.drop(columns=["_merge"])

    return df, quality


def _build_annotation_dataset():
    return _build_annotation_bundle()[0]


def get_data_quality():
    return _build_annotation_bundle()[1]


def _explode_topics(frame):
    """
    Kolom topic bersifat multi-label ("Kristen, Jewish"). Pecah menjadi
    satu baris per topik agar tiap topik bisa dibandingkan.
    Satu tweet/anotasi bisa dihitung di lebih dari satu topik.
    """
    out = frame.copy()
    out["topic"] = (
        out["topic"].fillna("UNKNOWN").astype(str).str.split(r"\s*,\s*", regex=True)
    )
    out = out.explode("topic")
    out["topic"] = out["topic"].str.strip()
    return out


def build_annotation_dataset():
    return _build_annotation_dataset().copy()


@lru_cache(maxsize=1)
def _build_annotation_with_consensus():
    """
    Tambahkan konsensus 'leave-one-out' per anotasi:
    label mayoritas dari anotator LAIN pada tweet yang sama.

    Dipakai untuk mengukur seberapa sering seorang anotator / kelompok
    demografi menyimpang dari konsensus (indikator bias anotator).
    Leave-one-out dipakai agar anotator tidak ikut memengaruhi
    konsensus yang dibandingkan dengan dirinya sendiri.
    """
    df = _build_annotation_dataset().copy()

    tox = df[TARGET_COLUMN]
    grp = df.groupby("text_id")[TARGET_COLUMN]

    n1 = grp.transform("sum")
    m = grp.transform("count")

    others_n1 = n1 - tox.fillna(0)
    others_m = m - tox.notna().astype(int)

    others_majority = np.where(
        others_m == 0,
        np.nan,
        np.where(
            others_n1 * 2 > others_m,
            1.0,
            np.where(others_n1 * 2 < others_m, 0.0, np.nan),  # tie -> NaN
        ),
    )

    df["others_majority"] = others_majority
    df.loc[tox.isna(), "others_majority"] = np.nan

    # Selisih label anotator ini terhadap rata-rata anotator LAIN pada tweet yang sama.
    # Membandingkan di tweet yang sama mengontrol tingkat kesulitan/topik tweet.
    others_mean = np.where(others_m > 0, others_n1 / others_m.replace(0, np.nan), np.nan)
    df["peer_diff"] = np.where(tox.notna(), tox - others_mean, np.nan)

    df["deviates"] = np.where(
        df["others_majority"].notna() & tox.notna(),
        (tox != df["others_majority"]).astype(float),
        np.nan,
    )

    return df


# =========================================================
# 2. DATASET LEVEL TWEET (majority voting, vectorized)
# =========================================================

@lru_cache(maxsize=1)
def _build_tweet_level_dataset():
    df = _build_annotation_dataset()
    cols = [c for c in ANNOTATION_COLUMNS if c in df.columns]

    grouped = df.groupby("text_id", sort=False)

    base = grouped.agg(
        text=("text", "first"),
        cleaned_text=("cleaned_text", "first"),
        topic=("topic", "first"),
        annotator_count=("annotator_id", "nunique"),
    )

    for c in cols:
        n1 = grouped[c].sum()
        m = grouped[c].count()

        # Majority voting: >= 0.5 menjadi 1
        label = pd.Series(np.nan, index=base.index, dtype=float)
        valid = m > 0
        label.loc[valid] = (
            n1.loc[valid] / m.loc[valid] >= 0.5
        ).astype(float)

        # Status tanpa kategori tie
        status = pd.Series("majority", index=base.index, dtype=object)

        status[(n1 == 0) & valid] = "agreement"
        status[(n1 == m) & valid] = "agreement"
        status[m == 1] = "single_vote"
        status[m == 0] = "no_votes"

        base[c] = label
        base[f"{c}_status"] = status

    return base.reset_index()


def build_tweet_level_dataset():
    return _build_tweet_level_dataset().copy()


# =========================================================
# 3. OVERVIEW + KESIAPAN DATA TRAINING
# =========================================================

def get_eda_overview():
    df = _build_annotation_dataset()
    tw = _build_tweet_level_dataset()

    total_tweets = int(tw["text_id"].nunique())
    total_annotations = len(df)
    total_annotators = int(df["annotator_id"].nunique())
    matched = int(df["demographic_matched"].sum())

    per_tweet = tw["annotator_count"]

    # Kesiapan data untuk fine-tuning BERT
    spam_mask = (
        tw["is_noise_or_spam_text"] == 1
        if "is_noise_or_spam_text" in tw.columns
        else pd.Series(False, index=tw.index)
    )
    tie_mask = tw[f"{TARGET_COLUMN}_status"] == "tie"
    labelled = tw[TARGET_COLUMN].notna()
    usable = labelled & ~spam_mask

    toxic_usable = int((tw.loc[usable, TARGET_COLUMN] == 1).sum())
    non_toxic_usable = int((tw.loc[usable, TARGET_COLUMN] == 0).sum())

    return {
        "total_tweets": total_tweets,
        "total_annotators": total_annotators,
        "total_annotations": total_annotations,
        "average_annotators_per_tweet": _num(total_annotations / total_tweets) if total_tweets else 0,

        "annotators_per_tweet_distribution": [
            {"annotators": int(k), "tweets": int(v)}
            for k, v in per_tweet.value_counts().sort_index().items()
        ],

        "demographic_match": {
            "matched": matched,
            "unmatched": total_annotations - matched,
            "match_rate": _pct(matched, total_annotations),
        },

        "annotation_coverage": {
            "single_annotator": int((per_tweet == 1).sum()),
            "multiple_annotators": int((per_tweet > 1).sum()),
        },

        "training_readiness": {
            "total_tweets": total_tweets,
            "removed_tie": int(tie_mask.sum()),
            "removed_spam_or_noise": int((spam_mask & labelled).sum()),
            "usable_tweets": int(usable.sum()),
            "usable_single_annotator": int((usable & (per_tweet == 1)).sum()),
            "toxic": toxic_usable,
            "non_toxic": non_toxic_usable,
            "toxic_percentage": _pct(toxic_usable, toxic_usable + non_toxic_usable),
            "imbalance_ratio": _num(
                max(toxic_usable, non_toxic_usable)
                / max(min(toxic_usable, non_toxic_usable), 1)
            ),
        },

        "data_quality": get_data_quality(),

        "dataset_rows": {
            "original_tweets": int(load_all_datasets()["tweets"].shape[0]),
            "annotation_level": total_annotations,
            "unique_tweets": total_tweets,
        },
    }


# =========================================================
# 4. DISTRIBUSI TOXICITY
# =========================================================
def get_eda_toxicity():
    df = _build_annotation_dataset()
    tw = _build_tweet_level_dataset()

    def build(series):
        counts = series.dropna().value_counts()
        total = int(counts.sum())

        return [
            {
                "label": get_binary_label_name(v),
                "value": v,
                "count": int(counts.get(v, 0)),
                "percentage": _pct(int(counts.get(v, 0)), total),
            }
            for v in (0, 1)
        ]

    return {
        "annotation_level": {
            "total_votes": int(df[TARGET_COLUMN].notna().sum()),
            "distribution": build(df[TARGET_COLUMN]),
        },
        "tweet_level": {
            "total_tweets": int(tw[TARGET_COLUMN].notna().sum()),
            "distribution": build(tw[TARGET_COLUMN]),
        },
    }



# =========================================================
# 5. KATEGORI UJARAN KEBENCIAN + FLAG KONTEKS
# =========================================================

def _label_summary(df, tw, col):
    ann_pos = int((df[col] == 1).sum())
    ann_tot = int(df[col].notna().sum())
    tw_pos = int((tw[col] == 1).sum())
    tw_tot = int(tw[col].notna().sum())

    return {
        "category": col,
        "annotation_level": {
            "positive": ann_pos,
            "total": ann_tot,
            "percentage": _pct(ann_pos, ann_tot),
        },
        "tweet_level": {
            "positive": tw_pos,
            "total": tw_tot,
            "percentage": _pct(tw_pos, tw_tot),
        },
    }


def get_eda_categories():
    df = _build_annotation_dataset()
    tw = _build_tweet_level_dataset()

    # Stage 2 hanya menggunakan tweet yang toxic
    tw = tw[tw[TARGET_COLUMN] == 1].copy()

    categories = []
    for col in CATEGORY_COLUMNS:
        if col not in df.columns:
            continue

        item = _label_summary(df, tw, col)

        categories.append(item)

    flags = [
        _label_summary(df, tw, col)
        for col in FLAG_COLUMNS
        if col in df.columns
    ]

    return {
        "categories": categories,
        "flags": flags
    }


# =========================================================
# 6. KORELASI ANTAR LABEL (tweet-level)
# =========================================================

def get_eda_label_correlation():
    tw = _build_tweet_level_dataset()

    cols = [c for c in [TARGET_COLUMN, *CATEGORY_COLUMNS] if c in tw.columns]
    corr = tw[cols].astype(float).corr()  # Pearson pada biner = koefisien phi

    matrix = []
    for r in cols:
        for c in cols:
            matrix.append({"x": c, "y": r, "value": _num(corr.loc[r, c], 3)})

    return {"labels": cols, "matrix": matrix}


# =========================================================
# 7. KARAKTERISTIK TEKS
# =========================================================

def _tweet_text_series(tw):
    base = tw["cleaned_text"].where(tw["cleaned_text"].notna(), tw["text"])
    return base.fillna("").astype(str)


def get_eda_text_length(bins=20):
    tw = _build_tweet_level_dataset().copy()
    tw["word_count"] = tw["text"].fillna("").astype(str).str.split().str.len()

    max_len = int(tw["word_count"].quantile(0.99)) or 1
    edges = np.linspace(0, max_len, bins + 1)

    def hist(series):
        counts, _ = np.histogram(series.clip(upper=max_len), bins=edges)
        return [
            {
                "range": f"{int(edges[i])}-{int(edges[i + 1])}",
                "count": int(counts[i]),
            }
            for i in range(len(counts))
        ]

    def stats(series):
        return {
            "mean": _num(series.mean()),
            "median": _num(series.median()),
            "p95": _num(series.quantile(0.95)),
            "max": int(series.max()) if len(series) else 0,
        }

    toxic = tw[tw[TARGET_COLUMN] == 1]["word_count"]
    non_toxic = tw[tw[TARGET_COLUMN] == 0]["word_count"]

    return {
        "overall": {"stats": stats(tw["word_count"]), "histogram": hist(tw["word_count"])},
        "by_label": {
            "toxic": {"stats": stats(toxic), "histogram": hist(toxic)},
            "non_toxic": {"stats": stats(non_toxic), "histogram": hist(non_toxic)},
        },
    }


def get_eda_top_words(top_n=15):
    tw = _build_tweet_level_dataset()
    texts = _tweet_text_series(tw)

    def tokens(series):
        counter = Counter()
        for t in series:
            words = re.findall(r"[a-zA-Z]{3,}", t.lower())
            counter.update(w for w in words if w not in STOPWORDS)
        return counter

    toxic = tokens(texts[tw[TARGET_COLUMN] == 1])
    non_toxic = tokens(texts[tw[TARGET_COLUMN] == 0])

    def top(counter):
        return [{"word": w, "count": int(c)} for w, c in counter.most_common(top_n)]

    return {"toxic": top(toxic), "non_toxic": top(non_toxic)}


# =========================================================
# 8. TOPIK VS TOXICITY
# =========================================================

def get_eda_topics():
    df = _explode_topics(_build_annotation_dataset())
    tw = _explode_topics(_build_tweet_level_dataset())

    multi_topic = int(
        _build_tweet_level_dataset()["topic"].astype(str).str.contains(",").sum()
    )

    ann = (
        df.groupby("topic")
        .agg(
            total_annotations=("text_id", "size"),
            toxic_votes=(TARGET_COLUMN, lambda x: int((x == 1).sum())),
            non_toxic_votes=(TARGET_COLUMN, lambda x: int((x == 0).sum())),
        )
        .reset_index()
    )
    ann["toxic_rate"] = (
        ann["toxic_votes"] / (ann["toxic_votes"] + ann["non_toxic_votes"]).replace(0, np.nan) * 100
    ).round(2)

    twg = (
        tw.groupby("topic")
        .agg(
            total_tweets=("text_id", "nunique"),
            toxic_tweets=(TARGET_COLUMN, lambda x: int((x == 1).sum())),
            non_toxic_tweets=(TARGET_COLUMN, lambda x: int((x == 0).sum())),
            tie_tweets=(f"{TARGET_COLUMN}_status", lambda x: int((x == "tie").sum())),
        )
        .reset_index()
    )
    twg["toxic_rate"] = (
        twg["toxic_tweets"] / (twg["toxic_tweets"] + twg["non_toxic_tweets"]).replace(0, np.nan) * 100
    ).round(2)

    ann = ann.sort_values("toxic_rate", ascending=False, na_position="last")
    twg = twg.sort_values("toxic_rate", ascending=False, na_position="last")

    return {
        "note": (
            "Topik bersifat multi-label: tweet dengan beberapa topik dihitung di "
            "setiap topiknya, sehingga jumlah antar topik melebihi total tweet."
        ),
        "multi_topic_tweets": multi_topic,
        "annotation_level": ann.astype(object).where(ann.notna(), None).to_dict(orient="records"),
        "tweet_level": twg.astype(object).where(twg.notna(), None).to_dict(orient="records"),
    }


# =========================================================
# 9. AGREEMENT ANTAR ANOTATOR
# =========================================================

def get_eda_agreement():
    """
    Per label: unanimous / majority / tie (hanya tweet dengan >= 2 anotator)
    + Krippendorff's alpha + percent agreement.
    """
    df = _build_annotation_dataset()
    cols = [TARGET_COLUMN, *CATEGORY_COLUMNS, *FLAG_COLUMNS]

    results = {}

    for col in cols:
        if col not in df.columns:
            continue

        g = df[["text_id", col]].dropna().groupby("text_id")[col].agg(n1="sum", m="count")
        g = g[g["m"] >= 2]
        total = len(g)

        unanimous = int(((g["n1"] == 0) | (g["n1"] == g["m"])).sum())
        ties = int((g["n1"] * 2 == g["m"]).sum())
        majority = total - unanimous - ties

        alpha = _krippendorff_alpha_binary(df, col)

        results[col] = {
            "total_multi_annotated_tweets": total,
            "unanimous_agreement": unanimous,
            "majority_agreement": majority,
            "ties": ties,
            "unanimous_percentage": _pct(unanimous, total),
            "majority_percentage": _pct(unanimous + majority, total),
            "tie_percentage": _pct(ties, total),
            "krippendorff_alpha": _num(alpha, 3),
            "alpha_interpretation": _interpret_alpha(alpha),
        }

    return {"agreement": results}


# =========================================================
# 10. DEMOGRAFI ANOTATOR
# =========================================================

def get_eda_demographics():
    df = _build_annotation_dataset()
    results = {}

    for field in DEMOGRAPHIC_FIELDS:
        col = find_column(df, [field])
        if col is None:
            continue

        per_annotator = df[["annotator_id", col]].drop_duplicates(subset=["annotator_id"]).copy()
        per_annotator[col] = _group_series(per_annotator, col)

        results[field] = {
            "unique_annotators": int(per_annotator["annotator_id"].nunique()),
            "distribution": distribution(per_annotator[col]),
        }

    return {"demographics": results}


# =========================================================
# 11. BIAS ANOTATOR: DEMOGRAFI VS TOXICITY
# =========================================================

def get_eda_demographics_toxicity(field):
    """
    Per grup demografi:
      - toxic_rate: % suara 'toxic' yang diberikan grup tsb
      - disagreement_rate: % suara yang berbeda dari mayoritas anotator LAIN
      - uji chi-square + Cramer's V untuk grup vs toxicity
    """
    df = _build_annotation_with_consensus()

    col = find_column(df, [field])
    if col is None:
        return {"available": False, "message": f"Field demografi '{field}' tidak ditemukan."}

    valid = df[df[TARGET_COLUMN].notna() & df["demographic_matched"]].copy()
    if valid.empty:
        return {"available": False, "message": "Tidak ada anotasi dengan demografi yang cocok."}

    valid["_group"] = _group_series(valid, col)

    grouped = (
        valid.groupby("_group")
        .agg(
            total_votes=(TARGET_COLUMN, "count"),
            toxic_votes=(TARGET_COLUMN, lambda x: int((x == 1).sum())),
            non_toxic_votes=(TARGET_COLUMN, lambda x: int((x == 0).sum())),
            unique_annotators=("annotator_id", "nunique"),
            disagreement_rate=("deviates", "mean"),
            peer_diff=("peer_diff", "mean"),
            coannotated_votes=("peer_diff", "count"),
        )
        .reset_index()
    )

    grouped["toxic_rate"] = grouped["toxic_votes"] / grouped["total_votes"] * 100
    overall_rate = valid[TARGET_COLUMN].mean() * 100

    grouped["low_support"] = (
        (grouped["total_votes"] < MIN_GROUP_VOTES)
        | (grouped["unique_annotators"] < MIN_GROUP_ANNOTATORS)
    )

    # Uji statistik hanya pada grup yang cukup data (jika masih >= 2 grup)
    reliable = grouped[~grouped["low_support"]]
    if len(reliable) >= 2:
        stats = _chi_square(reliable)
        if stats is not None:
            stats["excluded_low_support_groups"] = int(grouped["low_support"].sum())
    else:
        stats = _chi_square(grouped)

    groups = [
        {
            "group": str(r["_group"]),
            "unique_annotators": int(r["unique_annotators"]),
            "total_votes": int(r["total_votes"]),
            "toxic_votes": int(r["toxic_votes"]),
            "non_toxic_votes": int(r["non_toxic_votes"]),
            "toxic_rate": _num(r["toxic_rate"]),
            "non_toxic_rate": _num(100 - r["toxic_rate"]),
            # selisih terhadap rata-rata seluruh anotator (poin persentase)
            "diff_from_overall": _num(r["toxic_rate"] - overall_rate),
            "disagreement_rate": _num(
                r["disagreement_rate"] * 100 if pd.notna(r["disagreement_rate"]) else None
            ),
            # selisih (poin persentase) terhadap anotator lain di tweet yang SAMA;
            # positif = grup cenderung lebih sering melabeli toxic daripada rekan-rekannya
            "peer_diff": _num(r["peer_diff"] * 100 if pd.notna(r["peer_diff"]) else None),
            "coannotated_votes": int(r["coannotated_votes"]),
            "low_support": bool(r["low_support"]),
        }
        for _, r in grouped.sort_values("toxic_rate", ascending=False).iterrows()
    ]

    return {
        "available": True,
        "field": field,
        "total_votes": len(valid),
        "overall_toxic_rate": _num(overall_rate),
        "groups": groups,
        "statistics": stats,
        "note": (
            "toxic_rate dipengaruhi tweet mana yang ditugaskan ke tiap grup; "
            "peer_diff membandingkan dengan anotator lain di tweet yang sama sehingga "
            "lebih adil. Uji chi-square memperlakukan setiap suara sebagai independen, padahal satu "
            "anotator memberi banyak suara. Gunakan hasil ini sebagai indikasi awal; "
            "analisis lanjutan sebaiknya di level anotator."
        ),
    }


def get_eda_demographics_toxicity_all():
    """Ringkasan semua field: kekuatan asosiasi (Cramer's V) -> bar chart pembanding."""
    df = _build_annotation_dataset()
    out = []

    for field in DEMOGRAPHIC_FIELDS:
        if find_column(df, [field]) is None:
            continue
        res = get_eda_demographics_toxicity(field)
        if not res.get("available"):
            continue

        rates = [g["toxic_rate"] for g in res["groups"] if not g["low_support"]]
        stats = res.get("statistics") or {}

        out.append({
            "field": field,
            "groups": len(res["groups"]),
            "max_gap": _num(max(rates) - min(rates)) if len(rates) >= 2 else None,
            "cramers_v": stats.get("cramers_v"),
            "p_value": stats.get("p_value"),
            "significant": stats.get("significant"),
        })

    out.sort(key=lambda x: (x["cramers_v"] is None, -(x["cramers_v"] or 0)))
    return {"fields": out}


# =========================================================
# 12. BIAS ANOTATOR: DEMOGRAFI x TOPIK (heatmap)
# =========================================================

def get_eda_demographic_topic(field, min_votes=20):
    df = _build_annotation_dataset()
    col = find_column(df, [field])

    if col is None:
        return {"available": False, "message": f"Field demografi '{field}' tidak ditemukan."}

    valid = df[df[TARGET_COLUMN].notna() & df["demographic_matched"]].copy()
    valid = _explode_topics(valid)
    valid["_group"] = _group_series(valid, col)

    grouped = (
        valid.groupby(["_group", "topic"])
        .agg(
            votes=(TARGET_COLUMN, "count"),
            toxic_votes=(TARGET_COLUMN, lambda x: int((x == 1).sum())),
        )
        .reset_index()
    )

    cells = [
        {
            "group": str(r["_group"]),
            "topic": str(r["topic"]),
            "votes": int(r["votes"]),
            # sel dengan data terlalu sedikit dikosongkan agar tidak menyesatkan
            "toxic_rate": _num(r["toxic_votes"] / r["votes"] * 100) if r["votes"] >= min_votes else None,
        }
        for _, r in grouped.iterrows()
    ]

    return {
        "available": True,
        "field": field,
        "min_votes": min_votes,
        "groups": sorted(grouped["_group"].unique().tolist()),
        "topics": sorted(grouped["topic"].unique().tolist()),
        "cells": cells,
    }


# =========================================================
# 13. BIAS ANOTATOR: LEVEL INDIVIDU
# =========================================================

def get_eda_annotators(min_annotations=20, top_n=10):
    """
    Profil perilaku tiap anotator:
      - toxic_rate: kecenderungan melabeli toxic
      - disagreement_rate: seberapa sering menyimpang dari mayoritas anotator lain
    """
    df = _build_annotation_with_consensus()
    valid = df[df[TARGET_COLUMN].notna()]

    per = (
        valid.groupby("annotator_id")
        .agg(
            annotations=(TARGET_COLUMN, "size"),
            toxic_rate=(TARGET_COLUMN, "mean"),
            disagreement_rate=("deviates", "mean"),
            peer_diff=("peer_diff", "mean"),
            coannotated_share=("peer_diff", "count"),
        )
        .reset_index()
    )
    per["coannotated_share"] = per["coannotated_share"] / per["annotations"] * 100
    per["peer_diff"] *= 100
    per["toxic_rate"] *= 100
    per["disagreement_rate"] *= 100

    eligible = per[per["annotations"] >= min_annotations].copy()

    def histogram(series):
        counts, edges = np.histogram(series.dropna(), bins=np.arange(0, 101, 10))
        return [
            {"range": f"{int(edges[i])}-{int(edges[i + 1])}%", "count": int(counts[i])}
            for i in range(len(counts))
        ]

    def records(frame):
        rows = []
        for _, r in frame.iterrows():
            rows.append({
                "annotator_id": r["annotator_id"],
                "annotations": int(r["annotations"]),
                "toxic_rate": _num(r["toxic_rate"]),
                "disagreement_rate": _num(r["disagreement_rate"]),
                "peer_diff": _num(r["peer_diff"]),
                "coannotated_share": _num(r["coannotated_share"]),
            })
        return rows

    return {
        "total_annotators": int(per["annotator_id"].nunique()),
        "eligible_annotators": len(eligible),
        "min_annotations": min_annotations,
        "annotations_per_annotator": {
            "mean": _num(per["annotations"].mean()),
            "median": _num(per["annotations"].median()),
            "max": int(per["annotations"].max()),
        },
        "toxic_rate_histogram": histogram(eligible["toxic_rate"]),
        "disagreement_histogram": histogram(eligible["disagreement_rate"]),
        "most_toxic": records(eligible.sort_values("toxic_rate", ascending=False).head(top_n)),
        "least_toxic": records(eligible.sort_values("toxic_rate").head(top_n)),
        "most_deviating": records(eligible.sort_values("disagreement_rate", ascending=False).head(top_n)),
        # scatter: setiap titik = satu anotator
        "scatter": records(eligible),
    }


# =========================================================
# 14. PREVIEW DATA
# =========================================================

def get_eda_annotations(limit=20, offset=0, text_id=None, annotator_id=None):
    df = _build_annotation_dataset()

    if text_id is not None:
        df = df[df["text_id"] == str(text_id)]
    if annotator_id is not None:
        df = df[df["annotator_id"] == str(annotator_id)]

    total = len(df)
    page = df.iloc[offset:offset + limit].drop(columns=["demographic_matched"], errors="ignore")

    records = page.astype(object).where(pd.notna(page), None).to_dict(orient="records")

    return {"total": total, "limit": limit, "offset": offset, "data": records}