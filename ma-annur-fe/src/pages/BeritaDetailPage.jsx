import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiUser } from 'react-icons/fi';
import { fetchBeritaBySlug, getAssetUrl } from '../lib/directus';
import './PageStyles.css';

const BeritaDetailPage = () => {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        setError('');
        fetchBeritaBySlug(slug)
            .then((data) => setArticle(data))
            .catch(() => setError('Berita tidak ditemukan.'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="page-content">
                    <div className="container" style={{ textAlign: 'center', padding: '6rem 0', color: 'var(--gray-400)' }}>
                        Memuat berita...
                    </div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="page-wrapper">
                <div className="page-content">
                    <div className="container" style={{ textAlign: 'center', padding: '6rem 0' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📰</div>
                        <h2 style={{ color: 'var(--gray-700)', marginBottom: '0.5rem' }}>Berita Tidak Ditemukan</h2>
                        <p style={{ color: 'var(--gray-400)', marginBottom: '2rem' }}>{error || 'Halaman yang Anda cari tidak tersedia.'}</p>
                        <Link to="/berita" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '12px 28px', background: 'linear-gradient(135deg, var(--sage-500), var(--emerald-600))',
                            color: 'white', borderRadius: '12px', fontWeight: 600, textDecoration: 'none',
                            transition: 'all 0.3s ease'
                        }}>
                            <FiArrowLeft /> Kembali ke Daftar Berita
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            {/* Hero with cover image */}
            <div style={{
                position: 'relative', width: '100%', height: '400px', overflow: 'hidden',
                background: 'var(--sage-900)'
            }}>
                {article.gambar_cover && (
                    <img
                        src={getAssetUrl(article.gambar_cover)}
                        alt={article.judul}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                    />
                )}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(30,53,34,0.95) 0%, rgba(30,53,34,0.3) 100%)',
                    display: 'flex', alignItems: 'flex-end', padding: '3rem 0'
                }}>
                    <div className="container">
                        <Link to="/berita" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', marginBottom: '1rem',
                            textDecoration: 'none', transition: 'color 0.3s'
                        }}
                            onMouseEnter={e => e.currentTarget.style.color = 'white'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                        >
                            <FiArrowLeft /> Kembali ke Berita
                        </Link>
                        <h1 style={{
                            color: 'white', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                            fontWeight: 800, lineHeight: 1.3, maxWidth: '800px'
                        }}>
                            {article.judul}
                        </h1>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '1.5rem',
                            marginTop: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem'
                        }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiCalendar />
                                {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID', {
                                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                                }) : '-'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <FiUser /> Admin
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <div className="page-content" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <article style={{
                        background: 'var(--white)', borderRadius: '20px', padding: '2.5rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid var(--gray-100)',
                        lineHeight: 1.9, fontSize: '1.05rem', color: 'var(--gray-700)',
                        marginTop: '-60px', position: 'relative', zIndex: 2
                    }}>
                        <div style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}
                             dangerouslySetInnerHTML={article.konten?.includes('<') ? { __html: article.konten } : undefined}>
                            {!article.konten?.includes('<') ? article.konten : undefined}
                        </div>
                    </article>

                    {/* Back button */}
                    <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                        <Link to="/berita" style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '14px 32px', background: 'linear-gradient(135deg, var(--sage-500), var(--emerald-600))',
                            color: 'white', borderRadius: '12px', fontWeight: 600, fontSize: '1rem',
                            textDecoration: 'none', boxShadow: '0 4px 14px rgba(90,143,90,0.3)',
                            transition: 'all 0.3s ease'
                        }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(90,143,90,0.4)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(90,143,90,0.3)'; }}
                        >
                            <FiArrowLeft /> Kembali ke Daftar Berita
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeritaDetailPage;
