const { body, param } = require('express-validator');

/**
 * Validation rules for POST /api/berita
 */
const createBeritaRules = [
  body('judul')
    .trim()
    .notEmpty().withMessage('Judul wajib diisi.')
    .isLength({ min: 5 }).withMessage('Judul minimal 5 karakter.')
    .isLength({ max: 255 }).withMessage('Judul maksimal 255 karakter.'),

  body('konten')
    .trim()
    .notEmpty().withMessage('Konten wajib diisi.')
    .isLength({ min: 10 }).withMessage('Konten minimal 10 karakter.'),

  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('Status harus berupa "draft" atau "published".'),
];

/**
 * Validation rules for PUT /api/berita/:id
 */
const updateBeritaRules = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID harus berupa angka positif.'),

  body('judul')
    .optional()
    .trim()
    .isLength({ min: 5 }).withMessage('Judul minimal 5 karakter.')
    .isLength({ max: 255 }).withMessage('Judul maksimal 255 karakter.'),

  body('konten')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Konten minimal 10 karakter.'),

  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('Status harus berupa "draft" atau "published".'),
];

module.exports = { createBeritaRules, updateBeritaRules };
