# Dokumentasi autentikasi API

Seluruh endpoint `/api/*` menggunakan middleware `AM_API_KEY` dari `lib/api-key.js`. Header yang didukung: `X-API-Key` atau `Authorization: Bearer <key>`.

## Environment

```env
AM_API_KEY=<minimal-32-karakter>
PORT=3300
```

Buat API key acak untuk produksi:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Simpan kunci di konfigurasi environment server. Jangan gunakan `NEXT_PUBLIC_`, query string, atau JavaScript browser.

## API

- `GET /api/stats`: health check server, respons berisi `status` dan `timestamp`. Menggantikan path `/api/status`, bukan statistik aktivasi.
- `POST /api/get-link`: meminta pengiriman email autentikasi dengan body JSON `{"email":"user@example.com"}`. Menggantikan path `/api/send-link`. Hanya gunakan email dengan persetujuan pemilik.

```bash
curl -H "X-API-Key: $AM_API_KEY" "$AM_API_URL/api/stats"
curl -X POST "$AM_API_URL/api/get-link" -H "X-API-Key: $AM_API_KEY" -H "Content-Type: application/json" -d '{"email":"user@example.com"}'
```

## Error

- `503 API_KEY_NOT_CONFIGURED`: secret di server tidak tersedia atau terlalu pendek.
- `401 UNAUTHORIZED`: key client tidak valid.

## Catatan keamanan

Handler legacy `/api/verify-link` serta fungsi `auth.pro()` tidak diubah. Handler itu menangani tautan login Firebase pihak ketiga, mengembalikan token sesi, dan mencoba memproses bukti pembelian buatan; jangan tampilkan sebagai endpoint aktivasi reseller atau diteruskan ke browser pelanggan. Untuk alur provisioning produksi, gunakan identitas dan bukti pembelian yang sah.

Halaman utama adalah dokumentasi layanan independen. Tidak ada klaim afiliasi atau status reseller resmi Alight Motion.
