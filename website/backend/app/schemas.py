from typing import Literal

from pydantic import BaseModel, Field


PredictMode = Literal["full_pipeline", "stage1_only", "stage2_only"]
GradcamStatus = Literal["available", "unavailable", "skipped"]


class HealthResponse(BaseModel):
    status: str
    stage1ModelExists: bool
    stage2ModelExists: bool
    samplesReady: bool
    cacheReady: bool
    runtimeReady: bool


class SampleItem(BaseModel):
    id: str
    displayName: str
    labelGroup: str
    thumbnailUrl: str
    imageUrl: str
    hasCachedResult: bool


class SamplesResponse(BaseModel):
    samples: list[SampleItem]


class ProbabilityItem(BaseModel):
    label: str
    probability: float


class StageResult(BaseModel):
    stage: Literal["stage1", "stage2"]
    modelName: str
    label: str
    confidence: float
    probabilities: list[ProbabilityItem]
    skipped: bool = False
    message: str | None = None


class GradcamImages(BaseModel):
    originalUrl: str | None = None
    heatmapUrl: str | None = None
    overlayUrl: str | None = None


class GradcamResult(BaseModel):
    status: GradcamStatus
    stage: Literal["stage1", "stage2"] | None = None
    images: GradcamImages = Field(default_factory=GradcamImages)
    message: str | None = None


class PredictResponse(BaseModel):
    status: Literal[
        "success",
        "validation_rejected",
        "model_unavailable",
        "inference_error",
    ]
    mode: PredictMode
    sourceType: Literal["sample", "upload"]
    sampleId: str | None = None
    validationMessage: str | None = None
    stage1: StageResult | None = None
    stage2: StageResult | None = None
    gradcam: GradcamResult = Field(default_factory=lambda: GradcamResult(status="skipped"))
    warnings: list[str] = Field(default_factory=list)


class MetricCard(BaseModel):
    label: str
    value: str
    note: str | None = None


class DatasetSlice(BaseModel):
    label: str
    value: int
    color: str


class ExperimentRow(BaseModel):
    family: str
    version: str
    accuracy: float | None = None
    macroF1: float
    acaF1: float | None = None
    mcaF1: float | None = None
    pcaF1: float | None = None
    acaRecall: float | None = None
    mcaRecall: float | None = None
    pcaRecall: float | None = None
    strategy: str
    strategyDetail: str | None = None
    selected: bool = False


class ConfusionMatrix(BaseModel):
    classes: list[str]
    matrix: list[list[int]]


class Stage1Summary(BaseModel):
    title: str
    description: str
    approach: list[str]
    note: str


class ResultsResponse(BaseModel):
    stage1Metrics: list[MetricCard]
    stage2Metrics: list[MetricCard]
    stage1Distribution: list[DatasetSlice]
    stage2Distribution: list[DatasetSlice]
    experiments: list[ExperimentRow]
    stage2PerClass: list[dict[str, float | str]]
    limitations: list[str]
    confusionMatricesAvailable: bool
    stage1ConfusionMatrix: ConfusionMatrix | None = None
    stage2ConfusionMatrix: ConfusionMatrix | None = None
    stage1Summary: Stage1Summary | None = None
