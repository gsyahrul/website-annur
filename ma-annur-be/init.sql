-- ============================================
-- PPDB Madrasah Aliyah Annur - Database Schema
-- ============================================

USE ppdb_annur;

-- Tabel Pengguna
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'calon_siswa') NOT NULL DEFAULT 'calon_siswa',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Calon Siswa
CREATE TABLE IF NOT EXISTS calon_siswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    asal_sekolah VARCHAR(255) NOT NULL,
    jurusan VARCHAR(50),
    no_hp VARCHAR(20),
    alamat TEXT,
    kode_unik INT,
    nominal_pembayaran INT,
    jadwal_tes_tanggal DATE,
    jadwal_tes_waktu VARCHAR(10),
    jadwal_tes_lokasi VARCHAR(255),
    hasil_seleksi ENUM('lulus', 'tidak_lulus'),
    status_pendaftaran ENUM('belum_lengkap', 'menunggu_verifikasi', 'terverifikasi', 'lulus', 'tidak_lulus') DEFAULT 'belum_lengkap',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Index untuk pencarian nama dan asal sekolah
    INDEX idx_nama_lengkap (nama_lengkap),
    INDEX idx_status (status_pendaftaran)
);

-- Tabel Data Orang Tua / Wali
CREATE TABLE IF NOT EXISTS data_orang_tua (
    id INT AUTO_INCREMENT PRIMARY KEY,
    calon_siswa_id INT NOT NULL UNIQUE,
    nama_ayah VARCHAR(255) NOT NULL,
    pekerjaan_ayah VARCHAR(100),
    nama_ibu VARCHAR(255) NOT NULL,
    pekerjaan_ibu VARCHAR(100),
    no_telepon_wali VARCHAR(20) NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    FOREIGN KEY (calon_siswa_id) REFERENCES calon_siswa(id) ON DELETE CASCADE
);

-- Tabel Berkas Dokumen
CREATE TABLE IF NOT EXISTS berkas_dokumen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    calon_siswa_id INT NOT NULL,
    jenis_dokumen ENUM('kk', 'akta_kelahiran', 'skl', 'pas_foto') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    status_validasi ENUM('pending', 'valid', 'revisi') DEFAULT 'pending',
    FOREIGN KEY (calon_siswa_id) REFERENCES calon_siswa(id) ON DELETE CASCADE
);

-- Tabel Berita / Pengumuman (dengan Soft Delete)
CREATE TABLE IF NOT EXISTS berita (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    judul VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    konten LONGTEXT NOT NULL,
    gambar_cover VARCHAR(255),
    status ENUM('draft', 'published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Index untuk pencarian judul dan soft delete filter
    INDEX idx_judul (judul),
    INDEX idx_deleted_at (deleted_at)
);

-- Tabel Galeri
CREATE TABLE IF NOT EXISTS galeri (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    type ENUM('photo', 'video') DEFAULT 'photo',
    status ENUM('draft', 'published') DEFAULT 'published',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Buku (Perpustakaan Digital)
CREATE TABLE IF NOT EXISTS buku (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    badge VARCHAR(50),
    color VARCHAR(20) DEFAULT '#4a7a4a',
    file_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
