export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000"

/* ──────────────── types matching the FastAPI schemas ──────────────── */

export type PredictMode = "full_pipeline" | "stage1_only" | "stage2_only"

export type SampleItem = {
  id: string
  displayName: string
  labelGroup: string
  thumbnailUrl: string
  imageUrl: string
  hasCachedResult: boolean
}

export type SamplesResponse = { samples: SampleItem[] }

export type ProbabilityItem = { label: string; probability: number }

export type StageResult = {
  stage: "stage1" | "stage2"
  modelName: string
  label: string
  confidence: number
  probabilities: ProbabilityItem[]
  skipped: boolean
  message: string | null
}

export type GradcamImages = {
  originalUrl: string | null
  heatmapUrl: string | null
  overlayUrl: string | null
}

export type GradcamResult = {
  status: "available" | "unavailable" | "skipped"
  stage: "stage1" | "stage2" | null
  images: GradcamImages
  message: string | null
}

export type PredictStatus =
  | "success"
  | "validation_rejected"
  | "model_unavailable"
  | "inference_error"

export type PredictResponse = {
  status: PredictStatus
  mode: PredictMode
  sourceType: "sample" | "upload"
  sampleId: string | null
  validationMessage: string | null
  stage1: StageResult | null
  stage2: StageResult | null
  gradcam: GradcamResult
  warnings: string[]
}

export type HealthResponse = {
  status: string
  stage1ModelExists: boolean
  stage2ModelExists: boolean
  samplesReady: boolean
  cacheReady: boolean
  runtimeReady: boolean
}

export type MetricCard = { label: string; value: string; note: string | null }
export type DatasetSlice = { label: string; value: number; color: string }
export type ConfusionMatrixData = { classes: string[]; matrix: number[][] }
export type Stage1Summary = {
  title: string
  description: string
  approach: string[]
  note: string
}

export type ExperimentRow = {
  family: string
  version: string
  accuracy: number | null
  macroF1: number
  acaF1: number | null
  mcaF1: number | null
  pcaF1: number | null
  acaRecall: number | null
  mcaRecall: number | null
  pcaRecall: number | null
  strategy: string
  strategyDetail: string | null
  selected: boolean
}

export type PerClassRow = {
  className: string
  precision: number
  recall: number
  f1: number
  support: number
}

export type ResultsResponse = {
  stage1Metrics: MetricCard[]
  stage2Metrics: MetricCard[]
  stage1Distribution: DatasetSlice[]
  stage2Distribution: DatasetSlice[]
  experiments: ExperimentRow[]
  stage2PerClass: PerClassRow[]
  limitations: string[]
  confusionMatricesAvailable: boolean
  stage1ConfusionMatrix: ConfusionMatrixData | null
  stage2ConfusionMatrix: ConfusionMatrixData | null
  stage1Summary: Stage1Summary | null
}

/* ──────────────── helpers ──────────────── */

export function absoluteAsset(url: string | null | undefined): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  return `${API_BASE}${url}`
}

async function fetchJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store",
    ...init,
  })
  if (!res.ok) throw new Error(`${path} → ${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return fetchJSON<HealthResponse>("/api/health", { signal })
}

export async function getSamples(): Promise<SamplesResponse> {
  const r = await fetchJSON<SamplesResponse>("/api/samples")
  return {
    samples: r.samples.map((s) => ({
      ...s,
      thumbnailUrl: absoluteAsset(s.thumbnailUrl),
      imageUrl: absoluteAsset(s.imageUrl),
    })),
  }
}

export async function getResults(): Promise<ResultsResponse> {
  return fetchJSON<ResultsResponse>("/api/results")
}

export async function predictSample(
  sampleId: string,
  mode: PredictMode
): Promise<PredictResponse> {
  const form = new FormData()
  form.append("sample_id", sampleId)
  form.append("mode", mode)
  return fetchJSON<PredictResponse>("/api/predict", {
    method: "POST",
    body: form,
  })
}

export async function predictUpload(
  file: File,
  mode: PredictMode
): Promise<PredictResponse> {
  const form = new FormData()
  form.append("file", file)
  form.append("mode", mode)
  return fetchJSON<PredictResponse>("/api/predict", {
    method: "POST",
    body: form,
  })
}

/* ──────────────── normalize PredictResponse for UI ──────────────── */
/** Turn the backend asset URLs into absolute ones so <img src> works cross-port. */
export function withAbsoluteAssets(pred: PredictResponse): PredictResponse {
  const g = pred.gradcam
  return {
    ...pred,
    gradcam: {
      ...g,
      images: {
        originalUrl: g.images?.originalUrl ? absoluteAsset(g.images.originalUrl) : null,
        heatmapUrl: g.images?.heatmapUrl ? absoluteAsset(g.images.heatmapUrl) : null,
        overlayUrl: g.images?.overlayUrl ? absoluteAsset(g.images.overlayUrl) : null,
      },
    },
  }
}
