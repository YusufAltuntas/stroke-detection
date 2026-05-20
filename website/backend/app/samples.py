import json
from pathlib import Path

from . import config
from .schemas import SampleItem


DEFAULT_SAMPLES = [
    {
        "id": "normal-01",
        "displayName": "Normal-01",
        "labelGroup": "Normal",
        "image": "samples/normal-01.jpeg",
        "thumbnail": "thumbnails/normal-01.jpeg",
    },
    {
        "id": "aca-01",
        "displayName": "ACA-01",
        "labelGroup": "ACA",
        "image": "samples/aca-01.jpeg",
        "thumbnail": "thumbnails/aca-01.jpeg",
    },
    {
        "id": "mca-01",
        "displayName": "MCA-01",
        "labelGroup": "MCA",
        "image": "samples/mca-01.jpeg",
        "thumbnail": "thumbnails/mca-01.jpeg",
    },
    {
        "id": "pca-01",
        "displayName": "PCA-01",
        "labelGroup": "PCA",
        "image": "samples/pca-01.jpeg",
        "thumbnail": "thumbnails/pca-01.jpeg",
    },
]


def load_source_map() -> dict[str, dict[str, str]]:
    if not config.SOURCE_MAP_PATH.exists():
        return {item["id"]: item for item in DEFAULT_SAMPLES}
    with config.SOURCE_MAP_PATH.open("r", encoding="utf-8") as f:
        raw = json.load(f)
    return {item["id"]: item for item in raw["samples"]}


def list_samples() -> list[SampleItem]:
    source_map = load_source_map()
    items: list[SampleItem] = []
    for sample_id in sorted(source_map.keys()):
        sample = source_map[sample_id]
        image_path = config.DEMO_ASSETS_DIR / sample["image"]
        thumb_path = config.DEMO_ASSETS_DIR / sample["thumbnail"]
        cache_path = config.CACHE_DIR / sample_id / "prediction.json"
        if not image_path.exists() or not thumb_path.exists():
            continue
        items.append(
            SampleItem(
                id=sample_id,
                displayName=sample["displayName"],
                labelGroup=sample["labelGroup"],
                thumbnailUrl=config.asset_url(thumb_path),
                imageUrl=config.asset_url(image_path),
                hasCachedResult=cache_path.exists(),
            )
        )
    return items


def resolve_sample_image(sample_id: str) -> Path:
    source_map = load_source_map()
    if sample_id not in source_map:
        raise KeyError(f"Unknown sample id: {sample_id}")
    image_path = config.DEMO_ASSETS_DIR / source_map[sample_id]["image"]
    if not image_path.exists():
        raise FileNotFoundError(f"Sample image missing for {sample_id}")
    return image_path
