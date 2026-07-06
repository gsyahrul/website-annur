import { useState, useEffect } from 'react';
import { FiAward, FiEye, FiX, FiSearch } from 'react-icons/fi';
import { fetchPPDBRegistrations, updateHasilSeleksi } from '../lib/directus';

const KelulusanManager = () => {
    const [registrants, setRegistrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailModal, setDetailModal] = useState(null);
    const [seleksiModal, setSeleksiModal] = useState(null);
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const loadData = () => {
        setLoading(true);
        fetchPPDBRegistrations()
            .then(setRegistrants)
            .catch(() => setRegistrants([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleHasilSeleksi = async (hasil) => {
        if (!seleksiModal) return;
        setSaving(true);
        try {
            await updateHasilSeleksi(seleksiModal.id, hasil);
            setSeleksiModal(null);
            loadData();
        } catch (err) {
            alert('Gagal mengubah hasil seleksi: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const getStatusLabel = (status) => {
        const map = {
            belum_lengkap: '📝 Belum Lengkap',
            menunggu_verifikasi: '⏳ Menunggu Verifikasi',
            terverifikasi: '✅ Terverifikasi',
            lulus: '🎉 Lulus',
            tidak_lulus: '❌ Tidak Lulus',
        };
        return map[status] || status;
    };

    const getHasilLabel = (hasil) => {
        if (!hasil) return '—';
        if (hasil === 'lulus') return '🎉 LULUS';
        return '❌ TIDAK LULUS';
    };

    // Filter: only students that have been verified or have selection results
    const eligibleRegistrants = registrants.filter(r =>
        ['terverifikasi', 'lulus', 'tidak_lulus'].includes(r.status_pendaftaran)
    );

    const filteredRegistrants = eligibleRegistrants.filter(r => {
        const matchesSearch = !searchQuery ||
            r.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.nisn?.includes(searchQuery) ||
            r.asal_sekolah?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'belum' && !r.hasil_seleksi) ||
            (filterStatus === 'lulus' && r.hasil_seleksi === 'lulus') ||
            (filterStatus === 'tidak_lulus' && r.hasil_seleksi === 'tidak_lulus');

        return matchesSearch && matchesFilter;
    });

    const belumDitentukan = eligibleRegistrants.filter(r => !r.hasil_seleksi).length;
    const lulusCount = eligibleRegistrants.filter(r => r.hasil_seleksi === 'lulus').length;
    const tidakLulusCount = eligibleRegistrants.filter(r => r.hasil_seleksi === 'tidak_lulus').length;

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Kelola Kelulusan</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Tentukan hasil seleksi calon peserta didik baru</p>

            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div onClick={() => setFilterStatus('belum')} style={{
                    background: filterStatus === 'belum' ? '#fef3c7' : '#fffbeb',
                    padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                    border: filterStatus === 'belum' ? '2px solid #d97706' : '1px solid #fde68a',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s', minWidth: '150px'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#92400e', fontFamily: 'var(--font-heading)' }}>{belumDitentukan}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>⏳ Belum Ditentukan</span>
                </div>
                <div onClick={() => setFilterStatus('lulus')} style={{
                    background: filterStatus === 'lulus' ? '#d1fae5' : '#ecfdf5',
                    padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                    border: filterStatus === 'lulus' ? '2px solid #059669' : '1px solid #a7f3d0',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s', minWidth: '150px'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065f46', fontFamily: 'var(--font-heading)' }}>{lulusCount}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#047857' }}>🎉 Lulus</span>
                </div>
                <div onClick={() => setFilterStatus('tidak_lulus')} style={{
                    background: filterStatus === 'tidak_lulus' ? '#fee2e2' : '#fef2f2',
                    padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                    border: filterStatus === 'tidak_lulus' ? '2px solid #dc2626' : '1px solid #fecaca',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s', minWidth: '150px'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#991b1b', fontFamily: 'var(--font-heading)' }}>{tidakLulusCount}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b91c1c' }}>❌ Tidak Lulus</span>
                </div>
                <div onClick={() => setFilterStatus('all')} style={{
                    background: filterStatus === 'all' ? 'var(--emerald-100)' : 'var(--sage-50)',
                    padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                    border: filterStatus === 'all' ? '2px solid var(--emerald-600)' : '1px solid var(--sage-200)',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s', minWidth: '150px'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sage-700)', fontFamily: 'var(--font-heading)' }}>{eligibleRegistrants.length}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)' }}>📋 Semua</span>
                </div>
            </div>

            {/* Info for empty eligible */}
            {!loading && eligibleRegistrants.length === 0 && registrants.length > 0 && (
                <div style={{
                    background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px',
                    padding: '1rem 1.5rem', marginBottom: '1.5rem'
                }}>
                    <p style={{ color: '#92400e', fontSize: '0.9rem', fontWeight: 500 }}>
                        ⚠️ Belum ada peserta yang terverifikasi. Verifikasi pembayaran terlebih dahulu di halaman <strong>Verifikasi Pembayaran</strong>.
                    </p>
                </div>
            )}

            {/* Search */}
            <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
                <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
                <input
                    type="text"
                    placeholder="Cari nama, NISN, atau asal sekolah..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%', padding: '10px 12px 10px 36px', borderRadius: '10px',
                        border: '1px solid var(--gray-200)', fontSize: '0.9rem', outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                />
            </div>

            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h3>Peserta Terverifikasi ({filteredRegistrants.length})</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nama Lengkap</th>
                            <th>NISN</th>
                            <th>Asal Sekolah</th>
                            <th>Jurusan</th>
                            <th>Jadwal Tes</th>
                            <th>Hasil Seleksi</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Memuat...</td></tr>
                        ) : filteredRegistrants.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                                {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada peserta terverifikasi.'}
                            </td></tr>
                        ) : (
                            filteredRegistrants.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{r.nama_lengkap}</td>
                                    <td style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>{r.nisn || '-'}</td>
                                    <td>{r.asal_sekolah}</td>
                                    <td>{r.jurusan || '-'}</td>
                                    <td>
                                        {r.jadwal_tes_tanggal ? (
                                            <span style={{ fontSize: '0.82rem' }}>
                                                📅 {new Date(r.jadwal_tes_tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                <br />🕐 {r.jadwal_tes_waktu}
                                            </span>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        {r.hasil_seleksi ? (
                                            <span style={{
                                                display: 'inline-block', padding: '4px 12px', borderRadius: '6px',
                                                fontSize: '0.82rem', fontWeight: 700,
                                                background: r.hasil_seleksi === 'lulus' ? '#d1fae5' : '#fee2e2',
                                                color: r.hasil_seleksi === 'lulus' ? '#065f46' : '#991b1b'
                                            }}>
                                                {getHasilLabel(r.hasil_seleksi)}
                                            </span>
                                        ) : (
                                            <span style={{
                                                display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                                                fontSize: '0.78rem', fontWeight: 600, background: '#fef3c7', color: '#92400e'
                                            }}>
                                                ⏳ Belum Ditentukan
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button className="btn-action blue" onClick={() => setDetailModal(r)}>
                                                <FiEye /> Detail
                                            </button>
                                            <button className="btn-action" onClick={() => setSeleksiModal(r)} style={{
                                                background: r.hasil_seleksi
                                                    ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                                                    : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                color: '#fff', border: 'none', padding: '6px 12px',
                                                borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
                                                display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
                                            }}>
                                                <FiAward /> {r.hasil_seleksi ? 'Ubah Hasil' : 'Tentukan'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal */}
            {detailModal && (
                <div className="admin-modal-overlay" onClick={() => setDetailModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Detail Peserta</h3>
                            <button className="admin-modal-close" onClick={() => setDetailModal(null)}><FiX /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {[
                                    ['Nama Lengkap', detailModal.nama_lengkap],
                                    ['NISN', detailModal.nisn || '-'],
                                    ['Tempat Lahir', detailModal.tempat_lahir || '-'],
                                    ['Tanggal Lahir', detailModal.tanggal_lahir ? new Date(detailModal.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'],
                                    ['Jenis Kelamin', detailModal.jenis_kelamin === 'L' ? 'Laki-laki' : detailModal.jenis_kelamin === 'P' ? 'Perempuan' : '-'],
                                    ['Jurusan', detailModal.jurusan || '-'],
                                    ['Asal Sekolah', detailModal.asal_sekolah],
                                    ['No. HP', detailModal.no_hp || '-'],
                                ].map(([label, value], i) => (
                                    <div key={i}>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '2px' }}>{label}</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', fontWeight: 500 }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                            {/* Jadwal Tes */}
                            {detailModal.jadwal_tes_tanggal && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--emerald-50)', borderRadius: '10px', border: '1px solid var(--emerald-200)' }}>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '4px' }}>Jadwal Tes Masuk</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--emerald-700)', fontWeight: 600 }}>
                                        📅 {new Date(detailModal.jadwal_tes_tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • 🕐 {detailModal.jadwal_tes_waktu}
                                    </p>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>📍 {detailModal.jadwal_tes_lokasi}</p>
                                </div>
                            )}
                            {/* Hasil Seleksi */}
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '10px' }}>
                                <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '4px' }}>Hasil Seleksi</p>
                                {detailModal.hasil_seleksi ? (
                                    <span style={{
                                        display: 'inline-block', padding: '6px 16px', borderRadius: '8px',
                                        fontWeight: 700, fontSize: '0.95rem',
                                        background: detailModal.hasil_seleksi === 'lulus' ? '#d1fae5' : '#fee2e2',
                                        color: detailModal.hasil_seleksi === 'lulus' ? '#065f46' : '#991b1b'
                                    }}>
                                        {getHasilLabel(detailModal.hasil_seleksi)}
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.9rem', color: '#92400e', fontWeight: 500 }}>⏳ Belum ditentukan</span>
                                )}
                            </div>
                            {/* Action button */}
                            <div style={{ marginTop: '1.25rem' }}>
                                <button onClick={() => { setDetailModal(null); setSeleksiModal(detailModal); }} style={{
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    color: '#fff', border: 'none', padding: '10px 20px',
                                    borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
                                }}>
                                    <FiAward /> {detailModal.hasil_seleksi ? 'Ubah Hasil Seleksi' : 'Tentukan Hasil Seleksi'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Seleksi Modal */}
            {seleksiModal && (
                <div className="admin-modal-overlay" onClick={() => setSeleksiModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Hasil Seleksi</h3>
                            <button className="admin-modal-close" onClick={() => setSeleksiModal(null)}><FiX /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{
                                background: 'var(--sage-50)', border: '1px solid var(--sage-200)',
                                borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem'
                            }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '4px' }}>
                                    Tentukan hasil seleksi untuk:
                                </p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                                    {seleksiModal.nama_lengkap}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                                    NISN: {seleksiModal.nisn} • {seleksiModal.asal_sekolah}
                                </p>
                                {seleksiModal.hasil_seleksi && (
                                    <p style={{ fontSize: '0.85rem', color: '#92400e', fontWeight: 600, marginTop: '0.5rem' }}>
                                        Status saat ini: {getHasilLabel(seleksiModal.hasil_seleksi)}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => handleHasilSeleksi('lulus')}
                                    disabled={saving}
                                    style={{
                                        flex: 1, padding: '1.25rem', borderRadius: '12px',
                                        background: seleksiModal.hasil_seleksi === 'lulus'
                                            ? 'linear-gradient(135deg, #059669, #047857)'
                                            : 'linear-gradient(135deg, #10b981, #059669)',
                                        color: '#fff', border: seleksiModal.hasil_seleksi === 'lulus' ? '3px solid #064e3b' : 'none',
                                        cursor: 'pointer', fontSize: '1rem', fontWeight: 700, transition: 'all 0.2s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <span style={{ fontSize: '2rem' }}>🎉</span>
                                    {saving ? 'Memproses...' : 'LULUS'}
                                    {seleksiModal.hasil_seleksi === 'lulus' && (
                                        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(aktif)</span>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleHasilSeleksi('tidak_lulus')}
                                    disabled={saving}
                                    style={{
                                        flex: 1, padding: '1.25rem', borderRadius: '12px',
                                        background: seleksiModal.hasil_seleksi === 'tidak_lulus'
                                            ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                                            : 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        color: '#fff', border: seleksiModal.hasil_seleksi === 'tidak_lulus' ? '3px solid #7f1d1d' : 'none',
                                        cursor: 'pointer', fontSize: '1rem', fontWeight: 700, transition: 'all 0.2s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <span style={{ fontSize: '2rem' }}>❌</span>
                                    {saving ? 'Memproses...' : 'TIDAK LULUS'}
                                    {seleksiModal.hasil_seleksi === 'tidak_lulus' && (
                                        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>(aktif)</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KelulusanManager;
