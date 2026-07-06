import { useState, useEffect } from 'react';
import { FiBookOpen, FiBook, FiGlobe, FiClock, FiAward } from 'react-icons/fi';
import { fetchBuku } from '../lib/directus';
import './PageStyles.css';

const ICON_MAP = {
    'BookOpen': <FiBookOpen />,
    'Book': <FiBook />,
    'Globe': <FiGlobe />,
    'Clock': <FiClock />,
    'Award': <FiAward />,
};

const RuangBacaPage = () => {
    const [activeTab, setActiveTab] = useState('kelas-x');
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = [
        { id: 'kelas-x', label: 'Kelas X' },
        { id: 'kelas-xi', label: 'Kelas XI' },
        { id: 'kelas-xii', label: 'Kelas XII' },
        { id: 'hiburan', label: 'Hiburan' },
        { id: 'sejarah', label: 'Sejarah' },
        { id: 'referensi', label: 'Referensi' },
    ];

    useEffect(() => {
        setLoading(true);
        fetchBuku(activeTab)
            .then(setBooks)
            .catch(() => setBooks([]))
            .finally(() => setLoading(false));
    }, [activeTab]);

    const getIcon = (badge) => {
        if (['Kurikulum', 'IPA', 'IPS'].includes(badge)) return <FiBookOpen />;
        if (['Agama', 'Islami'].includes(badge)) return <FiAward />;
        if (['Nasional', 'Dunia', 'Kamus', 'Atlas', 'Ensiklopedia'].includes(badge)) return <FiGlobe />;
        if (badge === 'Sejarah' || badge === 'sejarah') return <FiClock />;
        return <FiBook />;
    };

    return (
        <div className="page-wrapper">
            <div className="page-hero">
                <div className="container">
                    <div className="page-hero-badge">📚 Perpustakaan Digital</div>
                    <h1>Ruang Baca Digital</h1>
                    <p>Jelajahi koleksi pustaka digital untuk mendukung kegiatan belajar mengajar</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    {/* Tabs */}
                    <div style={{
                        display: 'flex', justifyContent: 'center', flexWrap: 'wrap',
                        gap: '0.5rem', marginBottom: '2rem'
                    }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '10px 24px',
                                    background: activeTab === tab.id
                                        ? 'linear-gradient(135deg, var(--sage-500), var(--emerald-600))'
                                        : 'var(--white)',
                                    border: activeTab === tab.id
                                        ? '2px solid transparent'
                                        : '2px solid var(--gray-200)',
                                    borderRadius: '9999px',
                                    fontWeight: activeTab === tab.id ? 600 : 500,
                                    fontSize: '0.9rem',
                                    color: activeTab === tab.id ? 'var(--white)' : 'var(--gray-500)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: activeTab === tab.id ? '0 4px 12px rgba(90,143,90,0.3)' : 'none'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Book Grid */}
                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem 0' }}>Memuat buku...</p>
                    ) : books.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem 0' }}>Belum ada buku di kategori ini</p>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {books.map((book) => (
                                <div key={book.id} style={{
                                    background: 'var(--white)', borderRadius: '16px', overflow: 'hidden',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.3s ease', cursor: 'pointer'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
                                >
                                    <div style={{
                                        width: '100%', aspectRatio: '3/4',
                                        background: `linear-gradient(135deg, ${book.color || '#4a7a4a'}, ${book.color || '#4a7a4a'}dd)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        position: 'relative', overflow: 'hidden'
                                    }}>
                                        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                                            <pattern id={`bp-${book.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                                <circle cx="20" cy="20" r="8" fill="rgba(255,255,255,0.3)" />
                                            </pattern>
                                            <rect width="100%" height="100%" fill={`url(#bp-${book.id})`} />
                                        </svg>
                                        <div style={{ position: 'relative', zIndex: 1, fontSize: '2.5rem', color: 'rgba(255,255,255,0.9)' }}>
                                            {getIcon(book.badge)}
                                        </div>
                                    </div>
                                    <div style={{ padding: '1rem 1.25rem' }}>
                                        <h4 style={{
                                            fontSize: '0.9rem', color: 'var(--gray-800)', marginBottom: '4px',
                                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                        }}>{book.title}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>{book.author}</p>
                                        <span style={{
                                            display: 'inline-block', padding: '2px 10px', background: 'var(--emerald-50)',
                                            color: 'var(--emerald-700)', fontSize: '0.7rem', fontWeight: 600,
                                            borderRadius: '9999px', marginTop: '6px'
                                        }}>{book.badge}</span>
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

export default RuangBacaPage;
