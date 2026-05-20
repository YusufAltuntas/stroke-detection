from pathlib import Path

from fastapi.testclient import TestClient
from PIL import Image

from app import config
from app.main import app
from app.model_service import check_checkpoint_shapes
from app.validation import validate_mri_dwi_image


client = TestClient(app)


def test_health_returns_status():
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["stage1ModelExists"] is True
    assert payload["stage2ModelExists"] is True


def test_samples_are_anonymized():
    response = client.get("/api/samples")
    assert response.status_code == 200
    payload = response.json()
    assert len(payload["samples"]) >= 4
    serialized = str(payload)
    forbidden = ["ahmet", "mimar", "alaeddin", "hasan", "stroke_dataset", "normal-samples"]
    for token in forbidden:
        assert token not in serialized


def test_validation_rejects_bright_rgb_document_like_image():
    image = Image.new("RGB", (500, 500), (255, 250, 245))
    is_valid, message, stats = validate_mri_dwi_image(image)
    assert is_valid is False
    assert message == config.UPLOAD_REJECT_MESSAGE
    assert stats.mean_brightness > config.BRIGHTNESS_MAX


def test_validation_accepts_curated_mri_sample():
    image = Image.open(config.SAMPLES_DIR / "aca-01.jpeg")
    is_valid, message, _stats = validate_mri_dwi_image(image)
    assert is_valid is True
    assert message is None


def test_checkpoint_shapes_match_expected_heads():
    shapes = check_checkpoint_shapes()
    assert shapes == {"stage1": True, "stage2": True}


def test_samples_static_files_exist():
    for name in ["normal-01.jpeg", "aca-01.jpeg", "mca-01.jpeg", "pca-01.jpeg"]:
        assert Path(config.SAMPLES_DIR / name).exists()
        assert Path(config.THUMBNAILS_DIR / name).exists()
