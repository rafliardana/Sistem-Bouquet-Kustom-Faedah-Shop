# DFD Level 0 — Diagram Konteks Sistem (Faedah Shop)

Dokumen ini mendokumentasikan DFD Level 0 (Diagram Konteks) dari sistem **Faedah Shop** setelah migrasi ke PostgreSQL lokal dan Express.js menggunakan Bahasa Indonesia secara penuh.

---

## 1. Diagram Mermaid (Grafis)

```mermaid
graph TD
    %% Nodes
    Backend["BACKEND EXPRESS & POSTGRES<br>(Autentikasi, Database, Penyimpanan, Logika Server)"]
    System["SISTEM FAEDAH SHOP<br>(React Frontend)"]
    Customer["PELANGGAN"]
    Admin["ADMIN"]
    Owner["PEMILIK (OWNER)"]

    %% Formatting Nodes
    style Backend fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    style System fill:#e3f2fd,stroke:#1565c0,stroke-width:2px;
    style Customer fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px;
    style Admin fill:#fffde7,stroke:#fbc02d,stroke-width:2px;
    style Owner fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px;

    %% Relations
    Customer -->|1. Lihat Katalog Produk<br>2. Kustomisasi Buket<br>3. Buat Pesanan<br>4. Unggah Bukti Pembayaran<br>5. Lacak Status Pesanan| System
    System -->|1. Daftar & Detail Produk<br>2. Pratinjau Harga & Kustomisasi<br>3. Konfirmasi Pesanan<br>4. Metode Pembayaran<br>5. Pembaruan Status Pesanan| Customer

    Admin -->|1. Kelola Produk<br>2. Kelola Pesanan<br>3. Kelola Metode Pembayaran<br>4. Perbarui Status Pesanan| System
    System -->|1. Daftar & Detail Pesanan<br>2. Data Produk<br>3. Data Metode Pembayaran<br>4. Konfirmasi Pembaruan Status<br>5. Laporan & Informasi| Admin

    Owner -->|1. Lihat Laporan Penjualan<br>2. Kelola Akun Admin<br>3. Pantau Statistik| System
    System -->|1. Laporan Penjualan & Statistik<br>2. Data Akun Admin<br>3. Informasi Ringkasan Sistem| Owner

    System -->|1. Permintaan API (Requests)<br>2. Respons Data<br>3. Autentikasi<br>4. Akses File| Backend
    Backend -->|1. Baca / Tulis Data<br>2. Autentikasi Pengguna<br>3. Simpan File<br>4. Eksekusi Logika Server| System
```

---

## 2. Diagram ASCII (Berbasis Teks)

```
                                     ┌──────────────────────────────────────────┐
                                     │       BACKEND EXPRESS & POSTGRES         │
                                     │ (Auth, Database, Penyimpanan, Logika)    │
                                     └───────────────────▲──────────────────────┘
                                                         │ ▲
                                       Permintaan, Data  │ │ Baca/Tulis Data,
                                       Respons, Auth,    │ │ Autentikasi Pengguna,
                                       Akses File        │ │ Simpan File,
                                                         │ │ Logika Server
                                                         ▼ │
 ┌──────────────────────┐             ┌──────────────────┴──────────────────────┐             ┌──────────────────────┐
 │                      ├────────────►│                                         │◄────────────┤                      │
 │      PELANGGAN       │             │           SISTEM FAEDAH SHOP            │             │        ADMIN         │
 │                      │◄────────────┤            (React Frontend)             ├────────────►│                      │
 └──────────────────────┘             └──────────────────┬──────────────────────┘             └──────────────────────┘
  - Lihat Katalog Produk                                 │ ▲                                   - Kelola Produk
  - Kustomisasi Buket                                    │ │ Lihat Laporan Penjualan,          - Kelola Pesanan
  - Buat Pesanan                                         │ │ Kelola Akun Admin,                - Kelola Metode Bayar
  - Unggah Bukti Bayar                 Laporan &         │ │ Pantau Statistik                  - Perbarui Status Pesanan
  - Lacak Status Pesanan               Statistik, Data   │ │                                   
                                       Admin, Ringkasan  │ │                                   - Daftar & Detail Pesanan
  - Daftar & Detail Produk             Sistem            ▼ │                                   - Data Produk
  - Pratinjau Harga & Kustom                               ┌─┴──────────────────────┐              - Data Metode Bayar
  - Konfirmasi Pesanan                                     │                        │              - Konfirmasi Status
  - Metode Pembayaran                                      │     PEMILIK (OWNER)    │              - Laporan & Info
  - Pembaruan Status Pesanan                               │                        │
                                                           └────────────────────────┘
```

---

## 3. Entitas Eksternal

| Entitas | Deskripsi | Informasi yang Dikirim ke Sistem (Input) | Informasi yang Diterima dari Sistem (Output) |
|---|---|---|---|
| **Pelanggan** | Pengguna umum yang melihat katalog dan memesan buket secara kustom. | Lihat Katalog Produk, Kustomisasi Buket, Buat Pesanan, Unggah Bukti Pembayaran, Lacak Status Pesanan | Daftar & Detail Produk, Pratinjau Harga & Kustomisasi, Konfirmasi Pesanan, Metode Pembayaran, Pembaruan Status Pesanan |
| **Admin** | Staf toko yang mengelola operasional harian pemesanan buket. | Kelola Produk, Kelola Pesanan, Kelola Metode Pembayaran, Perbarui Status Pesanan | Daftar & Detail Pesanan, Data Produk, Data Metode Pembayaran, Konfirmasi Pembaruan Status, Laporan & Informasi |
| **Pemilik (Owner)** | Pemilik toko dengan hak akses penuh terhadap laporan keuangan dan akun admin. | Lihat Laporan Penjualan, Kelola Akun Admin, Pantau Statistik | Laporan Penjualan & Statistik, Data Akun Admin, Informasi Ringkasan Sistem |
| **Backend Express & Postgres** | Komponen server lokal yang melayani logika bisnis dan penyimpanan data database. | Permintaan API (Requests), Respons Data, Autentikasi, Akses File | Baca / Tulis Data, Autentikasi Pengguna, Simpan File, Eksekusi Logika Server |

> [!NOTE]
> Pada diagram konteks di atas, **Backend Express & Postgres** digambarkan secara terpisah untuk memperjelas batas interaksi antara aplikasi klien (*React Frontend*) dengan layanan server (*Backend API*).

---

## 4. Batas Sistem (System Boundary)

```
╔═══════════════════════════════════════════════════════════════════════╗
║                        SISTEM FAEDAH SHOP                             ║
║                                                                       ║
║  ┌─────────────────────┐    ┌──────────────────────────────────────┐ ║
║  │   React Frontend    │    │      Express.js + PostgreSQL         │ ║
║  │   (Sisi Klien)      │    │      (Sisi Server Lokal)             │ ║
║  │                     │    │                                      │ ║
║  │  - Routing          │◄──►│  - Node.js REST API (server.js)      │ ║
║  │  - Manajemen State  │    │  - JWT + bcrypt (Auth Lokal)         │ ║
║  │  - Komponen UI      │    │  - Database PostgreSQL               │ ║
║  │  - Validasi Form    │    │  - Penyimpanan File Disk Lokal       │ ║
║  │  - Kalkulator Harga │    │  - Middleware Autentikasi            │ ║
║  │  └─────────────────────┘    └──────────────────────────────────────┘ ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

Di luar batas sistem:
  - Browser / Perangkat milik pelanggan.
  - Platform / Bank pembayaran (BCA, Mandiri, GoPay, OVO) — proses transfer dilakukan manual di luar sistem.
  - Jasa pengiriman / kurir — dilakukan secara offline.
  - Unsplash (CDN foto produk) — layanan eksternal untuk gambar.
```
