# CerebrAI — Windows PC Üzerinde Kurulum

Bu rehber siteyi sıfır kurulumdan Windows 10/11 üzerinde ayağa kaldırmanı sağlar.
Kullanılan komutlar **PowerShell** içindir (Windows Terminal veya VS Code terminal'i de PowerShell çalıştırır).

---

## 1) Gereksinimler

Sırayla şu araçları kur:

### Git
[git-scm.com/download/win](https://git-scm.com/download/win)
Kurulum sonrası:
```powershell
git --version
```

### Python 3.11 (3.12 değil — bazı paketler henüz uyumsuz)
[python.org/downloads](https://www.python.org/downloads/release/python-3119/) → **"Add python.exe to PATH"** kutucuğunu işaretle.
```powershell
python --version
pip --version
```

### Node.js 20 LTS
[nodejs.org](https://nodejs.org/en/download) → LTS sürümünü kur.
```powershell
node --version
npm --version
```

### Git LFS (model dosyaları için zorunlu)
Model checkpoint'leri Git LFS'te tutuluyor. Olmazsa `.pth` dosyaları boş indirilir.
```powershell
winget install -e --id GitHub.GitLFS
git lfs install
```

### cloudflared (sadece tüneli açacaksan)
```powershell
winget install --id Cloudflare.cloudflared
cloudflared --version
```

---

## 2) Repo'yu klonla

İstediğin bir klasörde:

```powershell
cd $HOME\Desktop
git clone https://github.com/YusufAltuntas/stroke-detection.git
cd stroke-detection
git lfs pull
```

`git lfs pull` sonrası kontrol et — checkpoint'ler 28-43 MB civarı olmalı:

```powershell
Get-ChildItem website\best_*.pth | Select-Object Name, @{N='MB';E={[math]::Round($_.Length/1MB,1)}}
```

`MB` değeri 1'den küçükse LFS düzgün indirmemiş demektir; `git lfs pull` tekrar çalıştır.

---

## 3) Backend kurulumu

### 3a) Sanal ortam oluştur

```powershell
cd website\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

> Eğer **"running scripts is disabled"** hatası alırsan PowerShell'i **yönetici** olarak aç ve şunu çalıştır (tek sefer):
> ```powershell
> Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
> ```

Aktif olduğunda prompt'un başında `(.venv)` görmelisin.

### 3b) Bağımlılıkları kur

```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

> Torch kurulumu ~600 MB indirir, 3-5 dakika sürebilir. Hata alırsan tek tek dene:
> ```powershell
> pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
> pip install -r requirements.txt
> ```

### 3c) Doğrulama

```powershell
python -c "import torch, fastapi; print('torch', torch.__version__, '| fastapi', fastapi.__version__)"
```

---

## 4) Frontend kurulumu

Yeni bir PowerShell penceresi aç:

```powershell
cd $HOME\Desktop\stroke-detection\website\next-app
npm install
```

İlk kurulum ~2 dakika sürer (~400 MB `node_modules`).

---

## 5) Çalıştırma — sadece kendi makinende

İki PowerShell penceresi:

### Pencere 1 — Backend (port 8000)
```powershell
cd $HOME\Desktop\stroke-detection\website\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

`Application startup complete.` mesajını bekle.

### Pencere 2 — Frontend (port 3000)
```powershell
cd $HOME\Desktop\stroke-detection\website\next-app
npm run dev
```

`Ready in ...` mesajından sonra tarayıcıda aç: <http://localhost:3000>

**Test**: bir örnek seç → **Tahmin Başlat**. CPU'da ilk tahmin 5-10 sn (modeller yüklenir), sonrakiler 1-3 sn.

---

## 6) İnternete açma (Cloudflare Tunnel)

5 PowerShell penceresine ihtiyacın var:

### Pencere 1 — Backend
```powershell
cd $HOME\Desktop\stroke-detection\website\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Pencere 2 — Backend tüneli
```powershell
cloudflared tunnel --url http://localhost:8000
```
Çıktıdaki `https://xxxx.trycloudflare.com` URL'ini kopyala — **BACKEND_URL**.

### Pencere 3 — Frontend (production build, backend URL'i ile)
Komutları **tek tek** çalıştır:

```powershell
cd $HOME\Desktop\stroke-detection\website\next-app
```
```powershell
$env:NEXT_PUBLIC_API_BASE = "https://xxxx.trycloudflare.com"
```
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```
```powershell
npm run build
```
```powershell
npm run start -- --port 3000
```

### Pencere 4 — Frontend tüneli
```powershell
cloudflared tunnel --url http://localhost:3000
```
Çıktıdaki URL'i jüriye/arkadaşa ver.

### Pencere 5 — Bilgisayar uyumasın

Windows'ta `caffeinate` yok. Onun yerine:
```powershell
powercfg /change standby-timeout-ac 0
powercfg /change monitor-timeout-ac 0
```
(Sunum sonrası geri al: `60` → 60 dakika.)

Veya basit alternatif: **Ayarlar → Sistem → Güç ve uyku → "Uyut" = Hiçbir zaman**.

---

## 7) Sık karşılaşılan sorunlar

### `pip install torch` çok yavaş ya da hata veriyor
Doğrudan CPU wheel'i:
```powershell
pip install torch==2.12.0+cpu torchvision==0.27.0+cpu --index-url https://download.pytorch.org/whl/cpu
```

### `EADDRINUSE` / port zaten kullanımda
```powershell
# Port 3000'i kullanan PID'i bul
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
# O PID'i öldür
Stop-Process -Id <PID> -Force
```

### `git lfs pull` checkpoint indirmedi → tahmin sırasında "model unavailable"
```powershell
cd $HOME\Desktop\stroke-detection
git lfs install
git lfs pull
Get-ChildItem website\best_*.pth
```
Boyutlar 1 MB'tan büyük olmalı.

### Frontend hero'da kırmızı "Backend baglanamadi" rozeti
- Backend penceresinde `Application startup complete.` mesajı görünüyor mu?
- `http://localhost:8000/api/health` tarayıcıda açılıyor mu?
- Cloudflare modu kullanıyorsan: `NEXT_PUBLIC_API_BASE` build sırasında ayarlandı mı?
  Production build için ENV **build zamanında** gömülür; URL değiştiyse yeniden build et.

### `quote>` veya `>>` prompt'unda takıldım
Kopyala-yapıştır sırasında tırnak eşleşmedi. `Ctrl+C` ile çık, komutları **tek satır** olarak yapıştır.

### Windows Defender / SmartScreen `cloudflared`'i engelliyor
Indirme sonrası "More info → Run anyway" tıkla. Veya `winget install` ile kur (zaten imzalı paket).

### `Set-ExecutionPolicy` izni hâlâ vermiyor
PowerShell'i **Yönetici** olarak aç:
```powershell
Set-ExecutionPolicy -Scope LocalMachine -ExecutionPolicy RemoteSigned -Force
```

### Modeller RAM yetersizliğinden çöküyor
Stage 1 + Stage 2 birlikte ~1.5 GB RAM tüketir. En az 8 GB RAM önerilir.
Task Manager'dan bellek doluluğunu kontrol et.

---

## 8) Kapatma

Her PowerShell penceresinde `Ctrl+C`. Sanal ortamdan çıkmak için:
```powershell
deactivate
```

`powercfg` ayarladıysan geri al:
```powershell
powercfg /change standby-timeout-ac 60
powercfg /change monitor-timeout-ac 15
```

---

## 9) Yeniden açma

Sıfırdan kurulum yapmanı gerektirmez. Sadece:

```powershell
# Pencere 1
cd $HOME\Desktop\stroke-detection\website\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000

# Pencere 2
cd $HOME\Desktop\stroke-detection\website\next-app
npm run dev
```

`http://localhost:3000` → hazırsın.

---

## Notlar

- **CUDA / GPU**: Bu rehber CPU içindir. NVIDIA GPU'lu makinede çalıştıracaksan
  `pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121`
  (CUDA 12.1 için) komutunu kullan. Performans 10-20× artar.
- **Disk**: Tüm kurulum sonrası ~3 GB (Python deps + node_modules + model
  checkpoint'leri + Next.js build cache).
- **Eğitim**: Bu repo sadece inference içindir. Modelleri tekrar eğitmek
  istersen `notebooks/` klasöründeki ipynb'leri Kaggle'da çalıştır
  (yerel CPU'da eğitim haftalar sürer).
