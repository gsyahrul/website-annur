const { body } = require('express-validator');

/**
 * Validation rules for POST /api/auth/register
 */
const registerRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password wajib diisi.')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter.')
    .isLength({ max: 100 }).withMessage('Password maksimal 100 karakter.'),

  body('role')
    .optional()
    .isIn(['admin', 'calon_siswa']).withMessage('Role harus berupa "admin" atau "calon_siswa".'),
];

/**
 * Validation rules for POST /api/auth/login
 */
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi.')
    .isEmail().withMessage('Format email tidak valid.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password wajib diisi.'),
];

module.exports = { registerRules, loginRules };
