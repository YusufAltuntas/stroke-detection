from pathlib import Path


APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
WEBSITE_DIR = BACKEND_DIR.parent
REPO_DIR = WEBSITE_DIR.parent

MODEL_STAGE1_PATH = WEBSITE_DIR / "best_efficientnet_b3_A_fullstroke.pth"
MODEL_STAGE2_PATH = WEBSITE_DIR / "best_model_densenet_v1.pth"

DEMO_ASSETS_DIR = WEBSITE_DIR / "demo-assets"
SAMPLES_DIR = DEMO_ASSETS_DIR / "samples"
THUMBNAILS_DIR = DEMO_ASSETS_DIR / "thumbnails"
CACHE_DIR = DEMO_ASSETS_DIR / "cache"
RUNTIME_DIR = DEMO_ASSETS_DIR / "runtime"
SOURCE_MAP_PATH = DEMO_ASSETS_DIR / "source-map.json"

STATIC_MOUNT = "/static"
STATIC_DIRS = {
    "samples": SAMPLES_DIR,
    "thumbnails": THUMBNAILS_DIR,
    "cache": CACHE_DIR,
    "runtime": RUNTIME_DIR,
}

IMAGE_SIZE = 300
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

STAGE1_THRESHOLD = 0.15
STAGE2_CLASSES = ["ACA", "MCA", "PCA"]

COLOR_DIFF_MAX = 12.0
BRIGHTNESS_MAX = 160.0
DARK_RATIO_MIN = 0.15
MIDRANGE_RATIO_MIN = 0.003

UPLOAD_REJECT_MESSAGE = (
    "Bu goruntu gri tonlamali bir beyin MR-DWI kesitine benzemiyor. "
    "Lutfen uygun bir beyin MR-DWI goruntusu yukleyin."
)


def ensure_runtime_dirs() -> None:
    for path in [SAMPLES_DIR, THUMBNAILS_DIR, CACHE_DIR, RUNTIME_DIR]:
        path.mkdir(parents=True, exist_ok=True)


def asset_url(path: Path) -> str:
    resolved = path.resolve()
    for mount_name, root in STATIC_DIRS.items():
        try:
            rel = resolved.relative_to(root.resolve())
            return f"{STATIC_MOUNT}/{mount_name}/{rel.as_posix()}"
        except ValueError:
            continue
    raise ValueError(f"Path is not in a public static directory: {path}")
