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

## Required training contract

A state dict stores learned tensors, not the complete inference recipe. The
following items must come from the training notebook or source before the model
can be connected without inventing behavior:

1. Exact Python model class and `forward` method.
2. Image resize/crop, color mode, tensor conversion, and normalization values.
3. Exact Sentence-Transformers model identifier, tokenizer settings, maximum
   text length, pooling, and normalization behavior.
4. Definition and scaling of the extra scalar in the 2,433-feature fusion input.
5. How EasyOCR output is cleaned, ordered, joined, and paired with reference text.
6. Binary label map (`0` and `1`), sigmoid threshold, and any calibrated thresholds.
7. Reference-text source and the rule used to select a product reference.
8. At least one known input with its expected output for an end-to-end smoke test.

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

Once the training contract is supplied, the next implementation step is a
FastAPI service matching the existing `/v1/analyze` frontend contract, followed
by a known-sample verification before deployment.
