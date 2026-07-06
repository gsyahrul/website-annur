const GaleriModel = require('../models/galeriModel');
const logger = require('../config/logger');

/**
 * GET /api/galeri (PUBLIC)
 * Get all published galeri items.
 */
const getPublishedGaleri = async (req, res) => {
  try {
    const items = await GaleriModel.findAllPublished();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    logger.error('Get Published Galeri Error', { error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

/**
 * GET /api/galeri/admin/all (Admin)
 * Get all galeri items including draft.
 */
const getAllGaleri = async (req, res) => {
  try {
    const items = await GaleriModel.findAll();
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    logger.error('Get All Galeri Error', { error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

/**
 * POST /api/galeri (Admin only)
 * Create a new galeri item. Supports multipart upload via multer.
 */
const createGaleri = async (req, res) => {
  try {
    const { title, description, type, status } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await GaleriModel.create({ title, description, image, type, status });
    logger.info('Galeri dibuat', { id: result.id, title });

    res.status(201).json({
      success: true,
      message: 'Galeri berhasil ditambahkan.',
      data: { id: result.id, image },
    });
  } catch (error) {
    logger.error('Create Galeri Error', { error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

/**
 * DELETE /api/galeri/:id (Admin only)
 */
const deleteGaleri = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await GaleriModel.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Item galeri tidak ditemukan.' });
    }
    await GaleriModel.delete(id);
    logger.info('Galeri dihapus', { id, title: existing.title });
    res.status(200).json({ success: true, message: 'Galeri berhasil dihapus.' });
  } catch (error) {
    logger.error('Delete Galeri Error', { id: req.params.id, error: error.message });
    res.status(500).json({ success: false, message: 'Terjadi kesalahan.', error: error.message });
  }
};

module.exports = { getPublishedGaleri, getAllGaleri, createGaleri, deleteGaleri };
