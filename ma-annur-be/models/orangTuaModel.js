const pool = require('../config/db');

const OrangTuaModel = {
  async findByCalonSiswaId(calonSiswaId) {
    const [rows] = await pool.query(
      'SELECT * FROM data_orang_tua WHERE calon_siswa_id = ?',
      [calonSiswaId]
    );
    return rows[0];
  },

  async create({ calon_siswa_id, nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, no_telepon_wali, alamat_lengkap }) {
    const [result] = await pool.query(
      `INSERT INTO data_orang_tua 
       (calon_siswa_id, nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, no_telepon_wali, alamat_lengkap) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [calon_siswa_id, nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, no_telepon_wali, alamat_lengkap]
    );
    return { id: result.insertId };
  },

  async update(calonSiswaId, { nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, no_telepon_wali, alamat_lengkap }) {
    const [result] = await pool.query(
      `UPDATE data_orang_tua 
       SET nama_ayah = ?, pekerjaan_ayah = ?, nama_ibu = ?, pekerjaan_ibu = ?, no_telepon_wali = ?, alamat_lengkap = ?
       WHERE calon_siswa_id = ?`,
      [nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu, no_telepon_wali, alamat_lengkap, calonSiswaId]
    );
    return result;
  },
};

module.exports = OrangTuaModel;
