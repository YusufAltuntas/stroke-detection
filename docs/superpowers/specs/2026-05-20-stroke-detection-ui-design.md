# Stroke Detection UI Design

Date: 2026-05-20
Status: Approved design draft

## Purpose

Build a local presentation-ready web interface for the two-stage stroke detection system. The UI must demonstrate both the technical pipeline and the academic experiment results without making clinical diagnosis claims.

The system is a research prototype. All predictions must be framed as model outputs and confidence scores, not as medical diagnosis.

## Project Context

The project has two model stages:

1. Stage 1: binary stroke detection, using EfficientNet-B3.
   - Notebook: `website/fn-efficcientnet-b3.ipynb`
   - Weights: `website/best_efficientnet_b3_A_fullstroke.pth`
   - Output: one binary logit for `Normal` vs `Stroke`
   - Reported test metrics: Accuracy 0.9554, Stroke Recall 0.9798, Stroke F1 0.9734, ROC-AUC 0.9593

2. Stage 2: artery classification, using DenseNet-121.
   - Notebook: `website/notebookdf63700f04.ipynb`
   - Weights: `website/best_model_densenet_v1.pth`
   - Output classes: `ACA`, `MCA`, `PCA`
   - Reported test metrics: Accuracy 0.8960, Macro F1 0.8533, ACA F1 0.8036, MCA F1 0.9298, PCA F1 0.8265

Available local data:

- Stroke examples: `stroke_dataset/ACA`, `stroke_dataset/MCA`, `stroke_dataset/PCA`
- Normal demo examples: `website/normal-samples`
- Model result documentation: `results/results.md`

Patient names and date-like identifiers exist in source image filenames. The UI must never display raw filenames or filesystem paths.

## Chosen Approach

Use a hybrid local web application:

- Frontend: React/Vite with TypeScript.
- Backend: FastAPI.
- Demo behavior:
  - Prepared sample images use cached predictions and cached Grad-CAM overlays when available.
  - Uploaded images run real inference and Grad-CAM generation through the backend.
  - If sample cache is missing, the backend may fall back to real inference.

This approach balances presentation stability with a real working inference pipeline.

## Visual Direction

The interface should feel like a polished academic demo with clinical credibility, not like a heavy hospital information system.

Visual requirements:

- Main palette: blue and white, with restrained neutral grays.
- Clear information hierarchy with compact cards and panels.
- Turkish primary UI copy with English technical labels where appropriate.
- Keep technical terms such as `Macro F1`, `Confidence`, `Grad-CAM`, `Confusion Matrix`, and `ROC-AUC` in English.
- Use a visible but non-dominant research prototype notice.

## Application Routes

### 1. Inference

Primary demo screen for running the model pipeline.

Core sections:

1. Input panel
   - User can choose between `Ornek Gorsel` and `Gorsel Yukle`.
   - Sample cards use anonymized labels such as `Normal-01`, `ACA-01`, `MCA-01`, `PCA-01`.
   - Uploaded images are previewed before prediction.
   - Raw filenames and local paths are hidden.

2. Pipeline controls
   - Modes:
     - `Full Pipeline`: run Stage 1 first; if stroke is detected, automatically run Stage 2.
     - `Stage 1 Only`: run only stroke vs normal detection.
     - `Stage 2 Only`: run artery classification, intended for known stroke examples.
   - Model selectors are visible but simple:
     - Stage 1: EfficientNet-B3 binary model.
     - Stage 2: DenseNet-121 artery model.
   - Defaults:
     - Mode: `Full Pipeline`
     - Stage 1 model: EfficientNet-B3
     - Stage 2 model: DenseNet-121

3. Results panel
   - Stage 1 result card:
     - `Stroke Detected` or `No Stroke Detected`
     - Confidence percentage
     - Probability bar
   - Stage 2 result card:
     - Enabled only when Stage 1 predicts stroke or when Stage 2 mode is selected.
     - Shows predicted artery class: `ACA`, `MCA`, or `PCA`.
     - Shows per-class probability bars.
   - Full pipeline skip behavior:
     - If Stage 1 returns `No Stroke Detected`, Stage 2 is skipped.
     - UI message: `Inme saptanmadigi icin arter siniflandirmasi calistirilmadi.`
   - Grad-CAM viewer:
     - Shows original image and heatmap overlay.
     - Defaults to the Grad-CAM for the final decision.
     - Allows viewing Stage 1 and Stage 2 heatmaps when both exist.

### 2. Deneyler & Sonuclar

Academic dashboard for explaining model development and final model selection.

Core sections:

1. Project overview
   - Two-stage pipeline diagram:
     - `MRI-DWI Image -> Stage 1 Stroke Detection -> Stage 2 Artery Classification`
   - Dataset summary cards:
     - Stage 1: Stroke 4609, Normal 915
     - Stage 2: ACA 372, MCA 3269, PCA 968
   - Short explanation of class imbalance and why Macro F1 is the primary Stage 2 metric.

2. Model family comparison
   - EfficientNet-B3 experiments.
   - DenseNet-121 experiments.
   - Compact comparison tables sourced from `results/results.md`.
   - Emphasize the chosen final models:
     - Stage 1: EfficientNet-B3 because of high stroke recall.
     - Stage 2: DenseNet-121 v1 because it has the best Macro F1 and meets ACA F1 target.

3. Final model metrics
   - Stage 1 metric cards:
     - Accuracy 0.9554
     - Stroke Recall 0.9798
     - Stroke F1 0.9734
     - ROC-AUC 0.9593
   - Stage 2 metric cards:
     - Accuracy 0.8960
     - Macro F1 0.8533
     - ACA F1 0.8036
     - MCA F1 0.9298
     - PCA F1 0.8265
   - Confusion matrix visualizations for both final models.
   - ROC or summary chart for Stage 1 if data is available.
   - Per-class precision, recall, and F1 chart for Stage 2.

4. Limitations
   - Research prototype; not a clinical diagnosis system.
   - ACA class has few samples and high metric variance.
   - No external validation on a separate hospital/scanner distribution.
   - Stage 1 normal examples are provided as demo assets.

## Backend Design

Backend responsibilities:

- Load and cache PyTorch models.
- Validate uploaded MRI-DWI images.
- Run Stage 1 inference.
- Run Stage 2 inference.
- Generate Grad-CAM overlays.
- Serve anonymized sample metadata.
- Serve experiment result data for charts and tables.

### Model Lifecycle

Models should be lazy-loaded on first use and kept in memory afterward.

Model definitions must match notebook architectures:

- Stage 1 EfficientNet-B3:
  - `torchvision.models.efficientnet_b3`
  - classifier head: `Dropout(p=0.3) + Linear(1536, 1)`
  - expected checkpoint head shape: `(1, 1536)`

- Stage 2 DenseNet-121:
  - `torchvision.models.densenet121`
  - classifier head: `Dropout(p=0.3) + Linear(1024, 3)`
  - expected checkpoint head shape: `(3, 1024)`

If a model fails to load, the backend should report model status through `/api/health` and allow cached sample demos to remain usable when possible.

### API Endpoints

Proposed endpoints:

- `GET /api/health`
  - Returns backend status, model availability, and asset/cache availability.

- `GET /api/samples`
  - Returns anonymized sample metadata:
    - sample id
    - label group
    - thumbnail URL
    - available cached outputs
  - Must not return raw filenames or filesystem paths.

- `POST /api/predict`
  - Accepts:
    - uploaded image or sample id
    - mode: `full_pipeline`, `stage1_only`, or `stage2_only`
    - selected model ids
  - Returns:
    - validation status
    - Stage 1 result, if run
    - Stage 2 result, if run
    - Grad-CAM image references or base64 payloads
    - warnings and fallback details

- `GET /api/results`
  - Returns experiment metrics and chart data used by `Deneyler & Sonuclar`.

## MRI-DWI Image Validation

Uploaded images must pass a lightweight MRI-DWI suitability check before inference.

The previous CT-oriented logic will be adapted to MRI-DWI terminology and messages. The validation checks:

1. Low color channel difference, because MRI-DWI examples are grayscale-like.
2. Mean brightness not too high, to reject documents and screenshots.
3. Sufficient dark background ratio.
4. Sufficient mid-gray brain tissue ratio.

Rejected upload message:

`Bu goruntu gri tonlamali bir beyin MR-DWI kesitine benzemiyor. Lutfen uygun bir beyin MR-DWI goruntusu yukleyin.`

Validation should not run on trusted prepared samples unless explicitly requested, because samples are curated demo assets.

## Full Pipeline Logic

Full pipeline behavior:

1. Validate image if uploaded.
2. Run Stage 1 EfficientNet-B3.
3. If Stage 1 predicts `No Stroke Detected`, return Stage 1 result and skip Stage 2.
4. If Stage 1 predicts `Stroke Detected`, run Stage 2 DenseNet-121.
5. Generate Grad-CAM for the final decision.
6. Return a unified response with stage-level outputs.

Stage 2 only behavior:

1. Validate image if uploaded.
2. Run DenseNet-121 artery classifier.
3. Return `ACA`, `MCA`, `PCA` probabilities and Grad-CAM.
4. UI should label this mode as intended for known stroke images.

## Grad-CAM Design

Grad-CAM is used to make model attention visible during the presentation.

Requirements:

- Generate heatmap overlays for Stage 1 and Stage 2 when each model runs.
- For the final output, show the Grad-CAM corresponding to the final decision.
- Prepared samples may use cached Grad-CAM images.
- Uploaded images generate Grad-CAM in real time.
- If Grad-CAM fails, show prediction results and an explanatory fallback message instead of failing the whole request.

Target layers can be selected during implementation based on the model internals:

- EfficientNet-B3: final convolutional feature block.
- DenseNet-121: final dense feature block before classifier.

## Frontend Component Design

### Shared Layout

- `AppShell`
  - Provides navigation, page container, and research prototype banner.
- `TopNav`
  - Links to `Inference` and `Deneyler & Sonuclar`.
- `PrototypeNotice`
  - Short research prototype warning.

### Inference Components

- `SamplePicker`
  - Displays anonymized sample cards and thumbnails.
- `UploadDropzone`
  - Handles file selection, drag/drop, preview, and client-side format checks.
- `PipelineControls`
  - Contains mode selection and model selectors.
- `StageResultCard`
  - Shows stage decision, confidence, and probability bars.
- `ProbabilityBars`
  - Reusable probability visualization for binary and three-class outputs.
- `GradCamViewer`
  - Shows original, heatmap, and overlay views.
- `ValidationAlert`
  - Shows MRI-DWI validation and backend error messages.

### Results Components

- `PipelineOverview`
  - Shows the two-stage flow.
- `DatasetSummary`
  - Shows class counts and imbalance notes.
- `ExperimentTable`
  - Shows EfficientNet-B3 and DenseNet-121 experiment rows.
- `MetricCards`
  - Shows final model headline metrics.
- `ConfusionMatrixChart`
  - Shows Stage 1 and Stage 2 confusion matrices.
- `PerClassMetricsChart`
  - Shows Stage 2 precision, recall, and F1 by class.
- `LimitationsPanel`
  - Shows research limitations and safety framing.

## Frontend State Model

Prediction state should distinguish:

- idle
- sample selected
- upload selected
- validating
- loading cached result
- running inference
- success
- validation rejected
- model unavailable
- inference error

All prediction modes should use the same response shape so the result cards do not need separate logic for samples and uploads.

## Demo Assets and Privacy

Prepared demo assets should be copied or generated under the UI app asset structure during implementation.

Requirements:

- Use anonymized labels only.
- Do not display raw filenames.
- Do not expose local filesystem paths in API responses.
- Include at least:
  - one `Normal` sample
  - one `ACA` sample
  - one `MCA` sample
  - one `PCA` sample
- Prefer multiple examples per class if time permits.

Normal sample source:

- `website/normal-samples`

Stroke sample source:

- `stroke_dataset/ACA`
- `stroke_dataset/MCA`
- `stroke_dataset/PCA`

## Error Handling

Frontend must handle:

- Unsupported file type.
- Image validation rejection.
- Backend unavailable.
- Model unavailable.
- Grad-CAM unavailable.
- Stage 2 skipped after `No Stroke Detected`.

Backend must return structured errors with user-facing Turkish messages and developer-facing details omitted or minimized.

## Testing and Verification

Backend checks:

- `/api/health` returns healthy status.
- `/api/samples` returns anonymized samples only.
- Stage 1 model checkpoint shape is compatible.
- Stage 2 model checkpoint shape is compatible.
- Sample prediction works.
- Uploaded valid MRI-DWI image prediction works.
- Invalid image is rejected before inference.
- `No Stroke Detected` full pipeline path skips Stage 2.

Frontend checks:

- Vite build succeeds.
- `Inference` route renders.
- `Deneyler & Sonuclar` route renders.
- Sample selection displays cached or computed result.
- Upload path shows validation, loading, and result states.
- Grad-CAM viewer renders image/overlay or fallback.
- Results dashboard charts render without layout overlap.

Browser verification:

- Open the local app in a browser.
- Test desktop and mobile-ish viewport widths.
- Confirm text does not overlap cards or controls.
- Confirm blue-white visual system is clean and readable.
- Confirm no patient names or raw filenames appear in the UI.

## Out of Scope for First Implementation

- Authentication.
- Database persistence.
- Multi-user deployment.
- DICOM parsing.
- Clinical report generation.
- External validation dataset ingestion.
- Training or fine-tuning from the UI.

## Open Implementation Notes

- The implementation should prefer Vite over Next.js unless a later requirement introduces server rendering or full-stack routing needs.
- The backend can serve generated Grad-CAM files from a temporary/static directory or return base64 images; implementation can choose the simpler reliable option.
- Confusion matrix values may be hardcoded from verified notebook outputs if raw prediction arrays are not available.
- Any missing chart data should be represented honestly as unavailable, not invented.
