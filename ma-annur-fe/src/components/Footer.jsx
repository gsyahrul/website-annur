import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import { GiMoon } from 'react-icons/gi';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-about">
                        <div className="footer-logo">
                            <div className="logo-icon">
                                <GiMoon />
                            </div>
                            MA Annur
                        </div>
                        <p>
                            Madrasah Aliyah Annur adalah lembaga pendidikan Islam yang berkomitmen
                            membentuk generasi muda yang berilmu, beriman, dan berakhlak mulia
                            sejak tahun 2010.
                        </p>
                        <div className="footer-social">
                            <a href="#" aria-label="Facebook"><FaFacebook /></a>
                            <a href="#" aria-label="Instagram"><FaInstagram /></a>
                            <a href="#" aria-label="YouTube"><FaYoutube /></a>
                            <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
                        </div>
                    </div>

                    <div className="footer-column">
                        <h4>Tautan Cepat</h4>
                        <ul>
                            <li><a href="#beranda">Beranda</a></li>
                            <li><a href="#profil">Profil Sekolah</a></li>
                            <li><a href="#ppdb">Informasi PPDB</a></li>
                            <li><a href="#galeri">Galeri Kegiatan</a></li>
                            <li><a href="#perpustakaan">Perpustakaan</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Akademik</h4>
                        <ul>
                            <li><a href="#">Kurikulum</a></li>
                            <li><a href="#">Ekstrakurikuler</a></li>
                            <li><a href="#">Program Tahfidz</a></li>
                            <li><a href="#">Kalender Akademik</a></li>
                            <li><a href="#">E-Learning</a></li>
                        </ul>
                    </div>

                    <div className="footer-column">
                        <h4>Hubungi Kami</h4>
                        <div className="footer-contact-item">
                            <FiMapPin />
                            <span>Jl. Pendidikan No. 45, Kec. Cibinong, Kab. Bogor, Jawa Barat 16911</span>
                        </div>
                        <div className="footer-contact-item">
                            <FiPhone />
                            <span>(021) 8765-4321</span>
                        </div>
                        <div className="footer-contact-item">
                            <FiMail />
                            <span>info@ma-annur.sch.id</span>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <span>© 2026 Madrasah Aliyah Annur. Semua hak dilindungi.</span>
                    <span>
                        Dibuat dengan ❤️ untuk pendidikan Islam
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
