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

  /**
   * Find student by NISN (public lookup).
   * Returns limited fields — no sensitive data exposed.
   */
  async findByNisn(nisn) {
    const [rows] = await pool.query(
      `SELECT cs.nisn, cs.nama_lengkap, cs.asal_sekolah, cs.status_pendaftaran, cs.created_at
       FROM calon_siswa cs
       WHERE cs.nisn = ?`,
      [nisn]
    );
    return rows[0];
  },

  /**
   * Find all students with pagination, search, and filter.
   * @param {Object} options
   * @param {number} options.page - Halaman (default: 1)
   * @param {number} options.limit - Data per halaman (default: 10)
   * @param {string} options.search - Cari berdasarkan nama/NISN/asal sekolah
   * @param {string} options.status - Filter berdasarkan status pendaftaran
   * @returns {{ data: Array, pagination: Object }}
   */
  async findAll({ page = 1, limit = 10, search = '', status = '' } = {}) {
    const offset = (page - 1) * limit;
    const params = [];
    const conditions = [];

    // Search: cari di nama_lengkap, nisn, atau asal_sekolah
    if (search) {
      conditions.push('(cs.nama_lengkap LIKE ? OR cs.nisn LIKE ? OR cs.asal_sekolah LIKE ?)');
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    // Filter: berdasarkan status pendaftaran
    if (status) {
      conditions.push('cs.status_pendaftaran = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Query data dengan pagination
    const [rows] = await pool.query(
      `SELECT cs.*, u.email 
       FROM calon_siswa cs 
       JOIN users u ON cs.user_id = u.id 
       ${whereClause}
       ORDER BY cs.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Query total count (untuk pagination metadata)
    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM calon_siswa cs ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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
