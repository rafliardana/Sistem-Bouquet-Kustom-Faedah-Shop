# ERD & Entity Relation — Faedah Shop

## Ringkasan Arsitektur

Aplikasi menggunakan **Supabase** sebagai backend:
- **Auth** → tabel bawaan Supabase untuk autentikasi user
- **KV Store** → tabel `kv_store_205999f8` sebagai penyimpanan dokumen (key-value)
- **Storage** → bucket `make-205999f8-uploads` untuk file gambar

---

## Entity Relation Diagram (ERD)

```
┌─────────────────────────────────────┐
│             UserProfile             │
├─────────────────────────────────────┤
│ PK  id          : string (UUID)     │
│     email       : string            │
│     name        : string            │
│     role        : "owner"           │
│                   "admin"           │
│                   "customer"        │
│     createdAt   : timestamp         │
└──────────────┬──────────────────────┘
               │ 1
               │
               │ has many
               │
               ▼ N
┌─────────────────────────────────────┐
│                Order                │
├─────────────────────────────────────┤
│ PK  id              : string (UUID) │
│     orderNumber     : string        │  ← "FLR-XXXXXX"
│ FK  userId          : string        │  → UserProfile.id
│     customerName    : string        │
│     customerEmail   : string        │
│     customerPhone   : string        │
│     customerAddress : string        │
│     totalPrice      : number (IDR)  │
│     status          : OrderStatus   │
│ FK  paymentMethod   : string        │  → PaymentMethod.id
│     paymentMethodLabel : string     │
│     paymentProofPath   : string?    │  → Storage (proof/)
│     createdAt       : timestamp     │
│                                     │
│  [embedded] product  : Product      │  ← snapshot saat pesan
│  [embedded] customization           │  ← snapshot saat pesan
└──────────────┬──────────────────────┘
               │ 1
               │ contains (embedded)
               │
               ▼ 1
┌─────────────────────────────────────┐
│            Customization            │
│          (embedded in Order)        │
├─────────────────────────────────────┤
│ FK  sizeId              : string    │  → SizeOption.id
│     description         : string    │
│     selectedAddonIds    : string[]  │  → Addon.id[]
│     referenceImagePath  : string?   │  → Storage (reference/)
│     referenceImagePreview : string? │  ← signed URL (temp)
└─────────────────────────────────────┘


┌─────────────────────────────────────┐
│              Product                │
├─────────────────────────────────────┤
│ PK  id          : string            │
│     name        : string            │
│     description : string            │
│     basePrice   : number (IDR)      │
│     image       : string (URL)      │
│     category    : string            │
│     sizes       : SizeOption[]      │  ← embedded array
│     addons      : Addon[]           │  ← embedded array
└──────────────┬──────────────────────┘
               │ 1
               │ has many (embedded)
               ├────────────────────────────────────────────┐
               ▼ N                                          ▼ N
┌──────────────────────────────┐    ┌───────────────────────────────────┐
│          SizeOption          │    │               Addon               │
│      (embedded in Product)   │    │         (embedded in Product)     │
├──────────────────────────────┤    ├───────────────────────────────────┤
│ PK  id              : string │    │ PK  id     : string               │
│     label           : string │    │     label  : string               │
│     stems           : string │    │     price  : number (IDR)         │
│     priceMultiplier : number │    └───────────────────────────────────┘
└──────────────────────────────┘


┌─────────────────────────────────────┐
│           PaymentMethod             │
├─────────────────────────────────────┤
│ PK  id          : string            │
│     label       : string            │  ← "Transfer BCA", "GoPay", dll.
│     detail      : string            │  ← nomor rekening / kontak
│     needsProof  : boolean           │  ← wajib upload bukti transfer?
└─────────────────────────────────────┘


┌─────────────────────────────────────┐
│           SalesStats                │
│         (computed / view)           │
├─────────────────────────────────────┤
│     totalOrders    : number         │
│     totalRevenue   : number (IDR)   │
│     statusCounts   : Record<        │
│       OrderStatus, number>          │
│     revenueByDay   : Array<{        │
│       date, revenue, orders }>      │
│     topProducts    : Array<{        │
│       name, count }>                │
└─────────────────────────────────────┘
```

---

## Tabel Entity & Atribut Lengkap

### 1. UserProfile

| Kolom       | Tipe      | Keterangan                                      |
|-------------|-----------|--------------------------------------------------|
| `id`        | UUID (PK) | Dari Supabase Auth                               |
| `email`     | string    | Email login                                      |
| `name`      | string    | Nama lengkap                                     |
| `role`      | enum      | `owner` / `admin` / `customer`                   |
| `createdAt` | timestamp | Waktu registrasi                                 |

**Akses per role:**
- `customer` → registrasi mandiri, akses katalog & pesanan sendiri
- `admin` → kelola pesanan & produk
- `owner` → akses penuh + dashboard statistik + kelola akun admin

---

### 2. Product

| Kolom         | Tipe        | Keterangan                                 |
|---------------|-------------|---------------------------------------------|
| `id`          | string (PK) | Identifier produk                           |
| `name`        | string      | Nama bouquet (Mawar, Tulip, dsb.)           |
| `description` | string      | Deskripsi singkat                           |
| `basePrice`   | number      | Harga dasar (IDR)                           |
| `image`       | string      | URL foto produk (Unsplash)                  |
| `category`    | string      | Kategori (Mawar / Tulip / Bunga Kering/…)  |
| `sizes`       | array       | Daftar `SizeOption` yang tersedia           |
| `addons`      | array       | Daftar `Addon` yang tersedia                |

**Kategori produk yang ada:**
Mawar · Tulip · Bunga Matahari · Bunga Kering · Campur · Kombinasi Spesial

---

### 3. SizeOption *(embedded dalam Product)*

| Kolom             | Tipe   | Keterangan                      |
|-------------------|--------|---------------------------------|
| `id`              | string | `S` / `M` / `L` / `XL`         |
| `label`           | string | "Kecil" / "Sedang" / dll.       |
| `stems`           | string | Deskripsi jumlah tangkai        |
| `priceMultiplier` | number | Pengali harga dasar produk      |

---

### 4. Addon *(embedded dalam Product)*

| Kolom   | Tipe   | Keterangan                              |
|---------|--------|-----------------------------------------|
| `id`    | string | `vase` / `ribbon` / `card` / `premium`  |
| `label` | string | "Vas Bunga" / "Pita" / dll.             |
| `price` | number | Harga tambahan (IDR)                    |

**Addon yang tersedia:**
- `vase` → Vas Bunga
- `ribbon` → Pita Dekoratif
- `card` → Kartu Ucapan
- `premium` → Wrapping Premium

---

### 5. Order

| Kolom                | Tipe      | Keterangan                                        |
|----------------------|-----------|---------------------------------------------------|
| `id`                 | UUID (PK) | Identifier pesanan                                |
| `orderNumber`        | string    | Nomor human-readable `FLR-XXXXXX`                 |
| `userId`             | UUID (FK) | Referensi ke `UserProfile.id`                     |
| `customerName`       | string    | Nama pemesan                                      |
| `customerEmail`      | string    | Email pemesan                                     |
| `customerPhone`      | string    | Nomor HP pemesan                                  |
| `customerAddress`    | string    | Alamat pengiriman                                 |
| `product`            | object    | Snapshot `Product` saat pesanan dibuat            |
| `customization`      | object    | Snapshot `Customization` (lihat tabel 6)          |
| `totalPrice`         | number    | Harga akhir setelah kalkulasi (IDR)               |
| `status`             | enum      | Status pesanan (lihat alur di bawah)              |
| `paymentMethod`      | string (FK)| Referensi ke `PaymentMethod.id`                  |
| `paymentMethodLabel` | string    | Label metode pembayaran (cache)                   |
| `paymentProofPath`   | string?   | Path file di Supabase Storage (`proof/…`)         |
| `createdAt`          | timestamp | Waktu pesanan dibuat                              |

**Kalkulasi harga:**
```
totalPrice = product.basePrice × size.priceMultiplier + Σ addon.price
```

---

### 6. Customization *(embedded dalam Order)*

| Kolom                    | Tipe     | Keterangan                                    |
|--------------------------|----------|-----------------------------------------------|
| `sizeId`                 | string   | Referensi ke `SizeOption.id`                  |
| `description`            | string   | Permintaan khusus dari pelanggan               |
| `selectedAddonIds`       | string[] | Array ID addon yang dipilih                   |
| `referenceImagePath`     | string?  | Path file di Storage (`reference/…`)          |
| `referenceImagePreview`  | string?  | Signed URL sementara untuk preview            |

---

### 7. PaymentMethod

| Kolom        | Tipe        | Keterangan                             |
|--------------|-------------|----------------------------------------|
| `id`         | string (PK) | `bca` / `mandiri` / `gopay` / `ovo` / `cod` |
| `label`      | string      | "Transfer BCA" / "GoPay" / dll.        |
| `detail`     | string      | Nomor rekening / nomor HP / "-"        |
| `needsProof` | boolean     | Wajib upload bukti bayar atau tidak    |

---

## Relasi Antar Entity

```
UserProfile ──── 1 : N ──── Order
Order ──────────── 1 : 1 ──── Customization  (embedded)
Order ──────────── N : 1 ──── PaymentMethod
Order ──────────── N : 1 ──── Product         (snapshot embedded)
Product ────────── 1 : N ──── SizeOption      (embedded)
Product ────────── 1 : N ──── Addon           (embedded)
Customization ──── N : 1 ──── SizeOption      (via sizeId)
Customization ──── N : M ──── Addon           (via selectedAddonIds[])
```

---

## Alur Status Pesanan

```
[Buat Pesanan]
      │
      ▼
menunggu_konfirmasi   ←── Admin menerima pesanan & verifikasi pembayaran
      │
      ▼
  dalam_proses         ←── Florist sedang merangkai bouquet
      │
      ▼
  pesanan_siap         ←── Pesanan siap dikirim / diambil
      │
      ▼
    selesai            ←── Pesanan diterima pelanggan
```

---

## Penyimpanan Data (Storage Layer)

### KV Store (`kv_store_205999f8`)

| Key Pattern               | Value       | Keterangan                     |
|---------------------------|-------------|--------------------------------|
| `product:{id}`            | Product     | Data produk                    |
| `order:{id}`              | Order       | Data pesanan                   |
| `user:{id}`               | UserProfile | Data profil user               |
| `settings:payment_methods`| PaymentMethod[] | Konfigurasi metode bayar  |

### File Storage (`make-205999f8-uploads`)

| Path Pattern                       | Isi                          |
|------------------------------------|------------------------------|
| `reference/{userId}/{uuid}.{ext}`  | Foto referensi dari pelanggan|
| `proof/{userId}/{uuid}.{ext}`      | Bukti transfer pembayaran    |

---

## Diagram Relasi Supabase Auth ↔ Aplikasi

```
Supabase Auth (auth.users)
         │
         │ id (UUID) — one-to-one
         ▼
   UserProfile (kv_store)
         │
         │ userId — one-to-many
         ▼
      Order (kv_store)
      ├── product (snapshot)
      │       ├── sizes[]
      │       └── addons[]
      ├── customization (snapshot)
      │       ├── sizeId → SizeOption
      │       └── selectedAddonIds[] → Addon[]
      ├── paymentMethod → PaymentMethod (kv_store)
      └── paymentProofPath → Storage bucket
```
