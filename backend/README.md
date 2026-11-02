# RealOrFake inference API

This FastAPI service implements the exact inference recipe recovered from the
shared `team_novatrix.ipynb` notebook and `best_multimodal_model_50ep.pth` state
dict. The model weights are intentionally excluded from Git.

## Runtime contract

- One required front image drives the trained single-image model.
- Supporting views are validated and reported as evidence, but are not averaged
  into the prediction because the notebook did not train a multi-image model.
- EasyOCR uses English, paragraph mode, and a 1,024 px maximum dimension.
- The image input is RGB, resized to 224×224, and ImageNet-normalized.
- Text uses `sentence-transformers/all-MiniLM-L6-v2`.
- The auxiliary scalar is cosine similarity to the notebook's selected authentic
  reference text.
- Label `0` is Original, label `1` is Fake, and the sigmoid threshold is 0.5.

## Run locally

Use Python 3.10–3.12. PyTorch does not currently support the Python 3.14 runtime
installed as the system `py` command on the development machine.

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Place the checkpoint at `backend/models/best_multimodal_model_50ep.pth`, or set
`MODEL_DOWNLOAD_URL` to a private or controlled download URL. The service verifies
the checkpoint SHA-256 before loading it.

Health check: `GET /health`

Analysis: `POST /v1/analyze` using the multipart contract documented in the root
README.

## Docker

```bash
docker build -t realorfake-api backend
docker run --rm -p 8000:8000 --env-file backend/.env realorfake-api
```

The first startup downloads the public MiniLM tokenizer/model metadata and
EasyOCR detector/recognizer data unless those caches are already present. For a
production deployment, bake or mount those caches and keep the PyTorch checkpoint
in protected object storage.
