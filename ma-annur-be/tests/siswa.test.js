/**
 * tests/siswa.test.js — Integration Test untuk Endpoint Siswa/PPDB
 */
require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockQuery = jest.fn();
const mockGetConnection = jest.fn().mockResolvedValue({ release: jest.fn() });
jest.mock('../config/db', () => ({ query: mockQuery, getConnection: mockGetConnection }));

const app = require('../app');

const generateToken = (overrides = {}) =>
  jwt.sign({ id: 1, email: 'siswa@test.com', role: 'calon_siswa', ...overrides },
    process.env.JWT_SECRET, { expiresIn: '1h' });

const generateAdminToken = () =>
  generateToken({ id: 99, email: 'admin@test.com', role: 'admin' });

const validBiodata = {
  nisn: '1234567890', nama_lengkap: 'Ahmad Fauzi', tempat_lahir: 'Jakarta',
  tanggal_lahir: '2008-05-15', jenis_kelamin: 'L', asal_sekolah: 'MTs Annur',
};

const validOrangTua = {
  nama_ayah: 'Budi Santoso', pekerjaan_ayah: 'Wiraswasta',
  nama_ibu: 'Siti Aminah', pekerjaan_ibu: 'Ibu Rumah Tangga',
  no_telepon_wali: '081234567890',
  alamat_lengkap: 'Jl. Merdeka No. 10, Kota Jakarta Selatan',
};

beforeEach(() => { mockQuery.mockReset(); });

// ================================================================
// BIODATA
// ================================================================
describe('Biodata API', () => {
  describe('POST /api/siswa/biodata', () => {
    it('harus berhasil menyimpan biodata', async () => {
      const token = generateToken();
      mockQuery
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app).post('/api/siswa/biodata')
        .set('Authorization', `Bearer ${token}`).send(validBiodata);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('harus menolak NISN bukan 10 digit', async () => {
      const token = generateToken();
      const res = await request(app).post('/api/siswa/biodata')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validBiodata, nisn: '12345' });

      expect(res.status).toBe(422);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'nisn' })])
      );
    });

    it('harus menolak tanggal lahir di masa depan', async () => {
      const token = generateToken();
      const res = await request(app).post('/api/siswa/biodata')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validBiodata, tanggal_lahir: '2030-01-01' });

      expect(res.status).toBe(422);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'tanggal_lahir' })])
      );
    });

    it('harus menolak jenis kelamin selain L/P', async () => {
      const token = generateToken();
      const res = await request(app).post('/api/siswa/biodata')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validBiodata, jenis_kelamin: 'X' });

      expect(res.status).toBe(422);
    });

    it('harus menolak jika biodata sudah ada', async () => {
      const token = generateToken();
      mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);

      const res = await request(app).post('/api/siswa/biodata')
        .set('Authorization', `Bearer ${token}`).send(validBiodata);

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/siswa/biodata', () => {
    it('harus mengembalikan biodata user', async () => {
      const token = generateToken();
      mockQuery.mockResolvedValueOnce([[{ id: 1, ...validBiodata, status_pendaftaran: 'belum_lengkap' }]]);

      const res = await request(app).get('/api/siswa/biodata')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.nisn).toBe('1234567890');
    });

    it('harus return 404 jika belum diisi', async () => {
      const token = generateToken();
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app).get('/api/siswa/biodata')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});

// ================================================================
// ORANG TUA
// ================================================================
describe('Orang Tua API', () => {
  describe('POST /api/siswa/orang-tua', () => {
    it('harus berhasil menyimpan data orang tua', async () => {
      const token = generateToken();
      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ insertId: 1 }]);

      const res = await request(app).post('/api/siswa/orang-tua')
        .set('Authorization', `Bearer ${token}`).send(validOrangTua);

      expect(res.status).toBe(201);
    });

    it('harus menolak no telepon tidak valid', async () => {
      const token = generateToken();
      const res = await request(app).post('/api/siswa/orang-tua')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...validOrangTua, no_telepon_wali: '123' });

      expect(res.status).toBe(422);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'no_telepon_wali' })])
      );
    });

    it('harus menolak jika biodata belum diisi', async () => {
      const token = generateToken();
      mockQuery.mockResolvedValueOnce([[]]);

      const res = await request(app).post('/api/siswa/orang-tua')
        .set('Authorization', `Bearer ${token}`).send(validOrangTua);

      expect(res.status).toBe(400);
    });
  });
});

// ================================================================
// CEK STATUS NISN (PUBLIC)
// ================================================================
describe('Cek Status NISN (Public)', () => {
  it('harus mengembalikan status tanpa auth', async () => {
    mockQuery.mockResolvedValueOnce([[{
      nisn: '1234567890', nama_lengkap: 'Ahmad', status_pendaftaran: 'menunggu_verifikasi',
    }]]);

    const res = await request(app).get('/api/siswa/cek-status/1234567890');

    expect(res.status).toBe(200);
    expect(res.body.data.status_pendaftaran).toBe('menunggu_verifikasi');
  });

  it('harus return 404 jika NISN tidak ditemukan', async () => {
    mockQuery.mockResolvedValueOnce([[]]);
    const res = await request(app).get('/api/siswa/cek-status/9999999999');
    expect(res.status).toBe(404);
  });

  it('harus menolak NISN bukan 10 digit', async () => {
    const res = await request(app).get('/api/siswa/cek-status/12345');
    expect(res.status).toBe(422);
  });
});

// ================================================================
// ADMIN OPERATIONS
// ================================================================
describe('Admin Siswa API', () => {
  describe('GET /api/siswa/all', () => {
    it('harus mengembalikan daftar + pagination (admin)', async () => {
      const token = generateAdminToken();
      mockQuery
        .mockResolvedValueOnce([[{ id: 1, nama_lengkap: 'Ahmad' }, { id: 2, nama_lengkap: 'Budi' }]])
        .mockResolvedValueOnce([[{ total: 2 }]]);

      const res = await request(app).get('/api/siswa/all?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toEqual({ page: 1, limit: 10, total: 2, totalPages: 1 });
    });

    it('harus menolak non-admin', async () => {
      const token = generateToken();
      const res = await request(app).get('/api/siswa/all')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/siswa/status/:id', () => {
    it('harus berhasil update status (admin)', async () => {
      const token = generateAdminToken();
      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).put('/api/siswa/status/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status_pendaftaran: 'lulus' });

      expect(res.status).toBe(200);
    });

    it('harus menolak status tidak valid', async () => {
      const token = generateAdminToken();
      const res = await request(app).put('/api/siswa/status/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status_pendaftaran: 'ngawur' });
      expect(res.status).toBe(422);
    });
  });

  describe('PUT /api/siswa/validasi-dokumen/:id', () => {
    it('harus berhasil validasi dokumen (admin)', async () => {
      const token = generateAdminToken();
      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const res = await request(app).put('/api/siswa/validasi-dokumen/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status_validasi: 'valid' });
      expect(res.status).toBe(200);
    });

    it('harus menolak status validasi tidak valid', async () => {
      const token = generateAdminToken();
      const res = await request(app).put('/api/siswa/validasi-dokumen/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status_validasi: 'asal' });
      expect(res.status).toBe(422);
    });
  });
});
