import { useState, useEffect } from 'react';
import { FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { fetchBerita, getAssetUrl } from '../lib/directus';
import './PageStyles.css';

const BeritaPage = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBerita()
            .then(setArticles)
            .catch(() => setArticles([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="page-wrapper">
            <div className="page-hero">
                <div className="container">
                    <div className="page-hero-badge">📰 Ruang Informasi</div>
                    <h1>Berita &amp; Kegiatan</h1>
                    <p>Ikuti perkembangan terbaru dari berbagai kegiatan dan prestasi Madrasah Aliyah Annur</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem 0' }}>Memuat berita...</p>
                    ) : articles.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem 0' }}>Belum ada berita yang dipublikasikan</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                            {articles.map((article) => (
                                <div key={article.id} style={{
                                    background: 'var(--white)', borderRadius: '16px', overflow: 'hidden',
                                    boxShadow: '0 4px 14px rgba(0,0,0,0.08)', border: '1px solid var(--gray-100)',
                                    transition: 'all 0.3s ease', cursor: 'pointer'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.12)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; }}
                                >
                                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden' }}>
                                        <span style={{
                                            position: 'absolute', top: '12px', left: '12px', padding: '4px 14px',
                                            background: 'linear-gradient(135deg, var(--sage-500), var(--emerald-600))',
                                            color: 'var(--white)', fontSize: '0.75rem', fontWeight: 600,
                                            borderRadius: '9999px', zIndex: 2
                                        }}>{article.status}</span>
                                        <img
                                            src={article.gambar_cover ? getAssetUrl(article.gambar_cover) : '/images/gallery-1.png'}
                                            alt={article.judul}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                                        />
                                    </div>
                                    <div style={{ padding: '1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiCalendar /> {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID') : '-'}</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FiUser /> Admin</span>
                                        </div>
                                        <h4 style={{ fontSize: '1.05rem', color: 'var(--gray-800)', marginBottom: '0.5rem', lineHeight: 1.5 }}>{article.judul}</h4>
                                        <p style={{
                                            fontSize: '0.9rem', color: 'var(--gray-500)', lineHeight: 1.7, marginBottom: '1rem',
                                            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>{article.konten ? article.konten.substring(0, 200) : ''}</p>
                                        <Link to={`/berita/${article.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--sage-600)', textDecoration: 'none' }}>
                                            Baca Selengkapnya <FiArrowRight />
                                        </Link>
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

export default BeritaPage;
