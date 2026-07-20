const BukuModel = require('../models/bukuModel');
const logger = require('../config/logger');

/**
 * GET /api/buku (PUBLIC)
 * Get books by category. Query: ?category=kelas-x
 */
const getBooksByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    let books;
    if (category) {
      books = await BukuModel.findByCategory(category);
    } else {
      books = await BukuModel.findAll();
    }
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    logger.error('Get Books Error', { error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

/**
 * GET /api/buku/admin/all (Admin)
 * Get all books.
 */
const getAllBooks = async (req, res) => {
  try {
    const books = await BukuModel.findAll();
    res.status(200).json({ success: true, data: books });
  } catch (error) {
    logger.error('Get All Books Error', { error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

/**
 * POST /api/buku (Admin only)
 * Create a new book. Supports optional file upload.
 */
const createBook = async (req, res) => {
  try {
    const { title, author, category, badge, color } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await BukuModel.create({ title, author, category, badge, color, file_url });
    logger.info('Buku dibuat', { id: result.id, title });
    res.status(201).json({
      success: true,
      message: 'Buku berhasil ditambahkan.',
      data: { id: result.id },
    });
  } catch (error) {
    logger.error('Create Book Error', { error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

/**
 * PUT /api/buku/:id (Admin only)
 * Update a book. Supports optional file upload.
 */
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await BukuModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
    }
    const { title, author, category, badge, color } = req.body;
    const file_url = req.file ? `/uploads/${req.file.filename}` : existing.file_url;
    await BukuModel.update(id, {
      title: title || existing.title,
      author: author || existing.author,
      category: category || existing.category,
      badge: badge !== undefined ? badge : existing.badge,
      color: color || existing.color,
      file_url,
    });
    logger.info('Buku diperbarui', { id, title: title || existing.title });
    res.status(200).json({ success: true, message: 'Buku berhasil diperbarui.' });
  } catch (error) {
    logger.error('Update Book Error', { id: req.params.id, error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

/**
 * DELETE /api/buku/:id (Admin only)
 */
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await BukuModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan.' });
    }
    await BukuModel.delete(id);
    logger.info('Buku dihapus', { id, title: existing.title });
    res.status(200).json({ success: true, message: 'Buku berhasil dihapus.' });
  } catch (error) {
    logger.error('Delete Book Error', { id: req.params.id, error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

module.exports = { getBooksByCategory, getAllBooks, createBook, updateBook, deleteBook };
