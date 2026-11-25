# Laporan UTS — Konversi Aplikasi Web "Sistem Bouquet Kustom — Faedah Shop" ke Aplikasi Mobile (React Native Expo + TypeScript)

## 1. Ringkasan

Frontend web Faedah Shop (React + Vite + TailwindCSS + Radix UI, folder `/src`) dikonversi menjadi aplikasi mobile lintas platform (Android dan iOS) di folder `/mobile`. Aplikasi dibangun dengan Expo SDK 58, React Native 0.88, dan TypeScript 6. Aplikasi mobile memakai REST API Express + PostgreSQL yang sama (`/server`), jadi web dan mobile berbagi data yang sama.

Perubahan di server hanya berupa **penambahan**. Endpoint `POST /api/orders` kini juga menerima `multipart/form-data` (melalui multer) untuk upload gambar dari mobile. Format JSON + base64 yang dipakai web lama tetap berfungsi.

Cakupan fitur:

| Alur | Fitur |
|---|---|
| Customer | Katalog bouquet + filter kategori + pencarian, Kustomisasi (ukuran, tambahan, kartu ucapan, catatan, gambar referensi, harga langsung), Checkout + upload bukti pembayaran (BCA, Mandiri, OVO, GoPay, COD), Pelacak pesanan `FLR-XXXXXX` dengan pembaruan otomatis |
| Admin/Owner | Dashboard statistik, Manajemen pesanan (ubah status Menunggu → Diproses → Siap → Selesai), Manajemen produk (daftar, tambah, edit) |
| Umum | Login, daftar akun, sesi tersimpan (JWT), logout |

## 2. Arsitektur (CPMK111)

### 2.1 Arsitektur Berlapis

```
┌──────────────────────────────────────────────────────────┐
│  Screens (screens/customer, screens/admin, screens/auth) │  ← tampilan & interaksi
├──────────────────────────────────────────────────────────┤
│  Components (components/ui, components/*)                │  ← komponen UI reusable
├──────────────────────────────────────────────────────────┤
│  Navigation (React Navigation: Stack + Bottom Tabs)      │  ← alur antar layar per role
├──────────────────────────────────────────────────────────┤
│  State: Context (AuthContext, StoreContext) + Hooks      │  ← sesi, cache produk, draft
├──────────────────────────────────────────────────────────┤
│  Service Layer (api/services.ts)                         │  ← 1 fungsi per endpoint
├──────────────────────────────────────────────────────────┤
│  HTTP Client (api/client.ts) + Storage (AsyncStorage)    │  ← JWT, timeout, FormData
└──────────────────────────────────────────────────────────┘
                     │  HTTP/JSON + multipart
                     ▼
        Express REST API (/server/server.js) → PostgreSQL
```

Setiap lapisan hanya bergantung pada lapisan di bawahnya. Layar tidak memanggil `fetch` secara langsung, melainkan lewat fungsi di `services.ts`. Dengan begitu, perubahan endpoint cukup diperbaiki di satu tempat.

### 2.2 Struktur Folder `/mobile`

```
mobile/
├── App.tsx                  # Root: SafeAreaProvider, AuthProvider, StoreProvider, NavigationContainer
├── index.ts                 # Entry point Expo
├── app.json                 # Konfigurasi Expo (nama, ikon, izin kamera/galeri)
├── babel.config.js          # Preset Expo + NativeWind
├── metro.config.js          # Bundler Metro + NativeWind (global.css)
├── tailwind.config.js       # Token warna brand Faedah (sama dengan web)
├── global.css               # Direktif Tailwind
├── nativewind-env.d.ts      # Deklarasi tipe className & *.css
├── tsconfig.json            # TypeScript strict + alias @/*
├── .env.example             # Contoh EXPO_PUBLIC_API_URL
└── src/
    ├── config/env.ts            # Penentuan URL API otomatis (LAN / emulator)
    ├── theme/colors.ts          # Warna untuk props non-className (ikon, tab bar)
    ├── types/index.ts           # Tipe domain (Product, Order, User, SalesStats)
    ├── storage/tokenStorage.ts  # Simpan/hapus JWT di AsyncStorage
    ├── api/
    │   ├── client.ts            # Wrapper fetch: Bearer token, timeout, FormData, 401
    │   └── services.ts          # Fungsi endpoint: login, produk, pesanan, admin
    ├── context/
    │   ├── AuthContext.tsx      # Sesi pengguna, role, login/register/logout
    │   └── StoreContext.tsx     # Cache produk & metode bayar, draft pesanan
    ├── hooks/
    │   ├── usePolling.ts        # Polling saat layar fokus & aplikasi aktif
    │   └── useImagePicker.ts    # Galeri/kamera + kompresi gambar
    ├── utils/
    │   ├── format.ts            # Format Rupiah & tanggal Indonesia
    │   ├── price.ts             # Rumus harga (identik dengan server)
    │   ├── orderStatus.ts       # Label, warna, urutan status pesanan
    │   └── stats.ts             # Hitung statistik dari daftar pesanan (role admin)
    ├── components/
    │   ├── ui/                  # Button, Badge, Card, Chip, TextField, Screen, StateViews
    │   ├── ProductCard.tsx      # Kartu produk katalog
    │   ├── OptionRow.tsx        # Baris pilihan ukuran/tambahan
    │   ├── ImageUploadField.tsx # Kolom upload gambar dengan pratinjau
    │   ├── PriceSummary.tsx     # Rincian harga
    │   ├── StatusStepper.tsx    # Progres status pesanan
    │   ├── OrderCard.tsx        # Kartu pesanan (customer & admin)
    │   ├── StatCard.tsx         # Kartu angka dashboard
    │   └── BarChart.tsx         # Grafik batang berbasis View
    ├── navigation/
    │   ├── types.ts             # Tipe parameter semua navigator
    │   ├── RootNavigator.tsx    # Pilih alur berdasarkan role + modal Login
    │   ├── CustomerTabs.tsx     # Tab: Katalog, Pesanan Saya, Akun
    │   └── AdminTabs.tsx        # Tab: Dashboard, Pesanan, Produk, Akun
    └── screens/
        ├── auth/                # LoginScreen, RegisterScreen
        ├── customer/            # Catalog, Customize, Checkout, MyOrders, Account
        └── admin/               # AdminDashboard, AdminOrders, AdminProducts, AdminProductForm
```

Total kode aplikasi di `src/` adalah 44 file dengan 2.699 baris. Setiap file berisi komentar pembuka dalam Bahasa Indonesia yang menjelaskan fungsinya.

### 2.3 Daftar Library dan Alasan Pemilihan

| Library | Versi | Pengganti dari web | Fungsi |
|---|---|---|---|
| expo | ~58.0.26 | Vite | Toolchain, bundler Metro, akses API native |
| react-native | 0.88.1 | react-dom | Render komponen native (View, Text, FlatList) |
| typescript | ~6.0.3 | — | Type safety di seluruh lapisan |
| nativewind + tailwindcss | ^4.2.7 + ^3.4.19 | TailwindCSS web | Styling dengan className seperti di web |
| @react-navigation/native | ^7.5.2 | react-router | Container navigasi |
| @react-navigation/native-stack | ^7.21.1 | Route bertingkat | Navigasi Stack (Katalog → Kustomisasi → Checkout) |
| @react-navigation/bottom-tabs | ^7.22.0 | Navbar/Sidebar | Tab bawah untuk customer dan admin |
| react-native-screens, react-native-safe-area-context | ~4.30.1, ~5.11.1 | — | Layar native dan area aman (notch, home indicator) |
| @react-native-async-storage/async-storage | 2.2.0 | localStorage | Penyimpanan JWT persisten |
| expo-image-picker | ~58.0.10 | `<input type="file">` | Ambil foto dari galeri/kamera |
| expo-image-manipulator | ~58.0.16 | — | Kompres gambar sebelum upload |
| expo-image | ~58.0.18 | `<img>` | Gambar dengan cache memori + disk |
| expo-clipboard | ~58.0.4 | navigator.clipboard | Salin nomor rekening |
| @expo/vector-icons + expo-font | ^15.0.2, ~58.0.12 | lucide-react | Ikon (Ionicons) |
| react-native-reanimated + worklets | 4.7.1, 0.13.0 | motion | Animasi (dependensi NativeWind) |
| expo-constants | ~58.0.16 | import.meta.env | Membaca host Metro untuk URL API |

Library web yang **tidak** dipindahkan: Radix UI (diganti komponen `components/ui` buatan sendiri), recharts (diganti `BarChart` berbasis View), canvas-confetti (diganti banner "Pesanan berhasil dibuat"), dan MUI/Emotion (tidak diperlukan).

Semua library native dipasang dengan `npx expo install`, sehingga versinya otomatis cocok dengan SDK 58.

### 2.4 Koneksi ke Server Express

URL API ditentukan di `src/config/env.ts` dengan urutan prioritas berikut:

1. `EXPO_PUBLIC_API_URL` dari file `.env`, misalnya `http://192.168.1.10:3001/api`.
2. IP komputer yang menjalankan Metro (`Constants.expoConfig.hostUri`) dengan port 3001. Cara ini berjalan otomatis di Expo Go selama HP dan laptop memakai Wi-Fi yang sama.
3. Fallback: `10.0.2.2` untuk emulator Android dan `localhost` untuk simulator iOS.

`api/client.ts` menangani:
- Header `Authorization: Bearer <JWT>` yang diambil dari AsyncStorage.
- Timeout 20 detik menggunakan `AbortController`.
- Body `FormData` dikirim tanpa header `Content-Type` manual, sehingga boundary multipart dibuat otomatis.
- Respons 401 memicu logout otomatis, karena token sudah kedaluwarsa.

### 2.5 Upload Gambar (multipart/form-data)

Alur upload gambar:

1. `useImagePicker` membuka galeri atau kamera, lalu meminta izin akses.
2. Gambar diperkecil ke lebar maksimal 1280 px dan dikompres ke JPEG kualitas 70% dengan `expo-image-manipulator`. Ukuran gambar biasanya turun dari 3–8 MB menjadi 150–400 KB.
3. `services.createOrder` menyusun `FormData`, yang berisi field teks, `referenceImage`, `paymentProof`, dan `selectedAddonIds` sebagai string JSON.
4. Di server, multer (`memoryStorage`, maksimal 10 MB per file, hanya tipe JPEG/PNG/WEBP/HEIC) membaca file tersebut. File lalu disimpan dengan penamaan yang sama seperti jalur base64. Request JSON dari web lama dilewati multer tanpa diubah.

Perubahan server sudah diuji dengan server Express terpisah. Hasilnya: multipart dengan file diterima, JSON biasa tetap diterima, dan file PDF ditolak dengan status 400.

## 3. Konsistensi UI/UX Web → Mobile (CPMK110)

### 3.1 Pemetaan Komponen Web ke Native

| Web (`/src`) | Mobile (`/mobile`) | Catatan |
|---|---|---|
| `div`, `span`, `p` | `View`, `Text` | Di React Native, semua teks wajib berada di dalam `Text` |
| `button` | `Pressable` (`components/ui/Button`) | Efek tekan `active:opacity-80`, `accessibilityRole="button"` |
| `input`, `textarea` | `TextInput` (`components/ui/TextField`) | `keyboardType` sesuai isi (angka, telepon, URL) |
| Grid kartu produk | `FlatList numColumns={2}` | Item di-render secara virtual (lazy) |
| Radix Tabs / ToggleGroup | `ScrollView` horizontal berisi `Chip` | Filter kategori dan filter status pesanan |
| Radix Dialog | Layar Stack `presentation: "modal"` | Login, Register |
| Radix RadioGroup / Checkbox | `OptionRow` | Pilihan ukuran (radio) dan tambahan (checkbox) |
| `<img>` | `expo-image` | Cache memori + disk, transisi fade |
| react-router | React Navigation (Stack + Bottom Tabs) | Route terketik (typed) lewat `navigation/types.ts` |
| Sidebar admin (`AdminLayout`) | Bottom Tabs admin | Lebih mudah dijangkau ibu jari di layar HP |
| recharts | `BarChart` berbasis View | Tanpa library chart tambahan |
| Tabel pesanan admin | `FlatList` berisi `OrderCard` | Tabel lebar tidak cocok untuk layar HP |

### 3.2 Konsistensi Visual dan Bahasa

- **Warna brand sama dengan web.** Nilai warna diambil dari CSS variable web ke `tailwind.config.js`: primary `#5250f3`, secondary `#d4d4fc`, tertiary `#eaeaff`, surface `#ffffff`, surface-secondary `#f5f5f8`. Warna yang dipakai lewat props, seperti ikon, tab bar, dan RefreshControl, diambil dari `theme/colors.ts` agar tidak ada nilai warna yang ditulis ulang di banyak tempat.
- **Teks UI memakai Bahasa Indonesia yang sama dengan web**, misalnya "Cari bouquet favoritmu...", "Pilih Ukuran", "Tambahan Opsional", "Desain Kartu Ucapan Digital", "Data Pemesan", "Salin Nomor Rekening", "Ringkasan penjualan Faedah Shop", dan "Produk Terlaris".
- **Aturan bisnis sama dengan web**: tema kartu ucapan beserta format catatan `[KARTU: tema]`, validasi checkout (nama, telepon, alamat, metode bayar wajib diisi, dan bukti transfer wajib untuk selain COD), label serta warna badge status pesanan, dan kategori default produk.
- **Harga di aplikasi sama dengan harga di server.** `utils/price.ts` memakai rumus yang identik dengan `computeTotal` di server (harga dasar × pengali ukuran + harga tambahan). Server tetap menghitung ulang total sebagai sumber kebenaran.
- **Pola state seragam di semua layar**: `LoadingView` saat memuat, `ErrorView` dengan tombol "Coba Lagi", dan `EmptyState` saat data kosong.

## 4. Responsivitas Android & iOS (CPMK112)

| Aspek | Implementasi |
|---|---|
| Notch, Dynamic Island, status bar | `SafeAreaView` (`react-native-safe-area-context`) dengan `edges={["top"]}` pada layar tab |
| Home indicator iOS / gesture bar Android | Bar aksi bawah (Checkout, Kustomisasi) diberi padding `useSafeAreaInsets().bottom` |
| Keyboard menutupi form | `KeyboardAvoidingView` dengan `behavior="padding"` di iOS (Android sudah menggeser layar sendiri) dan `keyboardShouldPersistTaps="handled"` |
| Lebar layar beragam | Layout flex dan persentase, bukan ukuran piksel tetap. Katalog 2 kolom dengan `flex-1` dan gambar memakai `aspectRatio` |
| Teks angka panjang | `numberOfLines` + `adjustsFontSizeToFit` di `StatCard` agar nominal Rupiah tidak terpotong |
| Navigasi native | `native-stack` memakai UINavigationController (iOS) dan Fragment (Android), sehingga gesture swipe-back iOS dan tombol back Android berjalan otomatis |
| Izin kamera/galeri | Teks izin dalam Bahasa Indonesia di `app.json` (plugin `expo-image-picker`) untuk iOS Info.plist dan Android manifest |
| Tampilan khusus platform | `Platform.OS` dipakai hanya untuk perilaku keyboard. Komponen lain sama di kedua platform |
| Alamat server | Fallback `10.0.2.2` untuk emulator Android dan `localhost` untuk simulator iOS |

Hasil bundling: `npx expo export --platform android` dan `--platform ios` sama-sama berhasil dari satu basis kode. Bundle Hermes untuk Android berukuran ±3,6 MB.

## 5. Analisis Performa (CPMK113)

| Teknik | Lokasi | Dampak |
|---|---|---|
| `FlatList` (virtualisasi) | Katalog, Pesanan Saya, Kelola Pesanan, Kelola Produk | Hanya item yang terlihat di layar yang di-render, sehingga memori tetap stabil walau datanya ratusan |
| `initialNumToRender`, `windowSize`, `removeClippedSubviews` | Katalog (ketiganya), Kelola Pesanan (`initialNumToRender`, `windowSize`) | Render awal lebih cepat dan item di luar layar dilepas |
| `memo()` pada item list | `ProductCard`, `OrderCard` | Item tidak di-render ulang jika props-nya tidak berubah |
| `useMemo` / `useCallback` | Filter katalog, harga langsung, hitungan status | Perhitungan diulang hanya saat dependensinya berubah |
| Cache gambar `expo-image` (`memory-disk`, `recyclingKey`) | Semua gambar produk | Gambar tidak diunduh ulang saat scroll atau pindah layar |
| Kompresi gambar sebelum upload | `useImagePicker` | Ukuran upload turun ±90%, sehingga lebih cepat di jaringan seluler |
| Cache produk di `StoreContext` | Katalog ↔ Kustomisasi ↔ Admin | Produk dimuat sekali dan diperbarui hanya saat pull-to-refresh atau setelah admin menyimpan |
| Polling hemat baterai (`usePolling`) | Pesanan Saya (10 dtk), Kelola Pesanan (15 dtk) | Interval berjalan hanya saat layar fokus dan aplikasi aktif (`useFocusEffect` + `AppState`) |
| Update optimis | Ubah status pesanan | Hanya item yang berubah yang diganti, tanpa memuat ulang seluruh daftar |
| Grafik berbasis View | Dashboard | Tidak memakai library chart berat, sehingga bundle lebih kecil |
| Timeout request 20 detik | `api/client.ts` | Layar tidak menggantung saat jaringan buruk |

### Catatan "real-time"

Pelacak pesanan versi web hanya diperbarui dengan refresh manual. Di mobile, pembaruan otomatis dibuat dengan **polling** (pengambilan data berkala) yang hanya aktif saat layar terbuka, ditambah pull-to-refresh. Pendekatan ini dipilih karena tidak memerlukan perubahan server seperti WebSocket. Kekurangannya, perubahan status baru terlihat paling lambat 10–15 detik.

## 6. Alur Role dan Hak Akses

- `RootNavigator` membaca `user.role` dari `AuthContext`. Role `admin`/`owner` diarahkan ke `AdminTabs`, sedangkan customer dan tamu diarahkan ke `CustomerTabs`.
- Tamu boleh melihat katalog dan mengkustomisasi bouquet. Login baru diminta saat checkout, karena server mewajibkannya, dan form login tampil sebagai modal.
- `GET /api/admin/stats` hanya untuk **owner** (admin biasa mendapat 403). Agar admin tetap melihat ringkasan, Dashboard menghitung statistik dari `GET /api/orders` dengan `utils/stats.ts`, yang logikanya sama dengan server.
- Ubah status pesanan memakai `PATCH /api/admin/orders/:id/status` dengan konfirmasi sebelum dikirim. Tambah/edit produk memakai `POST`/`PATCH /api/admin/products`.

## 7. Pengujian yang Dilakukan

| Pengujian | Perintah | Hasil |
|---|---|---|
| Type checking | `npx tsc --noEmit` | Lolos, 0 error |
| Kesehatan proyek Expo | `npx expo-doctor` | 20/20 pengecekan lolos |
| Bundling Android | `npx expo export --platform android` | Berhasil (Hermes bytecode ±3,6 MB) |
| Bundling iOS | `npx expo export --platform ios` | Berhasil |
| Sintaks server | `node --check server/server.js` | Lolos |
| Middleware upload | Server Express uji dengan `fetch` + `FormData` | Multipart diterima, JSON diterima, PDF ditolak (400) |

Belum diuji: alur lengkap dengan database PostgreSQL dan pengujian di perangkat fisik. Keduanya perlu dicoba di laptop lokal dengan langkah di bawah.

## 8. Cara Menjalankan

```bash
# Terminal 1 — backend
cd server
npm install
npm run dev            # API di http://<IP-laptop>:3001

# Terminal 2 — aplikasi mobile
cd mobile
npm install
npx expo start         # scan QR dengan Expo Go (HP & laptop satu Wi-Fi)
```

Jika HP tidak bisa terhubung ke server, salin `.env.example` menjadi `.env`, lalu isi `EXPO_PUBLIC_API_URL=http://<IP-laptop>:3001/api`. Setelah itu jalankan ulang `npx expo start -c`.
