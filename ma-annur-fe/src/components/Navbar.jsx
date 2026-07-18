import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GiMoon } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ onLoginClick }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';
    const { user, isAuthenticated, logout, isAdmin } = useAuth();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const navLinks = [
        { label: 'Beranda', to: '/' },
        { label: 'Profil', to: '/profil' },
        { label: 'PPDB', to: '/ppdb' },
        { label: 'Cek Status', to: '/cek-status' },
        { label: 'Berita', to: '/berita' },
        { label: 'Galeri', to: '/galeri' },
        { label: 'Ruang Baca Digital', to: '/ruang-baca' },
    ];

    const handleLogout = async () => {
        await logout();
        setMenuOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled || !isHome ? 'scrolled' : ''}`}>
            <div className="container">
                <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
                    <div className="logo-icon">
                        <GiMoon />
                    </div>
                    MA Annur
                </Link>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={location.pathname === link.to ? 'active' : ''}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isAuthenticated ? (
                        <>
                            {isAdmin && (
                                <Link
                                    to="/admin"
                                    className={`navbar-login-btn ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                                    onClick={() => setMenuOpen(false)}
                                    style={{ marginRight: '0.25rem' }}
                                >
                                    Dashboard
                                </Link>
                            )}
                            <a
                                href="#"
                                className="navbar-login-btn"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleLogout();
                                }}
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: '#fca5a5' }}
                            >
                                Logout
                            </a>
                        </>
                    ) : (
                        <a
                            href="#"
                            className="navbar-login-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                onLoginClick();
                                setMenuOpen(false);
                            }}
                        >
                            Login
                        </a>
                    )}
                </div>

                <button
                    className={`hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
