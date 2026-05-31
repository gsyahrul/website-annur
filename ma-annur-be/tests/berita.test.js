/**
 * tests/berita.test.js — Integration Test untuk Endpoint Berita
 */

require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockQuery = jest.fn();
const mockGetConnection = jest.fn().mockResolvedValue({ release: jest.fn() });
jest.mock('../config/db', () => ({ query: mockQuery, getConnection: mockGetConnection }));

const app = require('../app');

const generateAdminToken = () => {
  return jwt.sign(
    { id: 99, email: 'admin@test.com', role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

beforeEach(() => { mockQuery.mockReset(); });

describe('Berita API', () => {

  describe('GET /api/berita (Public)', () => {
    it('harus mengembalikan berita published dengan pagination', async () => {
      mockQuery
        .mockResolvedValueOnce([[
          { id: 1, judul: 'Berita 1', slug: 'berita-1', status: 'published' },
        ]])
        .mockResolvedValueOnce([[{ total: 1 }]]);

      const res = await request(app).get('/api/berita?page=1&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.pagination).toHaveProperty('totalPages');
    });
  });

  describe('GET /api/berita/:slug (Public)', () => {
    it('harus mengembalikan detail berita by slug', async () => {
      mockQuery.mockResolvedValueOnce([[{
        id: 1, judul: 'PPDB 2026', slug: 'ppdb-2026', konten: '<p>Info PPDB</p>',
        author_email: 'admin@test.com',
      }]]);

      const res = await request(app).get('/api/berita/ppdb-2026');
      expect(res.status).toBe(200);
      expect(res.body.data.judul).toBe('PPDB 2026');
    });

    it('harus return 404 jika slug tidak ditemukan', async () => {
      mockQuery.mockResolvedValueOnce([[]]);
      const res = await request(app).get('/api/berita/tidak-ada');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/berita (Admin)', () => {
    it('harus berhasil membuat berita baru', async () => {
      const token = generateAdminToken();
      mockQuery
        .mockResolvedValueOnce([[]])                // findBySlug → kosong
        .mockResolvedValueOnce([{ insertId: 1 }]);  // create → berhasil

      const res = await request(app)
        .post('/api/berita')
        .set('Authorization', `Bearer ${token}`)
        .field('judul', 'Pengumuman PPDB 2026')
        .field('konten', 'Pendaftaran PPDB dibuka mulai 1 Juni 2026.')
        .field('status', 'published');

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('slug');
    });

    it('harus menolak judul kurang dari 5 karakter', async () => {
      const token = generateAdminToken();
      const res = await request(app)
        .post('/api/berita')
        .set('Authorization', `Bearer ${token}`)
        .field('judul', 'Ab')
        .field('konten', 'Konten yang cukup panjang untuk lolos validasi.');

      expect(res.status).toBe(422);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'judul' })])
      );
    });
  });

  describe('DELETE /api/berita/:id (Admin)', () => {
    it('harus berhasil menghapus berita', async () => {
      const token = generateAdminToken();
      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }]])       // findById
        .mockResolvedValueOnce([{ affectedRows: 1 }]); // delete

      const res = await request(app)
        .delete('/api/berita/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('berhasil dihapus');
    });
  });
});
