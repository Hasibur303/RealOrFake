from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


CHECKPOINT_SHA256 = "2efcf2283935e4ca91791b7e9fc965fb0ba9b87bdd684060f5c2b1144e744c6e"


def _split_origins(value: str) -> tuple[str, ...]:
    return tuple(origin.strip().rstrip("/") for origin in value.split(",") if origin.strip())


@dataclass(frozen=True)
class Settings:
    model_path: Path
    model_download_url: str | None
    model_sha256: str
    max_file_size_bytes: int
    cors_origins: tuple[str, ...]
    device: str
    sbert_model_name: str


def load_settings() -> Settings:
    backend_root = Path(__file__).resolve().parents[1]
    return Settings(
        model_path=Path(
            os.getenv(
                "MODEL_PATH",
                backend_root / "models" / "best_multimodal_model_50ep.pth",
            )
        ),
        model_download_url=os.getenv("MODEL_DOWNLOAD_URL") or None,
        model_sha256=os.getenv("MODEL_SHA256", CHECKPOINT_SHA256).lower(),
        max_file_size_bytes=int(float(os.getenv("MAX_FILE_SIZE_MB", "8")) * 1024 * 1024),
        cors_origins=_split_origins(
            os.getenv(
                "CORS_ORIGINS",
                "http://127.0.0.1:5173,http://localhost:5173,https://hasibur303.github.io",
            )
        ),
        device=os.getenv("MODEL_DEVICE", "auto"),
        sbert_model_name=os.getenv("SBERT_MODEL_NAME", "sentence-transformers/all-MiniLM-L6-v2"),
    )
