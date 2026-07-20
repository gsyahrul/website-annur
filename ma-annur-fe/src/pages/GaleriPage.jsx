import { useState, useEffect, useCallback } from 'react';
import { FiPlay, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { fetchGaleri, getAssetUrl } from '../lib/directus';
import './PageStyles.css';

const GaleriPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        fetchGaleri()
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    const openLightbox = (index) => setLightboxIndex(index);
    const closeLightbox = () => setLightboxIndex(null);
    const goNext = useCallback(() => {
        if (lightboxIndex !== null) setLightboxIndex((prev) => (prev + 1) % items.length);
    }, [lightboxIndex, items.length]);
    const goPrev = useCallback(() => {
        if (lightboxIndex !== null) setLightboxIndex((prev) => (prev - 1 + items.length) % items.length);
    }, [lightboxIndex, items.length]);

    // Keyboard navigation
    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKey = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [lightboxIndex, goNext, goPrev]);

    const currentItem = lightboxIndex !== null ? items[lightboxIndex] : null;

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
                            {items.map((item, index) => (
                                <div key={item.id} style={{
                                    breakInside: 'avoid', marginBottom: '1.5rem', borderRadius: '16px',
                                    overflow: 'hidden', position: 'relative', cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                    onClick={() => openLightbox(index)}
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

            {/* ── Lightbox Modal ── */}
            {currentItem && (
                <div
                    style={{
                        position: 'fixed', inset: 0, zIndex: 10000,
                        background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(10px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'fadeIn 0.3s ease'
                    }}
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button onClick={closeLightbox} style={{
                        position: 'absolute', top: '20px', right: '24px', zIndex: 10,
                        background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                        width: '48px', height: '48px', borderRadius: '50%', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', transition: 'background 0.3s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    ><FiX /></button>

                    {/* Prev */}
                    {items.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); goPrev(); }} style={{
                            position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                            width: '52px', height: '52px', borderRadius: '50%', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', transition: 'background 0.3s', zIndex: 10
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        ><FiChevronLeft /></button>
                    )}

                    {/* Image */}
                    <div onClick={e => e.stopPropagation()} style={{
                        maxWidth: '90vw', maxHeight: '85vh', display: 'flex',
                        flexDirection: 'column', alignItems: 'center'
                    }}>
                        <img
                            src={currentItem.image ? getAssetUrl(currentItem.image) : '/images/gallery-1.png'}
                            alt={currentItem.title}
                            style={{
                                maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain',
                                borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                                animation: 'scaleIn 0.3s ease'
                            }}
                        />
                        <div style={{ textAlign: 'center', marginTop: '1.2rem', maxWidth: '600px' }}>
                            <h3 style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
                                {currentItem.title}
                            </h3>
                            {currentItem.description && (
                                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                    {currentItem.description}
                                </p>
                            )}
                            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.8rem', marginTop: '8px' }}>
                                {lightboxIndex + 1} / {items.length}
                            </p>
                        </div>
                    </div>

                    {/* Next */}
                    {items.length > 1 && (
                        <button onClick={(e) => { e.stopPropagation(); goNext(); }} style={{
                            position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                            background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
                            width: '52px', height: '52px', borderRadius: '50%', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem', transition: 'background 0.3s', zIndex: 10
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                        ><FiChevronRight /></button>
                    )}
                </div>
            )}

            {/* Lightbox animations */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}</style>
        </div>
    );
};

export default GaleriPage;
