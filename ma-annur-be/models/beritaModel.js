const pool = require('../config/db');

const BeritaModel = {
  /**
   * Find all published news with pagination and search.
   * Soft-deleted articles (deleted_at != NULL) are excluded.
   * @param {Object} options - { page, limit, search }
   */
  async findAllPublished({ page = 1, limit = 10, search = '' } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = ["b.status = 'published'", 'b.deleted_at IS NULL'];

    if (search) {
      conditions.push('(b.judul LIKE ? OR b.konten LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const [rows] = await pool.query(
      `SELECT b.id, b.judul, b.slug, b.gambar_cover, b.status, b.created_at, b.updated_at, u.email AS author_email
       FROM berita b
       JOIN users u ON b.author_id = u.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM berita b ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  /**
   * Find all news (including drafts) with pagination and search. Admin use.
   * Soft-deleted articles are excluded by default.
   * @param {Object} options - { page, limit, search, includeDeleted }
   */
  async findAll({ page = 1, limit = 10, search = '', includeDeleted = false } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    if (!includeDeleted) {
      conditions.push('b.deleted_at IS NULL');
    }

    if (search) {
      conditions.push('(b.judul LIKE ? OR b.konten LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await pool.query(
      `SELECT b.*, u.email AS author_email
       FROM berita b
       JOIN users u ON b.author_id = u.id
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM berita b ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    return {
      data: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  async findBySlug(slug) {
    const [rows] = await pool.query(
      `SELECT b.*, u.email AS author_email
       FROM berita b
       JOIN users u ON b.author_id = u.id
       WHERE b.slug = ? AND b.deleted_at IS NULL`,
      [slug]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM berita WHERE id = ? AND deleted_at IS NULL',
      [id]
    );
    return rows[0];
  },

  async create({ author_id, judul, slug, konten, gambar_cover, status = 'draft' }) {
    const [result] = await pool.query(
      'INSERT INTO berita (author_id, judul, slug, konten, gambar_cover, status) VALUES (?, ?, ?, ?, ?, ?)',
      [author_id, judul, slug, konten, gambar_cover, status]
    );
    return { id: result.insertId };
  },

  async update(id, { judul, slug, konten, gambar_cover, status }) {
    const [result] = await pool.query(
      'UPDATE berita SET judul = ?, slug = ?, konten = ?, gambar_cover = ?, status = ? WHERE id = ?',
      [judul, slug, konten, gambar_cover, status, id]
    );
    return result;
  },

  /**
   * Soft delete — tidak menghapus data dari database,
   * hanya mengisi kolom deleted_at dengan waktu sekarang.
   * Data bisa di-restore nanti jika diperlukan.
   */
  async softDelete(id) {
    const [result] = await pool.query(
      'UPDATE berita SET deleted_at = NOW() WHERE id = ?',
      [id]
    );
    return result;
  },

  /**
   * Restore soft-deleted article — kembalikan deleted_at ke NULL.
   */
  async restore(id) {
    const [result] = await pool.query(
      'UPDATE berita SET deleted_at = NULL WHERE id = ?',
      [id]
    );
    return result;
  },

  /**
   * Find a soft-deleted article by ID (for restore).
   */
  async findDeletedById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM berita WHERE id = ? AND deleted_at IS NOT NULL',
      [id]
    );
    return rows[0];
  },
};

module.exports = BeritaModel;
