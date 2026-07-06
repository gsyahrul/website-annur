import { useState, useEffect } from 'react';
import { FiPlay } from 'react-icons/fi';
import { fetchGaleri, getAssetUrl } from '../lib/directus';
import './Gallery.css';

const Gallery = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGaleri()
            .then(setItems)
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="section gallery" id="galeri">
                <div className="container">
                    <div className="section-header">
                        <h2>Galeri Kegiatan</h2>
                        <p>Memuat data...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (items.length === 0) {
        return (
            <section className="section gallery" id="galeri">
                <div className="container">
                    <div className="section-header">
                        <h2>Galeri Kegiatan</h2>
                        <p>Belum ada galeri yang dipublikasikan</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section gallery" id="galeri">
            <div className="container">
                <div className="section-header">
                    <h2>Galeri Kegiatan</h2>
                    <p>Dokumentasi aktivitas dan kegiatan unggulan siswa Madrasah Aliyah Annur</p>
                </div>

                <div className="gallery-grid">
                    {items.map((item) => (
                        <div className={`gallery-item ${item.type === 'video' ? 'video' : ''}`} key={item.id}>
                            <img
                                src={item.image ? getAssetUrl(item.image) : '/images/gallery-1.png'}
                                alt={item.title}
                            />
                            {item.type === 'video' && (
                                <div className="play-icon">
                                    <FiPlay />
                                </div>
                            )}
                            <div className="gallery-overlay">
                                <div className="gallery-overlay-text">
                                    <h4>{item.title}</h4>
                                    <p>{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Gallery;
