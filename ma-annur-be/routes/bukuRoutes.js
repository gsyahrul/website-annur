const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getBooksByCategory,
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bukuController');

/**
 * @swagger
 * tags:
 *   name: Buku
 *   description: Manajemen perpustakaan digital (Ruang Baca)
 */

/**
 * @swagger
 * /api/buku:
 *   get:
 *     summary: Ambil buku berdasarkan kategori (publik)
 *     tags: [Buku]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter berdasarkan kategori (kelas-x, kelas-xi, kelas-xii, hiburan, sejarah, referensi)
 *     responses:
 *       200:
 *         description: Daftar buku
 */
router.get('/', getBooksByCategory);

/**
 * @swagger
 * /api/buku/admin/all:
 *   get:
 *     summary: Ambil semua buku (Admin only)
 *     tags: [Buku]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua buku
 */
router.get('/admin/all', verifyToken, authorizeRoles('admin'), getAllBooks);

/**
 * @swagger
 * /api/buku:
 *   post:
 *     summary: Tambah buku baru (Admin only)
 *     tags: [Buku]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - author
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               badge:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Buku berhasil ditambahkan
 */
router.post('/', verifyToken, authorizeRoles('admin'), upload.single('file'), createBook);

/**
 * @swagger
 * /api/buku/{id}:
 *   put:
 *     summary: Update buku (Admin only)
 *     tags: [Buku]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               category:
 *                 type: string
 *               badge:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       200:
 *         description: Buku berhasil diperbarui
 *       404:
 *         description: Buku tidak ditemukan
 *   delete:
 *     summary: Hapus buku (Admin only)
 *     tags: [Buku]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Buku berhasil dihapus
 *       404:
 *         description: Buku tidak ditemukan
 */
router.put('/:id', verifyToken, authorizeRoles('admin'), upload.single('file'), updateBook);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteBook);

module.exports = router;
