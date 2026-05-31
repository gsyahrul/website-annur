/**
 * jest.config.js — Konfigurasi Jest Test Runner
 * 
 * Jest adalah framework testing paling populer untuk Node.js.
 * File ini mengatur bagaimana Jest menjalankan test.
 */
module.exports = {
  // Environment: Node.js (bukan browser)
  testEnvironment: 'node',

  // Cari file test di folder tests/
  testMatch: ['**/tests/**/*.test.js'],

  // Jalankan setup file sebelum semua test
  setupFiles: ['./tests/setup.js'],

  // Timeout per test (10 detik, cukup untuk DB operations)
  testTimeout: 10000,

  // Tampilkan detail setiap test yang jalan
  verbose: true,
};
