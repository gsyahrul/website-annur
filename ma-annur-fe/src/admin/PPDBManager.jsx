import { useState, useEffect } from 'react';
import { FiCheckCircle, FiEye, FiX, FiCalendar, FiClock, FiAward, FiEdit3 } from 'react-icons/fi';
import { fetchPPDBRegistrations, verifyRegistration, updateHasilSeleksi, updatePPDBStatus } from '../lib/directus';

const PPDBManager = () => {
    const [registrants, setRegistrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailModal, setDetailModal] = useState(null);
    const [verifyModal, setVerifyModal] = useState(null);
    const [seleksiModal, setSeleksiModal] = useState(null);
    const [statusModal, setStatusModal] = useState(null);
    const [jadwalTes, setJadwalTes] = useState({ tanggal: '', waktu: '', lokasi: 'Gedung Utama MA Annur' });
    const [saving, setSaving] = useState(false);

    const loadData = () => {
        setLoading(true);
        fetchPPDBRegistrations()
            .then(setRegistrants)
            .catch(() => setRegistrants([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleVerify = async () => {
        if (!jadwalTes.tanggal || !jadwalTes.waktu) return;
        setSaving(true);
        try {
            await verifyRegistration(verifyModal.id, {
                jadwal_tes_tanggal: jadwalTes.tanggal,
                jadwal_tes_waktu: jadwalTes.waktu,
                jadwal_tes_lokasi: jadwalTes.lokasi,
            });
            setVerifyModal(null);
            setJadwalTes({ tanggal: '', waktu: '', lokasi: 'Gedung Utama MA Annur' });
            loadData();
        } catch (err) {
            alert('Gagal memverifikasi: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

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

    const handleUpdateStatus = async (id, newStatus) => {
        setSaving(true);
        try {
            await updatePPDBStatus(id, newStatus);
            setStatusModal(null);
            setDetailModal(null);
            loadData();
        } catch (err) {
            alert('Gagal mengubah status: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

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

    const pendingCount = registrants.filter(r => r.status_pendaftaran === 'menunggu_verifikasi').length;
    const verifiedCount = registrants.filter(r => ['terverifikasi', 'lulus'].includes(r.status_pendaftaran)).length;

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Kelola PPDB</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Verifikasi pembayaran dan atur jadwal tes masuk</p>

            {/* Summary */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    background: '#fef3c7', padding: '0.75rem 1.25rem', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: '#92400e'
                }}>
                    <FiClock /> {pendingCount} Menunggu Verifikasi
                </div>
                <div style={{
                    background: 'var(--emerald-100)', padding: '0.75rem 1.25rem', borderRadius: '10px',
                    display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--emerald-800)'
                }}>
                    <FiCheckCircle /> {verifiedCount} Terverifikasi
                </div>
            </div>

            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <h3>Daftar Pendaftar ({registrants.length})</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nama Lengkap</th>
                            <th>Asal Sekolah</th>
                            <th>Kode Unik</th>
                            <th>Nominal</th>
                            <th>No. HP</th>
                            <th>Tgl Daftar</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Memuat...</td></tr>
                        ) : registrants.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Belum ada pendaftar. Calon siswa dapat mendaftar melalui halaman PPDB.</td></tr>
                        ) : (
                            registrants.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{r.nama_lengkap}</td>
                                    <td>{r.asal_sekolah}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--sage-700)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>{r.kode_unik ? String(r.kode_unik).padStart(3, '0') : '-'}</td>
                                    <td style={{ fontWeight: 600 }}>{r.nominal_pembayaran ? `Rp ${Number(r.nominal_pembayaran).toLocaleString('id-ID')}` : '-'}</td>
                                    <td>{r.no_hp || '-'}</td>
                                    <td>{r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</td>
                                    <td>
                                        <span className={`status-badge ${r.status_pendaftaran}`}>
                                            {getStatusLabel(r.status_pendaftaran)}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button className="btn-action blue" onClick={() => setDetailModal(r)}>
                                                <FiEye /> Detail
                                            </button>
                                            {['belum_lengkap', 'menunggu_verifikasi'].includes(r.status_pendaftaran) && (
                                                <button className="btn-action green" onClick={() => setVerifyModal(r)}>
                                                    <FiCheckCircle /> Verifikasi
                                                </button>
                                            )}
                                            {r.status_pendaftaran === 'terverifikasi' && (
                                                <button className="btn-action" onClick={() => setSeleksiModal(r)} style={{
                                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                    color: '#fff', border: 'none', padding: '6px 12px',
                                                    borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
                                                    display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
                                                }}>
                                                    <FiAward /> Hasil Seleksi
                                                </button>
                                            )}
                                            <button className="btn-action" onClick={() => setStatusModal(r)} style={{
                                                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                                color: '#fff', border: 'none', padding: '6px 12px',
                                                borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
                                                display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
                                            }}>
                                                <FiEdit3 /> Ubah Status
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
                            <h3>Detail Pendaftar</h3>
                            <button className="admin-modal-close" onClick={() => setDetailModal(null)}><FiX /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {[
                                    ['Nama Lengkap', detailModal.nama_lengkap],
                                    ['NISN', detailModal.nisn || '-'],
                                    ['Tempat Lahir', detailModal.tempat_lahir || '-'],
                                    ['Tanggal Lahir', detailModal.tanggal_lahir || '-'],
                                    ['Jenis Kelamin', detailModal.jenis_kelamin === 'L' ? 'Laki-laki' : detailModal.jenis_kelamin === 'P' ? 'Perempuan' : '-'],
                                    ['Jurusan', detailModal.jurusan || '-'],
                                    ['Asal Sekolah', detailModal.asal_sekolah],
                                    ['No. HP', detailModal.no_hp || '-'],
                                    ['Email', detailModal.email || '-'],
                                    ['Tanggal Daftar', detailModal.created_at ? new Date(detailModal.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'],
                                ].map(([label, value], i) => (
                                    <div key={i}>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '2px' }}>{label}</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', fontWeight: 500 }}>{value}</p>
                                    </div>
                                ))}
                            </div>
                            {detailModal.alamat && (
                                <div style={{ marginTop: '1rem' }}>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '2px' }}>Alamat</p>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)' }}>{detailModal.alamat}</p>
                                </div>
                            )}
                            <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'linear-gradient(135deg, var(--sage-50), var(--emerald-50))', borderRadius: '10px', border: '1px solid var(--sage-200)' }}>
                                <div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '4px' }}>Kode Unik</p>
                                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--sage-700)', fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}>{detailModal.kode_unik ? String(detailModal.kode_unik).padStart(3, '0') : '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '4px' }}>Nominal Pembayaran</p>
                                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-700)', fontFamily: 'var(--font-heading)' }}>{detailModal.nominal_pembayaran ? `Rp ${Number(detailModal.nominal_pembayaran).toLocaleString('id-ID')}` : '-'}</p>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '10px' }}>
                                <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '4px' }}>Status Pendaftaran</p>
                                <span className={`status-badge ${detailModal.status_pendaftaran}`}>
                                    {getStatusLabel(detailModal.status_pendaftaran)}
                                </span>
                                {detailModal.hasil_seleksi && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '4px' }}>Hasil Seleksi</p>
                                        <span style={{
                                            display: 'inline-block', padding: '4px 12px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem',
                                            background: detailModal.hasil_seleksi === 'lulus' ? '#d1fae5' : '#fee2e2',
                                            color: detailModal.hasil_seleksi === 'lulus' ? '#065f46' : '#991b1b'
                                        }}>
                                            {detailModal.hasil_seleksi === 'lulus' ? '🎉 LULUS' : '❌ TIDAK LULUS'}
                                        </span>
                                    </div>
                                )}
                                {detailModal.jadwal_tes_tanggal && (
                                    <div style={{ marginTop: '0.75rem' }}>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '4px' }}>Jadwal Tes Masuk</p>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--emerald-700)', fontWeight: 600 }}>
                                            📅 {new Date(detailModal.jadwal_tes_tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} • 🕐 {detailModal.jadwal_tes_waktu}
                                        </p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>📍 {detailModal.jadwal_tes_lokasi}</p>
                                    </div>
                                )}
                            </div>
                            {/* Action buttons inside detail modal */}
                            <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {['belum_lengkap', 'menunggu_verifikasi'].includes(detailModal.status_pendaftaran) && (
                                    <button className="btn-add" onClick={() => { setDetailModal(null); setVerifyModal(detailModal); }}>
                                        <FiCheckCircle /> Verifikasi & Atur Jadwal
                                    </button>
                                )}
                                {detailModal.status_pendaftaran === 'terverifikasi' && (
                                    <button onClick={() => { setDetailModal(null); setSeleksiModal(detailModal); }} style={{
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: '#fff', border: 'none', padding: '10px 20px',
                                        borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem',
                                        display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
                                    }}>
                                        <FiAward /> Tentukan Hasil Seleksi
                                    </button>
                                )}
                                <button onClick={() => { setDetailModal(null); setStatusModal(detailModal); }} style={{
                                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                    color: '#fff', border: 'none', padding: '10px 20px',
                                    borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem',
                                    display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
                                }}>
                                    <FiEdit3 /> Ubah Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Verify Modal */}
            {verifyModal && (
                <div className="admin-modal-overlay" onClick={() => setVerifyModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Verifikasi Pembayaran</h3>
                            <button className="admin-modal-close" onClick={() => setVerifyModal(null)}><FiX /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{
                                background: 'var(--emerald-50)', border: '1px solid var(--emerald-200)',
                                borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem'
                            }}>
                                <p style={{ fontSize: '0.85rem', color: 'var(--emerald-700)' }}>
                                    Anda akan memverifikasi pembayaran untuk <strong>{verifyModal.nama_lengkap}</strong>.
                                    Setelah diverifikasi, status akan berubah menjadi "Terverifikasi" dan jadwal tes akan dikirimkan.
                                </p>
                            </div>

                            <div className="form-group">
                                <label><FiCalendar style={{ marginRight: '4px' }} /> Tanggal Tes *</label>
                                <input type="date" className="form-input" value={jadwalTes.tanggal} onChange={e => setJadwalTes({ ...jadwalTes, tanggal: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label><FiClock style={{ marginRight: '4px' }} /> Waktu Tes *</label>
                                <input type="time" className="form-input" value={jadwalTes.waktu} onChange={e => setJadwalTes({ ...jadwalTes, waktu: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Lokasi Tes</label>
                                <input className="form-input" value={jadwalTes.lokasi} onChange={e => setJadwalTes({ ...jadwalTes, lokasi: e.target.value })} />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setVerifyModal(null)}>Batal</button>
                            <button className="btn-add" onClick={handleVerify} disabled={saving}>
                                {saving ? 'Memproses...' : <><FiCheckCircle /> Verifikasi & Kirim Jadwal</>}
                            </button>
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
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => handleHasilSeleksi('lulus')}
                                    disabled={saving}
                                    style={{
                                        flex: 1, padding: '1rem', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: '#fff', border: 'none', cursor: 'pointer',
                                        fontSize: '1rem', fontWeight: 700, transition: 'all 0.2s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>🎉</span>
                                    {saving ? 'Memproses...' : 'LULUS'}
                                </button>
                                <button
                                    onClick={() => handleHasilSeleksi('tidak_lulus')}
                                    disabled={saving}
                                    style={{
                                        flex: 1, padding: '1rem', borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        color: '#fff', border: 'none', cursor: 'pointer',
                                        fontSize: '1rem', fontWeight: 700, transition: 'all 0.2s',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <span style={{ fontSize: '1.5rem' }}>❌</span>
                                    {saving ? 'Memproses...' : 'TIDAK LULUS'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Change Modal */}
            {statusModal && (
                <div className="admin-modal-overlay" onClick={() => setStatusModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Ubah Status Pendaftaran</h3>
                            <button className="admin-modal-close" onClick={() => setStatusModal(null)}><FiX /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{
                                background: 'var(--sage-50)', border: '1px solid var(--sage-200)',
                                borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem'
                            }}>
                                <p style={{ fontSize: '0.9rem', color: 'var(--gray-700)', marginBottom: '4px' }}>
                                    Ubah status untuk:
                                </p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--gray-800)' }}>
                                    {statusModal.nama_lengkap}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)' }}>
                                    Status saat ini: {getStatusLabel(statusModal.status_pendaftaran)}
                                </p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                {[
                                    { value: 'belum_lengkap', label: '📝 Belum Lengkap', bg: '#f3f4f6', color: '#374151' },
                                    { value: 'menunggu_verifikasi', label: '⏳ Menunggu Verifikasi', bg: '#fef3c7', color: '#92400e' },
                                    { value: 'terverifikasi', label: '✅ Terverifikasi', bg: '#d1fae5', color: '#065f46' },
                                    { value: 'lulus', label: '🎉 Lulus', bg: '#a7f3d0', color: '#064e3b' },
                                    { value: 'tidak_lulus', label: '❌ Tidak Lulus', bg: '#fee2e2', color: '#991b1b' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        disabled={saving || statusModal.status_pendaftaran === opt.value}
                                        onClick={() => handleUpdateStatus(statusModal.id, opt.value)}
                                        style={{
                                            padding: '0.85rem 1rem', borderRadius: '10px',
                                            background: statusModal.status_pendaftaran === opt.value ? opt.bg : '#fff',
                                            color: opt.color,
                                            border: statusModal.status_pendaftaran === opt.value ? `2px solid ${opt.color}` : '1px solid #e5e7eb',
                                            cursor: statusModal.status_pendaftaran === opt.value ? 'default' : 'pointer',
                                            fontWeight: 600, fontSize: '0.85rem',
                                            opacity: statusModal.status_pendaftaran === opt.value ? 0.6 : 1,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {opt.label}
                                        {statusModal.status_pendaftaran === opt.value && ' (aktif)'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PPDBManager;
