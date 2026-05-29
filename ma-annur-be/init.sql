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
    user_id INT NOT NULL,
    nisn VARCHAR(20) NOT NULL UNIQUE,
    nama_lengkap VARCHAR(255) NOT NULL,
    tempat_lahir VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    asal_sekolah VARCHAR(255) NOT NULL,
    status_pendaftaran ENUM('belum_lengkap', 'menunggu_verifikasi', 'lulus', 'tidak_lulus') DEFAULT 'belum_lengkap',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel Data Orang Tua / Wali
CREATE TABLE IF NOT EXISTS data_orang_tua (
    id INT AUTO_INCREMENT PRIMARY KEY,
    calon_siswa_id INT NOT NULL,
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

-- Tabel Berita / Pengumuman
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
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);
