export type PredictMode = "full_pipeline" | "stage1_only" | "stage2_only";

export interface HealthResponse {
  status: string;
  stage1ModelExists: boolean;
  stage2ModelExists: boolean;
  samplesReady: boolean;
  cacheReady: boolean;
  runtimeReady: boolean;
}

export interface SampleItem {
  id: string;
  displayName: string;
  labelGroup: string;
  thumbnailUrl: string;
  imageUrl: string;
  hasCachedResult: boolean;
}

export interface ProbabilityItem {
  label: string;
  probability: number;
}

export interface StageResult {
  stage: "stage1" | "stage2";
  modelName: string;
  label: string;
  confidence: number;
  probabilities: ProbabilityItem[];
  skipped: boolean;
  message?: string | null;
}

export interface GradcamResult {
  status: "available" | "unavailable" | "skipped";
  stage?: "stage1" | "stage2" | null;
  images: {
    originalUrl?: string | null;
    heatmapUrl?: string | null;
    overlayUrl?: string | null;
  };
  message?: string | null;
}

export interface PredictResponse {
  status: "success" | "validation_rejected" | "model_unavailable" | "inference_error";
  mode: PredictMode;
  sourceType: "sample" | "upload";
  sampleId?: string | null;
  validationMessage?: string | null;
  stage1?: StageResult | null;
  stage2?: StageResult | null;
  gradcam: GradcamResult;
  warnings: string[];
}

export interface ResultsResponse {
  stage1Metrics: Array<{ label: string; value: string; note?: string | null }>;
  stage2Metrics: Array<{ label: string; value: string; note?: string | null }>;
  stage1Distribution: Array<{ label: string; value: number; color: string }>;
  stage2Distribution: Array<{ label: string; value: number; color: string }>;
  experiments: Array<{
    family: string;
    version: string;
    accuracy?: number | null;
    macroF1: number;
    acaF1?: number | null;
    mcaF1?: number | null;
    pcaF1?: number | null;
    strategy: string;
    selected: boolean;
  }>;
  stage2PerClass: Array<Record<string, number | string>>;
  limitations: string[];
  confusionMatricesAvailable: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const toAbsoluteUrl = (url?: string | null) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};

export const getHealth = () => getJson<HealthResponse>("/api/health");

export async function getSamples(): Promise<SampleItem[]> {
  const payload = await getJson<{ samples: SampleItem[] }>("/api/samples");
  return payload.samples;
}

export const getResults = () => getJson<ResultsResponse>("/api/results");

export async function predictSample(sampleId: string, mode: PredictMode): Promise<PredictResponse> {
  const form = new FormData();
  form.append("sample_id", sampleId);
  form.append("mode", mode);
  const response = await fetch(`${API_BASE}/api/predict`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`predictSample failed with ${response.status}`);
  return response.json() as Promise<PredictResponse>;
}

export async function predictUpload(file: File, mode: PredictMode): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("mode", mode);
  const response = await fetch(`${API_BASE}/api/predict`, { method: "POST", body: form });
  if (!response.ok) throw new Error(`predictUpload failed with ${response.status}`);
  return response.json() as Promise<PredictResponse>;
}
