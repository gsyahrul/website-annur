import { useState, useEffect } from 'react';
import { FiCheckCircle, FiEye, FiX, FiSearch, FiFile, FiDownload, FiAlertTriangle } from 'react-icons/fi';
import { fetchPPDBRegistrations, getDokumenBySiswaId, validasiDokumen } from '../lib/directus';

const REQUIRED_DOCS = [
    { key: 'kk', label: 'Kartu Keluarga (KK)' },
    { key: 'akta_kelahiran', label: 'Akta Kelahiran' },
    { key: 'skl', label: 'Surat Keterangan Lulus (SKL)' },
    { key: 'pas_foto', label: 'Pas Foto 3×4' },
];

const STATUS_MAP = {
    pending: { label: '⏳ Pending', bg: '#fef3c7', color: '#92400e' },
    valid: { label: '✅ Valid', bg: '#d1fae5', color: '#065f46' },
    revisi: { label: '⚠️ Revisi', bg: '#fee2e2', color: '#991b1b' },
};

const VerifikasiBerkasManager = () => {
    const [registrants, setRegistrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailModal, setDetailModal] = useState(null);
    const [detailDocs, setDetailDocs] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [revisiModal, setRevisiModal] = useState(null);
    const [catatan, setCatatan] = useState('');
    const [saving, setSaving] = useState(false);

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

    const handleValidasi = async (docId, status, catatanAdmin = null) => {
        setSaving(true);
        try {
            await validasiDokumen(docId, status, catatanAdmin);
            // Reload docs for current detail
            if (detailModal) {
                const docs = await getDokumenBySiswaId(detailModal.id);
                setDetailDocs(docs || []);
            }
            setRevisiModal(null);
            setCatatan('');
        } catch (err) {
            alert('Gagal mengubah status: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const openRevisiModal = (doc) => {
        setRevisiModal(doc);
        setCatatan(doc.catatan_admin || '');
    };

    const handleSubmitRevisi = () => {
        if (!revisiModal) return;
        handleValidasi(revisiModal.id, 'revisi', catatan);
    };

    // Only show students that have passed the exam (lulus) or have status lulus
    const eligibleRegistrants = registrants.filter(r =>
        r.hasil_seleksi === 'lulus' || r.status_pendaftaran === 'lulus' || r.status_pendaftaran === 'diterima'
    );

    const filteredRegistrants = eligibleRegistrants.filter(r => {
        const matchesSearch = !searchQuery ||
            r.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.nisn?.includes(searchQuery) ||
            r.asal_sekolah?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Verifikasi Berkas</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Validasi dokumen persyaratan pendaftar dan berikan catatan revisi jika diperlukan</p>

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
                    <h3>Pendaftar Lulus Ujian ({filteredRegistrants.length})</h3>
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
                                {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada pendaftar yang lulus ujian.'}
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
                                            display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                                            fontSize: '0.78rem', fontWeight: 600,
                                            background: r.status_pendaftaran === 'diterima' ? '#d1fae5' : '#a7f3d0',
                                            color: r.status_pendaftaran === 'diterima' ? '#065f46' : '#064e3b'
                                        }}>
                                            {r.status_pendaftaran === 'diterima' ? '✅ Diterima' : '🎉 Lulus Ujian'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-action blue" onClick={() => openDetail(r)}>
                                            <FiEye /> Verifikasi Berkas
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Detail Modal with Documents */}
            {detailModal && (
                <div className="admin-modal-overlay" onClick={() => setDetailModal(null)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="admin-modal-header">
                            <h3>Verifikasi Berkas — {detailModal.nama_lengkap}</h3>
                            <button className="admin-modal-close" onClick={() => setDetailModal(null)}><FiX /></button>
                        </div>
                        <div className="admin-modal-body">
                            {/* Student info summary */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--sage-50)', borderRadius: '10px', border: '1px solid var(--sage-200)' }}>
                                {[
                                    ['NISN', detailModal.nisn || '-'],
                                    ['Jurusan', detailModal.jurusan || '-'],
                                    ['Asal Sekolah', detailModal.asal_sekolah],
                                    ['No. HP', detailModal.no_hp || '-'],
                                ].map(([label, value], i) => (
                                    <div key={i}>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginBottom: '2px' }}>{label}</p>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--gray-700)', fontWeight: 500 }}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Documents list */}
                            <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>📁 Dokumen Persyaratan</p>
                            {docsLoading ? (
                                <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Memuat dokumen...</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {REQUIRED_DOCS.map(reqDoc => {
                                        const doc = detailDocs.find(d => d.jenis_dokumen === reqDoc.key);
                                        if (!doc) {
                                            return (
                                                <div key={reqDoc.key} style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: '8px', background: '#fff', border: '1px dashed var(--gray-300)' }}>
                                                    <FiFile style={{ color: 'var(--gray-300)', marginRight: '0.5rem' }} />
                                                    <div>
                                                        <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--gray-400)' }}>{reqDoc.label}</p>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>Belum diunggah</span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        const st = STATUS_MAP[doc.status_validasi] || STATUS_MAP.pending;
                                        const API_URL = import.meta.env.VITE_API_URL || '';
                                        const fileUrl = `${API_URL}${doc.file_path}`;
                                        const isImage = /\.(jpg|jpeg|png|webp)$/i.test(doc.file_path);
                                        return (
                                            <div key={doc.id} style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', background: '#fff', border: '1px solid var(--gray-200)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: isImage ? '0.5rem' : 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                        <FiFile style={{ color: 'var(--sage-600)' }} />
                                                        <div>
                                                            <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--gray-700)' }}>{reqDoc.label}</p>
                                                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                        <button onClick={() => setPreviewDoc({ url: fileUrl, label: reqDoc.label, isImage })}
                                                            style={{ padding: '4px 10px', borderRadius: '6px', background: '#dbeafe', color: '#2563eb', fontSize: '0.72rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <FiEye size={12} /> Lihat
                                                        </button>
                                                        <a href={fileUrl} download
                                                            style={{ padding: '4px 10px', borderRadius: '6px', background: '#f3e8ff', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <FiDownload size={12} /> Unduh
                                                        </a>
                                                        {doc.status_validasi !== 'valid' && (
                                                            <button onClick={() => handleValidasi(doc.id, 'valid')}
                                                                disabled={saving}
                                                                style={{ padding: '4px 10px', borderRadius: '6px', background: '#d1fae5', color: '#065f46', fontSize: '0.72rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                                                <FiCheckCircle size={12} /> Validasi
                                                            </button>
                                                        )}
                                                        <button onClick={() => openRevisiModal(doc)}
                                                            disabled={saving}
                                                            style={{ padding: '4px 10px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', fontSize: '0.72rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                            <FiAlertTriangle size={12} /> Revisi
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Show existing admin notes */}
                                                {doc.catatan_admin && (
                                                    <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: doc.status_validasi === 'revisi' ? '#fef2f2' : '#f8fafc', borderRadius: '6px', border: `1px solid ${doc.status_validasi === 'revisi' ? '#fca5a5' : '#e2e8f0'}` }}>
                                                        <p style={{ fontSize: '0.7rem', fontWeight: 600, color: doc.status_validasi === 'revisi' ? '#991b1b' : '#64748b', marginBottom: '2px' }}>📝 Catatan Admin:</p>
                                                        <p style={{ fontSize: '0.78rem', color: doc.status_validasi === 'revisi' ? '#7f1d1d' : '#475569', margin: 0 }}>{doc.catatan_admin}</p>
                                                    </div>
                                                )}
                                                {isImage && (
                                                    <img src={fileUrl} alt={reqDoc.label}
                                                        onClick={() => setPreviewDoc({ url: fileUrl, label: reqDoc.label, isImage: true })}
                                                        style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--gray-200)', marginTop: '0.5rem' }} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Revisi Modal with Catatan Admin */}
            {revisiModal && (
                <div className="admin-modal-overlay" onClick={() => setRevisiModal(null)} style={{ zIndex: 10001 }}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className="admin-modal-header">
                            <h3>Catatan Revisi Dokumen</h3>
                            <button className="admin-modal-close" onClick={() => setRevisiModal(null)}><FiX /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div style={{
                                background: '#fef2f2', border: '1px solid #fca5a5',
                                borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem'
                            }}>
                                <p style={{ fontSize: '0.85rem', color: '#991b1b' }}>
                                    Berikan catatan revisi untuk dokumen ini. Catatan akan ditampilkan kepada calon siswa agar mereka mengetahui apa yang perlu diperbaiki.
                                </p>
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '6px' }}>
                                    📝 Catatan Revisi untuk Siswa
                                </label>
                                <textarea
                                    className="form-input"
                                    rows="4"
                                    placeholder="Contoh: Foto tidak jelas, mohon upload ulang dengan kualitas lebih baik..."
                                    value={catatan}
                                    onChange={e => setCatatan(e.target.value)}
                                    style={{
                                        width: '100%', padding: '10px 14px', border: '1px solid var(--gray-200)',
                                        borderRadius: '10px', fontSize: '0.9rem', fontFamily: 'inherit',
                                        color: 'var(--gray-700)', outline: 'none', resize: 'vertical',
                                    }}
                                />
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setRevisiModal(null)}>Batal</button>
                            <button className="btn-add" onClick={handleSubmitRevisi} disabled={saving} style={{
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            }}>
                                {saving ? 'Memproses...' : <><FiAlertTriangle /> Tandai Revisi & Kirim Catatan</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {previewDoc && (
                <div className="admin-modal-overlay" onClick={() => setPreviewDoc(null)} style={{ zIndex: 10002 }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '800px',
                        maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-200)' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--gray-700)' }}>{previewDoc.label}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <a href={previewDoc.url} target="_blank" rel="noopener noreferrer"
                                    style={{ padding: '6px 14px', borderRadius: '8px', background: '#dbeafe', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>Buka Tab Baru</a>
                                <button onClick={() => setPreviewDoc(null)} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                    <FiX size={18} />
                                </button>
                            </div>
                        </div>
                        <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', background: '#f9fafb' }}>
                            {previewDoc.isImage ? (
                                <img src={previewDoc.url} alt={previewDoc.label} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} />
                            ) : (
                                <iframe src={previewDoc.url} title={previewDoc.label} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '8px' }} />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerifikasiBerkasManager;
