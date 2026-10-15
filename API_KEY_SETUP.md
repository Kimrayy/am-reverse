# API Key untuk am-reverse

Semua endpoint yang sudah ada di `/api/*` sekarang memerlukan `AM_API_KEY`. Perubahan ini hanya menambah lapisan autentikasi, **tidak mengubah** implementasi `lib/auth.js`, termasuk `pro()`.

## 1. Konfigurasi

Buat secret dengan Node.js:

```bash
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Simpan hasilnya sebagai environment variable `AM_API_KEY` di server/layanan hosting. Minimal 32 karakter. Jangan memasukkan secret ke GitHub atau JavaScript yang dijalankan browser.

Port server menggunakan `PORT` dari lingkungan atau default `3300`.

## 2. Mengakses API dari backend

```bash
curl -H "X-API-Key: $AM_API_KEY" https://api.contoh.com/api/status
```

Alternatifnya, gunakan header `Authorization: Bearer <api-key>`.

- Jika key kosong/terlalu pendek: HTTP 503, `API_KEY_NOT_CONFIGURED`.
- Jika key salah/tidak ada: HTTP 401, `UNAUTHORIZED`.
- Jika key benar: request diteruskan ke endpoint yang sudah ada.

**Gunakan kunci hanya dari backend Waroengkuy.** Pemanggilan API langsung dari browser akan membocorkan kuncinya. Halaman HTML lama di `public/index.html` memanggil `/api` langsung dari browser dan perlu proxy backend/autentikasi terpisah jika tetap akan digunakan.

## 3. Batasan

API key hanya mengamankan siapa yang bisa mengakses endpoint. Ini bukan bukti transaksi atau lisensi Alight Motion, dan tidak memvalidasi status premium. Kode `verify-link` saat ini mengembalikan token autentikasi pihak ketiga; jangan meneruskan respons tersebut secara mentah kepada pelanggan/browser. Bagian `pro()` yang memakai bukti pembelian buatan tidak diuji atau diubah oleh penambahan autentikasi ini.

## 4. Tes

```bash
node --test test/api-key.test.js
```
