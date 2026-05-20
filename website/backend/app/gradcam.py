from pathlib import Path

import cv2
import numpy as np
import torch
from PIL import Image
from torch import nn

from . import config
from .model_service import display_image_array, get_device, preprocess_image
from .schemas import GradcamImages, GradcamResult


def _target_layer(model: nn.Module, stage: str) -> nn.Module:
    if stage == "stage1":
        return model.features[-1]
    return model.features.denseblock4


def _target_score(output: torch.Tensor, stage: str, class_index: int | None) -> torch.Tensor:
    if stage == "stage1":
        return output.squeeze()
    if class_index is None:
        class_index = int(torch.argmax(output.squeeze(0)).item())
    return output.squeeze(0)[class_index]


def generate_gradcam(
    *,
    model: nn.Module,
    image: Image.Image,
    stage: str,
    output_dir: Path,
    class_index: int | None = None,
) -> GradcamResult:
    activations: list[torch.Tensor] = []
    gradients: list[torch.Tensor] = []
    layer = _target_layer(model, stage)

    def forward_hook(_module, _inputs, output):
        activations.append(output.detach())

    def backward_hook(_module, _grad_input, grad_output):
        gradients.append(grad_output[0].detach())

    handle_fwd = layer.register_forward_hook(forward_hook)
    handle_bwd = layer.register_full_backward_hook(backward_hook)

    try:
        output_dir.mkdir(parents=True, exist_ok=True)
        device = get_device()
        tensor = preprocess_image(image).to(device)
        model.zero_grad(set_to_none=True)
        output = model(tensor)
        score = _target_score(output, stage, class_index)
        score.backward()

        if not activations or not gradients:
            raise RuntimeError("Grad-CAM hooks did not capture activations")

        acts = activations[-1]
        grads = gradients[-1]
        weights = grads.mean(dim=(2, 3), keepdim=True)
        cam = (weights * acts).sum(dim=1).squeeze()
        cam = torch.relu(cam)
        cam_np = cam.detach().cpu().numpy()
        cam_np = cam_np - cam_np.min()
        denom = cam_np.max() if cam_np.max() > 0 else 1.0
        cam_np = cam_np / denom

        original = display_image_array(image)
        heat = cv2.resize(cam_np, (original.shape[1], original.shape[0]))
        heat_uint = np.uint8(255 * heat)
        color_heat = cv2.applyColorMap(heat_uint, cv2.COLORMAP_JET)
        color_heat = cv2.cvtColor(color_heat, cv2.COLOR_BGR2RGB)
        overlay = np.uint8(0.58 * original + 0.42 * color_heat)

        original_path = output_dir / f"{stage}-original.jpeg"
        heatmap_path = output_dir / f"{stage}-heatmap.jpeg"
        overlay_path = output_dir / f"{stage}-overlay.jpeg"
        Image.fromarray(original).save(original_path, quality=90)
        Image.fromarray(color_heat).save(heatmap_path, quality=90)
        Image.fromarray(overlay).save(overlay_path, quality=90)

        return GradcamResult(
            status="available",
            stage=stage,  # type: ignore[arg-type]
            images=GradcamImages(
                originalUrl=config.asset_url(original_path),
                heatmapUrl=config.asset_url(heatmap_path),
                overlayUrl=config.asset_url(overlay_path),
            ),
        )
    except Exception as exc:
        return GradcamResult(
            status="unavailable",
            stage=stage,  # type: ignore[arg-type]
            message=f"Grad-CAM uretilemedi: {exc}",
        )
    finally:
        handle_fwd.remove()
        handle_bwd.remove()
