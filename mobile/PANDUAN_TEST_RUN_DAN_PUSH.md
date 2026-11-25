# Panduan Test Run & Push — Faedah Shop Mobile

Panduan ini menjelaskan cara menjalankan server dan aplikasi mobile di laptop, mengujinya di HP atau emulator, lalu mengirim perubahan ke GitHub. Perintah ditulis untuk **PowerShell (Windows)** dan **bash (macOS/Linux)** jika keduanya berbeda.

---

## 1. Prasyarat

| Kebutuhan | Versi | Cek dengan |
|---|---|---|
| Node.js | 20 atau 22 (LTS) | `node -v` |
| PostgreSQL | 14 ke atas | `psql --version` |
| Git | terbaru | `git --version` |
| Expo Go (di HP) | versi terbaru dari Play Store / App Store (mendukung SDK 58) | — |
| Opsional | Android Studio (emulator) / Xcode (simulator iOS, khusus macOS) | — |

HP dan laptop **harus terhubung ke Wi-Fi yang sama**. Wi-Fi kampus sering memblokir koneksi antar perangkat. Jika itu terjadi, gunakan hotspot HP sebagai jaringan bersama.

---

## 2. Ambil Kode dari Branch `mobile`

### Jika repo sudah ada di laptop

Commit terakhir menghapus `server/.env` dari git, sehingga `git pull` **akan menghapus file itu di laptop**. Backup file tersebut terlebih dahulu.

PowerShell:
```powershell
Copy-Item server\.env $HOME\server.env.bak
git fetch origin
git checkout mobile
git pull origin mobile
Copy-Item $HOME\server.env.bak server\.env
```

bash:
```bash
cp server/.env ~/server.env.bak
git fetch origin && git checkout mobile && git pull origin mobile
cp ~/server.env.bak server/.env
```

Jika `server/.env` terlanjur hilang, pulihkan dari commit lama:
```bash
git show cb04b682:server/.env > server/.env
```

### Jika baru clone

```bash
git clone -b mobile https://github.com/rafliardana/Sistem-Bouquet-Kustom-Faedah-Shop.git
cd Sistem-Bouquet-Kustom-Faedah-Shop
```

---

## 3. Siapkan Database & `server/.env`

1. Buat database kosong:
   ```bash
   psql -U postgres -c "CREATE DATABASE faedah_shop;"
   ```
2. Buat atau periksa file `server/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:PASSWORD_ANDA@localhost:5432/faedah_shop
   JWT_SECRET=GANTI_DENGAN_STRING_ACAK_PANJANG
   PORT=3001
   UPLOAD_DIR=uploads
   ```
3. Buat `JWT_SECRET` baru. Secret lama sudah pernah ter-push ke repo publik, jadi jangan dipakai lagi.
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
   Jika password PostgreSQL juga pernah tercantum di `.env` lama, ganti juga password tersebut.

Tabel dan data contoh (produk serta metode pembayaran) dibuat **otomatis** saat server pertama kali berjalan, melalui `init.sql` dan seed.

---

## 4. Jalankan Server (Terminal 1)

```bash
cd server
npm install
npm run dev
```

Output yang benar:
```
✅ Database tables initialized
🚀 Faedah Shop Server running at http://localhost:3001
```

Cek di browser laptop: `http://localhost:3001/api/products`. Halaman harus menampilkan JSON daftar produk.

### Buat akun Owner (sekali saja)

Aplikasi mobile tidak memiliki halaman pembuatan owner. Buat owner lewat API berikut. Bootstrap hanya bisa dilakukan sekali; jika owner sudah ada, server membalas 409.

PowerShell:
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/bootstrap/owner `
  -ContentType "application/json" `
  -Body '{"email":"owner@faedah.com","password":"owner123","name":"Owner Faedah"}'
```

bash:
```bash
curl -X POST http://localhost:3001/api/bootstrap/owner \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@faedah.com","password":"owner123","name":"Owner Faedah"}'
```

Akun customer dibuat dari layar **Daftar** di aplikasi. Akun ber-role admin (bukan owner) dibuat dari halaman Kelola Akun di versi web.

---

## 5. Cari IP Laptop & Buka Akses Port

| OS | Perintah | Yang dicari |
|---|---|---|
| Windows | `ipconfig` | "IPv4 Address" pada adapter Wi-Fi, mis. `192.168.1.10` |
| macOS | `ipconfig getifaddr en0` | `192.168.x.x` |
| Linux | `hostname -I` | alamat pertama |

Uji dari **browser HP**: `http://192.168.1.10:3001/api/products`. Ganti angka IP dengan IP laptop Anda.

Jika halaman tidak terbuka, kemungkinan besar firewall memblokir port 3001. Di Windows, jalankan PowerShell sebagai Administrator:
```powershell
New-NetFirewallRule -DisplayName "Faedah API 3001" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

---

## 6. Jalankan Aplikasi Mobile (Terminal 2)

```bash
cd mobile
npm install
```

Atur alamat API. Langkah ini disarankan untuk HP fisik.

PowerShell: `Copy-Item .env.example .env`. bash: `cp .env.example .env`.

Lalu isi file `mobile/.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:3001/api
```

Tanpa `.env`, aplikasi menebak IP dari server Metro. Cara itu biasanya berhasil, tetapi alamat di `.env` lebih pasti.

Jalankan:
```bash
npx expo start -c
```

| Target | Cara |
|---|---|
| HP Android | Buka Expo Go → Scan QR code |
| iPhone | Buka aplikasi Kamera → scan QR → buka di Expo Go |
| Emulator Android | Tekan `a` di terminal (emulator harus sudah menyala) |
| Simulator iOS (macOS) | Tekan `i` di terminal |

Jalankan ulang dengan `-c` (hapus cache) **setiap kali `.env` diubah**.

---

## 7. Skenario Uji (Checklist)

Centang setiap langkah dan catat hasilnya. Screenshot dari langkah-langkah ini bisa dipakai di laporan UTS.

### A. Customer

| No | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| A1 | Buka aplikasi tanpa login | Katalog tampil dalam 2 kolom, gambar termuat | ☐ |
| A2 | Ketuk chip kategori (mis. "Mawar"), lalu ketik di kolom cari | Daftar tersaring sesuai kategori dan kata kunci | ☐ |
| A3 | Tarik layar ke bawah | Indikator refresh muncul, data dimuat ulang | ☐ |
| A4 | Pilih produk → ganti ukuran → centang Vas & Pita | Total harga berubah langsung | ☐ |
| A5 | Pilih tema kartu, isi pesan & catatan, upload gambar referensi dari galeri | Pratinjau gambar tampil | ☐ |
| A6 | Lanjut ke Checkout tanpa login → ketuk "Masuk untuk Memesan" | Muncul dialog "Login diperlukan" → "Masuk" membuka modal Login | ☐ |
| A7 | Ketuk "Daftar", buat akun baru | Otomatis login, modal tertutup, kembali ke Checkout (data pesanan tetap ada) | ☐ |
| A8 | Pilih BCA, ketuk "Buat Pesanan" tanpa upload bukti | Muncul pesan "Bukti pembayaran wajib diunggah", pesanan tidak terkirim | ☐ |
| A9 | Ketuk "Salin" nomor rekening | Nomor tersalin (cek dengan paste) | ☐ |
| A10 | Upload bukti dari kamera → pesan | Pindah ke Pesanan Saya, banner "Pesanan berhasil dibuat", nomor `FLR-XXXXXX` | ☐ |
| A11 | Buat pesanan kedua dengan COD | Berhasil tanpa bukti bayar | ☐ |
| A12 | Cari pesanan dengan nomor FLR | Hanya pesanan tersebut yang tampil | ☐ |
| A13 | Tutup lalu buka lagi aplikasi | Masih login (JWT tersimpan di AsyncStorage) | ☐ |

Cek di laptop: folder `server/uploads/` berisi file gambar referensi dan bukti bayar. Total harga pesanan di aplikasi harus sama dengan total yang dihitung server.

### B. Admin / Owner

| No | Langkah | Hasil yang diharapkan | ✓ |
|---|---|---|---|
| B1 | Logout dari tab Akun, login sebagai owner | Tab berubah menjadi Dashboard, Pesanan, Produk, Akun | ☐ |
| B2 | Buka Dashboard | Kartu Total Pesanan dan Pendapatan sesuai pesanan uji, grafik serta produk terlaris tampil | ☐ |
| B3 | Tab Pesanan → filter "Menunggu" | Pesanan dari langkah A10–A11 tampil | ☐ |
| B4 | Ketuk "Ubah ke Diproses" → konfirmasi | Badge status berubah tanpa reload seluruh daftar | ☐ |
| B5 | Ulangi sampai "Selesai" | Muncul tanda "✓ Pesanan sudah selesai" | ☐ |
| B6 | Login sebagai customer di HP/emulator lain, buka Pesanan Saya | Status ikut berubah paling lambat 10 detik | ☐ |
| B7 | Tab Produk → "+" → isi form tanpa nama | Muncul pesan "Nama produk wajib diisi" | ☐ |
| B8 | Isi form lengkap dengan URL gambar https → simpan | Produk baru tampil di daftar admin dan di katalog customer | ☐ |
| B9 | Edit harga produk → simpan | Harga baru tampil di daftar | ☐ |
| B10 | Login sebagai **admin** (bukan owner) → Dashboard | Statistik tetap tampil (dihitung dari daftar pesanan) | ☐ |

### C. Pengecekan Otomatis (opsional, untuk lampiran laporan)

```bash
cd mobile
npx tsc --noEmit                         # harus tanpa output (0 error)
npx expo-doctor                          # harus "20/20 checks passed"
npx expo export --platform android       # harus diakhiri "Exported: dist"
```

Hapus folder `mobile/dist` setelah selesai karena tidak perlu di-commit.

---

## 8. Troubleshooting

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| "Network request failed" / timeout di HP | IP salah, beda Wi-Fi, atau firewall | Cek langkah 5, isi `EXPO_PUBLIC_API_URL`, lalu jalankan `npx expo start -c` |
| QR tidak bisa terhubung ke Metro | Wi-Fi memblokir antar perangkat | Gunakan hotspot HP, atau `npx expo start --tunnel` (alamat API tetap harus bisa diakses HP) |
| Server: `ECONNREFUSED 5432` / `password authentication failed` | PostgreSQL mati atau `DATABASE_URL` salah | Nyalakan service PostgreSQL, cek user/password/nama database |
| Server: `database "faedah_shop" does not exist` | Database belum dibuat | Jalankan langkah 3.1 |
| Login berhasil lalu langsung logout | `JWT_SECRET` diganti saat sesi lama masih tersimpan | Normal, cukup login ulang |
| Upload gagal "Upload gagal: ..." | File bukan gambar atau lebih dari 10 MB | Pilih foto JPG/PNG. Aplikasi sudah mengompres foto biasa |
| Emulator Android tidak bisa akses API | Emulator tidak mengenal `localhost` milik laptop | Kosongkan `.env` (otomatis memakai `10.0.2.2`) atau isi IP LAN |
| Expo Go: "Project is incompatible with this version" | Expo Go belum mendukung SDK 58 | Perbarui Expo Go dari store |
| Gambar produk tidak tampil | URL gambar bukan https atau tidak bisa diakses | Gunakan URL gambar publik https |

---

## 9. Push Perubahan ke GitHub

### 9.1 Sebelum commit: pastikan secret aman

```bash
git status
git ls-files | grep -E "\.env$"        # harus KOSONG
```
PowerShell: `git ls-files | Select-String "\.env$"`. Hasilnya juga harus kosong.

Jika `.env` muncul di daftar tersebut, keluarkan dari git tanpa menghapus file lokal:
```bash
git rm --cached server/.env mobile/.env
```
File `.gitignore` di root repo sudah berisi `.env`, `server/.env`, dan `mobile/.env`. Pastikan baris-baris itu tidak terhapus.

### 9.2 Commit & push ke branch `mobile`

```bash
git checkout mobile
git pull origin mobile                  # ambil perubahan terbaru dulu
git add .
git status                              # cek ulang: tidak ada .env, node_modules, dist
git commit -m "docs: hasil test run mobile"
git push origin mobile
```

Contoh pesan commit yang rapi:
- `feat: tambah fitur ...` untuk fitur baru
- `fix: perbaiki ...` untuk perbaikan bug
- `docs: perbarui laporan/panduan` untuk dokumentasi

### 9.3 Gabungkan ke `main` (setelah semua uji lolos)

1. Buka https://github.com/rafliardana/Sistem-Bouquet-Kustom-Faedah-Shop
2. Klik **Compare & pull request** untuk branch `mobile`.
3. Base: `main`, compare: `mobile`. Beri judul, lalu klik **Create pull request**.
4. Periksa tab *Files changed*. Pastikan tidak ada file `.env`.
5. Klik **Merge pull request**.

Alternatif lewat terminal:
```bash
git checkout main
git pull origin main
git merge mobile
git push origin main
```

### 9.4 Jika push ditolak

| Pesan | Solusi |
|---|---|
| `rejected ... fetch first` | Jalankan `git pull origin mobile`, selesaikan konflik jika ada, lalu push lagi |
| `Authentication failed` | GitHub tidak menerima password biasa. Gunakan Personal Access Token (Settings → Developer settings → Tokens) atau login lewat `gh auth login` |
| `Permission denied` | Pastikan akun yang login adalah pemilik repo atau collaborator |

---

## 10. Catatan Keamanan

- Commit lama di riwayat git masih berisi isi `server/.env`, karena `git rm --cached` hanya berlaku untuk commit berikutnya. Karena itu **ganti `JWT_SECRET` dan password database**. Jika ingin membersihkan riwayatnya juga, gunakan `git filter-repo` atau BFG Repo-Cleaner. Cara ini menulis ulang riwayat dan butuh force push, jadi backup repo terlebih dahulu.
- Jangan pernah menulis password atau token ke dalam kode, laporan, atau screenshot.
