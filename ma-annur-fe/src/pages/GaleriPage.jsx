import { useState, useEffect } from 'react';
import { FiPlay } from 'react-icons/fi';
import { fetchGaleri, getAssetUrl } from '../lib/directus';
import './PageStyles.css';

const GaleriPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGaleri()
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page-wrapper">
            <div className="page-hero">
                <div className="container">
                    <div className="page-hero-badge">📸 Dokumentasi</div>
                    <h1>Galeri Kegiatan</h1>
                    <p>Dokumentasi aktivitas dan kegiatan unggulan siswa Madrasah Aliyah Annur</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem 0' }}>Memuat galeri...</p>
                    ) : items.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem 0' }}>Belum ada galeri yang dipublikasikan</p>
                    ) : (
                        <div style={{ columnCount: 3, columnGap: '1.5rem' }}>
                            {items.map((item) => (
                                <div key={item.id} style={{
                                    breakInside: 'avoid', marginBottom: '1.5rem', borderRadius: '16px',
                                    overflow: 'hidden', position: 'relative', cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.12)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                                >
                                    <img
                                        src={item.image ? getAssetUrl(item.image) : '/images/gallery-1.png'}
                                        alt={item.title}
                                        style={{ width: '100%', display: 'block', transition: 'transform 0.5s ease' }}
                                    />
                                    {item.type === 'video' && (
                                        <div style={{
                                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                                            width: '64px', height: '64px', background: 'rgba(255,255,255,0.9)',
                                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.5rem', color: 'var(--sage-700)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', zIndex: 2
                                        }}><FiPlay /></div>
                                    )}
                                    <div style={{
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(to top, rgba(30,53,34,0.8) 0%, transparent 50%)',
                                        opacity: 0, transition: 'opacity 0.3s ease',
                                        display: 'flex', alignItems: 'flex-end', padding: '1.5rem'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                        onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                                    >
                                        <div>
                                            <h4 style={{ color: 'var(--white)', fontSize: '1.05rem', marginBottom: '4px' }}>{item.title}</h4>
                                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GaleriPage;
