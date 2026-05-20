from .schemas import DatasetSlice, ExperimentRow, MetricCard, ResultsResponse


def get_results_data() -> ResultsResponse:
    return ResultsResponse(
        stage1Metrics=[
            MetricCard(label="Accuracy", value="0.9554", note="EfficientNet-B3"),
            MetricCard(label="Stroke Recall", value="0.9798", note="Threshold 0.15"),
            MetricCard(label="Stroke F1", value="0.9734"),
            MetricCard(label="ROC-AUC", value="0.9593"),
        ],
        stage2Metrics=[
            MetricCard(label="Accuracy", value="0.8960", note="DenseNet-121 v1"),
            MetricCard(label="Macro F1", value="0.8533", note="Primary metric"),
            MetricCard(label="ACA F1", value="0.8036"),
            MetricCard(label="MCA F1", value="0.9298"),
            MetricCard(label="PCA F1", value="0.8265"),
        ],
        stage1Distribution=[
            DatasetSlice(label="Stroke", value=4609, color="#1d4ed8"),
            DatasetSlice(label="Normal", value=915, color="#94a3b8"),
        ],
        stage2Distribution=[
            DatasetSlice(label="ACA", value=372, color="#38bdf8"),
            DatasetSlice(label="MCA", value=3269, color="#2563eb"),
            DatasetSlice(label="PCA", value=968, color="#0f766e"),
        ],
        experiments=[
            ExperimentRow(family="EfficientNet-B3", version="baseline", accuracy=0.8902, macroF1=0.8400, acaF1=0.7611, mcaF1=0.9236, pcaF1=0.8354, strategy="CrossEntropy baseline"),
            ExperimentRow(family="EfficientNet-B3", version="v1", accuracy=0.9017, macroF1=0.8449, acaF1=0.7455, mcaF1=0.9340, pcaF1=0.8553, strategy="Label smoothing"),
            ExperimentRow(family="EfficientNet-B3", version="v3", accuracy=0.9003, macroF1=0.8479, acaF1=0.7652, mcaF1=0.9337, pcaF1=0.8449, strategy="Softened focal loss", selected=False),
            ExperimentRow(family="DenseNet-121", version="baseline", accuracy=0.8829, macroF1=0.8353, acaF1=0.7692, mcaF1=0.9175, pcaF1=0.8194, strategy="Weighted CE"),
            ExperimentRow(family="DenseNet-121", version="v1", accuracy=0.8960, macroF1=0.8533, acaF1=0.8036, mcaF1=0.9298, pcaF1=0.8265, strategy="Focal loss gamma=1.5, power=0.5", selected=True),
            ExperimentRow(family="DenseNet-121", version="v2", accuracy=0.8815, macroF1=0.8139, acaF1=0.6900, mcaF1=0.9200, pcaF1=0.8300, strategy="CE + label smoothing"),
            ExperimentRow(family="DenseNet-121", version="v3", accuracy=0.8656, macroF1=0.8116, acaF1=0.7288, mcaF1=0.9060, pcaF1=0.8000, strategy="Weighted CE + light LS"),
            ExperimentRow(family="DenseNet-121", version="v4", accuracy=0.8295, macroF1=0.7840, acaF1=0.7288, mcaF1=0.8758, pcaF1=0.7473, strategy="Discriminative LR"),
        ],
        stage2PerClass=[
            {"className": "ACA", "precision": 0.8036, "recall": 0.8036, "f1": 0.8036, "support": 56},
            {"className": "MCA", "precision": 0.9569, "recall": 0.9043, "f1": 0.9298, "support": 491},
            {"className": "PCA", "precision": 0.7616, "recall": 0.9034, "f1": 0.8265, "support": 145},
        ],
        limitations=[
            "Research prototype; klinik tani yerine gecmez.",
            "ACA sinifi az ornekli oldugu icin varyans yuksektir.",
            "External validation farkli hastane veya tarayici verisiyle yapilmadi.",
            "Confusion matrix ham tahminleri tum modeller icin saklanmadigi yerlerde tablo metrikleri kullanilir.",
        ],
        confusionMatricesAvailable=False,
    )
