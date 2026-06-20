# ERD & Entity Relation — Faedah Shop

## Ringkasan Arsitektur

Aplikasi menggunakan **PostgreSQL** lokal sebagai backend database relasional dan **Express.js** untuk server API & otentikasi JWT:
- **`users`** → Tabel relasional untuk data otentikasi (JWT + bcrypt lokal) dan role user.
- **`products`** → Tabel relasional dengan kolom JSONB untuk data sub-elemen (`sizes` dan `addons`).
- **`orders`** → Tabel relasional dengan kolom JSONB untuk snapshot data produk dan kustomisasi pada saat transaksi dibuat.
- **`payment_methods`** → Tabel relasional untuk menyimpan konfigurasi pembayaran.
- **`uploads/`** → Folder penyimpanan lokal pada disk server Express.js untuk file gambar.

---

## Entity Relation Diagram (ERD)

```
┌──────────────────────────────────────────┐
│                  users                   │
├──────────────────────────────────────────┤
│ PK  id            : UUID                 │
│     email         : VARCHAR(255) (UQ)    │
│     password_hash : VARCHAR(255)         │
│     name          : VARCHAR(255)         │
│     role          : VARCHAR(20)          │  ← "owner", "admin", "customer"
│     created_at    : TIMESTAMPTZ          │
└───────────────────┬──────────────────────┘
                    │ 1
                    │
                    │ has many
                    │
                    ▼ N
┌──────────────────────────────────────────┐
│                  orders                  │
├──────────────────────────────────────────┤
│ PK  id                   : VARCHAR(100)  │
│     order_number         : VARCHAR(20)   │  ← "FLR-XXXXXX"
│ FK  user_id              : UUID          │  → users.id
│     customer_email       : VARCHAR(255)  │
│     customer_name        : VARCHAR(255)  │
│     customer_phone       : VARCHAR(50)   │
│     customer_address     : TEXT          │
│     total_price          : INTEGER       │
│     status               : VARCHAR(30)   │  ← status pesanan
│     payment_method       : VARCHAR(50)   │
│     payment_method_label : VARCHAR(100)  │
│     payment_proof_path   : TEXT          │  ← path disk lokal (/uploads)
│     created_at           : TIMESTAMPTZ   │
│                                          │
│     [JSONB] product      : JSONB         │  ← snapshot data Product
│     [JSONB] customization: JSONB         │  ← snapshot data Customization
└───────────────────┬──────────────────────┘
                    │ 1
                    │ contains (embedded JSONB)
                    │
                    ▼ 1
┌──────────────────────────────────────────┐
│              customization               │
│           (embedded in orders)           │
├──────────────────────────────────────────┤
│     sizeId              : string         │  ← "S", "M", "L", "XL"
│     description         : string         │
│     selectedAddonIds    : string[]       │
│     referenceImagePath  : string?        │  ← path disk lokal (/uploads)
└──────────────────────────────────────────┘


┌──────────────────────────────────────────┐
│                 products                 │
├──────────────────────────────────────────┤
│ PK  id          : VARCHAR(50)            │
│     name        : VARCHAR(255)           │
│     description : TEXT                   │
│     base_price  : INTEGER                │
│     image       : TEXT (URL/Path)        │
│     category    : VARCHAR(100)           │
│     sizes       : JSONB                  │  ← SizeOption[] (embedded array)
│     addons      : JSONB                  │  ← Addon[] (embedded array)
│     created_at  : TIMESTAMPTZ            │
└───────────────────┬──────────────────────┘
                    │ 1
                    │ contains (embedded arrays in JSONB)
                    ├───────────────────────────────────────────┐
                    ▼ N                                         ▼ N
┌──────────────────────────────────────┐    ┌───────────────────────────────────┐
│              SizeOption              │    │               Addon               │
│         (embedded in products)       │    │       (embedded in products)      │
├──────────────────────────────────────┤    ├───────────────────────────────────┤
│     id              : string (S/M/L) │    │     id     : string (vase/ribbon) │
│     label           : string         │    │     label  : string               │
│     stems           : string         │    │     price  : number (IDR)         │
│     priceMultiplier : number         │    └───────────────────────────────────┘
└──────────────────────────────────────┘


┌──────────────────────────────────────────┐
│             payment_methods              │
├──────────────────────────────────────────┤
│ PK  id          : VARCHAR(50)            │
│     label       : VARCHAR(100)           │  ← "Transfer BCA", "GoPay", dll.
│     detail      : TEXT                   │  ← nomor rekening / nomor HP
│     needs_proof : BOOLEAN                │  ← wajib upload bukti bayar?
└──────────────────────────────────────────┘
```

---

## Tabel Entity & Atribut Lengkap (PostgreSQL)

### 1. Tabel: `users`

| Kolom | Tipe Data | Atribut | Keterangan |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | ID unik pengguna |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Alamat email untuk login |
| `password_hash` | VARCHAR(255) | NOT NULL | Password yang di-hash dengan bcrypt |
| `name` | VARCHAR(255) | NOT NULL | Nama lengkap pengguna |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'customer' | Peran pengguna (`owner`, `admin`, `customer`) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu registrasi akun |

---

### 2. Tabel: `products`

| Kolom | Tipe Data | Atribut | Keterangan |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | ID unik produk (misal: `p1`, `p2`) |
| `name` | VARCHAR(255) | NOT NULL | Nama bouquet bunga |
| `description` | TEXT | | Deskripsi produk bouquet |
| `base_price` | INTEGER | NOT NULL, DEFAULT 0 | Harga dasar bouquet |
| `image` | TEXT | | URL atau nama path gambar utama produk |
| `category` | VARCHAR(100) | DEFAULT 'Campur' | Kategori bouquet (Mawar / Tulip / dll.) |
| `sizes` | JSONB | DEFAULT '[]' | Menyimpan array struktur objek `SizeOption` |
| `addons` | JSONB | DEFAULT '[]' | Menyimpan array struktur objek `Addon` |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Waktu produk ditambahkan |

#### Struktur data `SizeOption` di dalam JSONB:
```json
{
  "id": "S",
  "label": "Kecil",
  "stems": "5–7 tangkai",
  "priceMultiplier": 1.0
}
```

#### Struktur data `Addon` di dalam JSONB:
```json
{
  "id": "vase",
  "label": "Vas Bunga",
  "price": 75000
}
```

---

### 3. Tabel: `orders`

| Kolom | Tipe Data | Atribut | Keterangan |
|---|---|---|---|
| `id` | VARCHAR(100) | PRIMARY KEY | ID unik pesanan (generated timestamp-random) |
| `order_number` | VARCHAR(20) | NOT NULL | Nomor pesanan berformat `FLR-XXXXXX` |
| `user_id` | UUID | FOREIGN KEY REFERENCES `users(id)` | ID pembeli (pelanggan terdaftar) |
| `customer_email` | VARCHAR(255) | | Email pembeli |
| `customer_name` | VARCHAR(255) | | Nama penerima / pembeli |
| `customer_phone` | VARCHAR(50) | | Nomor telepon pembeli |
| `customer_address` | TEXT | | Alamat lengkap pengiriman |
| `product` | JSONB | NOT NULL | Snapshot data `Product` lengkap saat dipesan |
| `customization` | JSONB | NOT NULL | Snapshot data `Customization` saat dipesan |
| `total_price` | INTEGER | NOT NULL | Nilai transaksi akhir dalam rupiah |
| `status` | VARCHAR(30) | DEFAULT 'menunggu_konfirmasi' | `menunggu_konfirmasi`, `dalam_proses`, `pesanan_siap`, `selesai` |
| `payment_method` | VARCHAR(50) | | ID metode pembayaran yang dipilih |
| `payment_method_label` | VARCHAR(100) | | Nama/Label metode pembayaran |
| `payment_proof_path` | TEXT | | Nama file bukti transfer yang disimpan di server |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Tanggal & waktu transaksi |

---

### 4. Tabel: `payment_methods`

| Kolom | Tipe Data | Atribut | Keterangan |
|---|---|---|---|
| `id` | VARCHAR(50) | PRIMARY KEY | ID unik metode pembayaran (misal: `gopay`, `transfer_bca`) |
| `label` | VARCHAR(100) | NOT NULL | Label pembayaran yang tampil (misal: "Transfer BCA") |
| `detail` | TEXT | | Instruksi transfer (nomor rekening, nama pemilik rekening) |
| `needs_proof` | BOOLEAN | DEFAULT FALSE | Apakah perlu mengunggah bukti bayar atau tidak |

---

## Relasi Antar Entity

```
users ─────────── 1 : N ───────── orders
orders ────────── 1 : 1 ───────── customization (embedded JSONB)
orders ────────── N : 1 ───────── payment_methods
orders ────────── N : 1 ───────── products        (snapshot embedded JSONB)
products ──────── 1 : N ───────── SizeOption      (embedded JSONB)
products ──────── 1 : N ───────── Addon           (embedded JSONB)
```

---

## Alur Status Pesanan

```
[Buat Pesanan]
      │
      ▼
menunggu_konfirmasi   ←── Admin menerima pesanan & memverifikasi pembayaran
      │
      ▼
  dalam_proses         ←── Florist sedang merangkai bouquet pesanan
      │
      ▼
  pesanan_siap         ←── Bouquet selesai dirangkai & siap dikirim / diambil
      │
      ▼
    selesai            ←── Pesanan telah diterima dengan baik oleh pelanggan
```

---

## Penyimpanan File (File Storage)

Penyimpanan file bukti pembayaran (`payment_proof_path`) dan foto referensi bouquet kustom dari pelanggan (`referenceImagePath`) disimpan di **Disk Lokal Server** di bawah folder:
* **`server/uploads/`**

Nama file yang disimpan akan di-generate menggunakan format UUID demi menjaga keamanan nama file agar unik dan tidak saling menimpa:
* Bukti Transfer: `proof-{userId}-{random-uuid}.{ext}`
* Gambar Referensi: `reference-{userId}-{random-uuid}.{ext}`

File-file tersebut dapat diakses oleh client / frontend menggunakan alamat url statis:
* **`http://localhost:3001/uploads/{filename}`**
