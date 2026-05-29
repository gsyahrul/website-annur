const CalonSiswaModel = require('../models/calonSiswaModel');
const OrangTuaModel = require('../models/orangTuaModel');
const BerkasModel = require('../models/berkasModel');

// =============================================
// BIODATA CALON SISWA
// =============================================

/**
 * POST /api/siswa/biodata
 * Create biodata for the authenticated user (calon_siswa).
 */
const createBiodata = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah } = req.body;

    // Validation
    if (!nisn || !nama_lengkap || !tempat_lahir || !tanggal_lahir || !jenis_kelamin || !asal_sekolah) {
      return res.status(400).json({
        success: false,
        message: 'Semua field biodata wajib diisi.',
      });
    }

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
    });

    res.status(201).json({
      success: true,
      message: 'Biodata berhasil disimpan.',
      data: { id: result.id },
    });
  } catch (error) {
    console.error('Create Biodata Error:', error);

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
 */
const updateBiodata = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah } = req.body;

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
    });

    res.status(200).json({
      success: true,
      message: 'Biodata berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Update Biodata Error:', error);

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
    console.error('Get Biodata Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

/**
 * GET /api/siswa/all (Admin only)
 * Get all registered students.
 */
const getAllSiswa = async (req, res) => {
  try {
    const students = await CalonSiswaModel.findAll();
    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Get All Siswa Error:', error);
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
 */
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_pendaftaran } = req.body;

    const validStatuses = ['belum_lengkap', 'menunggu_verifikasi', 'lulus', 'tidak_lulus'];
    if (!validStatuses.includes(status_pendaftaran)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilih salah satu: ${validStatuses.join(', ')}`,
      });
    }

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
    console.error('Update Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
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
 */
const createOrangTua = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, no_telepon_wali, alamat_lengkap } = req.body;

    // Validation
    if (!nama_ayah || !nama_ibu || !no_telepon_wali || !alamat_lengkap) {
      return res.status(400).json({
        success: false,
        message: 'Nama ayah, nama ibu, no telepon wali, dan alamat wajib diisi.',
      });
    }

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
    console.error('Create OrangTua Error:', error);
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
    console.error('Update OrangTua Error:', error);
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
    console.error('Get OrangTua Error:', error);
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
 */
const uploadDokumen = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jenis_dokumen } = req.body;

    // Validate jenis_dokumen
    const validJenis = ['kk', 'akta_kelahiran', 'skl', 'pas_foto'];
    if (!jenis_dokumen || !validJenis.includes(jenis_dokumen)) {
      return res.status(400).json({
        success: false,
        message: `Jenis dokumen tidak valid. Pilih salah satu: ${validJenis.join(', ')}`,
      });
    }

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
    console.error('Upload Dokumen Error:', error);
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
    console.error('Get Dokumen Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/siswa/validasi-dokumen/:id (Admin only)
 * Validate a specific document.
 */
const validasiDokumen = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_validasi } = req.body;

    const validStatuses = ['pending', 'valid', 'revisi'];
    if (!validStatuses.includes(status_validasi)) {
      return res.status(400).json({
        success: false,
        message: `Status validasi tidak valid. Pilih salah satu: ${validStatuses.join(', ')}`,
      });
    }

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
    console.error('Validasi Dokumen Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

module.exports = {
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
};
