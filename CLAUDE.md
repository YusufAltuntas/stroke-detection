# Stroke Detection — ML Experiment Automation

## Proje Ozeti
Inme arter siniflandirmasi (ACA vs MCA vs PCA) icin EfficientNet-B3 tabanli derin ogrenme projesi.
Cascaded yaklasim — Stage 2: Stroke olarak tespit edilen goruntulerde arter siniflandirmasi.

## Proje Yapisi
- `notebooks/base/`    → Referans notebook'lar (DEGISTIRME, sadece oku)
- `notebooks/runs/`    → Her deney versiyonu (efnb3_v1.ipynb, efnb3_v2.ipynb...)
- `results/`           → results.md karsilastirma dokumani
- `efficientnet_b3/`   → Orijinal efnb3 notebook'lari (arsiv)
- `densenet-121/`      → DenseNet notebook'lari (arsiv)
- `.claude/`           → Agent, command ve hook konfigurasyonlari

## Kritik Kurallar
1. Her yeni notebook MUTLAKA `notebooks/runs/` icine kaydedilmeli
2. `notebooks/base/` icindeki dosyalar SADECE okunmali, degistirilmemeli
3. Her notebook'un ilk code hucresinde Papermill tag'li parametreler olmali
4. Her egitim sonrasi `results/results.md` GUNCELLENMEL
5. Git commit: her notebook kaydinda otomatik (hook ile)
6. Bir model ailesi icin daha fazla deneme yapilmamasi gerekiyorsa DUR ve kullaniciyi bilgilendir

## Veri Bilgileri
- Veri seti: Stroke MRI goruntuleri
- Siniflar: ACA (372), MCA (3269), PCA (968) — Toplam: 4609
- Dengesizlik: MCA:ACA = 8.79:1, PCA:ACA = 2.60:1
- Split: 70/15/15 (Train/Val/Test), Stratified
- Augmentasyon: Albumentations (medikal MRI icin guvenli)
  - YASAK: VerticalFlip, GaussianBlur, CutMix

## Model Bilgileri
- Framework: PyTorch
- Base model: EfficientNet-B3 (ImageNet pretrained, ~12M parametre)
- Input: 300x300 piksel, 3 kanal (RGB)
- Sinif sayisi: 3 (ACA, MCA, PCA)
- Loss: FocalLoss (gamma, alpha ayarlanabilir) veya CrossEntropyLoss
- Optimizer: AdamW (lr=1e-4, weight_decay=1e-4)
- Scheduler: CosineAnnealingWarmRestarts veya ReduceLROnPlateau
- Dengeleme: WeightedRandomSampler (1/count)

## Convergence Kriterleri
- 3 ardisik denemede val_accuracy artisi < 0.002 → hiperparametre optimizasyonu doyuma ulasti
- 3 ardisik denemede macro_f1 artisi < 0.003 → ayni sonuc
- Farkli mimariler de ayni platoya ulasirsa → yeni model ailesi iste
- HEDEFLER:
  - ACA Recall >= 0.85 (KRITIK — en zor sinif)
  - MCA Recall >= 0.85
  - PCA Recall >= 0.80
  - Macro Recall >= 0.83
  - Macro F1 >= 0.80

## Mevcut En Iyi Sonuclar
- efnb3_baseline: Test Acc 89.02%, Macro F1 0.8400, ACA Recall 0.7679
- efnb3_v1: MCA Recall 0.92, ACA Recall 0.73
- efnb3_v2: ACA Recall 0.8393, MCA Recall 0.8676 (Aggressive Focal)
- efnb3_v3: Balanced Focal Loss (gamma=1.5, power=0.5)

## Vertex AI Config
- Project: stroke-detection-489321
- Region: europe-central2
- GCS Bucket: gs://stroke-detection/experiments/
- Machine type: n1-standard-4 + NVIDIA_TESLA_T4 (1 GPU)
- Notebook execution: Vertex AI Workbench Executor

## Otonom Calisma Modu
Claude yeni bir deney baslatirken:
1. Onceki TUM notebook'lari (notebooks/base/) analiz eder
2. Her deneydeki hiperparametreleri, yaklasimlari ve sonuclari cikarir
3. Neyin ise yaradigini, neyin yaramadigini belirler
4. Bir sonraki deney icin en mantikli hiperparametre + strateji kombinasyonunu KENDISI secer
5. Kullanici sadece model adini verir, gerisini Claude planlar
6. Her karar icin GEREKCE yazar (neden bu parametreyi sectim)

Ornek akis:
- Kullanici: "/new-experiment model=efficientnet-b3"
- Claude: Onceki 4 notebook'u inceler → v2'de ACA artti ama MCA dustu → v3'te denge iyilesti ama hala ACA < 0.85 → Sonraki adim: gamma=1.3, weight_power=0.6, lr=5e-5 dene (sebep: ...)

## Notebook Format
Her notebook su bolumlerden olusur:
1. Markdown: Giris, hipotez, strateji aciklamasi
2. Setup & Imports (torch, albumentations, sklearn)
3. Sabitler ve Hiperparametreler (IMG_SIZE, BATCH_SIZE, LR, GAMMA vs.)
4. Veri Hazirligi (collect_stroke_image_paths, stratified split)
5. Augmentation & Dataset sinifi (StrokeDataset)
6. WeightedRandomSampler & DataLoader
7. Model tanimlama (create_efficientnet_b3 veya create_model)
8. Loss, Optimizer, Scheduler
9. train_one_epoch ve validate fonksiyonlari
10. Egitim dongusu (history, checkpoint kaydi)
11. Test degerlendirmesi (classification_report, confusion_matrix, ROC)
12. Sonuc ozeti
