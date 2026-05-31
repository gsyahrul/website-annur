const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const { getStatistics } = require('../controllers/dashboardController');

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Statistik dan ringkasan data untuk admin
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Ambil statistik dashboard (Admin only)
 *     description: |
 *       Mengembalikan data agregasi dari seluruh sistem:
 *       - Total pendaftar dan breakdown per status
 *       - Statistik validasi dokumen
 *       - Statistik berita (published/draft)
 *       - 5 pendaftar terbaru
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data statistik dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStats'
 *       401:
 *         description: Token tidak tersedia
 *       403:
 *         description: Tidak memiliki izin (bukan admin)
 */
router.get('/stats', verifyToken, authorizeRoles('admin'), getStatistics);

module.exports = router;
