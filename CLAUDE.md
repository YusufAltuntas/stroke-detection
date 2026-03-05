# Stroke Detection — ML Experiment Automation

## Proje Ozeti
Inme arter siniflandirmasi (ACA vs MCA vs PCA) icin coklu model ailesiyle derin ogrenme projesi.
Cascaded yaklasim — Stage 2: Stroke olarak tespit edilen goruntulerde arter siniflandirmasi.
Ana hedef: Bu 3 sinifli (ACA, MCA, PCA) problemde en yuksek skoru almak.
Farkli model aileleri sirayla denenir (EfficientNet-B3, DenseNet-121, YOLO, vs.).

## Proje Yapisi
- `notebooks/base/`    → Referans notebook'lar (DEGISTIRME, sadece oku)
- `notebooks/runs/`    → Her deney versiyonu ({model_kisa}_{version}.ipynb)
- `results/`           → results.md karsilastirma dokumani (TUM model aileleri)
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

## Coklu Model Ailesi Sureci
Bu proje tek bir modelle sinirli DEGILDIR. Amac en iyi sonucu bulmaktir.

### Genel Akis
1. Bir model ailesi secilir (ornek: EfficientNet-B3)
2. O model icin baseline notebook olusturulur
3. Sonuclar incelenir, bir veri bilimci gibi v1, v2... versiyonlari hazirlanir
4. Her versiyonda MINOR degisiklikler yapilir (deneysel surec)
5. Imbalanced data problemine karsi farkli yaklasimlar denenir
6. Model ailesi doyuma ulasirsa → yeni model ailesine gecilir (DenseNet, YOLO, vs.)

### Her Model Ailesi Icin
- Her model ailesi YENI bir context/session ile baslar
- Baseline notebook olusturulur (standart hiperparametreler)
- Onceki model ailelerinin BIRKAC notebook'u incelenir (yapi ogrenilir)
- Her versiyon oncekinin sonuclarina bakarak planlanir
- Deney sonuclari hem notebook icerisinde hem results.md'de dokumante edilir

### Model Ailesi Gecis Kurallari
- 3 ardisik denemede iyilesme yoksa → model ailesi tamamlandi
- Kullaniciya bilgi ver, yeni model ailesi oner
- Onceki model ailesinin en iyi sonuclari referans olarak kalir

### Mevcut Model Aileleri
- **EfficientNet-B3** (efnb3): Devam ediyor. 4 deney yapildi (baseline, v1, v2, v3)
- **DenseNet-121** (densenet): Planlanmis
- **YOLO** (yolo): Planlanmis


## Convergence Kriterleri
- 3 ardisik denemede val_accuracy ve macro&micro f1 scorelarda artış olmazsa model doyuma ulaştı
- Farkli mimariler de ayni platoya ulasirsa → yeni model ailesi iste
- HEDEFLER:
  - ACA Recall >= 0.85 (KRITIK — en zor sinif)
  - MCA Recall >= 0.85
  - PCA Recall >= 0.85
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
- GCS Veri Seti: gs://stroke-detection/data/flattened_images/ (ACA/, MCA/, PCA/)
- Machine type: n1-standard-4 + NVIDIA_TESLA_T4 (1 GPU)
- Notebook execution: Vertex AI Workbench Executor
stroke-detection/data/stroke_dataset/stroke_dataset
## Veri Erisimi (Vertex AI)
Notebook'lar Vertex AI Workbench'te calisirken GCS'den veri indirir:
- GCS kaynak: gs://stroke-detection/data/stroke_dataset/stroke_dataset bu klasör altında aca, mca ve pca klasörlerine ayrılmış durumda
- Yerel hedef: /tmp/data/flattened_images/
- Her notebook'un baslangicinda GCS setup hucresi OLMALI

## Otonom Calisma Modu
Claude yeni bir deney baslatirken:
1. Ayni model ailesinin onceki TUM notebook'larini analiz eder (notebooks/base/ ve notebooks/runs/)
2. Her deneydeki hiperparametreleri, yaklasimlari ve sonuclari cikarir
3. Neyin ise yaradigini, neyin yaramadigini belirler
4. Bir sonraki deney icin en mantikli hiperparametre + strateji kombinasyonunu KENDISI secer
5. Kullanici sadece model adini verir, gerisini Claude planlar
6. Her karar icin GEREKCE yazar (neden bu parametreyi sectim)

### Ayni Model Ailesi Icinde (Devam Eden Deneyler)
- Kullanici: "/new-experiment model=efficientnet-b3"
- Claude: Onceki 4 notebook'u inceler → v2'de ACA artti ama MCA dustu → v3'te denge iyilesti ama hala ACA < 0.85 → Sonraki adim: gamma=1.3, weight_power=0.6, lr=5e-5 dene (sebep: ...)

### Yeni Model Ailesine Gecis
- Kullanici: "/new-experiment model=densenet-121"
- Claude: Onceki model ailelerinin BIRKAC notebook'unu inceler (yapi ve format ogrenmek icin)
- results.md'den onceki tum sonuclari okur (karsilastirma icin)
- Yeni model ailesi icin baseline notebook olusturur
- Baseline sonuclarina gore v1, v2... planlanir

## Notebook Format
Her notebook su bolumlerden olusur:
1. Markdown: Giris, hipotez, strateji aciklamasi
2. Setup & Imports (torch, albumentations, sklearn)
3. Sabitler ve Hiperparametreler — metadata: {"tags": ["parameters"]} (Papermill)
   - GCS_DATA_PATH dahil
4. GCS Data Setup (ortam tespiti + gsutil ile veri indirme)
5. Veri Hazirligi (collect_stroke_image_paths, stratified split)
6. Augmentation & Dataset sinifi (StrokeDataset)
7. WeightedRandomSampler & DataLoader
8. Model tanimlama (create_model)
9. Loss, Optimizer, Scheduler
10. train_one_epoch ve validate fonksiyonlari
11. Egitim dongusu (history, checkpoint kaydi)
12. Test degerlendirmesi (classification_report, confusion_matrix, ROC)
13. Sonuc ozeti (metrikleri acikca yaz — results.md guncellemesi icin)

### Vertex AI Notebook Gereksinimleri (notebooks/runs/)
- Parametre hucresinde GCS_DATA_PATH tanimli olmali
- Parametre hucresi metadata: {"tags": ["parameters"]}
- GCS setup hucresi: ortam tespiti + gsutil ile /tmp/data/ altina indirme
- STROKE_IMAGES_DIR setup hucresinde belirlenir, parametre hucresinde DEGIL
- Hucre sirasi: Imports → Parametreler (tagged) → GCS Setup → Veri Hazirligi → ...
- /kaggle/ hardcoded path KULLANILMAMALI

### Dokumantasyon Kurallari
- Her notebook'un sonuc bolumunde metrikler net yazilmali
- Her deney sonrasi results/results.md GUNCELLENMELI
- results.md TUM model ailelerinin sonuclarini icerir (model bazli gruplu)
- Her versiyonda yapilan degisiklik ve sonucu not edilmeli
