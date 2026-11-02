from __future__ import annotations

import hashlib
import io
import os
import threading
import urllib.request
from dataclasses import dataclass
from pathlib import Path

import cv2
import easyocr
import numpy as np
import torch
from PIL import Image
from sentence_transformers import util
from torchvision import transforms

from .config import Settings
from .model import MultimodalAuthenticityClassifier
from .references import reference_label, select_reference


MODEL_VERSION = "best_multimodal_model_50ep"
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}


@dataclass(frozen=True)
class Prediction:
    probability_fake: float
    ocr_text: str
    text_similarity: float
    reference_key: str
    reference_name: str


def file_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def ensure_checkpoint(settings: Settings) -> Path:
    path = settings.model_path
    if not path.exists():
        if not settings.model_download_url:
            raise FileNotFoundError(
                f"Model checkpoint not found at {path}. Set MODEL_PATH or MODEL_DOWNLOAD_URL."
            )
        path.parent.mkdir(parents=True, exist_ok=True)
        temporary = path.with_suffix(path.suffix + ".download")
        request = urllib.request.Request(
            settings.model_download_url,
            headers={"User-Agent": "RealOrFake inference service"},
        )
        with urllib.request.urlopen(request, timeout=120) as response, temporary.open("wb") as output:
            while block := response.read(1024 * 1024):
                output.write(block)
        os.replace(temporary, path)

    actual_hash = file_sha256(path)
    if actual_hash.lower() != settings.model_sha256:
        raise ValueError(
            "Model checkpoint checksum mismatch; refusing to load unverified weights."
        )
    return path


def decode_image(data: bytes) -> Image.Image:
    Image.MAX_IMAGE_PIXELS = 40_000_000
    try:
        image = Image.open(io.BytesIO(data))
        image.load()
    except Exception as error:
        raise ValueError("The uploaded file is not a readable image.") from error
    if image.format not in ALLOWED_FORMATS:
        raise ValueError("Only JPEG, PNG, and WebP images are supported.")
    return image.convert("RGB")


def image_quality_issues(image: Image.Image) -> list[str]:
    width, height = image.size
    issues: list[str] = []
    if width < 512 or height < 512:
        issues.append("Low resolution; use at least 512 px on each side when possible")
    ratio = max(width, height) / max(1, min(width, height))
    if ratio > 3.5:
        issues.append("Unusually narrow crop; include the complete package")
    return issues


class InferenceEngine:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.device = self._select_device(settings.device)
        self.model: MultimodalAuthenticityClassifier | None = None
        self.reader: easyocr.Reader | None = None
        self._lock = threading.Lock()
        self.transform = transforms.Compose(
            [
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )

    @staticmethod
    def _select_device(configured: str) -> torch.device:
        if configured == "auto":
            return torch.device("cuda" if torch.cuda.is_available() else "cpu")
        if configured == "cuda" and not torch.cuda.is_available():
            raise RuntimeError("MODEL_DEVICE=cuda was requested, but CUDA is unavailable.")
        return torch.device(configured)

    def load(self) -> None:
        checkpoint = ensure_checkpoint(self.settings)
        model = MultimodalAuthenticityClassifier(
            device=self.device,
            sbert_model_name=self.settings.sbert_model_name,
        ).to(self.device)
        state = torch.load(checkpoint, map_location=self.device, weights_only=True)
        model.load_state_dict(state, strict=True)
        model.eval()
        self.model = model
        self.reader = easyocr.Reader(["en"], gpu=self.device.type == "cuda")

    @property
    def ready(self) -> bool:
        return self.model is not None and self.reader is not None

    def extract_ocr(self, image: Image.Image, max_dimension: int = 1024) -> str:
        if self.reader is None:
            raise RuntimeError("OCR reader is not loaded.")
        rgb = np.asarray(image)
        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        height, width = bgr.shape[:2]
        if max(height, width) > max_dimension:
            scale = max_dimension / float(max(height, width))
            bgr = cv2.resize(
                bgr,
                (int(width * scale), int(height * scale)),
                interpolation=cv2.INTER_AREA,
            )
        results = self.reader.readtext(bgr, detail=0, paragraph=True)
        return " ".join(str(result) for result in results).strip()

    def predict(self, image: Image.Image) -> Prediction:
        if self.model is None:
            raise RuntimeError("Model is not loaded.")

        with self._lock, torch.inference_mode():
            ocr_text = self.extract_ocr(image)
            reference_key, reference_text = select_reference(ocr_text)
            embeddings = self.model.sbert.encode(
                [ocr_text, reference_text],
                convert_to_tensor=True,
                device=str(self.device),
            )
            similarity = float(util.cos_sim(embeddings[0], embeddings[1]).item())
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            similarity_tensor = torch.tensor([similarity], dtype=torch.float32, device=self.device)
            logits = self.model(image_tensor, [ocr_text], similarity_tensor)
            probability_fake = float(torch.sigmoid(logits).squeeze().item())

        return Prediction(
            probability_fake=probability_fake,
            ocr_text=ocr_text,
            text_similarity=similarity,
            reference_key=reference_key,
            reference_name=reference_label(reference_key),
        )
