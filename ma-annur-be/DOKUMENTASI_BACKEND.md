# Dokumentasi Backend — Sistem PPDB Madrasah Aliyah Annur

> REST API untuk Penerimaan Peserta Didik Baru (PPDB)
> Versi: 1.0.0

---

## 1. Teknologi yang Digunakan

| Komponen | Teknologi | Versi | Penjelasan |
|----------|-----------|-------|------------|
| **Runtime** | Node.js | 18+ | JavaScript runtime untuk menjalankan server |
| **Framework** | Express.js | 4.21 | Web framework minimalis untuk membuat REST API |
| **Database** | MySQL | 8.0 | Relational database untuk menyimpan seluruh data |
| **Containerization** | Docker + Docker Compose | — | Menjalankan MySQL dan API di container terisolasi |
| **Testing** | Jest + Supertest | 30.x / 7.x | Unit & integration testing framework |
| **Dokumentasi API** | Swagger/OpenAPI 3.0 | — | Dokumentasi interaktif di `/api-docs` |

### Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser/Postman)                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP Request
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         EXPRESS SERVER                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  MIDDLEWARE LAYER (berurutan)                             │   │
│  │  1. Helmet (HTTP Security Headers)                       │   │
│  │  2. CORS (Cross-Origin Whitelist)                        │   │
│  │  3. Rate Limiter (Anti DDoS/Brute-force)                 │   │
│  │  4. Morgan (Request Logger)                              │   │
│  │  5. Body Parser (JSON & URL-encoded)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ROUTE → VALIDATOR → CONTROLLER → MODEL                 │   │
│  │                                                          │   │
│  │  /api/auth/*        → authValidator        → UserModel   │   │
│  │  /api/siswa/*       → siswaValidator       → SiswaModel  │   │
│  │  /api/berita/*      → beritaValidator      → BeritaModel │   │
│  │  /api/dashboard/*   → (admin guard)        → (aggregasi) │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────┘
                                │ SQL Query
                                ▼
                    ┌───────────────────────┐
                    │   MySQL 8.0 (Docker)  │
                    │   Database: ppdb_annur │
                    └───────────────────────┘
```

---

## 2. Database — MySQL 8.0

Database dijalankan melalui Docker Compose dan diinisialisasi otomatis menggunakan file `init.sql`.

### Konfigurasi Koneksi

| Parameter | Nilai |
|-----------|-------|
| Host | `localhost` (dev) / `db` (Docker) |
| Port | `3307` (mapped) / `3306` (internal) |
| User | `root` |
| Database | `ppdb_annur` |
| Driver | `mysql2` (Connection Pool) |

---

## 3. Tabel yang Digunakan

### 3.1 Tabel `users` — Pengguna Sistem

Menyimpan data autentikasi (email + password) dan peran pengguna.

| Kolom | Tipe Data | Constraint | Penjelasan |
|-------|-----------|------------|------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | ID unik pengguna |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email untuk login |
| `password` | VARCHAR(255) | NOT NULL | Password ter-hash (bcrypt) |
| `role` | ENUM('admin', 'calon_siswa') | NOT NULL, DEFAULT 'calon_siswa' | Peran pengguna |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu registrasi |

---

### 3.2 Tabel `calon_siswa` — Biodata Calon Siswa

Menyimpan biodata lengkap calon peserta didik baru.

| Kolom | Tipe Data | Constraint | Penjelasan |
|-------|-----------|------------|------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | ID unik |
| `user_id` | INT | NOT NULL, FOREIGN KEY → users(id) | Relasi ke tabel users |
| `nisn` | VARCHAR(20) | NOT NULL, UNIQUE | Nomor Induk Siswa Nasional |
| `nama_lengkap` | VARCHAR(255) | NOT NULL | Nama lengkap siswa |
| `tempat_lahir` | VARCHAR(100) | NOT NULL | Tempat lahir |
| `tanggal_lahir` | DATE | NOT NULL | Tanggal lahir |
| `jenis_kelamin` | ENUM('L', 'P') | NOT NULL | Laki-laki / Perempuan |
| `asal_sekolah` | VARCHAR(255) | NOT NULL | Sekolah asal (SMP/MTs) |
| `status_pendaftaran` | ENUM('belum_lengkap', 'menunggu_verifikasi', 'lulus', 'tidak_lulus') | DEFAULT 'belum_lengkap' | Status proses pendaftaran |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pendaftaran |

**Index:** `idx_nama_lengkap` (pencarian nama), `idx_status` (filter status)
**Relasi:** `user_id` → `users.id` (ON DELETE CASCADE)

---

### 3.3 Tabel `data_orang_tua` — Data Orang Tua/Wali

Menyimpan informasi orang tua atau wali calon siswa.

| Kolom | Tipe Data | Constraint | Penjelasan |
|-------|-----------|------------|------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | ID unik |
| `calon_siswa_id` | INT | NOT NULL, FOREIGN KEY → calon_siswa(id) | Relasi ke calon siswa |
| `nama_ayah` | VARCHAR(255) | NOT NULL | Nama ayah |
| `pekerjaan_ayah` | VARCHAR(100) | — | Pekerjaan ayah |
| `nama_ibu` | VARCHAR(255) | NOT NULL | Nama ibu |
| `pekerjaan_ibu` | VARCHAR(100) | — | Pekerjaan ibu |
| `no_telepon_wali` | VARCHAR(20) | NOT NULL | No. telepon wali |
| `alamat_lengkap` | TEXT | NOT NULL | Alamat lengkap |

**Relasi:** `calon_siswa_id` → `calon_siswa.id` (ON DELETE CASCADE)

---

### 3.4 Tabel `berkas_dokumen` — Berkas Pendaftaran

Menyimpan file dokumen yang diunggah calon siswa.

| Kolom | Tipe Data | Constraint | Penjelasan |
|-------|-----------|------------|------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | ID unik |
| `calon_siswa_id` | INT | NOT NULL, FOREIGN KEY → calon_siswa(id) | Relasi ke calon siswa |
| `jenis_dokumen` | ENUM('kk', 'akta_kelahiran', 'skl', 'pas_foto') | NOT NULL | Jenis dokumen |
| `file_path` | VARCHAR(255) | NOT NULL | Path file di server |
| `status_validasi` | ENUM('pending', 'valid', 'revisi') | DEFAULT 'pending' | Status verifikasi admin |

**Relasi:** `calon_siswa_id` → `calon_siswa.id` (ON DELETE CASCADE)

---

### 3.5 Tabel `berita` — Berita & Pengumuman

Menyimpan artikel berita/pengumuman sekolah dengan dukungan **soft delete**.

| Kolom | Tipe Data | Constraint | Penjelasan |
|-------|-----------|------------|------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | ID unik |
| `author_id` | INT | NOT NULL, FOREIGN KEY → users(id) | Penulis (admin) |
| `judul` | VARCHAR(255) | NOT NULL | Judul berita |
| `slug` | VARCHAR(255) | NOT NULL, UNIQUE | URL-friendly title |
| `konten` | LONGTEXT | NOT NULL | Isi berita (HTML) |
| `gambar_cover` | VARCHAR(255) | — | Path gambar cover |
| `status` | ENUM('draft', 'published') | DEFAULT 'draft' | Status publikasi |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu dibuat |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Waktu diperbarui |
| `deleted_at` | TIMESTAMP | NULL, DEFAULT NULL | Waktu dihapus (soft delete) |

**Index:** `idx_judul` (pencarian judul), `idx_deleted_at` (filter soft delete)
**Relasi:** `author_id` → `users.id` (ON DELETE CASCADE)

---

### Diagram Relasi Antar Tabel (ERD)

```
┌──────────────┐        ┌──────────────────┐       ┌─────────────────┐
│    users     │───1:1──│   calon_siswa     │──1:1──│ data_orang_tua  │
│              │        │                  │       │                 │
│  id (PK)     │        │  id (PK)         │       │  id (PK)        │
│  email       │        │  user_id (FK)    │       │  calon_siswa_id  │
│  password    │        │  nisn (UNIQUE)   │       │  nama_ayah       │
│  role        │        │  nama_lengkap    │       │  nama_ibu        │
│  created_at  │        │  tempat_lahir    │       │  no_telepon_wali │
│              │        │  tanggal_lahir   │       │  alamat_lengkap  │
│              │        │  jenis_kelamin   │       └─────────────────┘
│              │        │  asal_sekolah    │
│              │        │  status_pendaft. │       ┌─────────────────┐
│              │        │  created_at      │──1:N──│ berkas_dokumen  │
│              │        └──────────────────┘       │                 │
│              │                                   │  id (PK)        │
│              │                                   │  calon_siswa_id  │
│              │        ┌──────────────────┐       │  jenis_dokumen   │
│              │───1:N──│     berita        │       │  file_path       │
│              │        │                  │       │  status_validasi │
│              │        │  id (PK)         │       └─────────────────┘
│              │        │  author_id (FK)  │
│              │        │  judul           │
│              │        │  slug (UNIQUE)   │
│              │        │  konten          │
│              │        │  status          │
│              │        │  deleted_at      │
└──────────────┘        └──────────────────┘
```

---

## 4. Library yang Digunakan

### 4.1 Dependencies (Production)

| Library | Versi | Fungsi | Penjelasan |
|---------|-------|--------|------------|
| **express** | ^4.21.0 | Web Framework | Framework utama untuk membuat REST API, menangani routing, middleware, dan HTTP request/response |
| **mysql2** | ^3.11.0 | Database Driver | Driver MySQL untuk Node.js dengan dukungan Promise/async-await dan connection pooling |
| **bcryptjs** | ^3.0.3 | Password Hashing | Mengenkripsi password dengan algoritma bcrypt sebelum disimpan ke database. Mencegah password tersimpan dalam bentuk plain text |
| **jsonwebtoken** | ^9.0.2 | Autentikasi JWT | Membuat dan memverifikasi JSON Web Token untuk autentikasi stateless. Token dikirim di header `Authorization: Bearer <token>` |
| **dotenv** | ^16.4.5 | Environment Config | Memuat variabel environment dari file `.env` agar konfigurasi sensitif (DB password, JWT secret) tidak di-hardcode |
| **cors** | ^2.8.5 | CORS Security | Cross-Origin Resource Sharing — membatasi domain mana saja yang boleh mengakses API. Dikonfigurasi dengan whitelist di `.env` |
| **helmet** | ^8.2.0 | HTTP Security | Menambahkan 11+ header keamanan HTTP otomatis (X-Frame-Options, CSP, HSTS, dll) untuk mencegah serangan XSS, clickjacking, dll |
| **express-rate-limit** | ^8.5.2 | Rate Limiting | Membatasi jumlah request per IP per waktu. Global: 100 req/15 menit. Auth: 10 req/15 menit (anti brute-force) |
| **express-validator** | ^7.3.2 | Input Validation | Validasi dan sanitisasi input request secara deklaratif di level route (NISN 10 digit, email format, password min 6 char, dll) |
| **multer** | ^1.4.5 | File Upload | Middleware untuk menangani upload file multipart/form-data (dokumen KK, akta, SKL, pas foto) dengan batasan ukuran 5MB |
| **morgan** | ^1.10.1 | HTTP Logger | Mencatat setiap HTTP request ke console dengan format berwarna (method, URL, status code, response time) |
| **winston** | ^3.19.0 | Application Logger | Logger profesional dengan dukungan file rotation, level (error/warn/info/debug), dan format JSON + timestamp |
| **swagger-jsdoc** | ^6.3.0 | API Spec Generator | Menghasilkan spesifikasi OpenAPI 3.0 dari JSDoc comments di file route |
| **swagger-ui-express** | ^5.0.1 | API Docs UI | Menampilkan dokumentasi API interaktif di browser (`/api-docs`) dengan fitur "Try it out" |

### 4.2 DevDependencies (Development/Testing)

| Library | Versi | Fungsi | Penjelasan |
|---------|-------|--------|------------|
| **jest** | ^30.4.2 | Test Runner | Framework testing paling populer untuk JavaScript. Menjalankan, mengorganisir, dan melaporkan hasil test |
| **supertest** | ^7.2.2 | HTTP Testing | Mengirim HTTP request ke Express app tanpa menjalankan server. Memungkinkan integration testing yang cepat |
| **nodemon** | ^3.1.4 | Auto-restart | Otomatis restart server saat ada perubahan file selama development |

---

## 5. Daftar Endpoint API

### 5.1 Auth — Autentikasi (`/api/auth`)

| Method | Endpoint | Akses | Fungsi |
|--------|----------|-------|--------|
| POST | `/api/auth/register` | Public | Registrasi user baru |
| POST | `/api/auth/login` | Public | Login dan dapatkan JWT token |
| GET | `/api/auth/me` | Protected | Ambil profil user yang sedang login |

### 5.2 Siswa — PPDB (`/api/siswa`)

| Method | Endpoint | Akses | Fungsi |
|--------|----------|-------|--------|
| GET | `/api/siswa/cek-status/:nisn` | **Public** | Cek status pendaftaran berdasarkan NISN |
| GET | `/api/siswa/biodata` | Protected | Ambil biodata user |
| POST | `/api/siswa/biodata` | Protected | Buat biodata baru |
| PUT | `/api/siswa/biodata` | Protected | Update biodata |
| GET | `/api/siswa/orang-tua` | Protected | Ambil data orang tua |
| POST | `/api/siswa/orang-tua` | Protected | Buat data orang tua |
| PUT | `/api/siswa/orang-tua` | Protected | Update data orang tua |
| GET | `/api/siswa/dokumen` | Protected | Ambil daftar dokumen |
| POST | `/api/siswa/upload-dokumen` | Protected | Upload dokumen (multipart) |
| GET | `/api/siswa/all?page=1&limit=10&search=&status=` | Admin | Daftar semua pendaftar |
| PUT | `/api/siswa/status/:id` | Admin | Update status pendaftaran |
| PUT | `/api/siswa/validasi-dokumen/:id` | Admin | Validasi dokumen siswa |

### 5.3 Berita — Pengumuman (`/api/berita`)

| Method | Endpoint | Akses | Fungsi |
|--------|----------|-------|--------|
| GET | `/api/berita?page=1&limit=10&search=` | Public | List berita published |
| GET | `/api/berita/:slug` | Public | Detail berita by slug |
| GET | `/api/berita/admin/all?page=1&limit=10&search=` | Admin | List semua berita + draft |
| POST | `/api/berita` | Admin | Buat berita baru (multipart) |
| PUT | `/api/berita/:id` | Admin | Update berita |
| DELETE | `/api/berita/:id` | Admin | Soft delete berita |
| PUT | `/api/berita/restore/:id` | Admin | Restore berita yang dihapus |

### 5.4 Dashboard — Statistik (`/api/dashboard`)

| Method | Endpoint | Akses | Fungsi |
|--------|----------|-------|--------|
| GET | `/api/dashboard/stats` | Admin | Statistik agregasi (total pendaftar, breakdown status, dokumen, berita) |

**Total: 22 endpoint**

---

## 6. Fitur Keamanan

| Fitur | Implementasi | Penjelasan |
|-------|-------------|------------|
| **Password Hashing** | bcryptjs | Password tidak pernah disimpan plain text |
| **JWT Authentication** | jsonwebtoken | Token stateless, expire dalam 7 hari |
| **Role-Based Access** | Middleware `authorizeRoles` | Admin dan calon_siswa memiliki akses berbeda |
| **Input Validation** | express-validator | Validasi di level route sebelum masuk controller |
| **HTTP Security Headers** | Helmet (11+ headers) | X-Frame-Options, CSP, HSTS, dll |
| **CORS Whitelist** | Konfigurasi origin di `.env` | Hanya domain terdaftar yang bisa akses |
| **Rate Limiting** | Global: 100/15min, Auth: 10/15min | Anti DDoS dan brute-force |
| **Parameterized Queries** | mysql2 placeholder `?` | Mencegah SQL Injection |
| **Soft Delete** | Kolom `deleted_at` | Data tidak hilang permanen, bisa di-restore |

---

## 7. Fitur Tambahan

| Fitur | Penjelasan |
|-------|------------|
| **Pagination** | Semua endpoint list mendukung `?page=1&limit=10` dengan metadata (total, totalPages) |
| **Search** | Siswa: cari berdasarkan nama/NISN/asal sekolah. Berita: cari berdasarkan judul/konten |
| **Filter** | Siswa: filter berdasarkan status pendaftaran (`?status=lulus`) |
| **Soft Delete** | Berita yang dihapus tidak hilang permanen — bisa di-restore oleh admin |
| **File Upload** | Mendukung upload dokumen (KK, akta, SKL, pas foto) dengan validasi tipe dan ukuran |
| **Swagger UI** | Dokumentasi API interaktif di `http://localhost:5000/api-docs` |
| **Winston Logging** | Log disimpan ke file (`logs/error.log`, `logs/combined.log`) + console berwarna |
| **Database Indexing** | Index pada kolom yang sering di-search/filter untuk performa query |

---

## 8. Testing

### Hasil Test: 40/40 PASSED ✅

| Test Suite | File | Jumlah Test |
|------------|------|-------------|
| Auth API | `tests/auth.test.js` | 12 |
| Siswa/PPDB API | `tests/siswa.test.js` | 19 |
| Berita API | `tests/berita.test.js` | 6 |
| Dashboard API | `tests/dashboard.test.js` | 3 |

### Cara Menjalankan

```bash
cd ma-annur-be

# Jalankan semua test
npm test

# Test dengan output detail
npm run test:verbose

# Test dengan laporan coverage
npm run test:coverage
```

---

## 9. Cara Menjalankan Proyek

### Development (lokal)

```bash
# 1. Clone dan masuk ke direktori
cd ma-annur-be

# 2. Install dependencies
npm install

# 3. Jalankan MySQL via Docker
docker compose up db -d

# 4. Jalankan server development
npm run dev

# Server berjalan di http://localhost:5000
# Swagger docs di http://localhost:5000/api-docs
```

### Production (Docker)

```bash
# Jalankan semua service (API + MySQL)
docker compose up -d
```

---

## 10. Struktur Direktori

```
ma-annur-be/
│
├── config/                     # Konfigurasi
│   ├── db.js                   # Koneksi MySQL (connection pool)
│   ├── logger.js               # Konfigurasi Winston logger
│   └── swagger.js              # Konfigurasi Swagger/OpenAPI
│
├── controllers/                # Business Logic
│   ├── authController.js       # Login, register, profil
│   ├── beritaController.js     # CRUD berita + soft delete + restore
│   ├── dashboardController.js  # Statistik agregasi admin
│   └── siswaController.js      # PPDB, biodata, orang tua, dokumen
│
├── middlewares/                # Middleware
│   ├── auth.js                 # JWT verification + role authorization
│   ├── upload.js               # Multer file upload config
│   └── validate.js             # express-validator error handler
│
├── models/                     # Data Access Layer (SQL queries)
│   ├── beritaModel.js          # Query berita + search + soft delete
│   ├── berkasModel.js          # Query berkas dokumen
│   ├── calonSiswaModel.js      # Query calon siswa + search + filter
│   ├── orangTuaModel.js        # Query data orang tua
│   └── userModel.js            # Query user (auth)
│
├── routes/                     # Route Definitions + Swagger JSDoc
│   ├── authRoutes.js           # /api/auth/*
│   ├── beritaRoutes.js         # /api/berita/*
│   ├── dashboardRoutes.js      # /api/dashboard/*
│   └── siswaRoutes.js          # /api/siswa/*
│
├── validators/                 # Input Validation Rules
│   ├── authValidator.js        # Email, password rules
│   ├── beritaValidator.js      # Judul, konten rules
│   └── siswaValidator.js       # NISN, biodata, orang tua rules
│
├── tests/                      # Integration Tests
│   ├── setup.js                # Test environment setup
│   ├── auth.test.js            # 12 test cases
│   ├── siswa.test.js           # 19 test cases
│   ├── berita.test.js          # 6 test cases
│   └── dashboard.test.js       # 3 test cases
│
├── uploads/                    # Uploaded files (dokumen siswa)
├── logs/                       # Winston log files (auto-created)
│
├── app.js                      # Express app setup (middleware + routes)
├── index.js                    # Server entry point (app.listen)
├── init.sql                    # Database schema (5 tabel)
├── jest.config.js              # Jest test configuration
├── package.json                # Dependencies & scripts
├── Dockerfile                  # Docker image config
├── docker-compose.yml          # Docker Compose (API + MySQL)
├── .env                        # Environment variables
└── .gitignore                  # Git ignore rules
```
