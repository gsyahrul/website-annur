import { useState, useEffect } from 'react';
import { FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';
import { fetchBerita, getAssetUrl } from '../lib/directus';
import './News.css';

const News = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBerita()
            .then(setArticles)
            .catch(() => setArticles([]))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="section news" id="berita">
                <div className="container">
                    <div className="section-header">
                        <h2>Berita &amp; Kegiatan Terbaru</h2>
                        <p>Memuat data...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (articles.length === 0) {
        return (
            <section className="section news" id="berita">
                <div className="container">
                    <div className="section-header">
                        <h2>Berita &amp; Kegiatan Terbaru</h2>
                        <p>Belum ada berita yang dipublikasikan</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section news" id="berita">
            <div className="container">
                <div className="section-header">
                    <h2>Berita &amp; Kegiatan Terbaru</h2>
                    <p>Ikuti perkembangan terbaru dari berbagai kegiatan dan prestasi Madrasah Aliyah Annur</p>
                </div>

                <div className="news-grid">
                    {articles.map((article, idx) => (
                        <div
                            className={`news-card ${idx === 0 ? 'news-featured' : ''}`}
                            key={article.id}
                        >
                            <div className="news-card-image">
                                <span className="news-card-badge">{article.status}</span>
                                <img
                                    src={article.gambar_cover ? getAssetUrl(article.gambar_cover) : '/images/gallery-1.png'}
                                    alt={article.judul}
                                />
                            </div>
                            <div className="news-card-body">
                                <div className="news-card-meta">
                                    <span><FiCalendar /> {article.created_at ? new Date(article.created_at).toLocaleDateString('id-ID') : '-'}</span>
                                    <span><FiUser /> Admin</span>
                                </div>
                                <h4>{article.judul}</h4>
                                <p>{article.konten ? article.konten.substring(0, 150) + '...' : ''}</p>
                                <a href="#" className="news-read-more">
                                    Baca Selengkapnya <FiArrowRight />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="news-cta">
                    <a href="/berita" className="btn-secondary">
                        Lihat Semua Berita <FiArrowRight />
                    </a>
                </div>
            </div>
        </section>
    );
};

export default News;
