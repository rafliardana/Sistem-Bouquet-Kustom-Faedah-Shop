# 💐 Sistem Bouquet Kustom — Faedah Shop 💐

Sistem e-commerce dan kustomisasi bouquet bunga berbasis **web** dan **aplikasi mobile (Android & iOS)** yang modern, interaktif, dan responsif. Versi web dan mobile memakai backend REST API dan database yang sama. Aplikasi ini dirancang khusus untuk mempermudah pelanggan dalam memilih, mengkustomisasi ukuran & tambahan (addons) bouquet, serta mempermudah pemilik toko (**Faedah Shop**) dalam manajemen stok, pesanan, dan laporan penjualan secara lokal.

<img width="1536" height="1024" alt="ChatGPT Image 21 Jun 2026, 01 32 35" src="https://github.com/user-attachments/assets/a63c9fd7-95a1-487f-b8ef-a6f5a23382c8" />

<img width="962" height="1067" alt="diagram-export-21-6-2026-00 43 57" src="https://github.com/user-attachments/assets/c52b35d1-1a80-4b44-9eef-af7af5920c48" />


<img width="808" height="634" alt="Untitled" src="https://github.com/user-attachments/assets/4c131600-2349-43f0-98da-c068fc1c51a0" />

---

## 🚀 Fitur Utama

### 🛒 Pelanggan (Customer)
*   **Katalog Interaktif**: Tampilan produk bouquet bunga yang elegan dan responsif dengan navigasi kategori.
*   **Kustomisasi Bouquet (Real-time)**: Pelanggan bisa menentukan ukuran buket, menambah aksesori (pita, kartu ucapan, vas), memberikan deskripsi khusus, dan mengunggah gambar referensi buket.
*   **Formulir Checkout & Pembayaran**: Integrasi metode pembayaran transfer (BCA, Mandiri, OVO, GoPay) lengkap dengan unggah bukti transfer atau opsi COD.
*   **Lacak Pesanan (Order Tracker)**: Menelusuri status pengerjaan pesanan secara real-time berdasarkan nomor pesanan (`FLR-XXXXXX`).

### 💼 Admin & Owner (Manajemen)
*   **Dashboard Statistik (Owner)**: Grafik omzet penjualan harian, total transaksi harian, produk terlaris, serta persentase status pesanan.
*   **Manajemen Pesanan**: Mengonfirmasi pembayaran, memperbarui status pengerjaan (Menunggu → Diproses → Siap → Selesai).
*   **Manajemen Produk (CRUD)**: Menambah, mengubah detail harga dasar, kategori, foto, ukuran, serta addons bouquet.
*   **Kelola Metode Pembayaran**: Mengaktifkan atau menonaktifkan metode bayar langsung dari panel admin.
*   **Manajemen Akun Admin (Owner Only)**: Hak akses khusus bagi owner untuk merekrut atau menghapus staf admin.

### 📱 Aplikasi Mobile (folder `mobile/`)
*   **Customer**: Katalog 2 kolom dengan filter kategori & pencarian, kustomisasi bouquet dengan harga langsung, upload gambar referensi & bukti bayar dari galeri/kamera, serta pelacak pesanan `FLR-XXXXXX` yang diperbarui otomatis setiap 10 detik.
*   **Admin/Owner**: Dashboard statistik, ubah status pesanan (Menunggu → Diproses → Siap → Selesai), serta daftar, tambah, dan edit produk.
*   **Sesi tersimpan**: Pengguna tetap login setelah aplikasi ditutup (JWT di AsyncStorage).
*   Kelola Metode Pembayaran dan Kelola Akun Admin tetap dilakukan lewat versi web.

---

## 🛠️ Tech Stack

*   **Frontend**: React (TypeScript), Vite, TailwindCSS (v4), Radix UI (Primitives), Lucide Icons, Recharts (Statistik).
*   **Mobile**: React Native 0.88 + Expo SDK 58 (TypeScript), NativeWind 4 (Tailwind v3), React Navigation 7 (Stack + Bottom Tabs), expo-image, expo-image-picker, AsyncStorage.
*   **Backend Server**: Node.js, Express.js.
*   **Database**: PostgreSQL (v18+).
*   **Otentikasi**: JWT (JSON Web Tokens) & Password Hashing via `bcryptjs`.
*   **Penyimpanan Gambar**: Local Storage pada disk server (`server/uploads/`). Upload diterima dalam format JSON base64 (web) maupun `multipart/form-data` via multer (mobile).

---

## 📁 Struktur Direktori

```
Sistem Bouquet Kustom/
├── src/                    # Frontend React SPA
│   ├── app/
│   │   ├── components/     # Komponen UI (Catalog, Checkout, Admin, dll)
│   │   ├── lib/            # Client API, State Store, & Auth Providers
│   │   └── pages/          # Halaman Aplikasi
│   └── assets/             # Aset gambar & ilustrasi
├── mobile/                 # Aplikasi mobile Expo (Android & iOS)
│   ├── src/
│   │   ├── api/            # HTTP client (JWT, timeout, multipart) & service endpoint
│   │   ├── context/        # AuthContext & StoreContext
│   │   ├── components/     # Komponen UI native (Button, Card, ProductCard, dll)
│   │   ├── navigation/     # Navigator Customer & Admin
│   │   └── screens/        # Layar auth, customer, dan admin
│   ├── LAPORAN_CPMK.md     # Arsitektur & analisis CPMK110–CPMK113
│   └── PANDUAN_TEST_RUN_DAN_PUSH.md  # Panduan uji coba & push
├── server/                 # Backend Express.js Server
│   ├── uploads/            # Folder penyimpanan bukti transfer & foto referensi
│   ├── db.js               # Koneksi & Init Database PostgreSQL
│   ├── auth.js             # Enkripsi & JWT Middleware
│   ├── seed.js             # Data awal produk & metode pembayaran
│   └── server.js           # Endpoint REST API utama
├── start_faedah_shop.bat   # Launcher 1-Click untuk Windows
├── faeda_shop.sql          # Backup/Dump Database PostgreSQL
├── CONTEXT_DIAGRAM.md      # Aliran Data Sistem (DFD)
└── ERD.md                  # Skema Database Relasional
```

---

## ⚡ Cara Menjalankan Aplikasi

### Persyaratan Awal:
1.  Pastikan **Node.js** (versi 18+) sudah terinstal.
2.  Pastikan **PostgreSQL** sudah terinstal dan sedang berjalan di port `5432`.
3.  Buat database kosong bernama `faedah_shop` di PostgreSQL Anda.

### Cara 1: Menggunakan Launcher 1-Klik (Windows) — *Sangat Mudah*
Cukup masuk ke folder proyek ini melalui Windows File Explorer, lalu **klik dua kali (double click)** pada file:
👉 **`start_faedah_shop.bat`**

Script akan mendeteksi Node.js, secara otomatis menjalankan server backend Express (port `3001`), dan menjalankan frontend dev server (port `5173`) dalam satu waktu.

---

### Cara 2: Menjalankan Secara Manual (Lewat Terminal / CMD)

#### 1. Konfigurasi Database & Environment
Salin file `server/.env.example` menjadi `server/.env`, lalu sesuaikan kredensial PostgreSQL Anda. File `.env` tidak ikut di-commit (sudah ada di `.gitignore`):
```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/faedah_shop
JWT_SECRET=ganti-dengan-string-acak-panjang
PORT=3001
UPLOAD_DIR=./uploads
```

#### 2. Jalankan Backend Server
Buka terminal baru, masuk ke direktori server, pasang dependensi, dan jalankan server:
```bash
cd server
npm install
npm run dev
```
*(Server backend otomatis menginisialisasi tabel database dan melakukan seed data awal jika database masih kosong).*

#### 3. Jalankan Frontend
Buka terminal baru lainnya, masuk ke direktori utama proyek, pasang dependensi, dan jalankan Vite:
```bash
npm install
npm run dev
```

Buka **[http://localhost:5173](http://localhost:5173)** pada browser Anda untuk mengakses aplikasi.

---

### Cara 3: Menjalankan Aplikasi Mobile (Expo)

Jalankan backend server terlebih dahulu (langkah 1–2 di atas). HP dan laptop harus terhubung ke Wi-Fi yang sama. Pasang **Expo Go** di HP dari Play Store / App Store.

```bash
cd mobile
npm install
cp .env.example .env    # Windows: Copy-Item .env.example .env
```

Isi alamat API di `mobile/.env` dengan IP laptop Anda (cek dengan `ipconfig` / `hostname -I`):
```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3001/api
```

Lalu jalankan:
```bash
npx expo start -c
```
Scan QR code dengan Expo Go (Android) atau aplikasi Kamera (iPhone). Tekan `a` untuk emulator Android atau `i` untuk simulator iOS.

Panduan lengkap (checklist uji, troubleshooting, firewall, dan cara push) ada di **[`mobile/PANDUAN_TEST_RUN_DAN_PUSH.md`](mobile/PANDUAN_TEST_RUN_DAN_PUSH.md)**. Penjelasan arsitektur aplikasi mobile ada di **[`mobile/LAPORAN_CPMK.md`](mobile/LAPORAN_CPMK.md)**.

---

## 🔑 Akun Uji Coba (Default)

Saat pertama kali server dijalankan, database akan otomatis diisi dengan data default.
*   **Registrasi Akun Baru**: Anda bisa mendaftar akun baru langsung di halaman depan toko (akses pelanggan).
*   **Akses Owner/Admin**:
    *   Jika belum ada akun owner, aplikasi akan mendeteksi dan mengarahkan Anda ke halaman pembuatan akun owner pertama saat mengakses `/admin`.
    *   Owner yang terdaftar dapat membuat akun admin baru melalui menu **Kelola Admin** di panel dashboard.
*   **Aplikasi mobile** memakai akun yang sama. Setelah login, akun admin/owner otomatis diarahkan ke tampilan admin. Owner pertama dibuat lewat halaman `/admin` di web atau lewat endpoint `POST /api/bootstrap/owner` (lihat panduan mobile).

---

## 💾 Import & Export Database

Jika Anda ingin memulihkan atau memindahkan database, file cadangan database terkompresi SQL telah disediakan di root proyek dengan nama **`faeda_shop.sql`**.

**Cara Import Manual (via Command Line):**
```bash
psql -U postgres -d faedah_shop -f faeda_shop.sql
```
*(Sesuaikan `-U postgres` dengan nama pengguna database Anda).*
