const pool = require('../config/db');

const BeritaModel = {
  async findAllPublished() {
    const [rows] = await pool.query(
      `SELECT b.id, b.judul, b.slug, b.gambar_cover, b.status, b.created_at, b.updated_at, u.email AS author_email
       FROM berita b
       JOIN users u ON b.author_id = u.id
       WHERE b.status = 'published'
       ORDER BY b.created_at DESC`
    );
    return rows;
  },

  async findAll() {
    const [rows] = await pool.query(
      `SELECT b.*, u.email AS author_email
       FROM berita b
       JOIN users u ON b.author_id = u.id
       ORDER BY b.created_at DESC`
    );
    return rows;
  },

  async findBySlug(slug) {
    const [rows] = await pool.query(
      `SELECT b.*, u.email AS author_email
       FROM berita b
       JOIN users u ON b.author_id = u.id
       WHERE b.slug = ?`,
      [slug]
    );
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM berita WHERE id = ?', [id]);
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

  async delete(id) {
    const [result] = await pool.query('DELETE FROM berita WHERE id = ?', [id]);
    return result;
  },
};

module.exports = BeritaModel;
