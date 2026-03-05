# Experiment Results — Stroke Detection (ACA vs MCA vs PCA)

## Genel En Iyi Model
**efnb3_v2** — Macro F1: 0.8553, ACA Recall: 0.8393

---

## Hedef Metrikleri

| Metrik | Hedef | En Iyi Sonuc | Model | Durum |
|--------|-------|--------------|-------|-------|
| ACA Recall | >= 0.85 | 0.8393 | efnb3_v2 | YAKIN |
| MCA Recall | >= 0.85 | 0.8982 | efnb3_baseline | ULASILDI |
| PCA Recall | >= 0.80 | 0.9103 | efnb3_baseline | ULASILDI |
| Macro Recall | >= 0.83 | 0.8588 | efnb3_baseline | ULASILDI |
| Macro F1 | >= 0.80 | 0.8553 | efnb3_v2 | ULASILDI |

---

## Model Ailesi: EfficientNet-B3 (efnb3)

**Durum:** Devam ediyor
**En Iyi:** efnb3_v2 — Macro F1: 0.8553, ACA Recall: 0.8393

### Sonuc Tablosu

| Version | Test Acc | Macro F1 | ACA Recall | MCA Recall | PCA Recall | Macro Recall | Loss | LR | Gamma | Weight Power | Scheduler | Notlar |
|---------|----------|----------|------------|------------|------------|--------------|------|----|-------|--------------|-----------|--------|
| baseline | 89.02% | 0.8400 | 0.7679 | 0.8982 | 0.9103 | 0.8588 | CrossEntropy | 1e-4 | - | - | ReduceLROnPlateau | ACA dusuk, MCA/PCA iyi |
| v1 | ~88% | ~0.83 | 0.73 | 0.92 | ~0.88 | ~0.84 | CrossEntropy | 1e-4 | - | - | ReduceLROnPlateau | MCA cok iyi ama ACA kotu |
| v2 | ~88% | 0.8553 | 0.8393 | 0.8676 | ~0.87 | ~0.86 | FocalLoss | 1e-4 | 2.0 | 1.0 | CosineAnnealing | ACA muazzam artti, MCA dustu |
| v3 | ~88% | ~0.85 | ~0.83 | ~0.89 | ~0.87 | ~0.86 | FocalLoss | 1e-4 | 1.5 | 0.5 | CosineAnnealing | Balanced Focal — denge iyilesti |

### Deney Gecmisi

#### efnb3_baseline
- **Strateji**: CrossEntropyLoss + WeightedRandomSampler
- **Sonuc**: Genel iyi ama ACA Recall dusuk (0.7679)

#### efnb3_v1
- **Strateji**: Baseline uzerine kucuk iyilestirmeler
- **Sonuc**: MCA cok iyi (0.92), ACA hala kotu (0.73)

#### efnb3_v2
- **Strateji**: Aggressive Focal Loss (gamma=2.0, tam ters orantili agirliklar)
- **Sonuc**: ACA muazzam artti (0.8393), ama MCA dustu (0.8676). MCA->PCA bias shift.

#### efnb3_v3
- **Strateji**: Softened Focal Loss (gamma=1.5, power=0.5 karekoku agirliklari)
- **Sonuc**: Denge iyilesti, ACA ve MCA arasindaki ucurum kapandi.

### Convergence Durumu
**DEVAM** — ACA Recall henuz hedefe ulasmadi (0.8393 < 0.85).

### Gozlemler
- ACA en zor sinif (sadece 372 ornek, %8.1)
- Focal Loss + aggressive weights ACA'yi artiriyor ama MCA'yi dusuruyor (tahterevalli etkisi)
- v3'teki softened weights (power=0.5) dengeyi iyilestirdi
- Sonraki adim: gamma ve weight_power ince ayari, veya farkli augmentasyon stratejileri

---

<!-- Yeni model aileleri buraya eklenecek -->
<!-- Ornek format:
## Model Ailesi: DenseNet-121 (densenet)

**Durum:** Baslamadi
**En Iyi:** -

### Sonuc Tablosu
| Version | Test Acc | Macro F1 | ACA Recall | MCA Recall | PCA Recall | Macro Recall | Loss | LR | Gamma | Weight Power | Scheduler | Notlar |
|---------|----------|----------|------------|------------|------------|--------------|------|----|-------|--------------|-----------|--------|

### Deney Gecmisi
### Convergence Durumu
### Gozlemler
-->
