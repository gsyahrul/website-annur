const pool = require('../config/db');

const GaleriModel = {
  /**
   * Get all published galeri items.
   */
  async findAllPublished() {
    const [rows] = await pool.query(
      `SELECT * FROM galeri WHERE status = 'published' ORDER BY created_at DESC`
    );
    return rows;
  },

  /**
   * Get all galeri items (admin — including draft).
   */
  async findAll() {
    const [rows] = await pool.query(
      `SELECT * FROM galeri ORDER BY created_at DESC`
    );
    return rows;
  },

  /**
   * Find galeri item by ID.
   */
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM galeri WHERE id = ?', [id]);
    return rows[0] || null;
  },

  /**
   * Create a new galeri item.
   */
  async create({ title, description, image, type, status }) {
    const [result] = await pool.query(
      `INSERT INTO galeri (title, description, image, type, status) VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, image || null, type || 'photo', status || 'published']
    );
    return { id: result.insertId };
  },

  /**
   * Delete galeri item by ID.
   */
  async delete(id) {
    await pool.query('DELETE FROM galeri WHERE id = ?', [id]);
  },
};

module.exports = GaleriModel;
