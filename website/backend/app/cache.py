import json
import uuid
from pathlib import Path

from pydantic import TypeAdapter

from . import config
from .schemas import PredictResponse


PREDICT_RESPONSE_ADAPTER = TypeAdapter(PredictResponse)


def sample_cache_path(sample_id: str) -> Path:
    return config.CACHE_DIR / sample_id / "prediction.json"


def load_sample_cache(sample_id: str) -> PredictResponse | None:
    path = sample_cache_path(sample_id)
    if not path.exists():
        return None
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return PREDICT_RESPONSE_ADAPTER.validate_python(data)


def write_sample_cache(sample_id: str, response: PredictResponse) -> None:
    path = sample_cache_path(sample_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(response.model_dump(), f, ensure_ascii=True, indent=2)


def runtime_output_dir() -> Path:
    path = config.RUNTIME_DIR / uuid.uuid4().hex
    path.mkdir(parents=True, exist_ok=True)
    return path
