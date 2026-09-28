# Kasiran - Aplikasi Kasir & Stok Otomatis

Aplikasi kasir (Point of Sale) modern berbasis web untuk mencatat transaksi penjualan harian, cetak struk belanja thermal (58mm/80mm), dan manajemen stok barang otomatis.

## 🚀 Fitur Utama
- **Kasir POS Cepat**: Pencarian barang, SKU, dan scan barcode. Kalkulasi otomatis subtotal, diskon, dan PPN.
- **Multi Metode Pembayaran**: Tunai (kalkulasi uang pas & kembalian), QRIS Dinamis, dan Transfer Bank (BCA, Mandiri, BRI, BNI).
- **Stok Otomatis (Real-Time)**: Stok berkurang otomatis saat checkout berhasil, dan otomatis dikembalikan saat transaksi dibatalkan (*Refund*).
- **Cetak Struk**: Format struk kasir thermal standar siap cetak (*print dialog*) dan salin teks.
- **Laporan Harian & Ekspor CSV**: Filter penjualan harian, KPI omzet & laba kotor, serta ekspor file spreadsheet CSV/Excel.

---

## 📱 Cara Push Kode dari HP (Smartphone)

### Cara 1: Upload via Browser HP di GitHub Web (Tanpa Install Aplikasi - Paling Praktis)
1. Buka browser HP (Chrome / Safari), buka [github.com](https://github.com) dan login.
2. Di menu browser HP (titik tiga di kanan atas), aktifkan **"Situs Desktop"** (Desktop Site).
3. Buat repositori baru bernama `kasiran` (Public).
4. Klik tautan **"uploading an existing file"**.
5. Pilih berkas proyek Anda dari penyimpanan HP, lalu klik tombol **"Commit changes"**.

### Cara 2: Menggunakan Termux (Android Terminal)
```bash
# 1. Update paket dan install Git di Termux
pkg update && pkg install git nodejs -y

# 2. Masuk ke folder proyek Anda di HP
cd /sdcard/Download/kasiran

# 3. Setup identitas Git
git config --global user.name "Nama Anda"
git config --global user.email "email_anda@gmail.com"

# 4. Push ke GitHub
git init
git add .
git commit -m "feat: inisialisasi aplikasi kasiran"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/kasiran.git
git push -u origin main
# (Gunakan GitHub Personal Access Token/PAT sebagai password)
```

### Cara 3: Menggunakan Aplikasi Mobile Git GUI
- **Android**: Pasang **Spck Editor** atau **Acode** dari Google Play Store (memiliki antarmuka Git bawaan untuk commit & push dengan tombol visual).
- **iPhone / iOS**: Pasang **Working Copy** dari App Store (aplikasi Git client lengkap untuk iOS).

---

## ⚡ Panduan Hosting Langsung ke Vercel

### Metode 1: Hubungkan Repositori GitHub ke Vercel (Paling Mudah & Otomatis)
1. **Push kode ke GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi aplikasi kasiran"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/kasiran.git
   git push -u origin main
   ```
2. Buka [https://vercel.com](https://vercel.com) dan login menggunakan akun GitHub Anda.
3. Klik tombol **"Add New..."** lalu pilih **"Project"**.
4. Pilih repositori **kasiran** dari daftar repositori GitHub Anda, lalu klik **"Import"**.
5. Konfigurasi Vercel:
   - **Framework Preset**: `Vite` (terdeteksi otomatis)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Klik tombol **"Deploy"**. Dalam ~30 detik aplikasi Anda sudah aktif di internet dengan URL gratis `https://kasiran-xxx.vercel.app`! Setiap Anda melakukan `git push`, Vercel akan otomatis meng-update aplikasinya.

---

### Metode 2: Deploy Langsung via Vercel CLI (Dari Terminal)
Jika ingin deploy langsung dari terminal tanpa membuka web dashboard:
```bash
# 1. Pasang Vercel CLI (jika belum ada)
npm install -g vercel

# 2. Login ke akun Vercel Anda
vercel login

# 3. Jalankan perintah deploy
vercel

# 4. Untuk deploy ke production domain:
vercel --prod
```

---

## 💻 Menjalankan di Komputer Lokal

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan server lokal
npm run dev

# 3. Buka di browser
# http://localhost:3000
```
