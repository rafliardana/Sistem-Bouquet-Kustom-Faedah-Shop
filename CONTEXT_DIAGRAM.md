# Context Diagram — Faedah Shop

## Level 0 — System Context Diagram

Menggambarkan sistem **Faedah Shop** sebagai satu kotak tunggal dan seluruh aktor eksternal yang berinteraksi dengannya setelah migrasi ke PostgreSQL lokal dan Express.js.

```
                         ┌─────────────────────────────────────────────────────────────────┐
                         │                                                                 │
  ┌──────────────┐       │                      FAEDAH SHOP SYSTEM                        │        ┌──────────────┐
  │              │       │                                                                 │        │              │
  │  PELANGGAN   │◄─────►│  ┌───────────────────────────────────────────────────────┐    │◄──────►│    ADMIN     │
  │  (Customer)  │       │  │              React Frontend (SPA)                     │    │        │              │
  │  └──────────────┘       │  │  - Katalog produk          - Checkout                 │    │        └──────────────┘
                          │  │  - Kustomisasi bouquet     - Tracking pesanan         │    │
  Aksi:                  │  │  - Login / Register        - Panel admin/owner        │    │        Aksi:
  ─ Lihat katalog        │  └────────────────────┬──────────────────────────────────┘    │        ─ Login panel
  ─ Kustomisasi produk   │                        │                                       │        ─ Kelola pesanan
  ─ Pesan bouquet        │           ┌────────────▼──────────────┐                       │        ─ Update status
  ─ Upload foto referensi│           │     Express.js Server     │                       │        ─ Kelola produk
  ─ Pilih metode bayar   │           │    (server/server.js)     │                       │        ─ Kelola metode bayar
  ─ Upload bukti transfer│           │   REST API + JWT Middleware   │                       │
  ─ Cek status pesanan   │           └────────────┬──────────────┘                       │
                         │                        │                                       │
                         │          ┌─────────────┴─────────────┐                         │
                         │          │                           │                         │
                         │   ┌──────▼──────┐             ┌──────▼──────┐                  │
                         │   │ PostgreSQL  │             │ Disk Lokal  │                  │
                         │   │  Database   │             │  Uploads    │                  │
                         │   │ (localhost) │             │ (/uploads)  │                  │
                         │   └─────────────┘             └─────────────┘                  │
                         │                                                                 │
                         └─────────────────────────────────────────────────────────────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │     OWNER       │
                                              │                 │
                                              └─────────────────┘
                                              Aksi:
                                              ─ Semua akses admin
                                              ─ Dashboard statistik
                                              ─ Kelola akun admin
                                              ─ Lihat laporan penjualan
```

---

## Aktor Eksternal (External Entities)

| Aktor        | Deskripsi                                                   | Interaksi dengan Sistem                                                   |
|--------------|-------------------------------------------------------------|---------------------------------------------------------------------------|
| **Pelanggan** | Pengguna umum yang membeli bouquet                         | Lihat katalog, kustomisasi, pesan, bayar, tracking                       |
| **Admin**     | Staff toko yang mengelola operasional                      | Login, kelola pesanan, kelola produk, kelola metode pembayaran            |
| **Owner**     | Pemilik toko dengan akses penuh                            | Semua akses admin + statistik penjualan + kelola akun admin               |
| **Database & File** | Penyimpanan lokal (PostgreSQL + Disk) | Menyimpan data terstruktur di database relasional, menyimpan file gambar di folder lokal |

---

## Level 1 — Data Flow Diagram

Menggambarkan aliran data utama antara aktor dan proses dalam sistem.

```
PELANGGAN                    SISTEM FAEDAH SHOP                     BACKEND / DATABASE (LOCAL)
    │                                                                        │
    │──── [1] Register / Login ─────────────────────────────────────────────►│ users table (PostgreSQL)
    │◄─── JWT token ────────────────────────────────────────────────────────│
    │                                                                        │
    │──── [2] Minta daftar produk ──────────►┌──────────────────┐           │
    │                                        │  Proses: Tampil  │──────────►│ products table
    │◄─── daftar produk + foto ─────────────│  Katalog Produk  │◄──────────│
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [3] Pilih produk + kustomisasi ───►┌──────────────────┐           │
    │    (ukuran, addon, deskripsi,          │  Proses: Hitung  │           │
    │     foto referensi)                    │  Harga & Preview │           │
    │◄─── ringkasan pesanan + total harga ──│                  │           │
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [4] Upload foto referensi ────────────────────────────────────────►│ Disk Lokal (uploads/)
    │◄─── URL file lokal ───────────────────────────────────────────────────│
    │                                                                        │
    │──── [5] Isi form checkout ────────────►┌──────────────────┐           │
    │    (nama, HP, alamat, metode bayar)    │  Proses: Buat    │──────────►│ orders table (PostgreSQL)
    │◄─── nomor pesanan (FLR-XXXXXX) ───────│  Pesanan Baru    │◄──────────│
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [6] Upload bukti transfer ────────────────────────────────────────►│ Disk Lokal (uploads/)
    │◄─── konfirmasi upload ────────────────────────────────────────────────│
    │                                                                        │
    │──── [7] Cek status pesanan ───────────►┌──────────────────┐           │
    │    (cari by nomor pesanan / login)     │  Proses: Tracking│──────────►│ orders table (PostgreSQL)
    │◄─── status + detail pesanan ──────────│  Pesanan         │◄──────────│
    │                                        └──────────────────┘           │


ADMIN / OWNER                SISTEM FAEDAH SHOP                     BACKEND / DATABASE (LOCAL)
    │                                                                        │
    │──── [8] Login panel admin ────────────►┌──────────────────┐           │
    │    (/admin/login)                      │  Proses: Auth    │──────────►│ users table (PostgreSQL)
    │◄─── JWT + role check ─────────────────│  & Role Guard    │◄──────────│
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [9] Lihat semua pesanan ──────────►┌──────────────────┐           │
    │                                        │  Proses: Daftar  │──────────►│ orders table (PostgreSQL)
    │◄─── list pesanan + detail ────────────│  & Filter Pesanan│◄──────────│
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [10] Update status pesanan ───────►┌──────────────────┐           │
    │    (konfirmasi → proses → siap →       │  Proses: Update  │──────────►│ orders table (PostgreSQL)
    │     selesai)                           │  Status          │◄──────────│
    │◄─── status berhasil diperbarui ───────│                  │           │
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [11] Kelola produk ───────────────►┌──────────────────┐           │
    │    (tambah/edit/hapus produk,          │  Proses: CRUD    │──────────►│ products table (PostgreSQL)
    │     ubah ukuran & addon)              │  Produk          │◄──────────│
    │◄─── konfirmasi perubahan ─────────────│                  │           │
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [12] Kelola metode pembayaran ────►┌──────────────────┐           │
    │    (tambah/edit/hapus)                 │  Proses: CRUD    │──────────►│ payment_methods table (PG)
    │◄─── daftar metode terbaru ────────────│  Pembayaran      │◄──────────│
    │                                        └──────────────────┘           │
    │                                                                        │
    │  [OWNER ONLY]                                                          │
    │──── [13] Lihat dashboard statistik ───►┌──────────────────┐           │
    │                                        │  Proses: Agregat │──────────►│ orders table (PostgreSQL)
    │◄─── grafik revenue, top produk, ──────│  & Hitung Stats  │◄──────────│
    │      jumlah pesanan per status         └──────────────────┘           │
    │                                                                        │
    │──── [14] Kelola akun admin ───────────►┌──────────────────┐           │
    │    (tambah/nonaktifkan admin)          │  Proses: Kelola  │──────────►│ users table (PostgreSQL)
    │◄─── list akun admin/owner ────────────│  Akun            │◄──────────│
    │                                        └──────────────────┘           │
```

---

## Aliran Data Utama

### Pelanggan → Sistem

| No  | Aliran Data            | Dari         | Ke                  | Isi                                              |
|-----|------------------------|--------------|---------------------|--------------------------------------------------|
| D1  | Kredensial login       | Pelanggan    | Auth (Express API)  | email, password                                  |
| D2  | Request katalog        | Pelanggan    | Database            | —                                                |
| D3  | Pilihan kustomisasi    | Pelanggan    | Frontend (state)    | productId, sizeId, addonIds, deskripsi           |
| D4  | Foto referensi         | Pelanggan    | Disk Lokal          | file gambar (base64 via Express API)             |
| D5  | Data checkout          | Pelanggan    | Database            | nama, HP, alamat, paymentMethod                  |
| D6  | Bukti pembayaran       | Pelanggan    | Disk Lokal          | file gambar bukti transfer                       |
| D7  | Nomor/ID pesanan       | Pelanggan    | Database            | orderNumber atau userId                          |

### Sistem → Pelanggan

| No  | Aliran Data            | Dari         | Ke                  | Isi                                              |
|-----|------------------------|--------------|---------------------|--------------------------------------------------|
| D8  | JWT Token              | Auth         | Pelanggan           | JWT session token di localStorage                |
| D9  | Daftar produk          | Database     | Pelanggan           | array Product (nama, foto, harga, ukuran, addon) |
| D10 | Total harga            | Frontend     | Pelanggan           | basePrice × multiplier + Σ addon.price           |
| D11 | Nomor pesanan          | Database     | Pelanggan           | `FLR-XXXXXX`                                     |
| D12 | Status pesanan         | Database     | Pelanggan           | status + timestamp + detail                      |
| D13 | Preview foto           | Disk Lokal   | Pelanggan           | URL statis localhost (`/uploads/filename.ext`)   |

### Admin/Owner → Sistem

| No  | Aliran Data            | Dari         | Ke                  | Isi                                              |
|-----|------------------------|--------------|---------------------|--------------------------------------------------|
| D14 | Kredensial admin       | Admin/Owner  | Auth (Express API)  | email, password (role: admin/owner)              |
| D15 | Update status pesanan  | Admin        | Database            | orderId, status baru                             |
| D16 | Data produk baru/edit  | Admin        | Database            | Product object lengkap                           |
| D17 | Konfigurasi pembayaran | Admin        | Database            | PaymentMethod array                              |
| D18 | Data akun admin baru   | Owner        | Database            | email, password, name, role                      |

---

## Batas Sistem (System Boundary)

```
╔═══════════════════════════════════════════════════════════════════════╗
║                        FAEDAH SHOP SYSTEM                            ║
║                                                                       ║
║  ┌─────────────────────┐    ┌──────────────────────────────────────┐ ║
║  │   React Frontend    │    │      Express.js + PostgreSQL         │ ║
║  │   (Client-side)     │    │      (Server-side Lokal)             │ ║
║  │                     │    │                                      │ ║
║  │  - Routing          │◄──►│  - Node.js REST API (server.js)      │ ║
║  │  - State management │    │  - JWT + bcrypt (Lokal Auth)         │ ║
║  │  - UI components    │    │  - PostgreSQL Database               │ ║
║  │  - Form validation  │    │  - Disk Lokal File Storage           │ ║
║  │  - Price calculator │    │  - Middleware Autentikasi            │ ║
║  │  └─────────────────────┘    └──────────────────────────────────────┘ ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝

Di luar batas sistem:
  - Browser / Device pelanggan
  - Bank / Platform pembayaran (BCA, Mandiri, GoPay, OVO) — manual
  - Jasa pengiriman / kurir — offline
  - Unsplash (CDN foto produk) — eksternal
```

---

## Ringkasan Proses Bisnis

```
Pelanggan                                           Admin/Owner
    │                                                    │
    │  1. Lihat katalog bouquet                          │
    │  2. Pilih & kustomisasi                            │
    │  3. Isi data pengiriman                            │
    │  4. Pilih & bayar                                  │  5. Terima notif pesanan baru
    │  5. Upload bukti bayar                             │  6. Verifikasi pembayaran
    │                                                    │  7. Update status → "Dalam Proses"
    │  8. Cek status pesanan              ◄──────────────┤
    │     (menunggu → proses → siap)                     │  9. Rangkai bouquet
    │                                                    │  10. Update status → "Pesanan Siap"
    │  11. Terima pesanan                 ◄──────────────┤
    │  12. Pesanan selesai                               │  11. Update status → "Selesai"
                                                         │
                                              Owner saja:
                                              12. Lihat statistik penjualan
                                              13. Kelola akun admin
```
