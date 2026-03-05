# Update Results

Tamamlanan bir deneyin sonuclarini `results/results.md` dosyasina ekle.

## Adimlar

1. **Analiz**: results-analyst subagent'ini calistir. Output notebook'u okusun ve metrikleri cikarsin.

2. **Tablo Guncelle**: `results/results.md` dosyasina yeni bir satir ekle:
   - Model adi
   - Versiyon
   - Test Accuracy
   - Macro F1
   - ACA Recall
   - MCA Recall
   - PCA Recall
   - Kullanilan hiperparametreler (ozet)
   - Notlar (iyilesen/kotusen metrikler)

3. **En Iyi Model**: Tablodaki en iyi modeli (Macro F1'e gore) tablonun ustunde belirt.

4. **Convergence Durumu**: results-analyst'in convergence ciktisini dosyanin sonuna ekle.

5. **Git Commit**: Degisiklikleri otomatik commit et.

## Ornek Kullanim
```
/update-results notebook=notebooks/runs/efnb3_v4.ipynb
```
