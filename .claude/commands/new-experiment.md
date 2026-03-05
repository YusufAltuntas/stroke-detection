# New Experiment

Onceki deneyleri analiz ederek otonom sekilde yeni bir deney notebook'u olustur ve deploy et.
Kullanici sadece model adini verir. Hiperparametreleri ve stratejiyi sen belirlersin.

## Adimlar

### 1. Model Ailesi Tespiti
- Bu model ailesi icin daha once deney yapilmis mi? (notebooks/base/ ve notebooks/runs/ kontrol et)
- EVET ise → Adim 2'ye git (devam eden deneyler)
- HAYIR ise → Adim 1b'ye git (yeni model ailesi)

### 1b. Yeni Model Ailesi Baslangici
- Onceki model ailelerinin BIRKAC notebook'unu oku (yapi ve format ogrenmek icin)
- results.md'den onceki TUM sonuclari oku (karsilastirma icin)
- Bu model ailesi icin baseline notebook olustur (standart hiperparametreler)
- Baseline'da ozel strateji DENEME — sadece modeli kur, standart ayarlarla calistir
- Adim 4'e atla

### 2. Onceki Deneylerin Tam Analizi
notebook-analyst subagent'i kullanarak ayni model ailesinin TUM notebook'larini incele:
- Her deneyde kullanilan hiperparametreleri cikar (lr, gamma, weight_power, scheduler, loss, batch_size, epochs)
- Her deneyin sonuclarini cikar (test_acc, macro_f1, per-class recall)
- Her deneyde yapilan strateji degisikligini ve sonucunu not et
- `results/results.md` dosyasini da oku — karsilastirma tablosunu kullan

### 3. Trend Analizi ve Karar
Onceki deneylerin trendini analiz et:
- Hangi hiperparametre degisiklikleri hangi metrikleri iyilestirdi?
- Hangi degisiklikler olumsuz etki yaratti?
- Tahterevalli etkisi var mi? (bir sinif artarken diger dusuyorsa)
- En buyuk darbogazin ne oldugunu belirle (ACA recall, MCA-PCA karisikligi, vs.)
- Her versiyonda MINOR degisiklikler yap — major degil (deneysel surec)

### 3b. Sonraki Deney Plani
Analiz sonucuna dayanarak KENDIN karar ver:
- Hangi hiperparametreleri degistirmeli?
- Neden bu degerleri sectin? (her parametre icin 1 cumle gerekce)
- Strateji ne olmali? (ornek: "gamma'yi biraz daha dusur cunku v3'te denge iyilesti")
- KARAR RAPORUNU kullaniciya goster, onay bekle

### 4. Notebook Olustur
- Dosya adi: `{model_kisa}_{version}.ipynb` (ornek: `efnb3_v4.ipynb`, `densenet_baseline.ipynb`)
- Konum: `notebooks/runs/`
- En son basarili notebook'un hucre yapisini referans al (yeni model ailesi ise onceki aileden ogren)

#### 4a. Vertex AI Uyumluluk (ZORUNLU)
Her yeni notebook'ta su hucre yapisi kullanilmali:

**HUCRE SIRASI:**
1. Markdown: Baslik, hipotez, strateji aciklamasi
2. Code — Imports: Tum import'lar
3. Code — Parametreler (PAPERMILL TAGGED): metadata: {"tags": ["parameters"]}
   - GCS_DATA_PATH = 'gs://stroke-detection/data/stroke_dataset/stroke_dataset/'
   - IMG_SIZE, BATCH_SIZE, LEARNING_RATE, WEIGHT_DECAY, NUM_EPOCHS, GAMMA, WEIGHT_POWER, vs.
   - STROKE_IMAGES_DIR burada OLMAMALI
4. Code — GCS Data Setup: Ortam tespiti + gsutil ile veri indirme
   - Kaggle path varsa → Kaggle kullan
   - Yoksa → GCS'den /tmp/data/stroke_dataset/stroke_dataset/ altina indir
   - STROKE_IMAGES_DIR burada belirlenir
5. Code+: Veri hazirligi, model, egitim, test, sonuc ozeti

**GCS SETUP HUCRESI SABLONU:**
```python
import os, subprocess
from pathlib import Path

if os.path.exists('/kaggle/input/stroke-images/flattened_images'):
    STROKE_IMAGES_DIR = '/kaggle/input/stroke-images/flattened_images'
    print('Ortam: Kaggle')
elif os.path.exists('/tmp/data/stroke_dataset/stroke_dataset') and len(os.listdir('/tmp/data/stroke_dataset/stroke_dataset')) >= 3:
    STROKE_IMAGES_DIR = '/tmp/data/stroke_dataset/stroke_dataset'
    print('Ortam: Vertex AI — Veri zaten mevcut')
else:
    print(f'GCS\'den veri indiriliyor: {GCS_DATA_PATH}')
    os.makedirs('/tmp/data', exist_ok=True)
    result = subprocess.run(['gsutil', '-m', 'cp', '-r', GCS_DATA_PATH, '/tmp/data/'], capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f'GCS download failed: {result.stderr}')
    STROKE_IMAGES_DIR = '/tmp/data/stroke_dataset/stroke_dataset'

for cls in ['ACA', 'MCA', 'PCA']:
    count = len(list(Path(STROKE_IMAGES_DIR, cls).glob('*'))) if Path(STROKE_IMAGES_DIR, cls).exists() else 0
    print(f'  {cls}: {count} goruntu')
```

- /kaggle/ hardcoded path KULLANILMAMALI (setup hucresi otomatik halleder)

### 5. Versiyon Belirleme
`notebooks/base/` ve `notebooks/runs/` dizinlerindeki mevcut dosyalari kontrol et.
Ayni model icin bir sonraki versiyon numarasini otomatik belirle.

### 6. Deploy
experiment-runner subagent'i ile notebook'u Vertex AI'a deploy et.

### 7. Takip ve Dokumantasyon
- Deploy basarili ise job ID'yi raporla
- Basarisiz ise hata mesajini goster
- Egitim tamamlandiginda results.md'yi guncelle (update-results skill'i kullan)
- Notebook'un sonuc bolumunde metrikleri net yaz

## Girdi
Sadece model adi:
```
/new-experiment model=efficientnet-b3
/new-experiment model=densenet-121
```

Tum hiperparametreler onceki deneylerin analizine dayanarak OTONOM secilir.

## Cikti Formati
```
DENEY PLANI
===========
Model Ailesi: [model adi]
Versiyon: [v# veya baseline]
Onceki En Iyi (bu model): [hangi versiyon, hangi metriklerle]
Onceki En Iyi (tum modeller): [hangi model/versiyon]

Secilen Hiperparametreler:
  learning_rate: X (gerekce: ...)
  gamma: X (gerekce: ...)
  weight_power: X (gerekce: ...)
  batch_size: X (gerekce: ...)
  scheduler: X (gerekce: ...)
  loss: X (gerekce: ...)

Strateji Ozeti: [1-2 cumle]
Beklenen Etki: [hangi metrigin iyilesmesi hedefleniyor]
```
