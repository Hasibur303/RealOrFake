from __future__ import annotations

import asyncio
import json
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Annotated
from uuid import uuid4

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from .config import load_settings
from .contracts import (
    AnalysisResponse,
    ErrorBody,
    HealthResponse,
    ImageModelOutput,
    ImageQualityResult,
    OcrTextBlock,
    ProductDetails,
    ReferenceMatch,
)
from .inference import MODEL_VERSION, InferenceEngine, decode_image, image_quality_issues


settings = load_settings()
engine = InferenceEngine(settings)
load_error: str | None = None
loading = True


@asynccontextmanager
async def lifespan(_: FastAPI):
    global load_error, loading
    try:
        await asyncio.to_thread(engine.load)
    except Exception as error:
        load_error = str(error)
    finally:
        loading = False
    yield


app = FastAPI(
    title="RealOrFake inference API",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def api_error(status: int, code: str, message: str, *, retryable: bool, details: list[str] | None = None) -> HTTPException:
    return HTTPException(
        status_code=status,
        detail=ErrorBody(
            code=code,
            message=message,
            details=details or [],
            retryable=retryable,
        ).model_dump(),
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_, exception: HTTPException):
    if isinstance(exception.detail, dict) and "code" in exception.detail:
        return JSONResponse(status_code=exception.status_code, content=exception.detail)
    return JSONResponse(
        status_code=exception.status_code,
        content=ErrorBody(
            code="REQUEST_ERROR",
            message=str(exception.detail),
            retryable=False,
        ).model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def request_validation_handler(_, exception: RequestValidationError):
    details = [
        f"{'.'.join(str(part) for part in error['loc'])}: {error['msg']}"
        for error in exception.errors()
    ]
    return JSONResponse(
        status_code=422,
        content=ErrorBody(
            code="REJECTED_FILE",
            message="The analysis request is missing required inputs or metadata.",
            details=details,
            retryable=False,
        ).model_dump(),
    )


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    if loading:
        return HealthResponse(status="loading")
    if not engine.ready:
        return HealthResponse(status="unavailable", detail=load_error or "Model failed to load")
    return HealthResponse(
        status="ready",
        modelVersion=MODEL_VERSION,
        device=str(engine.device),
    )


@app.post("/v1/analyze", response_model=AnalysisResponse)
async def analyze(
    images: Annotated[list[UploadFile], File()],
    imageViews: Annotated[str, Form()],
    product: Annotated[str, Form()],
) -> AnalysisResponse:
    if not engine.ready:
        raise api_error(
            503,
            "SERVICE_UNAVAILABLE",
            "The analysis model is not ready.",
            retryable=True,
            details=[load_error] if load_error else None,
        )
    if not 1 <= len(images) <= 4:
        raise api_error(422, "REJECTED_FILE", "Upload between one and four images.", retryable=False)

    try:
        views = json.loads(imageViews)
        product_details = ProductDetails.model_validate_json(product)
    except (json.JSONDecodeError, ValidationError) as error:
        raise api_error(422, "INCOMPLETE_RESPONSE", "Product or image-view metadata is invalid.", retryable=False) from error

    if not isinstance(views, list) or len(views) != len(images):
        raise api_error(422, "REJECTED_FILE", "Each image must have one matching view label.", retryable=False)
    if any(view not in {"front", "back", "detail"} for view in views):
        raise api_error(422, "REJECTED_FILE", "An image view label is unsupported.", retryable=False)
    front_indexes = [index for index, view in enumerate(views) if view == "front"]
    if len(front_indexes) != 1:
        raise api_error(422, "REJECTED_FILE", "Choose exactly one front image.", retryable=False)

    decoded = []
    quality = []
    for index, upload in enumerate(images):
        data = await upload.read(settings.max_file_size_bytes + 1)
        if len(data) > settings.max_file_size_bytes:
            raise api_error(413, "REJECTED_FILE", f"{upload.filename or 'An image'} exceeds the file-size limit.", retryable=False)
        try:
            image = await asyncio.to_thread(decode_image, data)
        except ValueError as error:
            raise api_error(422, "REJECTED_FILE", str(error), retryable=False) from error
        issues = image_quality_issues(image)
        decoded.append(image)
        quality.append(
            ImageQualityResult(
                imageId=upload.filename or f"image-{index + 1}",
                view=views[index],
                usable=image.width >= 224 and image.height >= 224,
                issues=issues,
            )
        )

    front_index = front_indexes[0]
    if not quality[front_index].usable:
        raise api_error(422, "REJECTED_FILE", "The front image is too small for analysis.", retryable=False)

    prediction = await asyncio.to_thread(engine.predict, decoded[front_index])
    suspicious = prediction.probability_fake >= 0.5
    outcome = "suspicious-packaging" if suspicious else "likely-genuine"
    score_percent = round(prediction.probability_fake * 100)
    similarity_percent = round(prediction.text_similarity * 100)
    missing_information = []
    if not prediction.ocr_text:
        missing_information.append("No readable packaging text was extracted from the front image.")
    if len(images) == 1:
        missing_information.append("Only a front view was supplied; back and detail views were not assessed by the interface.")

    return AnalysisResponse(
        requestId=str(uuid4()),
        outcome=outcome,
        summary=(
            "The trained model found packaging signals that warrant further review."
            if suspicious
            else "The trained model found packaging signals closer to the original-product class."
        ),
        reasons=[
            f"The binary model produced a {score_percent}% fake-class sigmoid score against its 50% threshold.",
            f"Extracted front-label text had {similarity_percent}% cosine similarity to the selected notebook reference.",
            "The prediction combines ResNet-50 image features, MiniLM text features, and the text-similarity score.",
        ],
        suggestedNextSteps=[
            "Compare batch codes and seller details with the manufacturer or an authorized retailer.",
            "Review the supporting package views; the trained checkpoint evaluates one front image per prediction.",
            "Do not use this screening output as proof of authenticity, safety, or regulatory compliance.",
        ],
        imageQuality=quality,
        imageModel=ImageModelOutput(
            label="Suspicious-class signal" if suspicious else "Original-class signal",
            score=prediction.probability_fake,
            notes=[
                "The score is the model's fake-class sigmoid output, not a calibrated probability of authenticity.",
                f"Category supplied by the visitor: {product_details.category}.",
            ],
        ),
        extractedText=(
            [OcrTextBlock(text=prediction.ocr_text, sourceView="front")]
            if prediction.ocr_text
            else []
        ),
        referenceMatch=ReferenceMatch(
            referenceName=prediction.reference_name,
            market="Training-notebook reference set",
            packagingVersion="Notebook baseline",
            textSimilarity=prediction.text_similarity,
        ),
        fieldMismatches=[],
        missingInformation=missing_information,
        modelVersion=MODEL_VERSION,
        createdAt=datetime.now(UTC).isoformat().replace("+00:00", "Z"),
    )
