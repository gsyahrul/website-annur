const pool = require('../config/db');

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics for admin panel.
 * Returns total registrants, status breakdown, document stats, and recent registrants.
 */
const getStatistics = async (req, res) => {
  try {
    // 1. Total pendaftar & breakdown status
    const [statusRows] = await pool.query(
      `SELECT 
         COUNT(*) AS total_pendaftar,
         SUM(CASE WHEN status_pendaftaran = 'belum_lengkap' THEN 1 ELSE 0 END) AS belum_lengkap,
         SUM(CASE WHEN status_pendaftaran = 'menunggu_verifikasi' THEN 1 ELSE 0 END) AS menunggu_verifikasi,
         SUM(CASE WHEN status_pendaftaran = 'lulus' THEN 1 ELSE 0 END) AS lulus,
         SUM(CASE WHEN status_pendaftaran = 'tidak_lulus' THEN 1 ELSE 0 END) AS tidak_lulus
       FROM calon_siswa`
    );

    // 2. Statistik dokumen
    const [dokumenRows] = await pool.query(
      `SELECT 
         COUNT(*) AS total_dokumen,
         SUM(CASE WHEN status_validasi = 'pending' THEN 1 ELSE 0 END) AS pending,
         SUM(CASE WHEN status_validasi = 'valid' THEN 1 ELSE 0 END) AS valid,
         SUM(CASE WHEN status_validasi = 'revisi' THEN 1 ELSE 0 END) AS revisi
       FROM berkas_dokumen`
    );

    // 3. Total berita
    const [beritaRows] = await pool.query(
      `SELECT 
         COUNT(*) AS total_berita,
         SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
         SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS draft
       FROM berita`
    );

    // 4. 5 pendaftar terbaru
    const [recentRows] = await pool.query(
      `SELECT cs.id, cs.nisn, cs.nama_lengkap, cs.asal_sekolah, cs.status_pendaftaran, cs.created_at, u.email
       FROM calon_siswa cs
       JOIN users u ON cs.user_id = u.id
       ORDER BY cs.created_at DESC
       LIMIT 5`
    );

    const stats = statusRows[0];
    const dokumen = dokumenRows[0];
    const berita = beritaRows[0];

    res.status(200).json({
      success: true,
      data: {
        total_pendaftar: stats.total_pendaftar,
        status_breakdown: {
          belum_lengkap: stats.belum_lengkap,
          menunggu_verifikasi: stats.menunggu_verifikasi,
          lulus: stats.lulus,
          tidak_lulus: stats.tidak_lulus,
        },
        dokumen_stats: {
          total_dokumen: dokumen.total_dokumen,
          pending: dokumen.pending,
          valid: dokumen.valid,
          revisi: dokumen.revisi,
        },
        berita_stats: {
          total_berita: berita.total_berita,
          published: berita.published,
          draft: berita.draft,
        },
        pendaftar_terbaru: recentRows,
      },
    });
  } catch (error) {
    console.error('Get Statistics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik.',
      error: error.message,
    });
  }
};

module.exports = { getStatistics };
