# ToxiLens Backend

Backend API for Indonesian Toxicity Detection using **IndoBERTweet** and FastAPI.

## Tech Stack

- Python
- FastAPI
- PyTorch
- Hugging Face Transformers
- IndoBERTweet

## Project Structure

```text
toxilens-backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── schemas.py
│   ├── model_service.py
│   └── utils.py
├── .env.example
├── requirements.txt
└── README.md
```

## Installation

### 1. Clone Repository

```bash
git clone <REPOSITORY_URL>
cd toxilens-backend
```

### 2. Create Virtual Environment

```bash
python -m venv .venv
```

Activate the environment:

**Windows:**
```bash
.venv\Scripts\activate
```

**Linux / macOS:**
```bash
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Configure the required variables in `.env`:

Make sure the Hugging Face model IDs in `MODEL_IDS` are configured correctly in `.env`.

If the models are private, provide a valid Hugging Face access token.

### 5. Run Backend

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend will run at:

```text
http://127.0.0.1:8000
```

## API Documentation

Open Swagger UI in your browser:

```text
http://127.0.0.1:8000/docs
```

Available endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API information |
| GET | `/health` | Health check |
| POST | `/api/v1/predict/text-only` | Text-only prediction |
| POST | `/api/v1/predict/metadata` | Metadata prediction |

## Notes

- Models are loaded automatically from Hugging Face when first requested.
- The first prediction may take longer because the models need to be downloaded.
- Subsequent predictions reuse the cached models.
- `MODEL_DEVICE=auto` automatically selects CUDA if available, otherwise CPU.
- Make sure `.env` is not committed to the repository.
- GPU is optional; the backend can also run on CPU.

