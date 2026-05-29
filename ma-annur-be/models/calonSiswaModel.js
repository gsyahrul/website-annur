const pool = require('../config/db');

const CalonSiswaModel = {
  async findByUserId(userId) {
    const [rows] = await pool.query('SELECT * FROM calon_siswa WHERE user_id = ?', [userId]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM calon_siswa WHERE id = ?', [id]);
    return rows[0];
  },

  async findAll() {
    const [rows] = await pool.query(
      `SELECT cs.*, u.email 
       FROM calon_siswa cs 
       JOIN users u ON cs.user_id = u.id 
       ORDER BY cs.created_at DESC`
    );
    return rows;
  },

  async create({ user_id, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah }) {
    const [result] = await pool.query(
      `INSERT INTO calon_siswa 
       (user_id, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah]
    );
    return { id: result.insertId };
  },

  async update(userId, { nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah }) {
    const [result] = await pool.query(
      `UPDATE calon_siswa 
       SET nisn = ?, nama_lengkap = ?, tempat_lahir = ?, tanggal_lahir = ?, jenis_kelamin = ?, asal_sekolah = ?
       WHERE user_id = ?`,
      [nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah, userId]
    );
    return result;
  },

  async updateStatus(id, status_pendaftaran) {
    const [result] = await pool.query(
      'UPDATE calon_siswa SET status_pendaftaran = ? WHERE id = ?',
      [status_pendaftaran, id]
    );
    return result;
  },
};

module.exports = CalonSiswaModel;
