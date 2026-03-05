# New Experiment

Onceki deneyleri analiz ederek otonom sekilde yeni bir deney notebook'u olustur ve deploy et.
Kullanici sadece model adini verir. Hiperparametreleri ve stratejiyi sen belirlersin.

## Adimlar

### 1. Onceki Deneylerin Tam Analizi
notebook-analyst subagent'i kullanarak `notebooks/base/` ve `notebooks/runs/` icindeki TUM notebook'lari incele:
- Her deneyde kullanilan hiperparametreleri cikar (lr, gamma, weight_power, scheduler, loss, batch_size, epochs)
- Her deneyin sonuclarini cikar (test_acc, macro_f1, per-class recall)
- Her deneyde yapilan strateji degisikligini ve sonucunu not et
- `results/results.md` dosyasini da oku — karsilastirma tablosunu kullan

### 2. Trend Analizi ve Karar
Onceki deneylerin trendini analiz et:
- Hangi hiperparametre degisiklikleri hangi metrikleri iyilestirdi?
- Hangi degisiklikler olumsuz etki yaratti?
- Tahterevalli etkisi var mi? (bir sinif artarken diger dusuyorsa)
- En buyuk darbogazin ne oldugunu belirle (ACA recall, MCA-PCA karisikligi, vs.)

### 3. Sonraki Deney Plani
Analiz sonucuna dayanarak KENDIN karar ver:
- Hangi hiperparametreleri degistirmeli?
- Neden bu degerleri sectin? (her parametre icin 1 cumle gerekce)
- Strateji ne olmali? (ornek: "gamma'yi biraz daha dusur cunku v3'te denge iyilesti")
- KARAR RAPORUNU kullaniciya goster, onay bekle

### 4. Notebook Olustur
- Dosya adi: `{model_kisa}_{version}.ipynb` (ornek: `efnb3_v4.ipynb`)
- Konum: `notebooks/runs/`
- En son basarili notebook'un hucre yapisini referans al
- Ilk code hucresinde tum parametreleri tanimla
- Degisiklikleri markdown hucresinde acikla (neden bu parametreler secildi)

### 5. Versiyon Belirleme
`notebooks/base/` ve `notebooks/runs/` dizinlerindeki mevcut dosyalari kontrol et.
Ayni model icin bir sonraki versiyon numarasini otomatik belirle.

### 6. Deploy
experiment-runner subagent'i ile notebook'u Vertex AI'a deploy et.

### 7. Takip
Deploy basarili ise job ID'yi raporla. Basarisiz ise hata mesajini goster.

## Girdi
Sadece model adi:
```
/new-experiment model=efficientnet-b3
```

Tum hiperparametreler onceki deneylerin analizine dayanarak OTONOM secilir.

## Cikti Formati
```
DENEY PLANI
===========
Model: [model adi]
Versiyon: [v#]
Onceki En Iyi: [hangi versiyon, hangi metriklerle]

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
