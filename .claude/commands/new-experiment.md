# New Experiment

Yeni bir deney notebook'u olustur ve deploy et.

## Adimlar

1. **Analiz**: notebook-analyst subagent'i kullanarak `notebooks/base/` icindeki referans notebook'u incele. Mevcut format ve yapiyi ogren.

2. **Notebook Olustur**: Arguman olarak verilen model, hiperparametreler ve stratejiyi kullanarak yeni bir notebook olustur:
   - Dosya adi formati: `{model}_{version}.ipynb` (ornek: `efnb3_v4.ipynb`)
   - Konum: `notebooks/runs/`
   - Ilk code hucresinde tum parametreleri tanimla
   - Referans notebook'un hucre yapisini koru

3. **Parametreler**: Su parametreleri kullanicidan al veya varsayilan deger kullan:
   - `model`: Model adi (varsayilan: efficientnet-b3)
   - `learning_rate`: Ogrenme orani (varsayilan: 1e-4)
   - `batch_size`: Batch boyutu (varsayilan: 16)
   - `epochs`: Epoch sayisi (varsayilan: 100)
   - `gamma`: Focal Loss gamma (varsayilan: 2.0)
   - `weight_power`: Sinif agirlik yumusatma (varsayilan: 0.5)
   - `scheduler`: Scheduler tipi (varsayilan: cosine)
   - `loss`: Loss tipi (varsayilan: focal)

4. **Versiyon Belirleme**: `notebooks/runs/` dizinindeki mevcut dosyalari kontrol et ve bir sonraki versiyon numarasini otomatik belirle.

5. **Deploy**: experiment-runner subagent'i ile notebook'u Vertex AI'a deploy et.

6. **Takip**: Deploy basarili ise job ID'yi raporla. Basarisiz ise hata mesajini goster.

## Ornek Kullanim
```
/new-experiment model=efficientnet-b3 learning_rate=0.0005 gamma=1.5 batch_size=32
```
