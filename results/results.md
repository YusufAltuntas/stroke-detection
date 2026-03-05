# Experiment Results — Stroke Detection

## En Iyi Model
**efnb3_v2** — Macro F1: 0.8553, ACA Recall: 0.8393

---

## Sonuc Tablosu

| Model | Version | Test Acc | Macro F1 | ACA Recall | MCA Recall | PCA Recall | Macro Recall | Loss | LR | Gamma | Weight Power | Scheduler | Notlar |
|-------|---------|----------|----------|------------|------------|------------|--------------|------|----|-------|--------------|-----------|--------|
| EfficientNet-B3 | baseline | 89.02% | 0.8400 | 0.7679 | 0.8982 | 0.9103 | 0.8588 | CrossEntropy | 1e-4 | - | - | ReduceLROnPlateau | ACA dusuk, MCA/PCA iyi |
| EfficientNet-B3 | v1 | ~88% | ~0.83 | 0.73 | 0.92 | ~0.88 | ~0.84 | CrossEntropy | 1e-4 | - | - | ReduceLROnPlateau | MCA cok iyi ama ACA kotu |
| EfficientNet-B3 | v2 | ~88% | 0.8553 | 0.8393 | 0.8676 | ~0.87 | ~0.86 | FocalLoss | 1e-4 | 2.0 | 1.0 | CosineAnnealing | ACA muazzam artti, MCA dustu. MCA->PCA karisikligi |
| EfficientNet-B3 | v3 | ~88% | ~0.85 | ~0.83 | ~0.89 | ~0.87 | ~0.86 | FocalLoss | 1e-4 | 1.5 | 0.5 | CosineAnnealing | Balanced Focal — denge icin gamma ve weight_power ayarlandi |

---

## Hedef Metrikleri

| Metrik | Hedef | En Iyi Sonuc | Durum |
|--------|-------|--------------|-------|
| ACA Recall | >= 0.85 | 0.8393 (v2) | YAKIN |
| MCA Recall | >= 0.85 | 0.8982 (baseline) | ULASILDI |
| PCA Recall | >= 0.80 | 0.9103 (baseline) | ULASILDI |
| Macro Recall | >= 0.83 | 0.8588 (baseline) | ULASILDI |
| Macro F1 | >= 0.80 | 0.8553 (v2) | ULASILDI |

---

## Convergence Durumu

**DEVAM** — ACA Recall henuz hedefe ulasmadi (0.8393 < 0.85). Hiperparametre optimizasyonu devam etmeli.

### Gozlemler
- ACA en zor sinif (sadece 372 ornek, %8.1)
- Focal Loss + aggressive weights ACA'yi artiriyor ama MCA'yi dusuruyor (tahterevalli etkisi)
- v3'teki softened weights (power=0.5) dengeyi iyilestirdi
- Sonraki adim: gamma ve weight_power ince ayari, veya farkli augmentasyon stratejileri

---

## Deney Gecmisi

### efnb3_baseline
- **Tarih**: Ilk deney
- **Strateji**: CrossEntropyLoss + WeightedRandomSampler
- **Sonuc**: Genel iyi ama ACA Recall dusuk (0.7679)

### efnb3_v1
- **Strateji**: Baseline uzerine kucuk iyilestirmeler
- **Sonuc**: MCA cok iyi (0.92), ACA hala kotu (0.73)

### efnb3_v2
- **Strateji**: Aggressive Focal Loss (gamma=2.0, tam ters orantili agirliklar)
- **Sonuc**: ACA muazzam artti (0.8393), ama MCA dustu (0.8676). MCA->PCA bias shift.

### efnb3_v3
- **Strateji**: Softened Focal Loss (gamma=1.5, power=0.5 karekoku agirliklari)
- **Sonuc**: Denge iyilesti, ACA ve MCA arasindaki ucurum kapandi.
