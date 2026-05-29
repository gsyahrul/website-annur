const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const {
  createBiodata,
  updateBiodata,
  getBiodata,
  getAllSiswa,
  updateStatus,
  createOrangTua,
  updateOrangTua,
  getOrangTua,
  uploadDokumen,
  getDokumen,
  validasiDokumen,
} = require('../controllers/siswaController');

// All routes below require authentication
router.use(verifyToken);

// --- Biodata ---
router.get('/biodata', getBiodata);
router.post('/biodata', createBiodata);
router.put('/biodata', updateBiodata);

// --- Data Orang Tua ---
router.get('/orang-tua', getOrangTua);
router.post('/orang-tua', createOrangTua);
router.put('/orang-tua', updateOrangTua);

// --- Upload Dokumen ---
router.get('/dokumen', getDokumen);
router.post('/upload-dokumen', upload.single('dokumen'), uploadDokumen);

// --- Admin Only ---
router.get('/all', authorizeRoles('admin'), getAllSiswa);
router.put('/status/:id', authorizeRoles('admin'), updateStatus);
router.put('/validasi-dokumen/:id', authorizeRoles('admin'), validasiDokumen);

module.exports = router;
