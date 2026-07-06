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
   * Returns all relevant fields for status check and kartu peserta.
   */
  async findByNisn(nisn) {
    const [rows] = await pool.query(
      `SELECT cs.id, cs.nisn, cs.nama_lengkap, cs.tempat_lahir, cs.tanggal_lahir,
              cs.jenis_kelamin, cs.asal_sekolah, cs.jurusan, cs.no_hp,
              cs.kode_unik, cs.nominal_pembayaran,
              cs.jadwal_tes_tanggal, cs.jadwal_tes_waktu, cs.jadwal_tes_lokasi,
              cs.hasil_seleksi, cs.status_pendaftaran, cs.created_at
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

  async create({ user_id, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah, jurusan, no_hp, alamat }) {
    // Generate kode_unik (3-digit random) dan nominal_pembayaran
    const kode_unik = Math.floor(100 + Math.random() * 900);
    const nominal_pembayaran = 150000 + kode_unik;

    const [result] = await pool.query(
      `INSERT INTO calon_siswa 
       (user_id, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah, jurusan, no_hp, alamat, kode_unik, nominal_pembayaran) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah, jurusan || null, no_hp || null, alamat || null, kode_unik, nominal_pembayaran]
    );
    return { id: result.insertId, kode_unik, nominal_pembayaran };
  },

  async update(userId, { nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah, jurusan, no_hp, alamat }) {
    const [result] = await pool.query(
      `UPDATE calon_siswa 
       SET nisn = ?, nama_lengkap = ?, tempat_lahir = ?, tanggal_lahir = ?, jenis_kelamin = ?, asal_sekolah = ?, jurusan = ?, no_hp = ?, alamat = ?
       WHERE user_id = ?`,
      [nisn, nama_lengkap, tempat_lahir, tanggal_lahir, jenis_kelamin, asal_sekolah, jurusan || null, no_hp || null, alamat || null, userId]
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

  /**
   * Update jadwal tes and verification data (Admin).
   */
  async updateVerification(id, { status_pendaftaran, jadwal_tes_tanggal, jadwal_tes_waktu, jadwal_tes_lokasi }) {
    const [result] = await pool.query(
      `UPDATE calon_siswa 
       SET status_pendaftaran = ?, jadwal_tes_tanggal = ?, jadwal_tes_waktu = ?, jadwal_tes_lokasi = ?
       WHERE id = ?`,
      [status_pendaftaran, jadwal_tes_tanggal || null, jadwal_tes_waktu || null, jadwal_tes_lokasi || null, id]
    );
    return result;
  },

  /**
   * Update hasil seleksi (Admin).
   */
  async updateHasilSeleksi(id, hasil_seleksi) {
    const statusMap = { lulus: 'lulus', tidak_lulus: 'tidak_lulus' };
    const [result] = await pool.query(
      'UPDATE calon_siswa SET hasil_seleksi = ?, status_pendaftaran = ? WHERE id = ?',
      [hasil_seleksi, statusMap[hasil_seleksi] || 'menunggu_verifikasi', id]
    );
    return result;
  },
};

module.exports = CalonSiswaModel;
