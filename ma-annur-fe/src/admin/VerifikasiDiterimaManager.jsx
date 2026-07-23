import { useState, useEffect } from 'react';
import { FiUserCheck, FiEye, FiX, FiSearch, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { fetchPPDBRegistrations, updatePPDBStatus, getDokumenBySiswaId } from '../lib/directus';

const VerifikasiDiterimaManager = () => {
    const [registrants, setRegistrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailModal, setDetailModal] = useState(null);
    const [detailDocs, setDetailDocs] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [konfirmasiModal, setKonfirmasiModal] = useState(null);
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

    const openDetail = async (registrant) => {
        setDetailModal(registrant);
        setDetailDocs([]);
        setDocsLoading(true);
        try {
            const docs = await getDokumenBySiswaId(registrant.id);
            setDetailDocs(docs || []);
        } catch {
            setDetailDocs([]);
        } finally {
            setDocsLoading(false);
        }
    };

    const handleSetDiterima = async () => {
        if (!konfirmasiModal) return;
        setSaving(true);
        try {
            await updatePPDBStatus(konfirmasiModal.id, 'diterima');
            setKonfirmasiModal(null);
            loadData();
        } catch (err) {
            alert('Gagal mengubah status: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    // Only show students who passed the exam (lulus)
    const eligibleRegistrants = registrants.filter(r =>
        r.hasil_seleksi === 'lulus' && ['lulus', 'diterima'].includes(r.status_pendaftaran)
    );

    const filteredRegistrants = eligibleRegistrants.filter(r => {
        const matchesSearch = !searchQuery ||
            r.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.nisn?.includes(searchQuery) ||
            r.asal_sekolah?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'belum' && r.status_pendaftaran === 'lulus') ||
            (filterStatus === 'diterima' && r.status_pendaftaran === 'diterima');

        return matchesSearch && matchesFilter;
    });

    const belumCount = eligibleRegistrants.filter(r => r.status_pendaftaran === 'lulus').length;
    const diterimaCount = eligibleRegistrants.filter(r => r.status_pendaftaran === 'diterima').length;

    const REQUIRED_DOCS = [
        { key: 'bukti_pembayaran', label: 'Bukti Pembayaran' },
        { key: 'kk', label: 'Kartu Keluarga (KK)' },
        { key: 'akta_kelahiran', label: 'Akta Kelahiran' },
        { key: 'skl', label: 'Surat Keterangan Lulus (SKL)' },
        { key: 'pas_foto', label: 'Pas Foto 3×4' },
    ];

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Verifikasi Diterima</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Konfirmasi penerimaan siswa baru setelah berkas lengkap dan valid</p>

            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div onClick={() => setFilterStatus('belum')} style={{
                    background: filterStatus === 'belum' ? '#fef3c7' : '#fffbeb',
                    padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                    border: filterStatus === 'belum' ? '2px solid #d97706' : '1px solid #fde68a',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s', minWidth: '150px'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#92400e', fontFamily: 'var(--font-heading)' }}>{belumCount}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>⏳ Menunggu Konfirmasi</span>
                </div>
                <div onClick={() => setFilterStatus('diterima')} style={{
                    background: filterStatus === 'diterima' ? '#d1fae5' : '#ecfdf5',
                    padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                    border: filterStatus === 'diterima' ? '2px solid #059669' : '1px solid #a7f3d0',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s', minWidth: '150px'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065f46', fontFamily: 'var(--font-heading)' }}>{diterimaCount}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#047857' }}>✅ Diterima</span>
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

            {/* Info */}
            {!loading && eligibleRegistrants.length === 0 && registrants.length > 0 && (
                <div style={{
                    background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px',
                    padding: '1rem 1.5rem', marginBottom: '1.5rem'
                }}>
                    <p style={{ color: '#92400e', fontSize: '0.9rem', fontWeight: 500 }}>
                        ⚠️ Belum ada peserta yang lulus ujian. Tentukan hasil seleksi terlebih dahulu di halaman <strong>Verifikasi Kelulusan</strong>.
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
                    <h3>Daftar Peserta ({filteredRegistrants.length})</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nama Lengkap</th>
                            <th>NISN</th>
                            <th>Asal Sekolah</th>
                            <th>Jurusan</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Memuat...</td></tr>
                        ) : filteredRegistrants.length === 0 ? (
                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                                {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada data.'}
                            </td></tr>
                        ) : (
                            filteredRegistrants.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{r.nama_lengkap}</td>
                                    <td style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>{r.nisn || '-'}</td>
                                    <td>{r.asal_sekolah}</td>
                                    <td>{r.jurusan || '-'}</td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block', padding: '4px 12px', borderRadius: '6px',
                                            fontSize: '0.82rem', fontWeight: 700,
                                            background: r.status_pendaftaran === 'diterima' ? '#d1fae5' : '#fef3c7',
                                            color: r.status_pendaftaran === 'diterima' ? '#065f46' : '#92400e'
                                        }}>
                                            {r.status_pendaftaran === 'diterima' ? '✅ Diterima' : '⏳ Belum Dikonfirmasi'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <button className="btn-action blue" onClick={() => openDetail(r)}>
                                                <FiEye /> Detail
                                            </button>
                                            {r.status_pendaftaran !== 'diterima' && (
                                                <button className="btn-action green" onClick={() => setKonfirmasiModal(r)}>
                                                    <FiUserCheck /> Terima
                                                </button>
                                            )}
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

                            {/* Documents Status */}
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '10px' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>📁 Status Berkas</p>
                                {docsLoading ? (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Memuat...</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                        {REQUIRED_DOCS.map(reqDoc => {
                                            const doc = detailDocs.find(d => d.jenis_dokumen === reqDoc.key);
                                            const isValid = doc?.status_validasi === 'valid';
                                            return (
                                                <div key={reqDoc.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.5rem', borderRadius: '6px', background: '#fff' }}>
                                                    <span style={{ fontSize: '0.82rem', color: 'var(--gray-700)' }}>{reqDoc.label}</span>
                                                    <span style={{
                                                        fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 600,
                                                        background: doc ? (isValid ? '#d1fae5' : doc.status_validasi === 'revisi' ? '#fee2e2' : '#fef3c7') : '#f3f4f6',
                                                        color: doc ? (isValid ? '#065f46' : doc.status_validasi === 'revisi' ? '#991b1b' : '#92400e') : '#9ca3af',
                                                    }}>
                                                        {doc ? (isValid ? '✅ Valid' : doc.status_validasi === 'revisi' ? '⚠️ Revisi' : '⏳ Pending') : '— Belum'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <div style={{ marginTop: '1rem', padding: '1rem', background: detailModal.status_pendaftaran === 'diterima' ? '#ecfdf5' : '#fffbeb', borderRadius: '10px', border: `1px solid ${detailModal.status_pendaftaran === 'diterima' ? '#a7f3d0' : '#fde68a'}` }}>
                                <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '4px' }}>Status Penerimaan</p>
                                <span style={{
                                    display: 'inline-block', padding: '6px 16px', borderRadius: '8px',
                                    fontWeight: 700, fontSize: '0.95rem',
                                    background: detailModal.status_pendaftaran === 'diterima' ? '#d1fae5' : '#fef3c7',
                                    color: detailModal.status_pendaftaran === 'diterima' ? '#065f46' : '#92400e'
                                }}>
                                    {detailModal.status_pendaftaran === 'diterima' ? '✅ DITERIMA' : '⏳ Belum Dikonfirmasi'}
                                </span>
                            </div>

                            {/* Action */}
                            {detailModal.status_pendaftaran !== 'diterima' && (
                                <div style={{ marginTop: '1.25rem' }}>
                                    <button onClick={() => { setDetailModal(null); setKonfirmasiModal(detailModal); }} style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        color: '#fff', border: 'none', padding: '10px 20px',
                                        borderRadius: '10px', cursor: 'pointer', fontSize: '0.9rem',
                                        display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600
                                    }}>
                                        <FiUserCheck /> Konfirmasi Diterima
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Konfirmasi Modal */}
            {konfirmasiModal && (
                <div className="admin-modal-overlay" onClick={() => setKonfirmasiModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
                        <div className="admin-modal-header">
                            <h3>Konfirmasi Penerimaan</h3>
                            <button className="admin-modal-close" onClick={() => setKonfirmasiModal(null)}><FiX /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{
                                background: '#ecfdf5', border: '1px solid #a7f3d0',
                                borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem'
                            }}>
                                <p style={{ fontSize: '0.9rem', color: '#065f46', marginBottom: '8px' }}>
                                    Anda akan mengonfirmasi penerimaan untuk:
                                </p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#064e3b' }}>
                                    {konfirmasiModal.nama_lengkap}
                                </p>
                                <p style={{ fontSize: '0.85rem', color: '#047857' }}>
                                    NISN: {konfirmasiModal.nisn} • {konfirmasiModal.asal_sekolah}
                                </p>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>
                                Setelah dikonfirmasi, status siswa akan berubah menjadi <strong>"Diterima"</strong> dan siswa akan mendapatkan informasi registrasi ulang di dashboard mereka.
                            </p>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setKonfirmasiModal(null)}>Batal</button>
                            <button className="btn-add" onClick={handleSetDiterima} disabled={saving}>
                                {saving ? 'Memproses...' : <><FiCheckCircle /> Konfirmasi Diterima</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifikasiDiterimaManager;
