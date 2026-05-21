# CerebrAI — Cloudflare Quick Tunnel ile Canlıya Alma Rehberi

Bu rehber, projeyi **deploy etmeden** kendi MacBook'unda çalıştırıp Cloudflare Tunnel
üzerinden internete açma adımlarını içerir. Modeller CPU üzerinde, bu makinede çalışır.

> **Subdomain notu**: Quick tunnel rastgele bir subdomain üretir
> (`xxxx-yyyy-zzz.trycloudflare.com`). Sabit/özel isim istiyorsan en alttaki
> "Named tunnel" bölümüne bak.

---

## Gereksinimler (tek seferlik kurulum)

```bash
brew install cloudflared
```

Backend ve frontend bağımlılıkları kurulu olmalı:

```bash
# Python (backend) — bir kerelik
cd /Users/yusufaltuntas/Desktop/my-projects/stroke-detection/website/backend
pip install -r requirements.txt

# Node (frontend) — bir kerelik
cd /Users/yusufaltuntas/Desktop/my-projects/stroke-detection/website/next-app
npm install
```

Model checkpoint'leri zaten yerinde:
- `website/best_efficientnet_b3_A_fullstroke.pth`
- `website/best_model_densenet_v1.pth`

---

## Canlıya alma (5 terminal)

### Terminal 1 — Backend (FastAPI, port 8000)

```bash
cd /Users/yusufaltuntas/Desktop/my-projects/stroke-detection/website/backend
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

`Application startup complete.` mesajını bekle. Bu terminali kapatma.

---

### Terminal 2 — Backend tüneli

```bash
cloudflared tunnel --url http://localhost:8000
```

Çıktının en üstündeki kutuda URL göreceksin:
```
https://walking-hiring-east-alignment.trycloudflare.com
```

Bu **BACKEND_URL**. Kopyala — Terminal 3'te kullanacaksın.

Doğrula (yeni geçici bir terminalde):
```bash
curl https://walking-hiring-east-alignment.trycloudflare.com/api/health
```
`{"status":"ok",...}` dönmeli.

---

### Terminal 3 — Frontend (Next.js production build, port 3000)

Komutları **tek tek** yapıştır (blok halinde değil, shell quote hatasına yol açabilir):

```bash
cd /Users/yusufaltuntas/Desktop/my-projects/stroke-detection/website/next-app
```

```bash
export BACKEND_URL="https://walking-hiring-east-alignment.trycloudflare.com"
```

```bash
rm -rf .next
```

```bash
NEXT_PUBLIC_API_BASE="$BACKEND_URL" npm run build
```

```bash
NEXT_PUBLIC_API_BASE="$BACKEND_URL" npm run start -- --port 3000
```

`Local: http://localhost:3000` mesajını bekle.

> **Önemli**: `BACKEND_URL` build zamanında frontend'e gömülür. Backend tüneli
> her yeniden açıldığında URL değişir → frontend'i **yeniden build etmek zorundasın**.

---

### Terminal 4 — Frontend tüneli (paylaşılacak URL)

```bash
cloudflared tunnel --url http://localhost:3000
```

Çıktıdaki URL'i jüriye/arkadaşa ver:
```
https://desperate-can-assumed-midnight.trycloudflare.com
```

---

### Terminal 5 — Mac uyumasın

```bash
caffeinate -dimsu
```

Sunum süresince açık bırak. Mac uyursa Terminal 1, 2, 3, 4 hepsi düşer →
URL'ler değişir → Terminal 3'ü yeniden build etmek zorunda kalırsın.

---

## Sunum öncesi son kontrol

1. Paylaştığın URL'i tarayıcıda aç.
2. Inference sayfasında hero altında yeşil **"Backend bağlı"** rozetini gör.
3. Bir örneği seç → **Tahmin Başlat** → ~1–3 sn'de sonuç + Grad-CAM gelmeli.
4. `Deneyler & Sonuclar` sayfasında 14 deney tablosu ve confusion matrix'ler.

**Isıtma**: İlk tahmin ~5–10 sn sürer (model RAM'e yüklenir). Sunumdan önce
1 örnek tahmin çalıştırarak modelleri ısıt.

---

## Kapatma

Her terminalde sırasıyla `Ctrl+C`:

1. Terminal 5 (caffeinate)
2. Terminal 4 (frontend tunnel)
3. Terminal 2 (backend tunnel)
4. Terminal 3 (next start)
5. Terminal 1 (uvicorn)

---

## Yeniden açma (ertesi gün)

URL'ler **değişeceği için** sıralama önemli:

1. Terminal 1 → backend ayağa kalk
2. Terminal 2 → backend tünel → **yeni BACKEND_URL'i not al**
3. Terminal 3 → `BACKEND_URL` export'unu güncelle, `rm -rf .next`, `npm run build`, `npm run start`
4. Terminal 4 → frontend tünel → **yeni FRONTEND_URL paylaş**
5. Terminal 5 → caffeinate

---

## Sorun giderme

### "Backend bağlanılamadı" hatası (arayüzde kırmızı şerit)

Frontend yanlış BACKEND_URL ile build edilmiş. Terminal 3'ü `Ctrl+C` ile durdur,
güncel `BACKEND_URL` ile `rm -rf .next && npm run build && npm run start` adımlarını tekrar et.

### `EADDRINUSE` / `address already in use`

Port zaten kullanımda. Serbest bırak:
```bash
# Port 3000 için
lsof -ti :3000 | xargs kill -9 2>/dev/null

# Port 8000 için
lsof -ti :8000 | xargs kill -9 2>/dev/null
```

### `quote>` prompt'unda takıldım

Kopyala-yapıştır sırasında bir tırnak eşleşmedi. **`Ctrl+C`** ile çık, komutları
tek tek (`#` ile başlayan yorum satırlarını atlayarak) yapıştır.

### `{"detail":"Not Found"}`

Bu hata DEĞİL — FastAPI'nin kök `/` path için verdiği normal cevap. Test için
`/api/health` kullan: `curl <URL>/api/health`.

### Tahmin çok yavaş (>5 sn)

İlk istek modelleri yükler (~5-10 sn). Sonraki istekler ~1-3 sn olmalı.
Eğer sürekli yavaşsa Activity Monitor'da CPU/RAM doluluğunu kontrol et;
modeller ~1.5 GB RAM tüketir.

### Tüneller koptu, URL'ler değişti

Bilgisayar uyudu ya da ağ koptu. Yukarıdaki **"Yeniden açma"** adımlarını uygula.

---

## QR kod (mobil için)

```bash
brew install qrencode
qrencode -o cerebrai-qr.png "https://desperate-can-assumed-midnight.trycloudflare.com"
open cerebrai-qr.png
```

Slayta ekleyip jüri telefonundan da denesin.

---

## Bonus — Sabit URL (named tunnel)

Quick tunnel her açılışta URL değiştirir. Sabit istiyorsan kendi domain'in
Cloudflare DNS'inde olmalı:

```bash
cloudflared tunnel login                                # tarayıcıda domain seç
cloudflared tunnel create cerebrai
cloudflared tunnel route dns cerebrai cerebrai.kendisitenizin.com
```

`~/.cloudflared/config.yml`:
```yaml
tunnel: cerebrai
credentials-file: /Users/yusufaltuntas/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: api.cerebrai.kendisitenizin.com
    service: http://localhost:8000
  - hostname: cerebrai.kendisitenizin.com
    service: http://localhost:3000
  - service: http_status:404
```

Çalıştır:
```bash
cloudflared tunnel run cerebrai
```

Bu durumda Terminal 2 ve Terminal 4'ün yerine **tek bu komut yeter**.
Frontend'i `NEXT_PUBLIC_API_BASE=https://api.cerebrai.kendisitenizin.com`
ile bir kere build edersin, her oturumda yeniden build gerekmez.
