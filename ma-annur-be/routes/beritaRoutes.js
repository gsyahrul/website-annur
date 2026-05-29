const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  getPublishedBerita,
  getAllBerita,
  getBeritaBySlug,
  createBerita,
  updateBerita,
  deleteBerita,
} = require('../controllers/beritaController');

// --- Public Routes ---
router.get('/', getPublishedBerita);
router.get('/:slug', getBeritaBySlug);

// --- Protected Routes (Admin only) ---
router.get('/admin/all', verifyToken, authorizeRoles('admin'), getAllBerita);
router.post('/', verifyToken, authorizeRoles('admin'), upload.single('gambar_cover'), createBerita);
router.put('/:id', verifyToken, authorizeRoles('admin'), upload.single('gambar_cover'), updateBerita);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteBerita);

module.exports = router;
