from pathlib import Path

from PIL import Image

from . import cache, config
from .gradcam import generate_gradcam
from .model_service import (
    ModelUnavailable,
    get_stage1_model,
    get_stage2_model,
    predict_stage1,
    predict_stage2,
)
from .schemas import GradcamResult, PredictMode, PredictResponse, StageResult


SKIP_MESSAGE = "Inme saptanmadigi icin arter siniflandirmasi calistirilmadi."


def _skipped_stage2() -> StageResult:
    return StageResult(
        stage="stage2",
        modelName="DenseNet-121",
        label="Not run",
        confidence=0.0,
        probabilities=[],
        skipped=True,
        message=SKIP_MESSAGE,
    )


def run_prediction(
    image: Image.Image,
    *,
    mode: PredictMode,
    source_type: str,
    sample_id: str | None = None,
    output_dir: Path | None = None,
) -> PredictResponse:
    output_dir = output_dir or cache.runtime_output_dir()
    warnings: list[str] = []
    stage1 = None
    stage2 = None
    gradcam = GradcamResult(status="skipped")

    try:
        if mode in ("full_pipeline", "stage1_only"):
            stage1 = predict_stage1(image)
            if mode == "stage1_only":
                gradcam = generate_gradcam(
                    model=get_stage1_model(),
                    image=image,
                    stage="stage1",
                    output_dir=output_dir,
                )
            elif stage1.label == "No Stroke Detected":
                stage2 = _skipped_stage2()
                gradcam = generate_gradcam(
                    model=get_stage1_model(),
                    image=image,
                    stage="stage1",
                    output_dir=output_dir,
                )
            else:
                stage2 = predict_stage2(image)
                gradcam = generate_gradcam(
                    model=get_stage2_model(),
                    image=image,
                    stage="stage2",
                    output_dir=output_dir,
                )

        if mode == "stage2_only":
            stage2 = predict_stage2(image)
            gradcam = generate_gradcam(
                model=get_stage2_model(),
                image=image,
                stage="stage2",
                output_dir=output_dir,
            )

        if gradcam.status == "unavailable" and gradcam.message:
            warnings.append(gradcam.message)

        return PredictResponse(
            status="success",
            mode=mode,
            sourceType=source_type,  # type: ignore[arg-type]
            sampleId=sample_id,
            stage1=stage1,
            stage2=stage2,
            gradcam=gradcam,
            warnings=warnings,
        )
    except ModelUnavailable as exc:
        return PredictResponse(
            status="model_unavailable",
            mode=mode,
            sourceType=source_type,  # type: ignore[arg-type]
            sampleId=sample_id,
            validationMessage=str(exc),
            warnings=[str(exc)],
        )
    except Exception as exc:
        return PredictResponse(
            status="inference_error",
            mode=mode,
            sourceType=source_type,  # type: ignore[arg-type]
            sampleId=sample_id,
            validationMessage="Inference sirasinda hata olustu.",
            warnings=[str(exc)],
        )


def run_sample_prediction(sample_id: str, image_path: Path, mode: PredictMode) -> PredictResponse:
    cached = cache.load_sample_cache(sample_id)
    if cached and cached.mode == mode:
        return cached
    image = Image.open(image_path).convert("RGB")
    response = run_prediction(
        image,
        mode=mode,
        source_type="sample",
        sample_id=sample_id,
        output_dir=config.CACHE_DIR / sample_id,
    )
    if response.status == "success":
        cache.write_sample_cache(sample_id, response)
    return response
