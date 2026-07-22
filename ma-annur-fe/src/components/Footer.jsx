import { FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-about">
                        <div className="footer-logo">
                            <img src="/images/logo-annur.png" alt="Logo MA Annur" className="logo-img" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                            MA Annur
                        </div>
                        <p>
                            Madrasah Aliyah Annur adalah lembaga pendidikan Islam yang berkomitmen
                            membentuk generasi muda yang berilmu, beriman, dan berakhlak mulia
                            sejak tahun 2010.
                        </p>
                        <div className="footer-social">
                            <a href="https://www.facebook.com/p/Madrasah-Aliyah-Annur-100063496989639/" aria-label="Facebook"><FaFacebook /></a>
                            <a href="https://www.instagram.com/_ma.annur?igsh=MXR0cGE1dGltbTF1cA==" aria-label="Instagram"><FaInstagram /></a>
                            <a href="https://www.youtube.com/@maannurchannel7815" aria-label="YouTube"><FaYoutube /></a>
                        </div>
                    </div>

                    <div className="footer-column footer-contact-col">
                        <h4>Hubungi Kami</h4>
                        <div className="footer-contact-item">
                            <FiMapPin />
                            <span>Jl. KH. Muntar Thabrani No.51 Kel.Perwira Kec.Bekasi Utara-Kota Bekasi</span>
                        </div>
                        <div className="footer-contact-item">
                            <FiPhone />
                            <span>082125991649</span>
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
                        Dibuat oleh Mahasiswa Universitas Nusa Mandiri
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
