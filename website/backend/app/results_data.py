from .schemas import (
    ConfusionMatrix,
    DatasetSlice,
    ExperimentRow,
    MetricCard,
    ResultsResponse,
    Stage1Summary,
)


def get_results_data() -> ResultsResponse:
    return ResultsResponse(
        stage1Metrics=[
            MetricCard(label="Accuracy", value="0.9554", note="Test seti · 829 ornek"),
            MetricCard(label="Stroke Recall", value="0.9798", note="Threshold 0.15"),
            MetricCard(label="Stroke F1", value="0.9734", note="Validation seciminde optimize"),
            MetricCard(label="ROC-AUC", value="0.9593", note="Binary classification"),
            MetricCard(label="Specificity", value="0.8321", note="Normal recall"),
        ],
        stage2Metrics=[
            MetricCard(label="Accuracy", value="0.8960", note="Test seti · 692 ornek"),
            MetricCard(label="Macro F1", value="0.8533", note="Birincil metrik (dengesiz sinif)"),
            MetricCard(label="ACA F1", value="0.8036", note="Az ornekli minor sinif"),
            MetricCard(label="MCA F1", value="0.9298", note="Major sinif"),
            MetricCard(label="PCA F1", value="0.8265", note="Mid sinif"),
        ],
        stage1Distribution=[
            DatasetSlice(label="Stroke", value=4609, color="var(--chart-1)"),
            DatasetSlice(label="Normal", value=915, color="var(--chart-3)"),
        ],
        stage2Distribution=[
            DatasetSlice(label="ACA", value=372, color="var(--chart-1)"),
            DatasetSlice(label="MCA", value=3269, color="var(--chart-2)"),
            DatasetSlice(label="PCA", value=968, color="var(--chart-3)"),
        ],
        experiments=[
            # ────── EfficientNet-B3 — 9 deney (Stage 2) ──────
            ExperimentRow(
                family="EfficientNet-B3",
                version="baseline",
                accuracy=0.8902, macroF1=0.8400, acaF1=0.7611, mcaF1=0.9236, pcaF1=0.8354,
                acaRecall=0.7679, mcaRecall=0.8982, pcaRecall=0.9103,
                strategy="CrossEntropy + Weighted Sampler",
                strategyDetail=(
                    "Plain CrossEntropy + WeightedRandomSampler + ReduceLROnPlateau. "
                    "Referans noktasi: ACA F1=0.7611. ACA'daki dusukluk ana iyilestirme hedefi oldu."
                ),
            ),
            ExperimentRow(
                family="EfficientNet-B3",
                version="v1",
                accuracy=0.9017, macroF1=0.8449, acaF1=0.7455, mcaF1=0.9340, pcaF1=0.8553,
                acaRecall=0.7321, mcaRecall=0.9226, pcaRecall=0.8966,
                strategy="Label Smoothing (eps=0.1)",
                strategyDetail=(
                    "CE'nin over-confident prediction egilimini frenlemek icin label smoothing. "
                    "MCA F1=0.9340 ve PCA F1=0.8553 aile rekorlari; ancak ACA F1 geriledi (0.7611 -> 0.7455). "
                    "Cogunluk sinifini kalibre etti, az ornekli ACA icin yetersiz."
                ),
            ),
            ExperimentRow(
                family="EfficientNet-B3",
                version="v2",
                accuracy=0.8829, macroF1=0.8401, acaF1=0.7769, mcaF1=0.9171, pcaF1=0.8263,
                acaRecall=0.8393, mcaRecall=0.8676, pcaRecall=0.9517,
                strategy="Focal Loss (gamma=2.0, power=1.0)",
                strategyDetail=(
                    "Hard-examples'a odaklanmak icin klasik Focal Loss. "
                    "ACA Recall baseline'a gore +0.0714 artti fakat MCA Recall geriledi -> 'tahterevalli etkisi' ilk kez net gorudu."
                ),
            ),
            ExperimentRow(
                family="EfficientNet-B3",
                version="v3",
                accuracy=0.9003, macroF1=0.8479, acaF1=0.7652, mcaF1=0.9337, pcaF1=0.8449,
                acaRecall=0.7857, mcaRecall=0.9185, pcaRecall=0.8828,
                strategy="Softened Focal (gamma=1.5, power=0.5)",
                strategyDetail=(
                    "v2'nin agresifligini yumusatmak icin gamma ve power esit dusuruldu. "
                    "Tahterevalli dengelendi - 3 sinifin hicbiri kurban verilmedi. "
                    "EfnB3 aile EN IYI Macro F1 (sonraki 5 deney bu esigi asamadi)."
                ),
            ),
            ExperimentRow(
                family="EfficientNet-B3",
                version="v4",
                accuracy=0.8801, macroF1=0.8333, acaF1=0.7500, mcaF1=0.9142, pcaF1=0.8358,
                acaRecall=0.8571, mcaRecall=0.8574, pcaRecall=0.9655,
                strategy="Fine-Tuned Focal (gamma=2.0, power=0.75)",
                strategyDetail=(
                    "v2 ve v3 arasi orta nokta. ACA Recall EN IYI (0.8571) ama ACA precision 0.6667'ye dustu - "
                    "1/3 ACA tahmini hatali, F1'i asagi cekti."
                ),
            ),
            ExperimentRow(
                family="EfficientNet-B3",
                version="v5",
                accuracy=0.8699, macroF1=0.8196, acaF1=0.7328, mcaF1=0.9079, pcaF1=0.8182,
                acaRecall=0.8571, mcaRecall=0.8534, pcaRecall=0.9310,
                strategy="Interpolated Focal (gamma=1.8, power=0.75)",
                strategyDetail=(
                    "v4'un gamma'sini hafifce dusurerek ACA precision'i geri almak. "
                    "Olmadi - ACA precision 0.64'e dustu, Macro F1 gerilemenin ikinci adimi."
                ),
            ),
            ExperimentRow(
                family="EfficientNet-B3",
                version="v6",
                accuracy=0.8584, macroF1=0.8030, acaF1=0.7179, mcaF1=0.8996, pcaF1=0.7915,
                acaRecall=0.7321, mcaRecall=0.8717, pcaRecall=0.9071,
                strategy="LR Ablasyonu (LR=5e-5)",
                strategyDetail=(
                    "v3 konfigurasyonu sabit tutulup LR yariya indirildi. "
                    "Daha dusuk LR under-fit yaratti, her sinifta gerileme. LR ekseni bu aile icin tukendi."
                ),
            ),
            ExperimentRow(
                family="EfficientNet-B3",
                version="v7",
                accuracy=0.8699, macroF1=0.8348, acaF1=0.7966, mcaF1=0.9043, pcaF1=0.8035,
                acaRecall=0.8393, mcaRecall=0.8595, pcaRecall=0.9462,
                strategy="Class-Balanced Focal (Cui et al., beta=0.9999)",
                strategyDetail=(
                    "Ters frekans yerine 'effective number of samples' bazli agirlik. "
                    "ACA F1 aile rekoru (0.7966); ama MCA/PCA tavan kaybi Macro F1'i v3 altina itti."
                ),
            ),
            ExperimentRow(
                family="EfficientNet-B3",
                version="v8",
                accuracy=0.8801, macroF1=0.8310, acaF1=0.7460, mcaF1=0.9151, pcaF1=0.8318,
                acaRecall=0.7857, mcaRecall=0.8839, pcaRecall=0.9379,
                strategy="Enhanced Augmentation (CLAHE + CoarseDropout + RandomGamma)",
                strategyDetail=(
                    "v3 + agresif augmentation. "
                    "Medikal doku detayi bozuldu, v3'u asamadi. Augmentation ekseni tukendi."
                ),
            ),

            # ────── DenseNet-121 — 5 deney (Stage 2) ──────
            ExperimentRow(
                family="DenseNet-121",
                version="baseline",
                accuracy=0.8829, macroF1=0.8353, acaF1=0.7692, mcaF1=0.9175, pcaF1=0.8194,
                acaRecall=0.8036, mcaRecall=0.8941, pcaRecall=0.8759,
                strategy="Weighted CE + Sampler",
                strategyDetail=(
                    "Sinif agirligi (tam ters frekans) + sampler + CosineWarmRestarts. "
                    "Yaridan az parametreyle (6.96M) EfnB3 baseline'a yakin sonuc verdi - omurganin verimi."
                ),
            ),
            ExperimentRow(
                family="DenseNet-121",
                version="v1",
                accuracy=0.8960, macroF1=0.8533, acaF1=0.8036, mcaF1=0.9298, pcaF1=0.8265,
                acaRecall=0.8036, mcaRecall=0.9043, pcaRecall=0.9034,
                strategy="Focal Loss (gamma=1.5, power=0.5)",
                strategyDetail=(
                    "EfnB3'te en iyi sonucu veren Focal konfigurasyonunu DenseNet'e tasimak. "
                    "ACA precision ve recall ayni anda 0.80+ seviyesine tasindi. "
                    "GENEL EN IYI Macro F1 (0.8533); Macro F1>=0.87 hedefi ile fark = 0.017."
                ),
                selected=True,
            ),
            ExperimentRow(
                family="DenseNet-121",
                version="v2",
                accuracy=0.8815, macroF1=0.8139, acaF1=0.6900, mcaF1=0.9200, pcaF1=0.8300,
                acaRecall=0.7300, mcaRecall=0.9100, pcaRecall=0.8600,
                strategy="CE + Label Smoothing (eps=0.1, IMG=224)",
                strategyDetail=(
                    "Alternatif regularizasyon ekseni. Sinif agirliklari ve sampler devre disi, "
                    "IMG 224, batch 32. Iki dengeleme mekanizmasinin birden kaldirilmasi "
                    "kontrollu deney niteligini bozdu; gerileme bu yuzden de olabilir."
                ),
            ),
            ExperimentRow(
                family="DenseNet-121",
                version="v3",
                accuracy=0.8656, macroF1=0.8116, acaF1=0.7288, mcaF1=0.9060, pcaF1=0.8000,
                acaRecall=0.7679, mcaRecall=0.8635, pcaRecall=0.9103,
                strategy="Weighted CE + Light LS (eps=0.05)",
                strategyDetail=(
                    "v2'nin kontrolsuzlugune yanit; sinif agirliklari ve sampler baseline ile ayni, "
                    "yalnizca hafif LS eklendi. Agresif agirliklar ile LS catisti - gradyani ACA yonunde asiri cekiyor."
                ),
            ),
            ExperimentRow(
                family="DenseNet-121",
                version="v4",
                accuracy=0.8295, macroF1=0.7840, acaF1=0.7288, mcaF1=0.8758, pcaF1=0.7473,
                acaRecall=0.7679, mcaRecall=0.8045, pcaRecall=0.9379,
                strategy="Discriminative LR (backbone=1e-5, head=1e-3)",
                strategyDetail=(
                    "Backbone icin dusuk LR, classifier head icin yuksek LR. "
                    "DenseNet dense-connection mimarisinde guclu feature reuse var; ayrik LR bu akisi bozdu. "
                    "PCA precision 0.62'ye dustu, MCA->PCA karisikligi cok artti."
                ),
            ),
        ],
        stage2PerClass=[
            {"className": "ACA", "precision": 0.8036, "recall": 0.8036, "f1": 0.8036, "support": 56},
            {"className": "MCA", "precision": 0.9569, "recall": 0.9043, "f1": 0.9298, "support": 491},
            {"className": "PCA", "precision": 0.7616, "recall": 0.9034, "f1": 0.8265, "support": 145},
        ],
        limitations=[
            "Arastirma prototipi - tibbi tani amaci tasimaz, klinik karari yerine gecmez.",
            "ACA sinifi az ornekli (n=372); test desteği=56. Tek yanlis tahmin recall'u 1.79 puan sarsiyor.",
            "External validation farkli hastane / tarayici / protokol verisiyle yapilmadi.",
            "Macro F1>=0.87 birincil hedefine ulasilamadi; en yuksek deger densenet-v1 ile 0.8533.",
        ],
        confusionMatricesAvailable=True,
        stage1ConfusionMatrix=ConfusionMatrix(
            classes=["Normal", "Stroke"],
            matrix=[
                [114, 23],
                [14, 678],
            ],
        ),
        stage2ConfusionMatrix=ConfusionMatrix(
            classes=["ACA", "MCA", "PCA"],
            matrix=[
                [45, 8, 3],
                [9, 444, 38],
                [2, 12, 131],
            ],
        ),
        stage1Summary=Stage1Summary(
            title="Stage 1 - Stroke vs Normal",
            description=(
                "Stage 1, akademik bir 'best-shot' notebook ile gelistirildi: tek bir modelle "
                "iki asamali fine-tuning ve birden cok stabilite onlemi. Stage 2 gibi 9 versiyonluk "
                "iterasyon yapilmadi cunku binary problem yeterli kapasiteyle ilk denemede hedefe ulasti."
            ),
            approach=[
                "EfficientNet-B3 (ImageNet pretrained), classifier head: Dropout(0.3) + Linear(1536 -> 1) binary logit",
                "Two-stage finetune: once head freeze + warmup (3 epoch, LR=1e-3), sonra tum model unfreeze (LR=2e-4)",
                "Loss: BCEWithLogitsLoss (sampler ile ikinci agirliklama yapmamak icin pos_weight kullanilmadi)",
                "WeightedRandomSampler ile train batch'lerinde sinif dengelemesi",
                "Mixed precision (AMP) + gradient clipping (norm=1.0) ile stabil egitim",
                "EMA (Exponential Moving Average, decay=0.999) - val ve test'te shadow weights ile evaluation",
                "TTA (Test Time Augmentation): horizontal flip ortalamasi - ucuz ensemble",
                "Validation'da constraint'li threshold secimi: oncelik (recall>=0.96 + acc>=0.96), sonra F1",
                "Augmentation: HorizontalFlip, Rotate(+-10), ShiftScaleRotate, RandomBrightnessContrast, GaussNoise",
            ],
            note=(
                "Stage 1 icin bu yaklasim 25 epoch'ta hedef ustu sonuca ulasti (recall 0.9798, acc 0.9554, ROC-AUC 0.9593). "
                "Stage 2'deki gibi loss-axis / LR-axis / augmentation-axis iterasyonlarina gerek kalmadi."
            ),
        ),
    )
