from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


ImageView = Literal["front", "back", "detail"]
ScreeningOutcome = Literal[
    "likely-genuine",
    "suspicious-packaging",
    "insufficient-evidence",
    "unsupported-product",
]


class ProductDetails(BaseModel):
    category: str = Field(min_length=1, max_length=100)
    brand: str | None = Field(default=None, max_length=150)
    variant: str | None = Field(default=None, max_length=150)
    packageSize: str | None = Field(default=None, max_length=100)


class ImageQualityResult(BaseModel):
    imageId: str
    view: ImageView
    usable: bool
    issues: list[str]


class ImageModelOutput(BaseModel):
    label: str | None = None
    score: float | None = None
    notes: list[str] = Field(default_factory=list)


class OcrTextBlock(BaseModel):
    text: str
    confidence: float | None = None
    sourceView: ImageView | None = None


class ReferenceMatch(BaseModel):
    referenceName: str | None = None
    market: str | None = None
    packagingVersion: str | None = None
    textSimilarity: float | None = None


class FieldMismatch(BaseModel):
    field: str
    observed: str | None = None
    expected: str | None = None
    severity: Literal["note", "warning", "critical"]


class AnalysisResponse(BaseModel):
    requestId: str
    outcome: ScreeningOutcome
    summary: str
    reasons: list[str]
    suggestedNextSteps: list[str]
    imageQuality: list[ImageQualityResult]
    imageModel: ImageModelOutput | None = None
    extractedText: list[OcrTextBlock]
    referenceMatch: ReferenceMatch | None = None
    fieldMismatches: list[FieldMismatch]
    missingInformation: list[str]
    modelVersion: str | None = None
    createdAt: str


class ErrorBody(BaseModel):
    code: str
    message: str
    details: list[str] = Field(default_factory=list)
    retryable: bool


class HealthResponse(BaseModel):
    status: Literal["ready", "loading", "unavailable"]
    modelVersion: str | None = None
    device: str | None = None
    detail: str | None = None
