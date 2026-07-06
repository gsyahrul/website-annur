import { useState, useEffect } from 'react';
import { FiFileText, FiImage, FiUsers, FiClock } from 'react-icons/fi';
import { fetchDashboardStats } from '../lib/directus';

const Dashboard = () => {
    const [stats, setStats] = useState({ beritaCount: 0, galeriCount: 0, ppdbCount: 0, ppdbPendingCount: 0, pendaftar_terbaru: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats()
            .then((data) => setStats(data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const statCards = [
        { icon: <FiFileText />, value: stats.beritaCount, label: 'Total Berita', color: 'green' },
        { icon: <FiImage />, value: stats.galeriCount, label: 'Total Galeri', color: 'blue' },
        { icon: <FiUsers />, value: stats.ppdbCount, label: 'Total Pendaftar', color: 'orange' },
        { icon: <FiClock />, value: stats.ppdbPendingCount, label: 'Menunggu Verifikasi', color: 'red' },
    ];

    const recentPPDB = stats.pendaftar_terbaru || [];

    const getStatusLabel = (status) => {
        const map = {
            belum_lengkap: '📝 Belum Lengkap',
            menunggu_verifikasi: '⏳ Menunggu',
            terverifikasi: '✅ Terverifikasi',
            lulus: '🎉 Lulus',
            tidak_lulus: '❌ Tidak Lulus',
        };
        return map[status] || status;
    };

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Dashboard</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Selamat datang di panel admin Madrasah Aliyah Annur</p>

            <div className="dash-stats">
                {statCards.map((s, i) => (
                    <div className="dash-stat-card" key={i}>
                        <div className={`dash-stat-icon ${s.color}`}>{s.icon}</div>
                        <div className="dash-stat-info">
                            <h3>{loading ? '...' : s.value}</h3>
                            <p>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h3>Pendaftar PPDB Terbaru</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Asal Sekolah</th>
                            <th>Kode Unik</th>
                            <th>Nominal</th>
                            <th>Tanggal Daftar</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Memuat...</td></tr>
                        ) : recentPPDB.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Belum ada pendaftar</td></tr>
                        ) : (
                            recentPPDB.map((p) => (
                                <tr key={p.id}>
                                    <td style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{p.nama_lengkap}</td>
                                    <td>{p.asal_sekolah}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--sage-700)' }}>{p.kode_unik ? String(p.kode_unik).padStart(3, '0') : '-'}</td>
                                    <td style={{ fontWeight: 600 }}>{p.nominal_pembayaran ? `Rp ${Number(p.nominal_pembayaran).toLocaleString('id-ID')}` : '-'}</td>
                                    <td>{p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</td>
                                    <td>
                                        <span className={`status-badge ${p.status_pendaftaran}`}>
                                            {getStatusLabel(p.status_pendaftaran)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
