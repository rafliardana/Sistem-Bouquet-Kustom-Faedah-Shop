# 💐 Sistem Bouquet Kustom — Faedah Shop 💐

Sistem e-commerce dan kustomisasi bouquet bunga berbasis web yang modern, interaktif, dan responsif. Aplikasi ini dirancang khusus untuk mempermudah pelanggan dalam memilih, mengkustomisasi ukuran & tambahan (addons) bouquet, serta mempermudah pemilik toko (**Faedah Shop**) dalam manajemen stok, pesanan, dan laporan penjualan secara lokal.

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

---

## 🛠️ Tech Stack

*   **Frontend**: React (TypeScript), Vite, TailwindCSS (v4), Radix UI (Primitives), Lucide Icons, Recharts (Statistik).
*   **Backend Server**: Node.js, Express.js.
*   **Database**: PostgreSQL (v18+).
*   **Otentikasi**: JWT (JSON Web Tokens) & Password Hashing via `bcryptjs`.
*   **Penyimpanan Gambar**: Local Storage pada disk server (`server/uploads/`).

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
Salin file `.env.example` di dalam folder `server` menjadi `.env` (atau edit file `.env` yang sudah ada) dan sesuaikan kredensial PostgreSQL Anda:
```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@localhost:5432/faedah_shop
JWT_SECRET=rahasia-jwt-anda-di-sini
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

## 🔑 Akun Uji Coba (Default)

Saat pertama kali server dijalankan, database akan otomatis diisi dengan data default.
*   **Registrasi Akun Baru**: Anda bisa mendaftar akun baru langsung di halaman depan toko (akses pelanggan).
*   **Akses Owner/Admin**:
    *   Jika belum ada akun owner, aplikasi akan mendeteksi dan mengarahkan Anda ke halaman pembuatan akun owner pertama saat mengakses `/admin`.
    *   Owner yang terdaftar dapat membuat akun admin baru melalui menu **Kelola Admin** di panel dashboard.

---

## 💾 Import & Export Database

Jika Anda ingin memulihkan atau memindahkan database, file cadangan database terkompresi SQL telah disediakan di root proyek dengan nama **`faeda_shop.sql`**.

**Cara Import Manual (via Command Line):**
```bash
psql -U postgres -d faedah_shop -f faeda_shop.sql
```
*(Sesuaikan `-U postgres` dengan nama pengguna database Anda).*
