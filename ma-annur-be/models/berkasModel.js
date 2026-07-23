const pool = require('../config/db');

const BerkasModel = {
  async findByCalonSiswaId(calonSiswaId) {
    const [rows] = await pool.query(
      'SELECT * FROM berkas_dokumen WHERE calon_siswa_id = ?',
      [calonSiswaId]
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM berkas_dokumen WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ calon_siswa_id, jenis_dokumen, file_path }) {
    const [result] = await pool.query(
      'INSERT INTO berkas_dokumen (calon_siswa_id, jenis_dokumen, file_path) VALUES (?, ?, ?)',
      [calon_siswa_id, jenis_dokumen, file_path]
    );
    return { id: result.insertId };
  },

  async updateByJenis(calonSiswaId, jenis_dokumen, file_path) {
    const [result] = await pool.query(
      'UPDATE berkas_dokumen SET file_path = ?, status_validasi = ? WHERE calon_siswa_id = ? AND jenis_dokumen = ?',
      [file_path, 'pending', calonSiswaId, jenis_dokumen]
    );
    return result;
  },

  async findByJenis(calonSiswaId, jenis_dokumen) {
    const [rows] = await pool.query(
      'SELECT * FROM berkas_dokumen WHERE calon_siswa_id = ? AND jenis_dokumen = ?',
      [calonSiswaId, jenis_dokumen]
    );
    return rows[0];
  },

  async updateValidasi(id, status_validasi, catatan_admin = null) {
    const [result] = await pool.query(
      'UPDATE berkas_dokumen SET status_validasi = ?, catatan_admin = ? WHERE id = ?',
      [status_validasi, catatan_admin, id]
    );
    return result;
  },
};

module.exports = BerkasModel;
