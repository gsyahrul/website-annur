const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const { createBeritaRules, updateBeritaRules } = require('../validators/beritaValidator');
const {
  getPublishedBerita,
  getAllBerita,
  getBeritaBySlug,
  createBerita,
  updateBerita,
  deleteBerita,
  restoreBerita,
} = require('../controllers/beritaController');

/**
 * @swagger
 * tags:
 *   name: Berita
 *   description: Manajemen berita dan pengumuman sekolah
 */

/**
 * @swagger
 * /api/berita:
 *   get:
 *     summary: Ambil semua berita yang sudah dipublish (publik)
 *     tags: [Berita]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Daftar berita published dengan pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BeritaResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get('/', getPublishedBerita);

/**
 * @swagger
 * /api/berita/admin/all:
 *   get:
 *     summary: Ambil semua berita termasuk draft (Admin only)
 *     tags: [Berita]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Jumlah data per halaman
 *     responses:
 *       200:
 *         description: Daftar semua berita dengan pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BeritaResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: Tidak memiliki izin
 */
router.get('/admin/all', verifyToken, authorizeRoles('admin'), getAllBerita);

/**
 * @swagger
 * /api/berita/{slug}:
 *   get:
 *     summary: Ambil detail berita berdasarkan slug (publik)
 *     tags: [Berita]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug berita
 *         example: pengumuman-ppdb-2026
 *     responses:
 *       200:
 *         description: Detail berita
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BeritaResponse'
 *       404:
 *         description: Berita tidak ditemukan
 */
router.get('/:slug', getBeritaBySlug);

/**
 * @swagger
 * /api/berita:
 *   post:
 *     summary: Buat berita baru (Admin only)
 *     tags: [Berita]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - judul
 *               - konten
 *             properties:
 *               judul:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 255
 *                 description: Judul berita
 *               konten:
 *                 type: string
 *                 minLength: 10
 *                 description: Isi berita (bisa berisi HTML)
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *               gambar_cover:
 *                 type: string
 *                 format: binary
 *                 description: Gambar cover berita (JPEG/PNG, max 5MB)
 *     responses:
 *       201:
 *         description: Berita berhasil dibuat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     slug:
 *                       type: string
 *       422:
 *         description: Validasi gagal
 */
router.post('/', verifyToken, authorizeRoles('admin'), upload.single('gambar_cover'), createBeritaRules, validate, createBerita);

/**
 * @swagger
 * /api/berita/{id}:
 *   put:
 *     summary: Update berita (Admin only)
 *     tags: [Berita]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID berita
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               judul:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 255
 *               konten:
 *                 type: string
 *                 minLength: 10
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               gambar_cover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Berita berhasil diperbarui
 *       404:
 *         description: Berita tidak ditemukan
 *       422:
 *         description: Validasi gagal
 *   delete:
 *     summary: Hapus berita (Admin only)
 *     tags: [Berita]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID berita
 *     responses:
 *       200:
 *         description: Berita berhasil dihapus
 *       404:
 *         description: Berita tidak ditemukan
 */
router.put('/:id', verifyToken, authorizeRoles('admin'), upload.single('gambar_cover'), updateBeritaRules, validate, updateBerita);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteBerita);

/**
 * @swagger
 * /api/berita/restore/{id}:
 *   put:
 *     summary: Restore berita yang sudah dihapus (Admin only)
 *     tags: [Berita]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID berita yang dihapus
 *     responses:
 *       200:
 *         description: Berita berhasil dikembalikan
 *       404:
 *         description: Berita yang dihapus tidak ditemukan
 */
router.put('/restore/:id', verifyToken, authorizeRoles('admin'), restoreBerita);

module.exports = router;
