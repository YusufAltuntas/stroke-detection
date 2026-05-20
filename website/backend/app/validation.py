from dataclasses import dataclass

import numpy as np
from PIL import Image

from . import config


@dataclass(frozen=True)
class ValidationStats:
    color_diff: float
    mean_brightness: float
    dark_ratio: float
    midrange_ratio: float


def image_stats(image: Image.Image) -> ValidationStats:
    arr = np.array(image.convert("RGB"), dtype=np.float32)
    r = arr[:, :, 0]
    g = arr[:, :, 1]
    b = arr[:, :, 2]

    color_diff = float(
        np.mean(
            [
                np.mean(np.abs(r - g)),
                np.mean(np.abs(r - b)),
                np.mean(np.abs(g - b)),
            ]
        )
    )
    gray = arr.mean(axis=2)
    mean_brightness = float(gray.mean())
    dark_ratio = float((gray < 30).mean())
    midrange_ratio = float(((gray >= 50) & (gray <= 200)).mean())
    return ValidationStats(color_diff, mean_brightness, dark_ratio, midrange_ratio)


def validate_mri_dwi_image(image: Image.Image) -> tuple[bool, str | None, ValidationStats]:
    stats = image_stats(image)
    if stats.color_diff > config.COLOR_DIFF_MAX:
        return False, config.UPLOAD_REJECT_MESSAGE, stats
    if stats.mean_brightness > config.BRIGHTNESS_MAX:
        return False, config.UPLOAD_REJECT_MESSAGE, stats
    if stats.dark_ratio < config.DARK_RATIO_MIN:
        return False, config.UPLOAD_REJECT_MESSAGE, stats
    if stats.midrange_ratio < config.MIDRANGE_RATIO_MIN:
        return False, config.UPLOAD_REJECT_MESSAGE, stats
    return True, None, stats
