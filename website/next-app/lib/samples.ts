// Re-exports kept for backwards compatibility with components.
// Sample data is now fetched from the backend via lib/api.ts.
export type {
  StageResult,
  ProbabilityItem as Probability,
  GradcamResult as GradCam,
  PredictResponse as Prediction,
  SampleItem,
} from "./api"
