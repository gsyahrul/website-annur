const CalonSiswaModel = require('../models/calonSiswaModel');
const OrangTuaModel = require('../models/orangTuaModel');
const BerkasModel = require('../models/berkasModel');
const logger = require('../config/logger');

// =============================================
// BIODATA CALON SISWA
// =============================================

/**
 * POST /api/siswa/biodata
 * Create biodata for the authenticated user (calon_siswa).
 * Input validation handled by siswaValidator middleware.
 */
const createBiodata = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah, jurusan, no_hp, alamat } = req.body;

    // Check if biodata already exists
    const existing = await CalonSiswaModel.findByUserId(userId);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Biodata sudah ada. Gunakan PUT untuk mengupdate.',
      });
    }

    const result = await CalonSiswaModel.create({
      user_id: userId,
      nisn,
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      asal_sekolah,
      jurusan,
      no_hp,
      alamat,
    });

    res.status(201).json({
      success: true,
      message: 'Biodata berhasil disimpan.',
      data: { id: result.id, kode_unik: result.kode_unik, nominal_pembayaran: result.nominal_pembayaran },
    });
  } catch (error) {
    logger.error('Create Biodata Error', { error: error.message, userId });

    // Handle duplicate NISN
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'NISN sudah terdaftar.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyimpan biodata.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/siswa/biodata
 * Update biodata for the authenticated user.
 * Input validation handled by siswaValidator middleware.
 */
const updateBiodata = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah, jurusan, no_hp, alamat } = req.body;

    // Check if biodata exists
    const existing = await CalonSiswaModel.findByUserId(userId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Biodata belum ada. Gunakan POST untuk membuat.',
      });
    }

    await CalonSiswaModel.update(userId, {
      nisn,
      nama_lengkap,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      asal_sekolah,
      jurusan,
      no_hp,
      alamat,
    });

    res.status(200).json({
      success: true,
      message: 'Biodata berhasil diperbarui.',
    });
  } catch (error) {
    logger.error('Update Biodata Error', { error: error.message, userId });

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'NISN sudah terdaftar oleh siswa lain.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui biodata.',
      error: error.message,
    });
  }
};

/**
 * GET /api/siswa/biodata
 * Get biodata of the authenticated user.
 */
const getBiodata = async (req, res) => {
  try {
    const userId = req.user.id;

    const biodata = await CalonSiswaModel.findByUserId(userId);
    if (!biodata) {
      return res.status(404).json({
        success: false,
        message: 'Biodata belum diisi.',
      });
    }

    res.status(200).json({
      success: true,
      data: biodata,
    });
  } catch (error) {
    logger.error('Get Biodata Error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

/**
 * GET /api/siswa/all (Admin only)
 * Get all registered students with pagination.
 * Query params: ?page=1&limit=10
 */
const getAllSiswa = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';
    const status = req.query.status || '';

    const result = await CalonSiswaModel.findAll({ page, limit, search, status });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Get All Siswa Error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/siswa/status/:id (Admin only)
 * Update student admission status.
 * Input validation handled by siswaValidator middleware.
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pendaftaran } = req.body;

    const siswa = await CalonSiswaModel.findById(id);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: 'Data calon siswa tidak ditemukan.',
      });
    }

    await CalonSiswaModel.updateStatus(id, status_pendaftaran);

    res.status(200).json({
      success: true,
      message: 'Status pendaftaran berhasil diperbarui.',
    });
  } catch (error) {
    logger.error('Update Status Error', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

/**
 * GET /api/siswa/cek-status/:nisn (PUBLIC — no auth required)
 * Check registration status by NISN.
 * Input validation handled by siswaValidator middleware.
 */
const cekStatusByNisn = async (req, res) => {
  try {
    const { nisn } = req.params;

    const siswa = await CalonSiswaModel.findByNisn(nisn);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: 'Data pendaftaran dengan NISN tersebut tidak ditemukan.',
      });
    }

    res.status(200).json({
      success: true,
      data: siswa,
    });
  } catch (error) {
    logger.error('Cek Status By NISN Error', { nisn: req.params.nisn, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengecek status.',
      error: error.message,
    });
  }
};

// =============================================
// DATA ORANG TUA
// =============================================

/**
 * POST /api/siswa/orang-tua
 * Create parent data linked to the authenticated user's calon_siswa record.
 * Input validation handled by siswaValidator middleware.
 */
const createOrangTua = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, no_telepon_wali, alamat_lengkap } = req.body;

    // Find calon_siswa record
    const siswa = await CalonSiswaModel.findByUserId(userId);
    if (!siswa) {
      return res.status(400).json({
        success: false,
        message: 'Isi biodata terlebih dahulu sebelum mengisi data orang tua.',
      });
    }

    // Check if parent data already exists
    const existing = await OrangTuaModel.findByCalonSiswaId(siswa.id);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Data orang tua sudah ada. Gunakan PUT untuk mengupdate.',
      });
    }

    const result = await OrangTuaModel.create({
      calon_siswa_id: siswa.id,
      nama_ayah,
      pekerjaan_ayah,
      nama_ibu,
      pekerjaan_ibu,
      no_telepon_wali,
      alamat_lengkap,
    });

    res.status(201).json({
      success: true,
      message: 'Data orang tua berhasil disimpan.',
      data: { id: result.id },
    });
  } catch (error) {
    logger.error('Create OrangTua Error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyimpan data orang tua.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/siswa/orang-tua
 * Update parent data.
 * Input validation handled by siswaValidator middleware.
 */
const updateOrangTua = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, no_telepon_wali, alamat_lengkap } = req.body;

    const siswa = await CalonSiswaModel.findByUserId(userId);
    if (!siswa) {
      return res.status(400).json({
        success: false,
        message: 'Biodata belum diisi.',
      });
    }

    const existing = await OrangTuaModel.findByCalonSiswaId(siswa.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Data orang tua belum ada. Gunakan POST untuk membuat.',
      });
    }

    await OrangTuaModel.update(siswa.id, {
      nama_ayah,
      pekerjaan_ayah,
      nama_ibu,
      pekerjaan_ibu,
      no_telepon_wali,
      alamat_lengkap,
    });

    res.status(200).json({
      success: true,
      message: 'Data orang tua berhasil diperbarui.',
    });
  } catch (error) {
    logger.error('Update OrangTua Error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui data orang tua.',
      error: error.message,
    });
  }
};

/**
 * GET /api/siswa/orang-tua
 * Get parent data of authenticated user.
 */
const getOrangTua = async (req, res) => {
  try {
    const userId = req.user.id;

    const siswa = await CalonSiswaModel.findByUserId(userId);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: 'Biodata belum diisi.',
      });
    }

    const orangTua = await OrangTuaModel.findByCalonSiswaId(siswa.id);
    if (!orangTua) {
      return res.status(404).json({
        success: false,
        message: 'Data orang tua belum diisi.',
      });
    }

    res.status(200).json({
      success: true,
      data: orangTua,
    });
  } catch (error) {
    logger.error('Get OrangTua Error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

// =============================================
// UPLOAD DOKUMEN
// =============================================

/**
 * POST /api/siswa/upload-dokumen
 * Upload a document file (Multer handles the file).
 * Input validation for jenis_dokumen handled by siswaValidator middleware.
 */
const uploadDokumen = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jenis_dokumen } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File dokumen wajib diunggah.',
      });
    }

    // Find calon_siswa record
    const siswa = await CalonSiswaModel.findByUserId(userId);
    if (!siswa) {
      return res.status(400).json({
        success: false,
        message: 'Isi biodata terlebih dahulu sebelum mengunggah dokumen.',
      });
    }

    const filePath = `/uploads/${req.file.filename}`;

    // Auto-update student status to menunggu_verifikasi when uploading proof of payment
    if (jenis_dokumen === 'bukti_pembayaran' && siswa.status_pendaftaran === 'belum_lengkap') {
      await CalonSiswaModel.updateStatus(siswa.id, 'menunggu_verifikasi');
    }

    // Check if this document type already exists (update instead of create)
    const existingDoc = await BerkasModel.findByJenis(siswa.id, jenis_dokumen);
    if (existingDoc) {
      await BerkasModel.updateByJenis(siswa.id, jenis_dokumen, filePath);
      return res.status(200).json({
        success: true,
        message: 'Dokumen berhasil diperbarui.',
        data: { file_path: filePath },
      });
    }

    const result = await BerkasModel.create({
      calon_siswa_id: siswa.id,
      jenis_dokumen,
      file_path: filePath,
    });

    res.status(201).json({
      success: true,
      message: 'Dokumen berhasil diunggah.',
      data: {
        id: result.id,
        file_path: filePath,
      },
    });
  } catch (error) {
    logger.error('Upload Dokumen Error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengunggah dokumen.',
      error: error.message,
    });
  }
};

/**
 * GET /api/siswa/dokumen
 * Get all documents for the authenticated user.
 */
const getDokumen = async (req, res) => {
  try {
    const userId = req.user.id;

    const siswa = await CalonSiswaModel.findByUserId(userId);
    if (!siswa) {
      return res.status(404).json({
        success: false,
        message: 'Biodata belum diisi.',
      });
    }

    const dokumen = await BerkasModel.findByCalonSiswaId(siswa.id);

    res.status(200).json({
      success: true,
      data: dokumen,
    });
  } catch (error) {
    logger.error('Get Dokumen Error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

/**
 * GET /api/siswa/dokumen/:siswaId (Admin only)
 * Get all documents for a specific student by calon_siswa_id.
 */
const getDokumenBySiswaId = async (req, res) => {
  try {
    const { siswaId } = req.params;
    const dokumen = await BerkasModel.findByCalonSiswaId(parseInt(siswaId));
    res.status(200).json({ success: true, data: dokumen });
  } catch (error) {
    logger.error('Get Dokumen By Siswa ID Error', { error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

/**
 * PUT /api/siswa/validasi-dokumen/:id (Admin only)
 * Validate a specific document.
 * Input validation handled by siswaValidator middleware.
 */
const validasiDokumen = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_validasi } = req.body;

    const doc = await BerkasModel.findById(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Dokumen tidak ditemukan.',
      });
    }

    await BerkasModel.updateValidasi(id, status_validasi);

    res.status(200).json({
      success: true,
      message: 'Status validasi dokumen berhasil diperbarui.',
    });
  } catch (error) {
    logger.error('Validasi Dokumen Error', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/siswa/verify/:id (Admin only)
 * Verify registration and set test schedule.
 */
const verifyRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const { jadwal_tes_tanggal, jadwal_tes_waktu, jadwal_tes_lokasi } = req.body;

    const siswa = await CalonSiswaModel.findById(id);
    if (!siswa) {
      return res.status(404).json({ success: false, message: 'Data calon siswa tidak ditemukan.' });
    }

    await CalonSiswaModel.updateVerification(id, {
      status_pendaftaran: 'terverifikasi',
      jadwal_tes_tanggal,
      jadwal_tes_waktu,
      jadwal_tes_lokasi,
    });

    res.status(200).json({ success: true, message: 'Pendaftaran berhasil diverifikasi dan jadwal tes telah diatur.' });
  } catch (error) {
    logger.error('Verify Registration Error', { id: req.params.id, error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

/**
 * PUT /api/siswa/hasil-seleksi/:id (Admin only)
 * Set final selection result.
 */
const updateHasilSeleksi = async (req, res) => {
  try {
    const { id } = req.params;
    const { hasil_seleksi } = req.body;

    const siswa = await CalonSiswaModel.findById(id);
    if (!siswa) {
      return res.status(404).json({ success: false, message: 'Data calon siswa tidak ditemukan.' });
    }

    await CalonSiswaModel.updateHasilSeleksi(id, hasil_seleksi);

    res.status(200).json({ success: true, message: 'Hasil seleksi berhasil diperbarui.' });
  } catch (error) {
    logger.error('Update Hasil Seleksi Error', { id: req.params.id, error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

module.exports = {
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
  getDokumenBySiswaId,
  validasiDokumen,
  verifyRegistration,
  updateHasilSeleksi,
};
