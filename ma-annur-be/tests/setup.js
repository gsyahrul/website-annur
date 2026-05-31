/**
 * tests/setup.js — Test Environment Setup
 * 
 * File ini dijalankan SEBELUM semua test dimulai.
 * Fungsinya: mengatur environment variables khusus untuk testing.
 */

// Set NODE_ENV ke 'test' agar:
// - Morgan (logger) tidak aktif → output test tetap bersih
// - Rate limiter tidak aktif → tidak memblokir test yang banyak request
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_for_jest';
process.env.JWT_EXPIRES_IN = '1h';
