/**
 * tests/auth.test.js — Integration Test untuk Endpoint Auth
 * 
 * ===================================================================
 * PENJELASAN TESTING:
 * ===================================================================
 * 
 * 1. SUPERTEST: Library yang memungkinkan kita mengirim HTTP request
 *    ke Express app TANPA perlu menjalankan server.
 *    - request(app).post('/api/auth/register') → kirim POST request
 *    - .send({ ... }) → kirim body JSON
 *    - .expect(201) → pastikan status code = 201
 * 
 * 2. JEST.MOCK: Kita "meniru" (mock) database agar test tidak
 *    membutuhkan MySQL yang sedang berjalan.
 *    - jest.mock('../config/db') → ganti koneksi DB asli dengan tiruan
 *    - mockResolvedValue → tentukan return value dari query tiruan
 * 
 * 3. DESCRIBE/IT: Struktur organisasi test
 *    - describe('Auth API') → grup test untuk modul Auth
 *    - it('should register') → satu test case spesifik
 * 
 * 4. EXPECT: Assertion — memastikan output sesuai harapan
 *    - expect(res.body.success).toBe(true) → pastikan response sukses
 * ===================================================================
 */

// Setup test environment
require('./setup');

const request = require('supertest');

// ================================================================
// MOCK DATABASE
// ================================================================
// jest.mock() HARUS dipanggil sebelum require app.
// Ini mengganti modul '../config/db' dengan versi tiruan.
// Sehingga semua model yang require db.js akan mendapat mock ini.
// ================================================================
const mockQuery = jest.fn();
const mockGetConnection = jest.fn().mockResolvedValue({ release: jest.fn() });

jest.mock('../config/db', () => ({
  query: mockQuery,
  getConnection: mockGetConnection,
}));

const app = require('../app');

// ================================================================
// HELPER: Generate JWT token untuk test yang butuh autentikasi
// ================================================================
const jwt = require('jsonwebtoken');

const generateTestToken = (payload = {}) => {
  const defaultPayload = {
    id: 1,
    email: 'test@example.com',
    role: 'calon_siswa',
    ...payload,
  };
  return jwt.sign(defaultPayload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// ================================================================
// RESET MOCK sebelum setiap test
// ================================================================
beforeEach(() => {
  // Bersihkan semua mock data dari test sebelumnya
  // Agar setiap test berjalan independen (tidak saling mempengaruhi)
  mockQuery.mockReset();
});

// ================================================================
// TEST SUITE: Auth API
// ================================================================
describe('Auth API', () => {

  // ============================================================
  // TEST GROUP: POST /api/auth/register
  // ============================================================
  describe('POST /api/auth/register', () => {

    it('harus berhasil register dengan data valid', async () => {
      // ARRANGE: Siapkan mock database
      // Query 1: Cek apakah email sudah ada → return kosong (belum ada)
      // Query 2: INSERT user baru → return insertId
      mockQuery
        .mockResolvedValueOnce([[]])                           // findByEmail → tidak ditemukan
        .mockResolvedValueOnce([{ insertId: 1 }]);             // create → berhasil

      // ACT: Kirim request register
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'siswa@example.com',
          password: 'rahasia123',
        });

      // ASSERT: Periksa response
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Registrasi berhasil.');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('email', 'siswa@example.com');
      expect(res.body.data).toHaveProperty('role', 'calon_siswa');
    });

    it('harus menolak jika email format tidak valid', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'bukan-email',
          password: 'rahasia123',
        });

      // Validator mengembalikan 422 dengan detail error
      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validasi gagal.');
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
        ])
      );
    });

    it('harus menolak jika password kurang dari 6 karakter', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'siswa@example.com',
          password: '123',   // Kurang dari 6 karakter
        });

      expect(res.status).toBe(422);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('6'),
          }),
        ])
      );
    });

    it('harus menolak jika email dan password kosong', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(422);
      expect(res.body.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('harus menolak jika email sudah terdaftar', async () => {
      // Mock: email sudah ada di database
      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        email: 'siswa@example.com',
        password: '$2a$10$hashedpassword',
        role: 'calon_siswa',
      }]]);

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'siswa@example.com',
          password: 'rahasia123',
        });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe('Email sudah terdaftar.');
    });
  });

  // ============================================================
  // TEST GROUP: POST /api/auth/login
  // ============================================================
  describe('POST /api/auth/login', () => {

    it('harus berhasil login dengan kredensial valid', async () => {
      // Mock: user ditemukan di database
      // bcryptjs.hash('rahasia123', 10) → hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('rahasia123', 10);

      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        email: 'siswa@example.com',
        password: hashedPassword,
        role: 'calon_siswa',
      }]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'siswa@example.com',
          password: 'rahasia123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', 'siswa@example.com');
    });

    it('harus menolak jika email tidak terdaftar', async () => {
      // Mock: user tidak ditemukan
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'tidakada@example.com',
          password: 'rahasia123',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Email atau password salah.');
    });

    it('harus menolak jika password salah', async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('rahasia123', 10);

      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        email: 'siswa@example.com',
        password: hashedPassword,
        role: 'calon_siswa',
      }]]);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'siswa@example.com',
          password: 'salahpassword',
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Email atau password salah.');
    });

    it('harus menolak jika body kosong', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(res.status).toBe(422);
    });
  });

  // ============================================================
  // TEST GROUP: GET /api/auth/me
  // ============================================================
  describe('GET /api/auth/me', () => {

    it('harus mengembalikan profil user dengan token valid', async () => {
      const token = generateTestToken({ id: 1, email: 'siswa@example.com' });

      // Mock: findById berhasil
      mockQuery.mockResolvedValueOnce([[{
        id: 1,
        email: 'siswa@example.com',
        role: 'calon_siswa',
        created_at: '2026-05-30T00:00:00Z',
      }]]);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('siswa@example.com');
    });

    it('harus menolak tanpa token', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Token tidak tersedia');
    });

    it('harus menolak dengan token tidak valid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token_palsu_12345');

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('tidak valid');
    });
  });
});
