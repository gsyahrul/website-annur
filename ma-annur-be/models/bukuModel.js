const pool = require('../config/db');

const BukuModel = {
  /**
   * Get books by category (public).
   */
  async findByCategory(category) {
    const [rows] = await pool.query(
      `SELECT * FROM buku WHERE category = ? ORDER BY created_at DESC`,
      [category]
    );
    return rows;
  },

  /**
   * Get all books (admin).
   */
  async findAll() {
    const [rows] = await pool.query(
      `SELECT * FROM buku ORDER BY created_at DESC`
    );
    return rows;
  },

  /**
   * Find book by ID.
   */
  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM buku WHERE id = ?', [id]);
    return rows[0] || null;
  },

  /**
   * Create a new book.
   */
  async create({ title, author, category, badge, color }) {
    const [result] = await pool.query(
      `INSERT INTO buku (title, author, category, badge, color) VALUES (?, ?, ?, ?, ?)`,
      [title, author, category, badge || null, color || '#4a7a4a']
    );
    return { id: result.insertId };
  },

  /**
   * Update a book by ID.
   */
  async update(id, { title, author, category, badge, color }) {
    await pool.query(
      `UPDATE buku SET title = ?, author = ?, category = ?, badge = ?, color = ? WHERE id = ?`,
      [title, author, category, badge || null, color || '#4a7a4a', id]
    );
  },

  /**
   * Delete a book by ID.
   */
  async delete(id) {
    await pool.query('DELETE FROM buku WHERE id = ?', [id]);
  },
};

module.exports = BukuModel;
