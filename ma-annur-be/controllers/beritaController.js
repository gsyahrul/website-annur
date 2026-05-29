const BeritaModel = require('../models/beritaModel');

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
 * Get all published news articles.
 */
const getPublishedBerita = async (req, res) => {
  try {
    const berita = await BeritaModel.findAllPublished();
    res.status(200).json({
      success: true,
      data: berita,
    });
  } catch (error) {
    console.error('Get Published Berita Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data berita.',
      error: error.message,
    });
  }
};

/**
 * GET /api/berita/all (Admin)
 * Get all news articles including drafts.
 */
const getAllBerita = async (req, res) => {
  try {
    const berita = await BeritaModel.findAll();
    res.status(200).json({
      success: true,
      data: berita,
    });
  } catch (error) {
    console.error('Get All Berita Error:', error);
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
    console.error('Get Berita By Slug Error:', error);
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

    if (!judul || !konten) {
      return res.status(400).json({
        success: false,
        message: 'Judul dan konten wajib diisi.',
      });
    }

    // Generate slug from title
    let slug = generateSlug(judul);

    // Ensure slug uniqueness by appending timestamp if needed
    const existingSlug = await BeritaModel.findBySlug(slug);
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Handle cover image (uploaded via Multer)
    const gambar_cover = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await BeritaModel.create({
      author_id: authorId,
      judul,
      slug,
      konten,
      gambar_cover,
      status: status || 'draft',
    });

    res.status(201).json({
      success: true,
      message: 'Berita berhasil dibuat.',
      data: { id: result.id, slug },
    });
  } catch (error) {
    console.error('Create Berita Error:', error);
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

    // Generate new slug if title changed
    let slug = existing.slug;
    if (judul && judul !== existing.judul) {
      slug = generateSlug(judul);
      const duplicateSlug = await BeritaModel.findBySlug(slug);
      if (duplicateSlug && duplicateSlug.id !== parseInt(id)) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Handle cover image update
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

    res.status(200).json({
      success: true,
      message: 'Berita berhasil diperbarui.',
    });
  } catch (error) {
    console.error('Update Berita Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui berita.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/berita/:id (Admin only)
 * Delete a news article.
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

    await BeritaModel.delete(id);

    res.status(200).json({
      success: true,
      message: 'Berita berhasil dihapus.',
    });
  } catch (error) {
    console.error('Delete Berita Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus berita.',
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
};
