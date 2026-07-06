import { FiArrowRight, FiBookOpen } from 'react-icons/fi';
import { GiMoon } from 'react-icons/gi';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero" id="beranda">
            <div className="hero-bg">
                <img src="/images/hero-bg.png" alt="Siswa Madrasah Aliyah Annur" />
            </div>
            <div className="hero-overlay" />

            <div className="hero-shape hero-shape-1" />
            <div className="hero-shape hero-shape-2" />

            <div className="container hero-content">
                <div className="hero-badge">
                    <GiMoon /> Madrasah Aliyah Annur
                </div>

                <h1>
                    Membentuk Generasi <span>Berilmu, Berakhlak</span> & Berprestasi
                </h1>

                <p className="hero-description">
                    Madrasah Aliyah Annur hadir sebagai lembaga pendidikan Islam modern
                    yang menggabungkan kurikulum nasional dengan pendidikan agama Islam
                    yang komprehensif.
                </p>

                <div className="hero-buttons">
                    <Link to="/ppdb" className="btn-primary">
                        Daftar Sekarang <FiArrowRight />
                    </Link>
                    <a href="#profil" className="hero-btn-secondary">
                        <FiBookOpen /> Tentang Kami
                    </a>
                </div>

                <div className="hero-stats">
                    <div className="hero-stat">
                        <h3>500+</h3>
                        <p>Siswa Aktif</p>
                    </div>
                    <div className="hero-stat">
                        <h3>50+</h3>
                        <p>Tenaga Pengajar</p>
                    </div>
                    <div className="hero-stat">
                        <h3>98%</h3>
                        <p>Kelulusan</p>
                    </div>
                    <div className="hero-stat">
                        <h3>15+</h3>
                        <p>Tahun Berdiri</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
