# DigiSecond — Deployment Guide
**Stack**: Ubuntu Server (VM) · Nginx · Cloudflare Tunnel · PostgreSQL (Supabase)  
**Scope**: Lokal → Internet, tanpa VPS, tanpa domain, tanpa CI/CD  
**Last updated**: 2026-04-11

---

## Arsitektur Final

```
User (Internet)
    ↓ HTTPS otomatis
Cloudflare Edge
    ↓ Named Tunnel (encrypted)
cloudflared (Ubuntu Server VM)
    ↓ http://localhost:80
Nginx (reverse proxy)
    ↓ http://localhost:3000
Next.js App (PM2)
    ↓
PostgreSQL (Supabase Cloud) + Redis (Upstash Cloud)
```

---

## Bagian 1 — Persiapan VirtualBox

### 1.1 Spesifikasi VM yang Disarankan

| Resource | Minimum | Disarankan |
|---|---|---|
| CPU | 2 core | 2–4 core |
| RAM | 2 GB | 4 GB |
| Storage | 20 GB | 40 GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### 1.2 Konfigurasi Network Adapter

Di VirtualBox → Settings → Network:

- **Adapter 1**: NAT — akses internet dari VM (untuk download package, Cloudflare Tunnel)
- **Adapter 2**: Host-only Adapter — SSH dari Manjaro ke VM

### 1.3 Cari IP VM Setelah Boot

```bash
# Di dalam Ubuntu VM
ip addr show
# Cari interface enp0s8 atau eth1
# Contoh output: inet 192.168.56.101/24
```

### 1.4 SSH dari Manjaro

```bash
# Di Manjaro
ssh deploy@192.168.56.101

# Agar tidak perlu password setiap kali
ssh-copy-id deploy@192.168.56.101
```

---

## Bagian 2 — Setup Ubuntu Server

### 2.1 Update & Package Dasar

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw fail2ban unzip
```

### 2.2 Buat User Non-root

```bash
# Jalankan sebagai root
adduser deploy
usermod -aG sudo deploy

# Copy SSH key
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy

# Login sebagai deploy mulai sekarang
su - deploy
```

### 2.3 Install Node.js via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

nvm install --lts
nvm use --lts

# Verifikasi
node -v && npm -v
```

---

## Bagian 3 — Deploy Aplikasi Next.js

### 3.1 Clone & Install

```bash
cd ~
git clone https://github.com/username/digisecond.git
cd digisecond

npm install
```

### 3.2 Environment Variables

```bash
cp .env.example .env
nano .env
```

Isi lengkap `.env`:

```env
# App
NODE_ENV=production
PORT=3000

# NextAuth — update setelah dapat URL tunnel di Bagian 5
NEXTAUTH_URL=http://192.168.56.101
NEXTAUTH_SECRET=isi-random-string-minimal-32-karakter

# Database — Supabase Cloud
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://[ID].upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Xendit
XENDIT_API_KEY=xnd_production_...
XENDIT_WEBHOOK_TOKEN=...

# MailerSend
MAILERSEND_API_KEY=...
```

> **Catatan**: `NEXTAUTH_URL` sementara pakai IP lokal dulu. Akan diupdate ke URL tunnel setelah Bagian 5 selesai.

### 3.3 Prisma & Build

```bash
# Generate Prisma client
npx prisma generate

# Jalankan migration ke Supabase
npx prisma migrate deploy

# Verifikasi status migration
npx prisma migrate status

# Build aplikasi
npm run build
```

### 3.4 PM2 — Process Manager

```bash
# Install PM2 global
npm install -g pm2

# Buat file ekosistem
nano ~/digisecond/ecosystem.config.js
```

```javascript
module.exports = {
  apps: [
    {
      name: 'digisecond',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: '/home/deploy/digisecond',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
}
```

```bash
# Jalankan
cd ~/digisecond
pm2 start ecosystem.config.js

# Auto-start saat VM reboot
pm2 startup
# Jalankan perintah output yang muncul, lalu:
pm2 save

# Verifikasi
pm2 status
curl http://localhost:3000   # harus dapat respons HTML
```

---

## Bagian 4 — Konfigurasi Nginx

### 4.1 Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4.2 Konfigurasi Site DigiSecond

```bash
sudo nano /etc/nginx/sites-available/digisecond
```

```nginx
server {
    listen 80;
    server_name _;

    # Log untuk debugging
    access_log /var/log/nginx/digisecond.access.log;
    error_log  /var/log/nginx/digisecond.error.log;

    # Buffer settings
    proxy_buffer_size       128k;
    proxy_buffers           4 256k;
    proxy_busy_buffers_size 256k;

    # Next.js — main app
    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade     $http_upgrade;
        proxy_set_header   Connection  'upgrade';
        proxy_set_header   Host        $host;
        proxy_set_header   X-Real-IP   $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # WebSocket — Supabase Realtime (live chat & auction bids)
    location /realtime/ {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade     $http_upgrade;
        proxy_set_header   Connection  "Upgrade";
        proxy_set_header   Host        $host;
        proxy_read_timeout 86400s;
    }

    # tRPC API
    location /api/trpc/ {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host            $host;
        proxy_set_header   X-Real-IP       $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }

    # Xendit Payment Webhook
    location /api/webhooks/xendit {
        proxy_pass           http://localhost:3000;
        proxy_http_version   1.1;
        proxy_set_header     Host            $host;
        proxy_set_header     X-Real-IP       $remote_addr;
        proxy_set_header     X-Forwarded-For $proxy_add_x_forwarded_for;
        client_max_body_size 10M;
    }

    # Upload KYC (ID card seller verification)
    location /api/upload/ {
        proxy_pass           http://localhost:3000;
        proxy_http_version   1.1;
        client_max_body_size 20M;
        proxy_read_timeout   120s;
    }

    # Next.js static assets — aggressive cache
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js public folder
    location /public/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=86400";
    }
}
```

### 4.3 Aktifkan & Test

```bash
# Hapus default site
sudo rm /etc/nginx/sites-enabled/default

# Aktifkan site digisecond
sudo ln -s /etc/nginx/sites-available/digisecond /etc/nginx/sites-enabled/

# Test konfigurasi
sudo nginx -t

# Reload
sudo systemctl reload nginx

# Verifikasi dari Manjaro
curl http://192.168.56.101   # harus dapat respons Next.js
```

---

## Bagian 5 — Cloudflare Tunnel

### 5.1 Buat Akun Cloudflare

Daftar gratis di https://cloudflare.com — tidak perlu kartu kredit.

### 5.2 Install cloudflared di VM

```bash
# Tambah repo Cloudflare
curl -L https://pkg.cloudflare.com/cloudflare-main.gpg | \
  sudo tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null

echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] \
  https://pkg.cloudflare.com/cloudflared jammy main' | \
  sudo tee /etc/apt/sources.list.d/cloudflared.list

sudo apt update && sudo apt install -y cloudflared

# Verifikasi
cloudflared --version
```

### 5.3 Login ke Cloudflare

```bash
cloudflared tunnel login
# Akan muncul URL — buka di browser Manjaro
# Klik Authorize
# File credentials tersimpan otomatis di ~/.cloudflared/cert.pem
```

### 5.4 Buat Named Tunnel

```bash
# Buat tunnel dengan nama
cloudflared tunnel create digisecond

# Output contoh:
# Created tunnel digisecond with id a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# Credentials written to /home/deploy/.cloudflared/a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json

# Catat Tunnel ID kamu!
```

### 5.5 Buat Konfigurasi Tunnel

```bash
nano ~/.cloudflared/config.yml
```

```yaml
tunnel: a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx   # ganti dengan Tunnel ID kamu
credentials-file: /home/deploy/.cloudflared/a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx.json

ingress:
  - service: http://localhost:80   # arahkan ke Nginx, bukan langsung :3000
```

### 5.6 Test Tunnel

```bash
# Test run dulu sebelum dijadikan service
cloudflared tunnel run digisecond

# Akan muncul output seperti:
# INF Connection established connIndex=0
# INF Connection established connIndex=1

# URL tunnel format:
# https://a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx.cfargotunnel.com
# URL ini PERMANEN — tidak berubah walau di-restart
```

> Buka URL tersebut di browser dari HP atau jaringan berbeda untuk verifikasi.

### 5.7 Jadikan Service (Auto-start)

```bash
# Install sebagai systemd service
sudo cloudflared service install

sudo systemctl enable cloudflared
sudo systemctl start cloudflared

# Cek status
sudo systemctl status cloudflared
```

### 5.8 Update NEXTAUTH_URL

Sekarang URL tunnel sudah diketahui, update `.env`:

```bash
nano ~/digisecond/.env
```

```env
NEXTAUTH_URL=https://a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx.cfargotunnel.com
```

```bash
# Restart Next.js agar perubahan .env terbaca
pm2 restart digisecond

# Tunggu beberapa detik, lalu verifikasi
pm2 logs digisecond --lines 20
```

### 5.9 Daftarkan Xendit Webhook

Masuk ke dashboard Xendit → Settings → Callbacks, isi:

```
https://a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx.cfargotunnel.com/api/webhooks/xendit
```

---

## Bagian 6 — Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Verifikasi
sudo ufw status verbose
```

> Port 3000 (Next.js) tidak perlu dibuka — hanya Nginx yang boleh akses dari luar, Next.js hanya diakses oleh Nginx secara internal.

---

## Bagian 7 — Simulate Xendit Payment (Lokal)

Karena Xendit tidak bisa hit URL lokal saat masih di fase lokal-only, gunakan script ini untuk testing:

```bash
nano ~/simulate-payment.sh
```

```bash
#!/bin/bash
WEBHOOK_URL="http://192.168.56.101/api/webhooks/xendit"
WEBHOOK_TOKEN="isi-xendit-webhook-token-kamu"
TRANSACTION_ID=${1:-"test-txn-$(date +%s)"}

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "x-callback-token: $WEBHOOK_TOKEN" \
  -d "{
    \"event\": \"payment.succeeded\",
    \"data\": {
      \"id\": \"pay-$(date +%s)\",
      \"external_id\": \"$TRANSACTION_ID\",
      \"status\": \"PAID\",
      \"amount\": 150000,
      \"paid_at\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }
  }"

echo ""
echo "Webhook terkirim untuk: $TRANSACTION_ID"
```

```bash
chmod +x ~/simulate-payment.sh

# Cara pakai
~/simulate-payment.sh "txn-uuid-dari-database"
```

---

## Bagian 8 — Script Update Aplikasi

Setiap ada perubahan kode, gunakan script ini untuk deploy:

```bash
nano ~/update.sh
```

```bash
#!/bin/bash
set -e

echo "=== Pulling latest code ==="
cd ~/digisecond
git pull origin main

echo "=== Installing dependencies ==="
npm install

echo "=== Running migrations ==="
npx prisma migrate deploy

echo "=== Building ==="
npm run build

echo "=== Restarting app ==="
pm2 restart digisecond

echo "=== Done! ==="
pm2 status
```

```bash
chmod +x ~/update.sh
```

---

## Bagian 9 — Checklist Verifikasi Akhir

Jalankan semua cek ini setelah setup selesai:

```bash
# 1. PM2
pm2 status
# digisecond harus: status=online, restarts=0

# 2. Next.js langsung
curl http://localhost:3000
# Harus dapat respons HTML

# 3. Nginx routing
curl http://localhost:80
# Harus dapat respons yang sama

# 4. Dari Manjaro (lokal)
curl http://192.168.56.101
# Harus dapat respons Next.js

# 5. Cloudflare Tunnel
sudo systemctl status cloudflared
# Harus: active (running)

cloudflared tunnel info digisecond
# Harus menampilkan info tunnel dan koneksi aktif

# 6. Database
cd ~/digisecond && npx prisma migrate status
# Harus: All migrations have been applied

# 7. Firewall
sudo ufw status
# Harus: OpenSSH dan Nginx Full ALLOW

# 8. Test dari internet
# Buka URL tunnel di browser HP (matikan WiFi, pakai data) 
# https://[TUNNEL-ID].cfargotunnel.com
```

---

## Bagian 10 — Troubleshooting Umum

### Next.js tidak jalan

```bash
pm2 logs digisecond --lines 50
# Cek error di output

# Kemungkinan penyebab:
# - .env tidak lengkap → cek grep -c "=" .env
# - Build gagal → jalankan npm run build manual
# - Port 3000 sudah dipakai → lsof -i :3000
```

### Nginx error 502 Bad Gateway

```bash
# Berarti Nginx jalan tapi Next.js tidak
pm2 status   # cek apakah digisecond online

# Cek log Nginx
sudo tail -f /var/log/nginx/digisecond.error.log
```

### Cloudflare Tunnel tidak konek

```bash
sudo journalctl -u cloudflared -f
# Cek error di log

# Pastikan VM punya akses internet
curl https://cloudflare.com

# Restart tunnel
sudo systemctl restart cloudflared
```

### Login / session NextAuth gagal setelah tunnel aktif

```bash
# Penyebab: NEXTAUTH_URL belum diupdate ke URL tunnel
nano ~/digisecond/.env
# Pastikan NEXTAUTH_URL = https://[TUNNEL-ID].cfargotunnel.com

pm2 restart digisecond
```

### WebSocket Supabase Realtime tidak konek

```bash
# Cek konfigurasi Nginx — lokasi /realtime/ harus ada
sudo nginx -T | grep -A 10 "realtime"

# Cloudflare Tunnel sudah support WebSocket secara default
# Tidak perlu konfigurasi tambahan di sisi tunnel
```

---

## Ringkasan Port & Service

| Service | Port | Akses dari luar | Keterangan |
|---|---|---|---|
| Next.js | 3000 | Tidak (internal only) | Diakses Nginx saja |
| Nginx | 80 | Ya (via tunnel) | Entry point semua request |
| cloudflared | — | — | Tunnel ke Cloudflare |
| PostgreSQL | 5432 | Tidak | Supabase Cloud |
| SSH | 22 | Hanya dari LAN | Manjaro → VM |

---

## Struktur File Konfigurasi

```
Ubuntu Server VM
├── /etc/nginx/sites-available/digisecond    ← Nginx config
├── /etc/nginx/sites-enabled/digisecond     ← Symlink
├── /home/deploy/.cloudflared/
│   ├── cert.pem                            ← Cloudflare auth
│   ├── config.yml                          ← Tunnel config
│   └── [TUNNEL-ID].json                   ← Tunnel credentials
├── /home/deploy/digisecond/
│   ├── .env                                ← Environment variables
│   ├── ecosystem.config.js                 ← PM2 config
│   ├── update.sh                           ← Deploy script
│   └── simulate-payment.sh                 ← Xendit simulator
└── /var/log/nginx/
    ├── digisecond.access.log
    └── digisecond.error.log
```
