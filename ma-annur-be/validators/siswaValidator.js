const { body, param } = require('express-validator');

/**
 * Validation rules for POST/PUT /api/siswa/biodata
 */
const biodataRules = [
  body('nisn')
    .trim()
    .notEmpty().withMessage('NISN wajib diisi.')
    .matches(/^\d{10}$/).withMessage('NISN harus terdiri dari 10 digit angka.'),

  body('nama_lengkap')
    .trim()
    .notEmpty().withMessage('Nama lengkap wajib diisi.')
    .isLength({ min: 3 }).withMessage('Nama lengkap minimal 3 karakter.')
    .isLength({ max: 255 }).withMessage('Nama lengkap maksimal 255 karakter.'),

  body('tempat_lahir')
    .trim()
    .notEmpty().withMessage('Tempat lahir wajib diisi.')
    .isLength({ min: 2 }).withMessage('Tempat lahir minimal 2 karakter.')
    .isLength({ max: 100 }).withMessage('Tempat lahir maksimal 100 karakter.'),

  body('tanggal_lahir')
    .notEmpty().withMessage('Tanggal lahir wajib diisi.')
    .isISO8601().withMessage('Format tanggal lahir tidak valid (gunakan YYYY-MM-DD).')
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error('Tanggal lahir tidak boleh di masa depan.');
      }
      return true;
    }),

  body('jenis_kelamin')
    .notEmpty().withMessage('Jenis kelamin wajib diisi.')
    .isIn(['L', 'P']).withMessage('Jenis kelamin harus berupa "L" (Laki-laki) atau "P" (Perempuan).'),

  body('asal_sekolah')
    .trim()
    .notEmpty().withMessage('Asal sekolah wajib diisi.')
    .isLength({ min: 3 }).withMessage('Asal sekolah minimal 3 karakter.')
    .isLength({ max: 255 }).withMessage('Asal sekolah maksimal 255 karakter.'),
];

/**
 * Validation rules for POST/PUT /api/siswa/orang-tua
 */
const orangTuaRules = [
  body('nama_ayah')
    .trim()
    .notEmpty().withMessage('Nama ayah wajib diisi.')
    .isLength({ min: 3 }).withMessage('Nama ayah minimal 3 karakter.')
    .isLength({ max: 255 }).withMessage('Nama ayah maksimal 255 karakter.'),

  body('pekerjaan_ayah')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 }).withMessage('Pekerjaan ayah maksimal 100 karakter.'),

  body('nama_ibu')
    .trim()
    .notEmpty().withMessage('Nama ibu wajib diisi.')
    .isLength({ min: 3 }).withMessage('Nama ibu minimal 3 karakter.')
    .isLength({ max: 255 }).withMessage('Nama ibu maksimal 255 karakter.'),

  body('pekerjaan_ibu')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 }).withMessage('Pekerjaan ibu maksimal 100 karakter.'),

  body('no_telepon_wali')
    .trim()
    .notEmpty().withMessage('No telepon wali wajib diisi.')
    .matches(/^\d{10,15}$/).withMessage('No telepon wali harus terdiri dari 10-15 digit angka.'),

  body('alamat_lengkap')
    .trim()
    .notEmpty().withMessage('Alamat lengkap wajib diisi.')
    .isLength({ min: 10 }).withMessage('Alamat lengkap minimal 10 karakter.'),
];

/**
 * Validation rules for POST /api/siswa/upload-dokumen
 */
const uploadDokumenRules = [
  body('jenis_dokumen')
    .notEmpty().withMessage('Jenis dokumen wajib diisi.')
    .isIn(['kk', 'akta_kelahiran', 'skl', 'pas_foto', 'bukti_pembayaran'])
    .withMessage('Jenis dokumen tidak valid. Pilih salah satu: kk, akta_kelahiran, skl, pas_foto, bukti_pembayaran.'),
];

/**
 * Validation rules for PUT /api/siswa/status/:id
 */
const updateStatusRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID harus berupa angka positif.'),

  body('status_pendaftaran')
    .notEmpty().withMessage('Status pendaftaran wajib diisi.')
    .isIn(['belum_lengkap', 'menunggu_verifikasi', 'terverifikasi', 'lulus', 'tidak_lulus'])
    .withMessage('Status tidak valid. Pilih: belum_lengkap, menunggu_verifikasi, terverifikasi, lulus, tidak_lulus.'),
];

/**
 * Validation rules for PUT /api/siswa/validasi-dokumen/:id
 */
const validasiDokumenRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID harus berupa angka positif.'),

  body('status_validasi')
    .notEmpty().withMessage('Status validasi wajib diisi.')
    .isIn(['pending', 'valid', 'revisi'])
    .withMessage('Status validasi tidak valid. Pilih: pending, valid, revisi.'),
];

/**
 * Validation rules for GET /api/siswa/cek-status/:nisn (public)
 */
const cekStatusRules = [
  param('nisn')
    .matches(/^\d{10}$/).withMessage('NISN harus terdiri dari 10 digit angka.'),
];

module.exports = {
  biodataRules,
  orangTuaRules,
  uploadDokumenRules,
  updateStatusRules,
  validasiDokumenRules,
  cekStatusRules,
};
