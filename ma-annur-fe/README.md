# Madrasah Aliyah Annur - Website Frontend

Website portal resmi Madrasah Aliyah Annur, dibangun menggunakan **React + Vite**.

---

## 📋 Prasyarat (Requirements)

Sebelum menginstal dan menjalankan proyek ini, pastikan perangkat Anda sudah memiliki:

| No | Software | Versi Minimum | Keterangan |
|----|----------|---------------|------------|
| 1 | **Node.js** | v18.x atau lebih baru | Runtime JavaScript untuk menjalankan React |
| 2 | **npm** | v9.x atau lebih baru | Package manager (otomatis terinstal bersama Node.js) |
| 3 | **Git** | v2.x atau lebih baru | Untuk meng-clone repository |
| 4 | **Code Editor** | - | Disarankan: [Visual Studio Code](https://code.visualstudio.com/) |
| 5 | **Web Browser** | - | Chrome, Firefox, atau Edge versi terbaru |

### Cara Cek Apakah Sudah Terinstal

Buka terminal/command prompt dan jalankan perintah berikut:

```bash
node -v      # Cek versi Node.js
npm -v       # Cek versi npm
git --version # Cek versi Git
```

Jika belum terinstal, ikuti panduan instalasi di bawah.

---

## 🔧 Instalasi Node.js & npm

### Windows

1. Kunjungi [https://nodejs.org](https://nodejs.org)
2. Download versi **LTS** (Long Term Support)
3. Jalankan installer, ikuti langkah-langkahnya (klik **Next** hingga selesai)
4. Restart terminal/command prompt
5. Verifikasi instalasi:
   ```bash
   node -v
   npm -v
   ```

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Node.js & npm
sudo apt install nodejs npm -y

# Atau gunakan NodeSource untuk versi terbaru:
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install nodejs -y

# Verifikasi
node -v
npm -v
```

### macOS

```bash
# Menggunakan Homebrew
brew install node

# Verifikasi
node -v
npm -v
```

---

## 🚀 Panduan Instalasi Proyek

### 1. Clone Repository

```bash
git clone <URL_REPOSITORY>
cd madrasah-annur-fe
```

### 2. Install Dependencies

```bash
npm install
```

Perintah ini akan menginstal semua package yang dibutuhkan berdasarkan file `package.json`, termasuk:

**Dependencies (Produksi):**
| Package | Versi | Fungsi |
|---------|-------|--------|
| `react` | ^19.2.5 | Library utama untuk membangun UI |
| `react-dom` | ^19.2.5 | Rendering React ke DOM browser |
| `react-router-dom` | ^7.14.2 | Navigasi antar halaman (routing) |
| `react-icons` | ^5.6.0 | Koleksi ikon untuk komponen UI |

**Dev Dependencies (Pengembangan):**
| Package | Versi | Fungsi |
|---------|-------|--------|
| `vite` | ^8.0.10 | Build tool & dev server |
| `@vitejs/plugin-react` | ^6.0.1 | Plugin Vite untuk React |
| `eslint` | ^10.2.1 | Linter untuk menjaga kualitas kode |
| `eslint-plugin-react-hooks` | ^7.1.1 | Aturan ESLint untuk React Hooks |
| `eslint-plugin-react-refresh` | ^0.5.2 | Aturan ESLint untuk React Refresh |

### 3. Jalankan Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173` (default Vite).

### 4. Build untuk Produksi

```bash
npm run build
```

Hasil build akan tersedia di folder `dist/`.

### 5. Preview Build Produksi

```bash
npm run preview
```

---

## 📁 Struktur Proyek

```
madrasah-annur-fe/
├── public/          # File statis (gambar, favicon, dll)
├── src/             # Source code aplikasi
│   ├── assets/      # Gambar dan aset lainnya
│   ├── components/  # Komponen React yang dapat digunakan ulang
│   ├── pages/       # Halaman-halaman website
│   ├── App.jsx      # Komponen utama aplikasi
│   └── main.jsx     # Entry point aplikasi
├── index.html       # File HTML utama
├── package.json     # Konfigurasi proyek & daftar dependencies
├── vite.config.js   # Konfigurasi Vite
└── eslint.config.js # Konfigurasi ESLint
```

---

## 📝 Perintah yang Tersedia

| Perintah | Keterangan |
|----------|------------|
| `npm run dev` | Menjalankan development server dengan Hot Module Replacement (HMR) |
| `npm run build` | Build aplikasi untuk produksi |
| `npm run preview` | Preview hasil build produksi |
| `npm run lint` | Menjalankan ESLint untuk mengecek kualitas kode |

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `npm install` gagal | Hapus folder `node_modules` dan file `package-lock.json`, lalu jalankan `npm install` ulang |
| Port 5173 sudah digunakan | Vite otomatis mencari port lain, atau ubah di `vite.config.js` |
| Module not found | Pastikan sudah menjalankan `npm install` terlebih dahulu |
| Versi Node.js tidak kompatibel | Update Node.js ke versi LTS terbaru |
