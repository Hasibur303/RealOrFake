# Model integration contract

This document records what can be verified from the shared checkpoint without
executing its pickle payload. It deliberately separates confirmed facts from
the training details that must be supplied before production inference is safe.

## Inspected checkpoint

- File: `best_multimodal_model_50ep.pth`
- Drive file ID: `1cBDSg-mIN0bvUuLyMfSTuHh_TUNNrm98`
- Size: 190,523,894 bytes
- SHA-256: `2EFCF2283935E4CA91791B7E9FC965FB0BA9B87BDD684060F5C2B1144E744C6E`
- Format: PyTorch ZIP checkpoint containing a plain `OrderedDict` state dict
- Tensor count: 437
- Saved device: CUDA; a backend loader must remap weights to its available device

The checkpoint was inspected with `scripts/inspect_checkpoint.py`. That utility
allows only the minimal globals used by a plain state dict and reports tensor
names and shapes without importing or executing checkpoint-defined code.

## Verified architecture

The parameter names and shapes establish the following structure:

- Visual branch: ResNet-50 feature extractor with a 2,048-dimensional output.
- Text branch: a six-layer, 384-hidden-dimension BERT/MiniLM encoder with a
  30,522-token vocabulary and 512-position embeddings. The structure is
  consistent with a Sentence-Transformers MiniLM-L6 model, but the exact model
  identifier and pooling configuration must be confirmed from the training code.
- Fusion input: 2,433 features, which equals 2,048 visual features + 384 text
  features + one additional scalar.
- Fusion head:
  - Linear `2433 -> 512`
  - Batch normalization with 512 features
  - Parameter-free activation/dropout layers
  - Linear `512 -> 128`
  - Batch normalization with 128 features
  - Parameter-free activation/dropout layers
  - Linear `128 -> 1`
- Output: one binary logit.

## Verified training contract

The shared `team_novatrix.ipynb` notebook supplies the previously missing
inference recipe:

1. RGB images are resized directly to 224×224, converted to tensors, and
   normalized with ImageNet mean `[0.485, 0.456, 0.406]` and standard deviation
   `[0.229, 0.224, 0.225]`.
2. EasyOCR runs in English with `detail=0` and `paragraph=True`; images larger
   than 1,024 px on either side are proportionally downscaled first.
3. Text uses `all-MiniLM-L6-v2` without normalized embeddings.
4. The extra scalar is cosine similarity between the extracted OCR text and the
   notebook-selected authentic reference text.
5. The reference is selected by a case-insensitive brand substring with a
   default-cosmetic fallback.
6. Label `0` is Original, label `1` is Fake, and inference uses sigmoid with a
   threshold of 0.5.
7. The checkpoint evaluates one image per example; it was not trained to average
   multiple package views.

## Deployment boundary

The 190 MB PyTorch model cannot execute in the current static GitHub Pages site.
It should run in a Python inference API with the checkpoint kept outside the
public Git repository. The existing frontend already sends multipart requests to
`POST /v1/analyze` when `VITE_API_BASE_URL` is configured.

The backend should:

- load with `torch.load(..., weights_only=True, map_location=device)`;
- validate file type, size, image readability, and request limits;
- run OCR and model inference server-side;
- return the typed response documented in `README.md`;
- expose an allowlisted CORS origin for the deployed frontend;
- avoid logging uploaded package images or extracted text by default; and
- report model limitations rather than treating a score as certification.

The implementation now lives in `backend/` as a FastAPI service matching the
existing `/v1/analyze` frontend contract. A known labeled image remains desirable
for a final end-to-end prediction check before public research use.
