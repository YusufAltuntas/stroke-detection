from io import BytesIO

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image

from . import config
from .inference import run_prediction, run_sample_prediction
from .results_data import get_results_data
from .samples import list_samples, resolve_sample_image
from .schemas import HealthResponse, PredictMode, PredictResponse, SamplesResponse
from .validation import validate_mri_dwi_image


config.ensure_runtime_dirs()

app = FastAPI(title="Stroke Detection Demo API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
for mount_name, directory in config.STATIC_DIRS.items():
    app.mount(f"{config.STATIC_MOUNT}/{mount_name}", StaticFiles(directory=directory), name=f"static-{mount_name}")


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    samples = list_samples()
    return HealthResponse(
        status="ok",
        stage1ModelExists=config.MODEL_STAGE1_PATH.exists(),
        stage2ModelExists=config.MODEL_STAGE2_PATH.exists(),
        samplesReady=len(samples) > 0,
        cacheReady=config.CACHE_DIR.exists(),
        runtimeReady=config.RUNTIME_DIR.exists(),
    )


@app.get("/api/samples", response_model=SamplesResponse)
def samples() -> SamplesResponse:
    return SamplesResponse(samples=list_samples())


@app.get("/api/results")
def results():
    return get_results_data()


@app.post("/api/predict", response_model=PredictResponse)
async def predict(
    mode: PredictMode = Form("full_pipeline"),
    sample_id: str | None = Form(None),
    file: UploadFile | None = File(None),
) -> PredictResponse:
    if sample_id:
        try:
            image_path = resolve_sample_image(sample_id)
        except (KeyError, FileNotFoundError) as exc:
            return PredictResponse(
                status="inference_error",
                mode=mode,
                sourceType="sample",
                sampleId=sample_id,
                validationMessage=str(exc),
                warnings=[str(exc)],
            )
        return run_sample_prediction(sample_id, image_path, mode)

    if file is None:
        return PredictResponse(
            status="validation_rejected",
            mode=mode,
            sourceType="upload",
            validationMessage="Lutfen bir gorsel yukleyin veya ornek secin.",
        )

    try:
        raw = await file.read()
        image = Image.open(BytesIO(raw)).convert("RGB")
    except Exception:
        return PredictResponse(
            status="validation_rejected",
            mode=mode,
            sourceType="upload",
            validationMessage="Gorsel dosyasi okunamadi.",
        )

    is_valid, message, _stats = validate_mri_dwi_image(image)
    if not is_valid:
        return PredictResponse(
            status="validation_rejected",
            mode=mode,
            sourceType="upload",
            validationMessage=message,
        )

    return run_prediction(image, mode=mode, source_type="upload")
