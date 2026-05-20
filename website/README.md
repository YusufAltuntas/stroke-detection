# MRI-DWI Stroke Detection Demo UI

Two-stage local demo for the graduation presentation:

1. Stage 1: EfficientNet-B3 stroke vs normal detection.
2. Stage 2: DenseNet-121 ACA / MCA / PCA artery classification.

This is a research prototype. It shows model confidence and Grad-CAM attention maps; it is not a clinical diagnosis system.

## Recommended Windows Presentation Startup

Prerequisite: Docker Desktop.

```powershell
cd website
.\scripts\run-docker.ps1
```

Open:

```text
http://localhost:5173
```

The backend runs at `http://localhost:8000`.

## Local Fallback Without Docker

Prerequisites:

- Python 3.11
- Node.js 24 or newer

Terminal 1:

```powershell
cd website
.\scripts\run-backend.ps1
```

Terminal 2:

```powershell
cd website
.\scripts\run-frontend.ps1
```

Open `http://localhost:5173`.

## Project Layout

```text
website/
  backend/                 FastAPI backend
  frontend/                React/Vite frontend
  demo-assets/             anonymized samples, thumbnails, cache, runtime Grad-CAM
  best_*.pth               trained model weights
  scripts/                 Windows startup scripts
  docker-compose.yml
```

## Demo Notes

- Prepared sample labels are anonymized as `Normal-01`, `ACA-01`, `MCA-01`, `PCA-01`.
- Uploaded images are checked for MRI-DWI-like grayscale brain slice characteristics before inference.
- If Stage 1 predicts no stroke, Stage 2 is skipped automatically in Full Pipeline mode.
- Grad-CAM may take additional time on CPU on first run.
