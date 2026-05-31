const BeritaModel = require('../models/beritaModel');
const logger = require('../config/logger');

/**
 * Helper: Generate slug from title.
 */
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * GET /api/berita (PUBLIC)
 * Get all published news articles with pagination and search.
 * Query params: ?page=1&limit=10&search=ppdb
 */
const getPublishedBerita = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';

    const result = await BeritaModel.findAllPublished({ page, limit, search });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Get Published Berita Error', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data berita.',
      error: error.message,
    });
  }
};

/**
 * GET /api/berita/admin/all (Admin)
 * Get all news articles including drafts with pagination and search.
 * Query params: ?page=1&limit=10&search=pengumuman
 */
const getAllBerita = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = req.query.search || '';

    const result = await BeritaModel.findAll({ page, limit, search });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Get All Berita Error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

/**
 * GET /api/berita/:slug (PUBLIC)
 * Get a single news article by slug.
 */
const getBeritaBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const berita = await BeritaModel.findBySlug(slug);

    if (!berita) {
      return res.status(404).json({
        success: false,
        message: 'Berita tidak ditemukan.',
      });
    }

    res.status(200).json({
      success: true,
      data: berita,
    });
  } catch (error) {
    logger.error('Get Berita By Slug Error', { slug: req.params.slug, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan.',
      error: error.message,
    });
  }
};

/**
 * POST /api/berita (Admin only)
 * Create a new news article.
 */
const createBerita = async (req, res) => {
  try {
    const authorId = req.user.id;
    const { judul, konten, status } = req.body;

    let slug = generateSlug(judul);

    const existingSlug = await BeritaModel.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const gambar_cover = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await BeritaModel.create({
      author_id: authorId,
      judul, slug, konten, gambar_cover,
      status: status || 'draft',
    });

    logger.info('Berita dibuat', { id: result.id, judul, slug, authorId });

    res.status(201).json({
      success: true,
      message: 'Berita berhasil dibuat.',
      data: { id: result.id, slug },
    });
  } catch (error) {
    logger.error('Create Berita Error', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat membuat berita.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/berita/:id (Admin only)
 * Update an existing news article.
 */
const updateBerita = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, konten, status } = req.body;

    const existing = await BeritaModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Berita tidak ditemukan.',
      });
    }

    let slug = existing.slug;
    if (judul && judul !== existing.judul) {
      slug = generateSlug(judul);
      const duplicateSlug = await BeritaModel.findBySlug(slug);
      if (duplicateSlug && duplicateSlug.id !== parseInt(id)) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    const gambar_cover = req.file
      ? `/uploads/${req.file.filename}`
      : existing.gambar_cover;

    await BeritaModel.update(id, {
      judul: judul || existing.judul,
      slug,
      konten: konten || existing.konten,
      gambar_cover,
      status: status || existing.status,
    });

    logger.info('Berita diperbarui', { id, judul: judul || existing.judul });

    res.status(200).json({
      success: true,
      message: 'Berita berhasil diperbarui.',
    });
  } catch (error) {
    logger.error('Update Berita Error', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui berita.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/berita/:id (Admin only)
 * Soft delete — data tidak dihapus permanen, hanya ditandai deleted_at.
 */
const deleteBerita = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await BeritaModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Berita tidak ditemukan.',
      });
    }

    await BeritaModel.softDelete(id);

    logger.info('Berita di-soft-delete', { id, judul: existing.judul });

    res.status(200).json({
      success: true,
      message: 'Berita berhasil dihapus.',
    });
  } catch (error) {
    logger.error('Delete Berita Error', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus berita.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/berita/restore/:id (Admin only)
 * Restore soft-deleted article — kembalikan dari "sampah".
 */
const restoreBerita = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await BeritaModel.findDeletedById(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Berita yang dihapus tidak ditemukan.',
      });
    }

    await BeritaModel.restore(id);

    logger.info('Berita di-restore', { id, judul: deleted.judul });

    res.status(200).json({
      success: true,
      message: 'Berita berhasil dikembalikan.',
    });
  } catch (error) {
    logger.error('Restore Berita Error', { id: req.params.id, error: error.message });
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengembalikan berita.',
      error: error.message,
    });
  }
};

module.exports = {
  getPublishedBerita,
  getAllBerita,
  getBeritaBySlug,
  createBerita,
  updateBerita,
  deleteBerita,
  restoreBerita,
};
