import { useState, useEffect } from 'react';
import { FiBookOpen, FiBook, FiGlobe, FiClock, FiAward } from 'react-icons/fi';
import { fetchBuku } from '../lib/directus';
import './DigitalLibrary.css';

const DigitalLibrary = () => {
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
        <section className="section library" id="perpustakaan">
            <div className="container">
                <div className="section-header">
                    <h2>Ruang Baca Digital</h2>
                    <p>Jelajahi koleksi pustaka digital untuk mendukung kegiatan belajar mengajar</p>
                </div>

                <div className="library-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`library-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem 0' }}>Memuat buku...</p>
                ) : books.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '2rem 0' }}>Belum ada buku di kategori ini</p>
                ) : (
                    <div className="library-grid">
                        {books.map((book) => (
                            <div className="book-card" key={book.id}>
                                <div className="book-cover" style={{ background: `linear-gradient(135deg, ${book.color || '#4a7a4a'}, ${book.color || '#4a7a4a'}dd)` }}>
                                    <div className="book-cover-pattern">
                                        <svg width="100%" height="100%">
                                            <pattern id={`pat-${book.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                                <circle cx="20" cy="20" r="8" fill="rgba(255,255,255,0.3)" />
                                            </pattern>
                                            <rect width="100%" height="100%" fill={`url(#pat-${book.id})`} />
                                        </svg>
                                    </div>
                                    <div className="book-cover-icon" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                        {getIcon(book.badge)}
                                    </div>
                                </div>
                                <div className="book-info">
                                    <h4>{book.title}</h4>
                                    <p>{book.author}</p>
                                    <span className="book-badge">{book.badge}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default DigitalLibrary;
