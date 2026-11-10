# ToxiLens — Frontend

React + TypeScript + Vite + Tailwind frontend for ToxiLens, an Indonesian toxicity detection research platform.
Frontend only: it talks to an existing FastAPI backend and contains no backend code.

## Run

```bash
npm install
cp .env.example .env     # set VITE_API_BASE_URL
npm run dev
```

## Where to change things

| What | File |
|---|---|
| Backend URL | `.env` → `VITE_API_BASE_URL` |
| Endpoint paths, response field mapping, text length limit | `src/config/api.ts` |
| Metadata fields, dropdown options, fields per variant | `src/config/metadata.ts` |
| Model labels / example sentences | `src/config/modes.ts` |
| Request / response types | `src/types/api.ts` |
| HTTP calls + response normalization | `src/services/api.ts` |
| Dataset figures (all `null` = placeholder) | `src/data/dataset.ts` |
| Model, research, API-doc content | `src/data/model.ts`, `research.ts`, `apiDocs.ts` |
| Theme colors (light / dark) | `src/index.css` |

Metadata dropdown options and the Stage 2 category names are placeholders taken from the example contract; replace them with the real values.
