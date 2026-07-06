import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import { fetchAllGaleri, createGaleri, deleteGaleri, getAssetUrl } from '../lib/directus';

const GaleriManager = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', type: 'photo', status: 'published' });
    const [imageFile, setImageFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const loadData = () => {
        setLoading(true);
        fetchAllGaleri()
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadData(); }, []);

    const handleAdd = async () => {
        if (!form.title || !imageFile) return;
        setSaving(true);
        try {
            await createGaleri({ ...form, image_file: imageFile });
            setModalOpen(false);
            setForm({ title: '', description: '', type: 'photo', status: 'published' });
            setImageFile(null);
            loadData();
        } catch (err) {
            alert('Gagal menambah: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Hapus foto ini?')) return;
        try {
            await deleteGaleri(id);
            loadData();
        } catch (err) {
            alert('Gagal menghapus: ' + err.message);
        }
    };

    return (
        <div>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--gray-800)' }}>Kelola Galeri</h2>
            <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>Tambah dan kelola foto & video kegiatan</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>
                    {loading ? 'Memuat...' : `${items.length} item`}
                </span>
                <button className="btn-add" onClick={() => { setForm({ title: '', description: '', type: 'photo', status: 'published' }); setImageFile(null); setModalOpen(true); }}>
                    <FiPlus /> Tambah Foto
                </button>
            </div>

            <div className="admin-gallery-grid">
                {items.map(item => (
                    <div className="admin-gallery-item" key={item.id}>
                        <div className="admin-gallery-item-actions">
                            <button className="btn-action red" onClick={() => handleDelete(item.id)} style={{ padding: '4px 8px' }}><FiTrash2 /></button>
                        </div>
                        <img src={item.image ? getAssetUrl(item.image) : '/images/gallery-1.png'} alt={item.title} />
                        <div className="admin-gallery-item-info">
                            <h4>{item.title}</h4>
                            <p>{item.description} • {item.type === 'video' ? '🎬 Video' : '📷 Foto'}</p>
                        </div>
                    </div>
                ))}
            </div>

            {modalOpen && (
                <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Tambah Foto / Video</h3>
                            <button className="admin-modal-close" onClick={() => setModalOpen(false)}><FiX /></button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="form-group">
                                <label>Judul *</label>
                                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Judul foto/video" />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi singkat" />
                            </div>
                            <div className="form-group">
                                <label>Upload Gambar *</label>
                                <input type="file" accept="image/*" className="form-input" onChange={e => setImageFile(e.target.files[0])} />
                            </div>
                            <div className="form-group">
                                <label>Tipe</label>
                                <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="photo">Foto</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button className="btn-cancel" onClick={() => setModalOpen(false)}>Batal</button>
                            <button className="btn-add" onClick={handleAdd} disabled={saving}>
                                {saving ? 'Mengupload...' : 'Tambah'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GaleriManager;
