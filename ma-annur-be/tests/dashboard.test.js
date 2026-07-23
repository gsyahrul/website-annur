/**
 * tests/dashboard.test.js — Integration Test untuk Dashboard API
 */

require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const mockQuery = jest.fn();
const mockGetConnection = jest.fn().mockResolvedValue({ release: jest.fn() });
jest.mock('../config/db', () => ({ query: mockQuery, getConnection: mockGetConnection }));

const app = require('../app');

const generateAdminToken = () =>
  jwt.sign({ id: 99, email: 'admin@test.com', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

const generateSiswaToken = () =>
  jwt.sign({ id: 1, email: 'siswa@test.com', role: 'calon_siswa' }, process.env.JWT_SECRET, { expiresIn: '1h' });

beforeEach(() => { mockQuery.mockReset(); });

describe('Dashboard API', () => {

  describe('GET /api/dashboard/stats', () => {

    it('harus mengembalikan statistik lengkap (admin)', async () => {
      const token = generateAdminToken();

      mockQuery
        .mockResolvedValueOnce([[{           // status breakdown
          total_pendaftar: 45, belum_lengkap: 10,
          menunggu_verifikasi: 20, lulus: 12, tidak_lulus: 3,
        }]])
        .mockResolvedValueOnce([[{           // dokumen stats
          total_dokumen: 120, pending: 30, valid: 80, revisi: 10,
        }]])
        .mockResolvedValueOnce([[{           // berita stats
          total_berita: 8, published: 6, draft: 2,
        }]])
        .mockResolvedValueOnce([[{           // galeri stats
          total_galeri: 5,
        }]])
        .mockResolvedValueOnce([[{           // buku stats
          total_buku: 10,
        }]])
        .mockResolvedValueOnce([[            // pendaftar terbaru
          { id: 1, nisn: '1234567890', nama_lengkap: 'Ahmad' },
        ]]);

      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total_pendaftar).toBe(45);
      expect(res.body.data.status_breakdown.lulus).toBe(12);
      expect(res.body.data.dokumen_stats.total_dokumen).toBe(120);
      expect(res.body.data.berita_stats.total_berita).toBe(8);
      expect(res.body.data.pendaftar_terbaru).toHaveLength(1);
    });

    it('harus menolak akses non-admin (calon_siswa)', async () => {
      const token = generateSiswaToken();

      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('tidak memiliki izin');
    });

    it('harus menolak tanpa token', async () => {
      const res = await request(app).get('/api/dashboard/stats');
      expect(res.status).toBe(401);
    });
  });
});
