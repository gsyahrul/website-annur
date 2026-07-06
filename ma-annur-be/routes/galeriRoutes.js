const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getPublishedGaleri,
  getAllGaleri,
  createGaleri,
  deleteGaleri,
} = require('../controllers/galeriController');

/**
 * @swagger
 * tags:
 *   name: Galeri
 *   description: Manajemen galeri foto dan video kegiatan
 */

/**
 * @swagger
 * /api/galeri:
 *   get:
 *     summary: Ambil semua galeri yang sudah dipublish (publik)
 *     tags: [Galeri]
 *     responses:
 *       200:
 *         description: Daftar galeri published
 */
router.get('/', getPublishedGaleri);

/**
 * @swagger
 * /api/galeri/admin/all:
 *   get:
 *     summary: Ambil semua galeri termasuk draft (Admin only)
 *     tags: [Galeri]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua galeri
 */
router.get('/admin/all', verifyToken, authorizeRoles('admin'), getAllGaleri);

/**
 * @swagger
 * /api/galeri:
 *   post:
 *     summary: Tambah item galeri baru (Admin only)
 *     tags: [Galeri]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [photo, video]
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Galeri berhasil ditambahkan
 */
router.post('/', verifyToken, authorizeRoles('admin'), upload.single('image'), createGaleri);

/**
 * @swagger
 * /api/galeri/{id}:
 *   delete:
 *     summary: Hapus item galeri (Admin only)
 *     tags: [Galeri]
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
 *         description: Galeri berhasil dihapus
 *       404:
 *         description: Galeri tidak ditemukan
 */
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteGaleri);

module.exports = router;
