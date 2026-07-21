import { useState, useEffect } from 'react';
import { FiCheckCircle, FiEye, FiX, FiCalendar, FiClock, FiSearch, FiFilter, FiFile, FiDownload } from 'react-icons/fi';
import { fetchPPDBRegistrations, verifyRegistration, updatePPDBStatus, getDokumenBySiswaId, validasiDokumen } from '../lib/directus';

const VerifikasiManager = () => {
    const [registrants, setRegistrants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailModal, setDetailModal] = useState(null);
    const [verifyModal, setVerifyModal] = useState(null);
    const [jadwalTes, setJadwalTes] = useState({ tanggal: '', waktu: '', lokasi: 'Gedung Utama MA Annur' });
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [detailDocs, setDetailDocs] = useState([]);
    const [docsLoading, setDocsLoading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState(null);

    // Open detail modal and load documents
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

    const handleSetMenunggu = async (id) => {
        setSaving(true);
        try {
            await updatePPDBStatus(id, 'menunggu_verifikasi');
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
            menunggu_verifikasi: '⏳ Menunggu Verifikasi',
            terverifikasi: '✅ Terverifikasi',
            lulus: '🎉 Lulus',
            tidak_lulus: '❌ Tidak Lulus',
        };
        return map[status] || status;
    };

    const getStatusColor = (status) => {
        const map = {
            belum_lengkap: { bg: '#f3f4f6', color: '#374151' },
            menunggu_verifikasi: { bg: '#fef3c7', color: '#92400e' },
            terverifikasi: { bg: '#d1fae5', color: '#065f46' },
            lulus: { bg: '#a7f3d0', color: '#064e3b' },
            tidak_lulus: { bg: '#fee2e2', color: '#991b1b' },
        };
        return map[status] || { bg: '#f3f4f6', color: '#374151' };
    };

    // Filter: only show pending verification statuses
    const filteredRegistrants = registrants.filter(r => {
        const matchesSearch = !searchQuery ||
            r.nama_lengkap?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.nisn?.includes(searchQuery) ||
            r.asal_sekolah?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus === 'all'
            ? ['belum_lengkap', 'menunggu_verifikasi', 'terverifikasi'].includes(r.status_pendaftaran)
            : r.status_pendaftaran === filterStatus;

        return matchesSearch && matchesFilter;
    });

    const belumLengkapCount = registrants.filter(r => r.status_pendaftaran === 'belum_lengkap').length;
    const pendingCount = registrants.filter(r => r.status_pendaftaran === 'menunggu_verifikasi').length;
    const verifiedCount = registrants.filter(r => r.status_pendaftaran === 'terverifikasi').length;

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Verifikasi Pembayaran</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Verifikasi pembayaran pendaftar dan atur jadwal tes masuk</p>

            {/* Summary Cards */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div onClick={() => setFilterStatus('belum_lengkap')} style={{
                    background: filterStatus === 'belum_lengkap' ? '#e5e7eb' : '#f9fafb',
                    padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                    border: filterStatus === 'belum_lengkap' ? '2px solid #6b7280' : '1px solid #e5e7eb',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s', minWidth: '150px'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#374151', fontFamily: 'var(--font-heading)' }}>{belumLengkapCount}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6b7280' }}>📝 Belum Lengkap</span>
                </div>
                <div onClick={() => setFilterStatus('menunggu_verifikasi')} style={{
                    background: filterStatus === 'menunggu_verifikasi' ? '#fef3c7' : '#fffbeb',
                    padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                    border: filterStatus === 'menunggu_verifikasi' ? '2px solid #d97706' : '1px solid #fde68a',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s', minWidth: '150px'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#92400e', fontFamily: 'var(--font-heading)' }}>{pendingCount}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#b45309' }}>⏳ Menunggu Verifikasi</span>
                </div>
                <div onClick={() => setFilterStatus('terverifikasi')} style={{
                    background: filterStatus === 'terverifikasi' ? '#d1fae5' : '#ecfdf5',
                    padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                    border: filterStatus === 'terverifikasi' ? '2px solid #059669' : '1px solid #a7f3d0',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s', minWidth: '150px'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#065f46', fontFamily: 'var(--font-heading)' }}>{verifiedCount}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#047857' }}>✅ Terverifikasi</span>
                </div>
                <div onClick={() => setFilterStatus('all')} style={{
                    background: filterStatus === 'all' ? 'var(--emerald-100)' : 'var(--sage-50)',
                    padding: '1rem 1.5rem', borderRadius: '12px', cursor: 'pointer',
                    border: filterStatus === 'all' ? '2px solid var(--emerald-600)' : '1px solid var(--sage-200)',
                    display: 'flex', flexDirection: 'column', gap: '0.25rem', transition: 'all 0.2s', minWidth: '150px'
                }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--sage-700)', fontFamily: 'var(--font-heading)' }}>{belumLengkapCount + pendingCount + verifiedCount}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)' }}>📋 Semua</span>
                </div>
            </div>

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
                    <h3>Daftar Pendaftar ({filteredRegistrants.length})</h3>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Nama Lengkap</th>
                            <th>NISN</th>
                            <th>Asal Sekolah</th>
                            <th>Kode Unik</th>
                            <th>Nominal</th>
                            <th>Status</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Memuat...</td></tr>
                        ) : filteredRegistrants.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>
                                {searchQuery ? 'Tidak ada hasil pencarian.' : 'Belum ada data pendaftar.'}
                            </td></tr>
                        ) : (
                            filteredRegistrants.map(r => {
                                const sc = getStatusColor(r.status_pendaftaran);
                                return (
                                    <tr key={r.id}>
                                        <td style={{ fontWeight: 500, color: 'var(--gray-700)' }}>{r.nama_lengkap}</td>
                                        <td style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>{r.nisn || '-'}</td>
                                        <td>{r.asal_sekolah}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--sage-700)', fontFamily: 'var(--font-heading)', letterSpacing: '1px' }}>
                                            {r.kode_unik ? String(r.kode_unik).padStart(3, '0') : '-'}
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            {r.nominal_pembayaran ? `Rp ${Number(r.nominal_pembayaran).toLocaleString('id-ID')}` : '-'}
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                                                fontSize: '0.78rem', fontWeight: 600, background: sc.bg, color: sc.color
                                            }}>
                                                {getStatusLabel(r.status_pendaftaran)}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <button className="btn-action blue" onClick={() => openDetail(r)}>
                                                    <FiEye /> Detail
                                                </button>
                                                {r.status_pendaftaran === 'belum_lengkap' && (
                                                    <button className="btn-action" onClick={() => handleSetMenunggu(r.id)} disabled={saving} style={{
                                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                        color: '#fff', border: 'none', padding: '6px 12px',
                                                        borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem',
                                                        display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500
                                                    }}>
                                                        <FiFilter /> Set Menunggu
                                                    </button>
                                                )}
                                                {['belum_lengkap', 'menunggu_verifikasi'].includes(r.status_pendaftaran) && (
                                                    <button className="btn-action green" onClick={() => setVerifyModal(r)}>
                                                        <FiCheckCircle /> Verifikasi
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
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
                                    ['Tanggal Lahir', detailModal.tanggal_lahir ? new Date(detailModal.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'],
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
                            {/* Dokumen Section */}
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--gray-50)', borderRadius: '10px' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '8px' }}>📁 Dokumen Pendaftaran</p>
                                {docsLoading ? (
                                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>Memuat dokumen...</p>
                                ) : (() => {
                                    const requiredDocs = [
                                        { key: 'bukti_pembayaran', label: 'Bukti Pembayaran Pendaftaran' },
                                        { key: 'kk', label: 'Kartu Keluarga (KK)' },
                                        { key: 'akta_kelahiran', label: 'Akta Kelahiran' },
                                        { key: 'skl', label: 'Surat Keterangan Lulus (SKL)' },
                                        { key: 'pas_foto', label: 'Pas Foto 3×4' },
                                    ];
                                    const statusMap = {
                                        pending: { label: '⏳ Pending', bg: '#fef3c7', color: '#92400e' },
                                        valid: { label: '✅ Valid', bg: '#d1fae5', color: '#065f46' },
                                        revisi: { label: '⚠️ Revisi', bg: '#fee2e2', color: '#991b1b' },
                                    };
                                    const API_URL = import.meta.env.VITE_API_URL || '';
                                    return (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {requiredDocs.map(reqDoc => {
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
                                                const st = statusMap[doc.status_validasi] || statusMap.pending;
                                                const fileUrl = `${API_URL}${doc.file_path}`;
                                                const isImage = /\.(jpg|jpeg|png)$/i.test(doc.file_path);
                                                return (
                                                    <div key={doc.id} style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', background: '#fff', border: '1px solid var(--gray-200)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isImage ? '0.5rem' : 0 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                <FiFile style={{ color: 'var(--sage-600)' }} />
                                                                <div>
                                                                    <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--gray-700)' }}>{reqDoc.label}</p>
                                                                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: st.bg, color: st.color, fontWeight: 600 }}>{st.label}</span>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                                                <button onClick={() => setPreviewDoc({ url: fileUrl, label: reqDoc.label, isImage })}
                                                                    style={{ padding: '4px 10px', borderRadius: '6px', background: '#dbeafe', color: '#2563eb', fontSize: '0.72rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                    <FiEye size={12} /> Lihat
                                                                </button>
                                                                <a href={fileUrl} download
                                                                    style={{ padding: '4px 10px', borderRadius: '6px', background: '#f3e8ff', color: '#7c3aed', fontSize: '0.72rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                                    <FiDownload size={12} /> Unduh
                                                                </a>
                                                                {doc.status_validasi !== 'valid' && (
                                                                    <button onClick={async () => { await validasiDokumen(doc.id, 'valid'); const docs = await getDokumenBySiswaId(detailModal.id); setDetailDocs(docs || []); }}
                                                                        style={{ padding: '4px 10px', borderRadius: '6px', background: '#d1fae5', color: '#065f46', fontSize: '0.72rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Validasi</button>
                                                                )}
                                                                {doc.status_validasi !== 'revisi' && (
                                                                    <button onClick={async () => { await validasiDokumen(doc.id, 'revisi'); const docs = await getDokumenBySiswaId(detailModal.id); setDetailDocs(docs || []); }}
                                                                        style={{ padding: '4px 10px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', fontSize: '0.72rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Revisi</button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {isImage && (
                                                            <img src={fileUrl} alt={reqDoc.label}
                                                                onClick={() => setPreviewDoc({ url: fileUrl, label: reqDoc.label, isImage: true })}
                                                                style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--gray-200)' }} />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                })()}
                            </div>
                            {/* Action button in detail modal */}
                            {['belum_lengkap', 'menunggu_verifikasi'].includes(detailModal.status_pendaftaran) && (
                                <div style={{ marginTop: '1.25rem' }}>
                                    <button className="btn-add" onClick={() => { setDetailModal(null); setVerifyModal(detailModal); }}>
                                        <FiCheckCircle /> Verifikasi & Atur Jadwal Tes
                                    </button>
                                </div>
                            )}
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
                                    Setelah diverifikasi, status akan berubah menjadi &quot;Terverifikasi&quot; dan jadwal tes akan dikirimkan.
                                </p>
                            </div>
                            <div style={{
                                background: 'linear-gradient(135deg, var(--sage-50), var(--emerald-50))',
                                border: '1px solid var(--sage-200)', borderRadius: '10px',
                                padding: '1rem', marginBottom: '1.5rem',
                                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'
                            }}>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Kode Unik</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sage-700)', fontFamily: 'var(--font-heading)', letterSpacing: '2px' }}>{verifyModal.kode_unik ? String(verifyModal.kode_unik).padStart(3, '0') : '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>Nominal</p>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--emerald-700)', fontFamily: 'var(--font-heading)' }}>{verifyModal.nominal_pembayaran ? `Rp ${Number(verifyModal.nominal_pembayaran).toLocaleString('id-ID')}` : '-'}</p>
                                </div>
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
                            <button className="btn-add" onClick={handleVerify} disabled={saving || !jadwalTes.tanggal || !jadwalTes.waktu}>
                                {saving ? 'Memproses...' : <><FiCheckCircle /> Verifikasi & Kirim Jadwal</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {previewDoc && (
                <div className="admin-modal-overlay" onClick={() => setPreviewDoc(null)} style={{ zIndex: 10000 }}>
                    <div onClick={e => e.stopPropagation()} style={{
                        background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '800px',
                        maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-200)' }}>
                            <h3 style={{ fontSize: '1rem', color: 'var(--gray-700)' }}>{previewDoc.label}</h3>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <a href={previewDoc.url} target="_blank" rel="noopener noreferrer"
                                    style={{ padding: '6px 14px', borderRadius: '8px', background: '#dbeafe', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>Buka Tab Baru</a>
                                <a href={previewDoc.url} download
                                    style={{ padding: '6px 14px', borderRadius: '8px', background: '#f3e8ff', color: '#7c3aed', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <FiDownload size={14} /> Unduh
                                </a>
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

export default VerifikasiManager;
