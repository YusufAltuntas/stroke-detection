from functools import lru_cache
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from torch import nn
from torchvision import models, transforms

from . import config
from .schemas import ProbabilityItem, StageResult


class ModelUnavailable(RuntimeError):
    pass


def get_device() -> torch.device:
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def build_stage1_model() -> nn.Module:
    model = models.efficientnet_b3(weights=None)
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(in_features, 1),
    )
    return model


def build_stage2_model() -> nn.Module:
    model = models.densenet121(weights=None)
    in_features = model.classifier.in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3),
        nn.Linear(in_features, len(config.STAGE2_CLASSES)),
    )
    return model


def _load_state_dict(model: nn.Module, path: Path) -> nn.Module:
    if not path.exists():
        raise ModelUnavailable(f"Model checkpoint not found: {path.name}")
    state_dict = torch.load(path, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    return model


@lru_cache(maxsize=1)
def get_stage1_model() -> nn.Module:
    return _load_state_dict(build_stage1_model(), config.MODEL_STAGE1_PATH).to(get_device())


@lru_cache(maxsize=1)
def get_stage2_model() -> nn.Module:
    return _load_state_dict(build_stage2_model(), config.MODEL_STAGE2_PATH).to(get_device())


def preprocess_image(image: Image.Image) -> torch.Tensor:
    transform = transforms.Compose(
        [
            transforms.Resize((config.IMAGE_SIZE, config.IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=config.IMAGENET_MEAN, std=config.IMAGENET_STD),
        ]
    )
    return transform(image.convert("RGB")).unsqueeze(0)


def display_image_array(image: Image.Image) -> np.ndarray:
    resized = image.convert("RGB").resize((config.IMAGE_SIZE, config.IMAGE_SIZE))
    return np.array(resized)


def predict_stage1(image: Image.Image) -> StageResult:
    model = get_stage1_model()
    tensor = preprocess_image(image).to(get_device())
    with torch.no_grad():
        logit = model(tensor).squeeze().float()
        stroke_prob = torch.sigmoid(logit).item()
    no_stroke_prob = 1.0 - stroke_prob
    label = "Stroke Detected" if stroke_prob >= config.STAGE1_THRESHOLD else "No Stroke Detected"
    confidence = stroke_prob if label == "Stroke Detected" else no_stroke_prob
    return StageResult(
        stage="stage1",
        modelName="EfficientNet-B3",
        label=label,
        confidence=float(confidence),
        probabilities=[
            ProbabilityItem(label="No Stroke", probability=float(no_stroke_prob)),
            ProbabilityItem(label="Stroke", probability=float(stroke_prob)),
        ],
    )


def predict_stage2(image: Image.Image) -> StageResult:
    model = get_stage2_model()
    tensor = preprocess_image(image).to(get_device())
    with torch.no_grad():
        logits = model(tensor).squeeze(0).float()
        probs = torch.softmax(logits, dim=0).cpu().numpy()
    max_idx = int(np.argmax(probs))
    return StageResult(
        stage="stage2",
        modelName="DenseNet-121",
        label=config.STAGE2_CLASSES[max_idx],
        confidence=float(probs[max_idx]),
        probabilities=[
            ProbabilityItem(label=label, probability=float(probs[idx]))
            for idx, label in enumerate(config.STAGE2_CLASSES)
        ],
    )


def check_checkpoint_shapes() -> dict[str, bool]:
    status = {"stage1": False, "stage2": False}
    if config.MODEL_STAGE1_PATH.exists():
        sd1 = torch.load(config.MODEL_STAGE1_PATH, map_location="cpu")
        status["stage1"] = tuple(sd1["classifier.1.weight"].shape) == (1, 1536)
    if config.MODEL_STAGE2_PATH.exists():
        sd2 = torch.load(config.MODEL_STAGE2_PATH, map_location="cpu")
        status["stage2"] = tuple(sd2["classifier.1.weight"].shape) == (3, 1024)
    return status
