# Context Diagram — Faedah Shop

## Level 0 — System Context Diagram

Menggambarkan sistem **Faedah Shop** sebagai satu kotak tunggal dan seluruh aktor eksternal yang berinteraksi dengannya.

```
                         ┌─────────────────────────────────────────────────────────────────┐
                         │                                                                 │
  ┌──────────────┐        │                      FAEDAH SHOP SYSTEM                        │        ┌──────────────┐
  │              │        │                                                                 │        │              │
  │  PELANGGAN   │◄──────►│  ┌───────────────────────────────────────────────────────┐    │◄──────►│    ADMIN     │
  │  (Customer)  │        │  │              React Frontend (SPA)                     │    │        │              │
  └──────────────┘        │  │  - Katalog produk          - Checkout                 │    │        └──────────────┘
                          │  │  - Kustomisasi bouquet     - Tracking pesanan         │    │
  Aksi:                   │  │  - Login / Register        - Panel admin/owner        │    │        Aksi:
  ─ Lihat katalog         │  └────────────────────┬──────────────────────────────────┘    │        ─ Login panel
  ─ Kustomisasi produk    │                        │                                       │        ─ Kelola pesanan
  ─ Pesan bouquet         │           ┌────────────▼──────────────┐                       │        ─ Update status
  ─ Upload foto referensi │           │   Supabase Edge Function  │                       │        ─ Kelola produk
  ─ Pilih metode bayar    │           │     (server/index.tsx)    │                       │        ─ Kelola metode bayar
  ─ Upload bukti transfer │           │   REST API + Auth Guard   │                       │
  ─ Cek status pesanan    │           └────────────┬──────────────┘                       │
                          │                        │                                       │
                          │          ┌─────────────┼──────────────┐                       │
                          │          │             │              │                        │
                          │   ┌──────▼──────┐ ┌───▼────────┐ ┌──▼────────────┐           │
                          │   │  Supabase   │ │  Supabase  │ │   Supabase    │           │
                          │   │    Auth     │ │  KV Store  │ │   Storage     │           │
                          │   │  (auth.     │ │ (kv_store_ │ │  (make-       │           │
                          │   │   users)    │ │  205999f8) │ │  205999f8-    │           │
                          │   └─────────────┘ └────────────┘ │  uploads)     │           │
                          │                                   └───────────────┘           │
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
| **Supabase**  | Platform backend (Auth, Database, Storage, Edge Functions) | Menyimpan data, autentikasi, menjalankan server-side logic, hosting file  |

---

## Level 1 — Data Flow Diagram

Menggambarkan aliran data utama antara aktor dan proses dalam sistem.

```
PELANGGAN                    SISTEM FAEDAH SHOP                         SUPABASE
    │                                                                        │
    │──── [1] Register / Login ─────────────────────────────────────────────►│ auth.users
    │◄─── session token ────────────────────────────────────────────────────│
    │                                                                        │
    │──── [2] Minta daftar produk ──────────►┌──────────────────┐           │
    │                                        │  Proses: Tampil  │──────────►│ kv_store (product:*)
    │◄─── daftar produk + foto ─────────────│  Katalog Produk  │◄──────────│
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [3] Pilih produk + kustomisasi ───►┌──────────────────┐           │
    │    (ukuran, addon, deskripsi,          │  Proses: Hitung  │           │
    │     foto referensi)                    │  Harga & Preview │           │
    │◄─── ringkasan pesanan + total harga ──│                  │           │
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [4] Upload foto referensi ────────────────────────────────────────►│ Storage (reference/)
    │◄─── signed URL preview ───────────────────────────────────────────────│
    │                                                                        │
    │──── [5] Isi form checkout ────────────►┌──────────────────┐           │
    │    (nama, HP, alamat, metode bayar)    │  Proses: Buat    │──────────►│ kv_store (order:*)
    │◄─── nomor pesanan (FLR-XXXXXX) ───────│  Pesanan Baru    │◄──────────│
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [6] Upload bukti transfer ────────────────────────────────────────►│ Storage (proof/)
    │◄─── konfirmasi upload ────────────────────────────────────────────────│
    │                                                                        │
    │──── [7] Cek status pesanan ───────────►┌──────────────────┐           │
    │    (cari by nomor pesanan / login)     │  Proses: Tracking│──────────►│ kv_store (order:*)
    │◄─── status + detail pesanan ──────────│  Pesanan         │◄──────────│
    │                                        └──────────────────┘           │


ADMIN / OWNER                SISTEM FAEDAH SHOP                         SUPABASE
    │                                                                        │
    │──── [8] Login panel admin ────────────►┌──────────────────┐           │
    │    (/admin/login)                      │  Proses: Auth    │──────────►│ auth.users
    │◄─── session + role check ─────────────│  & Role Guard    │◄──────────│
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [9] Lihat semua pesanan ──────────►┌──────────────────┐           │
    │                                        │  Proses: Daftar  │──────────►│ kv_store (order:*)
    │◄─── list pesanan + detail ────────────│  & Filter Pesanan│◄──────────│
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [10] Update status pesanan ───────►┌──────────────────┐           │
    │    (konfirmasi → proses → siap →       │  Proses: Update  │──────────►│ kv_store (order:*)
    │     selesai)                           │  Status          │◄──────────│
    │◄─── status berhasil diperbarui ───────│                  │           │
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [11] Kelola produk ───────────────►┌──────────────────┐           │
    │    (tambah/edit/hapus produk,          │  Proses: CRUD    │──────────►│ kv_store (product:*)
    │     ubah ukuran & addon)              │  Produk          │◄──────────│
    │◄─── konfirmasi perubahan ─────────────│                  │           │
    │                                        └──────────────────┘           │
    │                                                                        │
    │──── [12] Kelola metode pembayaran ────►┌──────────────────┐           │
    │    (tambah/edit/hapus)                 │  Proses: CRUD    │──────────►│ kv_store (settings:*)
    │◄─── daftar metode terbaru ────────────│  Pembayaran      │◄──────────│
    │                                        └──────────────────┘           │
    │                                                                        │
    │  [OWNER ONLY]                                                          │
    │──── [13] Lihat dashboard statistik ───►┌──────────────────┐           │
    │                                        │  Proses: Agregat │──────────►│ kv_store (order:*)
    │◄─── grafik revenue, top produk, ──────│  & Hitung Stats  │◄──────────│
    │      jumlah pesanan per status         └──────────────────┘           │
    │                                                                        │
    │──── [14] Kelola akun admin ───────────►┌──────────────────┐           │
    │    (tambah/nonaktifkan admin)          │  Proses: Kelola  │──────────►│ auth.users
    │◄─── list akun admin/owner ────────────│  Akun            │◄──────────│ kv_store (user:*)
    │                                        └──────────────────┘           │
```

---

## Aliran Data Utama

### Pelanggan → Sistem

| No  | Aliran Data            | Dari         | Ke                  | Isi                                              |
|-----|------------------------|--------------|---------------------|--------------------------------------------------|
| D1  | Kredensial login       | Pelanggan    | Auth                | email, password                                  |
| D2  | Request katalog        | Pelanggan    | KV Store            | —                                                |
| D3  | Pilihan kustomisasi    | Pelanggan    | Frontend (state)    | productId, sizeId, addonIds, deskripsi           |
| D4  | Foto referensi         | Pelanggan    | Storage             | file gambar (jpg/png/webp, maks 5MB)             |
| D5  | Data checkout          | Pelanggan    | KV Store            | nama, HP, alamat, paymentMethod                  |
| D6  | Bukti pembayaran       | Pelanggan    | Storage             | file gambar bukti transfer                       |
| D7  | Nomor/ID pesanan       | Pelanggan    | KV Store            | orderNumber atau userId                          |

### Sistem → Pelanggan

| No  | Aliran Data            | Dari         | Ke                  | Isi                                              |
|-----|------------------------|--------------|---------------------|--------------------------------------------------|
| D8  | Session token          | Auth         | Pelanggan           | JWT session                                      |
| D9  | Daftar produk          | KV Store     | Pelanggan           | array Product (nama, foto, harga, ukuran, addon) |
| D10 | Total harga            | Frontend     | Pelanggan           | basePrice × multiplier + Σ addon.price           |
| D11 | Nomor pesanan          | KV Store     | Pelanggan           | `FLR-XXXXXX`                                     |
| D12 | Status pesanan         | KV Store     | Pelanggan           | status + timestamp + detail                      |
| D13 | Preview foto           | Storage      | Pelanggan           | signed URL (temporary)                           |

### Admin/Owner → Sistem

| No  | Aliran Data            | Dari         | Ke                  | Isi                                              |
|-----|------------------------|--------------|---------------------|--------------------------------------------------|
| D14 | Kredensial admin       | Admin/Owner  | Auth                | email, password (role: admin/owner)              |
| D15 | Update status pesanan  | Admin        | KV Store            | orderId, status baru                             |
| D16 | Data produk baru/edit  | Admin        | KV Store            | Product object lengkap                           |
| D17 | Konfigurasi pembayaran | Admin        | KV Store            | PaymentMethod array                              |
| D18 | Data akun admin baru   | Owner        | Auth + KV Store     | email, password, name, role                      |

---

## Batas Sistem (System Boundary)

```
╔═══════════════════════════════════════════════════════════════════════╗
║                        FAEDAH SHOP SYSTEM                            ║
║                                                                       ║
║  ┌─────────────────────┐    ┌──────────────────────────────────────┐ ║
║  │   React Frontend    │    │      Supabase Backend                │ ║
║  │   (Client-side)     │    │      (Server-side)                   │ ║
║  │                     │    │                                      │ ║
║  │  - Routing          │◄──►│  - Edge Function (REST API)          │ ║
║  │  - State management │    │  - Auth (JWT, RLS)                   │ ║
║  │  - UI components    │    │  - KV Store (PostgreSQL)             │ ║
║  │  - Form validation  │    │  - Storage (S3-compatible)           │ ║
║  │  - Price calculator │    │  - Role-based access control         │ ║
║  └─────────────────────┘    └──────────────────────────────────────┘ ║
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
