
import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiBook, FiUpload, FiFile, FiExternalLink, FiImage } from 'react-icons/fi';
import { fetchAllBuku, createBuku, updateBuku, deleteBuku, getAssetUrl } from '../lib/directus';

const CATEGORIES = [
    { value: 'kelas-x', label: 'Kelas X' },
    { value: 'kelas-xi', label: 'Kelas XI' },
    { value: 'kelas-xii', label: 'Kelas XII' },
    { value: 'hiburan', label: 'Hiburan' },
    { value: 'sejarah', label: 'Sejarah' },
    { value: 'referensi', label: 'Referensi' },
];

const BADGES = ['Kurikulum', 'IPA', 'IPS', 'Agama', 'Fiksi', 'Novel', 'Islami', 'Nasional', 'Dunia', 'Kamus', 'Ensiklopedia', 'Atlas'];

const COLORS = [
    { value: '#4a7a4a', label: 'Hijau Tua' },
    { value: '#059669', label: 'Emerald' },
    { value: '#2d4d32', label: 'Hijau Gelap' },
    { value: '#065f46', label: 'Teal' },
    { value: '#3a6340', label: 'Forest' },
    { value: '#047857', label: 'Hijau' },
    { value: '#1e3522', label: 'Dark Green' },
    { value: '#5a8f5a', label: 'Sage' },
    { value: '#f59e0b', label: 'Kuning' },
    { value: '#10b981', label: 'Light Green' },
    { value: '#92400e', label: 'Coklat' },
];

const BukuManager = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', author: '', category: '', badge: '', color: '#4a7a4a', file: null, cover: null });
    const [saving, setSaving] = useState(false);
    const [filterCat, setFilterCat] = useState('');

    const loadData = () => {
        setLoading(true);
        fetchAllBuku()
            .then(setBooks)
            .catch(() => setBooks([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const openAdd = () => {
        setEditing(null);
        setForm({ title: '', author: '', category: 'kelas-x', badge: 'Kurikulum', color: '#4a7a4a', file: null, cover: null });
        setModalOpen(true);
    };

    const openEdit = (b) => {
        setEditing(b);
        setForm({ title: b.title, author: b.author, category: b.category, badge: b.badge, color: b.color, file: null, cover: null });
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.author || !form.category) return;
        setSaving(true);
        try {
            if (editing) {
                await updateBuku(editing.id, form);
            } else {
                await createBuku(form);
            }
            setModalOpen(false);
            loadData();
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus buku ini?')) return;
        try {
            await deleteBuku(id);
            loadData();
        } catch (err) {
            alert('Gagal menghapus: ' + err.message);
        }
    };

    const filtered = filterCat ? books.filter(b => b.category === filterCat) : books;
    const getCategoryLabel = (val) => CATEGORIES.find(c => c.value === val)?.label || val;

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Kelola Ruang Baca</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Tambah, edit, dan hapus koleksi buku perpustakaan digital</p>

            <div className="admin-table-wrapper">
                <div className="admin-table-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h3>Daftar Buku ({filtered.length})</h3>
                        <select
                            className="form-input"
                            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
                            value={filterCat}
                            onChange={e => setFilterCat(e.target.value)}
                        >
                            <option value="">Semua Kategori</option>
                            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                    </div>
                    <button className="btn-add" onClick={openAdd}><FiPlus /> Tambah Buku</button>
                </div>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Cover</th>
                            <th>Judul</th>
                            <th>Penulis</th>
                            <th>Kategori</th>
                            <th>Badge</th>
                            <th>File</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Memuat...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Belum ada buku</td></tr>
                        ) : (
                            filtered.map(b => (
                                <tr key={b.id}>
                                    <td>
                                        {b.cover_image ? (
                                            <img
                                                src={getAssetUrl(b.cover_image)}
                                                alt={b.title}
                                                style={{ width: 28, height: 36, borderRadius: 4, objectFit: 'cover', border: '1px solid var(--gray-200)' }}
                                            />
                                        ) : (
                                            <div style={{ width: 28, height: 36, borderRadius: 4, background: `linear-gradient(135deg, ${b.color}, ${b.color}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <FiBook style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }} />
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontWeight: 500, color: 'var(--gray-700)', maxWidth: '250px' }}>{b.title}</td>
                                    <td>{b.author}</td>
                                    <td><span className="status-badge success">{getCategoryLabel(b.category)}</span></td>
                                    <td><span style={{
                                        display: 'inline-block', padding: '2px 10px', background: 'var(--emerald-50)',
                                        color: 'var(--emerald-700)', fontSize: '0.75rem', fontWeight: 600, borderRadius: '9999px'
                                    }}>{b.badge}</span></td>
                                    <td>
                                        {b.file_url ? (
                                            <a href={getAssetUrl(b.file_url)} target="_blank" rel="noopener noreferrer"
                                               style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--sage-600)', fontWeight: 500 }}>
                                                <FiExternalLink size={14} /> Lihat
                                            </a>
                                        ) : (
                                            <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-action blue" onClick={() => openEdit(b)}><FiEdit2 /> Edit</button>
                                            <button className="btn-action red" onClick={() => handleDelete(b.id)}><FiTrash2 /> Hapus</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {modalOpen && (
                <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>{editing ? 'Edit Buku' : 'Tambah Buku Baru'}</h3>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}><FiX /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="form-group">
                                <label>Judul Buku *</label>
                                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Masukkan judul buku" />
                            </div>
                            <div className="form-group">
                                <label>Penulis / Penerbit *</label>
                                <input className="form-input" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Nama penulis atau penerbit" />
                            </div>
                            <div className="form-group">
                                <label>Kategori *</label>
                                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    <option value="">Pilih kategori</option>
                                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Badge / Label</label>
                                <select className="form-input" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })}>
                                    <option value="">Pilih badge</option>
                                    {BADGES.map(b => <option key={b} value={b}>{b}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Warna Tema Fallback</label>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => setForm({ ...form, color: c.value })}
                                            title={c.label}
                                            style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                background: c.value, border: form.color === c.value ? '3px solid var(--gray-800)' : '2px solid transparent',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Cover Image Upload */}
                            <div className="form-group">
                                <label>Gambar Cover Buku (JPG/PNG)</label>
                                <div style={{
                                    border: '2px dashed var(--gray-200)', borderRadius: '12px',
                                    padding: '1.25rem', textAlign: 'center', cursor: 'pointer',
                                    transition: 'all 0.3s', background: form.cover ? 'var(--emerald-50)' : 'var(--gray-50)',
                                    marginBottom: '0.5rem'
                                }}
                                    onClick={() => document.getElementById('buku-cover-input').click()}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sage-400)'; e.currentTarget.style.background = 'var(--sage-50)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = form.cover ? 'var(--emerald-50)' : 'var(--gray-50)'; }}
                                >
                                    <input
                                        id="buku-cover-input"
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        style={{ display: 'none' }}
                                        onChange={e => setForm({ ...form, cover: e.target.files[0] || null })}
                                    />
                                    {form.cover ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--emerald-700)' }}>
                                            <FiImage size={20} />
                                            <span style={{ fontWeight: 500 }}>{form.cover.name}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setForm({ ...form, cover: null }); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: '4px' }}
                                            ><FiX size={16} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <FiImage size={24} style={{ color: 'var(--gray-400)', marginBottom: '6px' }} />
                                            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>
                                                Klik untuk upload Gambar Cover
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', margin: '4px 0 0' }}>
                                                JPG, PNG (Opsional)
                                            </p>
                                        </>
                                    )}
                                </div>
                                {editing?.cover_image && !form.cover && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--sage-600)', marginTop: '4px' }}>
                                        🖼️ Cover saat ini:{' '}
                                        <a href={getAssetUrl(editing.cover_image)} target="_blank" rel="noopener noreferrer"
                                           style={{ color: 'var(--sage-600)', fontWeight: 500 }}>
                                            Lihat Cover
                                        </a>
                                    </p>
                                )}
                            </div>

                            {/* File Upload (PDF) */}
                            <div className="form-group">
                                <label>File Buku (PDF)</label>
                                <div style={{
                                    border: '2px dashed var(--gray-200)', borderRadius: '12px',
                                    padding: '1.25rem', textAlign: 'center', cursor: 'pointer',
                                    transition: 'all 0.3s', background: form.file ? 'var(--emerald-50)' : 'var(--gray-50)'
                                }}
                                    onClick={() => document.getElementById('buku-file-input').click()}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--sage-400)'; e.currentTarget.style.background = 'var(--sage-50)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.background = form.file ? 'var(--emerald-50)' : 'var(--gray-50)'; }}
                                >
                                    <input
                                        id="buku-file-input"
                                        type="file"
                                        accept=".pdf"
                                        style={{ display: 'none' }}
                                        onChange={e => setForm({ ...form, file: e.target.files[0] || null })}
                                    />
                                    {form.file ? (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--emerald-700)' }}>
                                            <FiFile size={20} />
                                            <span style={{ fontWeight: 500 }}>{form.file.name}</span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setForm({ ...form, file: null }); }}
                                                style={{ background: 'none', border: 'none', color: 'var(--gray-400)', cursor: 'pointer', padding: '4px' }}
                                            ><FiX size={16} /></button>
                                        </div>
                                    ) : (
                                        <>
                                            <FiUpload size={24} style={{ color: 'var(--gray-400)', marginBottom: '6px' }} />
                                            <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', margin: 0 }}>
                                                Klik untuk upload file PDF
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', margin: '4px 0 0' }}>
                                                Maks. 50MB
                                            </p>
                                        </>
                                    )}
                                </div>
                                {editing?.file_url && !form.file && (
                                    <p style={{ fontSize: '0.8rem', color: 'var(--sage-600)', marginTop: '8px' }}>
                                        📄 File saat ini:{' '}
                                        <a href={getAssetUrl(editing.file_url)} target="_blank" rel="noopener noreferrer"
                                           style={{ color: 'var(--sage-600)', fontWeight: 500 }}>
                                            Lihat file
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setModalOpen(false)}>Batal</button>
                            <button className="btn-add" onClick={handleSave} disabled={saving}>
                                {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Tambah Buku'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BukuManager;
