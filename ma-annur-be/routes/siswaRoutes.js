const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload');
const {
  biodataRules,
  orangTuaRules,
  uploadDokumenRules,
  updateStatusRules,
  validasiDokumenRules,
  cekStatusRules,
} = require('../validators/siswaValidator');
const {
  createBiodata,
  updateBiodata,
  getBiodata,
  getAllSiswa,
  updateStatus,
  cekStatusByNisn,
  createOrangTua,
  updateOrangTua,
  getOrangTua,
  uploadDokumen,
  getDokumen,
  validasiDokumen,
} = require('../controllers/siswaController');

/**
 * @swagger
 * tags:
 *   name: Siswa
 *   description: Manajemen data calon siswa PPDB
 */

/**
 * @swagger
 * /api/siswa/cek-status/{nisn}:
 *   get:
 *     summary: Cek status pendaftaran berdasarkan NISN (publik)
 *     tags: [Siswa]
 *     parameters:
 *       - in: path
 *         name: nisn
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{10}$'
 *         description: NISN calon siswa (10 digit)
 *         example: '1234567890'
 *     responses:
 *       200:
 *         description: Data status pendaftaran
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     nisn:
 *                       type: string
 *                     nama_lengkap:
 *                       type: string
 *                     asal_sekolah:
 *                       type: string
 *                     status_pendaftaran:
 *                       type: string
 *                       enum: [belum_lengkap, menunggu_verifikasi, lulus, tidak_lulus]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: NISN tidak ditemukan
 *       422:
 *         description: Format NISN tidak valid
 */
router.get('/cek-status/:nisn', cekStatusRules, validate, cekStatusByNisn);

// All routes below require authentication
router.use(verifyToken);

/**
 * @swagger
 * /api/siswa/biodata:
 *   get:
 *     summary: Ambil biodata calon siswa yang sedang login
 *     tags: [Siswa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data biodata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BiodataResponse'
 *       404:
 *         description: Biodata belum diisi
 *   post:
 *     summary: Buat biodata calon siswa baru
 *     tags: [Siswa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BiodataRequest'
 *     responses:
 *       201:
 *         description: Biodata berhasil disimpan
 *       409:
 *         description: Biodata sudah ada atau NISN duplikat
 *       422:
 *         description: Validasi gagal
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *   put:
 *     summary: Update biodata calon siswa
 *     tags: [Siswa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BiodataRequest'
 *     responses:
 *       200:
 *         description: Biodata berhasil diperbarui
 *       404:
 *         description: Biodata belum ada
 *       422:
 *         description: Validasi gagal
 */
router.get('/biodata', getBiodata);
router.post('/biodata', biodataRules, validate, createBiodata);
router.put('/biodata', biodataRules, validate, updateBiodata);

/**
 * @swagger
 * /api/siswa/orang-tua:
 *   get:
 *     summary: Ambil data orang tua/wali
 *     tags: [Siswa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data orang tua
 *       404:
 *         description: Data belum diisi
 *   post:
 *     summary: Buat data orang tua/wali
 *     tags: [Siswa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrangTuaRequest'
 *     responses:
 *       201:
 *         description: Data orang tua berhasil disimpan
 *       400:
 *         description: Biodata belum diisi
 *       409:
 *         description: Data orang tua sudah ada
 *       422:
 *         description: Validasi gagal
 *   put:
 *     summary: Update data orang tua/wali
 *     tags: [Siswa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrangTuaRequest'
 *     responses:
 *       200:
 *         description: Data orang tua berhasil diperbarui
 *       404:
 *         description: Data belum ada
 *       422:
 *         description: Validasi gagal
 */
router.get('/orang-tua', getOrangTua);
router.post('/orang-tua', orangTuaRules, validate, createOrangTua);
router.put('/orang-tua', orangTuaRules, validate, updateOrangTua);

/**
 * @swagger
 * /api/siswa/dokumen:
 *   get:
 *     summary: Ambil semua dokumen yang sudah diupload
 *     tags: [Siswa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar dokumen
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       jenis_dokumen:
 *                         type: string
 *                         enum: [kk, akta_kelahiran, skl, pas_foto]
 *                       file_path:
 *                         type: string
 *                       status_validasi:
 *                         type: string
 *                         enum: [pending, valid, revisi]
 */
router.get('/dokumen', getDokumen);

/**
 * @swagger
 * /api/siswa/upload-dokumen:
 *   post:
 *     summary: Upload dokumen pendaftaran
 *     tags: [Siswa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - dokumen
 *               - jenis_dokumen
 *             properties:
 *               dokumen:
 *                 type: string
 *                 format: binary
 *                 description: File dokumen (JPEG, PNG, atau PDF, max 5MB)
 *               jenis_dokumen:
 *                 type: string
 *                 enum: [kk, akta_kelahiran, skl, pas_foto]
 *                 description: Jenis dokumen yang diupload
 *     responses:
 *       201:
 *         description: Dokumen berhasil diunggah
 *       200:
 *         description: Dokumen berhasil diperbarui (re-upload)
 *       400:
 *         description: File tidak diunggah atau biodata belum diisi
 *       422:
 *         description: Jenis dokumen tidak valid
 */
router.post('/upload-dokumen', upload.single('dokumen'), uploadDokumenRules, validate, uploadDokumen);

/**
 * @swagger
 * /api/siswa/all:
 *   get:
 *     summary: Ambil semua data pendaftar (Admin only)
 *     tags: [Siswa]
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
 *         description: Daftar semua pendaftar dengan pagination
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
 *                     $ref: '#/components/schemas/BiodataResponse'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: Tidak memiliki izin (bukan admin)
 */
router.get('/all', authorizeRoles('admin'), getAllSiswa);

/**
 * @swagger
 * /api/siswa/status/{id}:
 *   put:
 *     summary: Update status pendaftaran siswa (Admin only)
 *     tags: [Siswa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID calon siswa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status_pendaftaran
 *             properties:
 *               status_pendaftaran:
 *                 type: string
 *                 enum: [belum_lengkap, menunggu_verifikasi, lulus, tidak_lulus]
 *     responses:
 *       200:
 *         description: Status berhasil diperbarui
 *       404:
 *         description: Calon siswa tidak ditemukan
 *       422:
 *         description: Status tidak valid
 */
router.put('/status/:id', authorizeRoles('admin'), updateStatusRules, validate, updateStatus);

/**
 * @swagger
 * /api/siswa/validasi-dokumen/{id}:
 *   put:
 *     summary: Validasi dokumen siswa (Admin only)
 *     tags: [Siswa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID dokumen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status_validasi
 *             properties:
 *               status_validasi:
 *                 type: string
 *                 enum: [pending, valid, revisi]
 *     responses:
 *       200:
 *         description: Status validasi berhasil diperbarui
 *       404:
 *         description: Dokumen tidak ditemukan
 *       422:
 *         description: Status validasi tidak valid
 */
router.put('/validasi-dokumen/:id', authorizeRoles('admin'), validasiDokumenRules, validate, validasiDokumen);

module.exports = router;
