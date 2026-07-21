import { FiCalendar, FiUsers, FiDollarSign, FiCheckCircle, FiUser, FiClipboard, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLoginModal } from '../App';
import './PPDBPage.css';

const PPDBPage = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const infoCards = [
        { icon: <FiCalendar />, value: 'Juni - Juli 2026', label: 'Periode Pendaftaran' },
        { icon: <FiUsers />, value: '120 Siswa', label: 'Kuota Penerimaan' },
        { icon: <FiDollarSign />, value: 'Rp 150.000', label: 'Biaya Formulir' },
    ];

    const requirements = [
        'Fotokopi Ijazah / Surat Keterangan Lulus (SKL) SMP/MTs',
        'Fotokopi Rapor semester 1 sampai 5',
        'Fotokopi Kartu Keluarga (KK)',
        'Fotokopi Akta Kelahiran',
        'Pas foto berwarna ukuran 3x4 sebanyak 4 lembar',
        'Surat keterangan sehat dari dokter',
        'Fotokopi SKHUN (jika tersedia)',
        'Mengisi formulir pendaftaran online',
    ];

    const steps = [
        { num: 1, title: 'Registrasi Akun', desc: 'Buat akun terlebih dahulu kemudian login', icon: <FiUser /> },
        { num: 2, title: 'Isi Biodata', desc: 'Lengkapi formulir biodata calon siswa', icon: <FiClipboard /> },
        { num: 3, title: 'Pembayaran', desc: 'Transfer biaya formulir sesuai nominal unik yang diberikan', icon: <FiDollarSign /> },
        { num: 4, title: 'Kartu Ujian', desc: 'Dapatkan kartu peserta tes masuk', icon: <FiCalendar /> },
        { num: 5, title: 'Upload Berkas', desc: 'Setelah lulus ujian, upload dokumen persyaratan', icon: <FiClipboard /> },
        { num: 6, title: 'Pengumuman', desc: 'Cek hasil seleksi dan informasi registrasi ulang', icon: <FiCheckCircle /> },
    ];

    const openLoginModal = useLoginModal();

    const handleMulaiDaftar = () => {
        if (isAuthenticated) {
            navigate('/dashboard');
        } else {
            openLoginModal();
        }
    };

    return (
        <div className="ppdb-page">
            <div className="ppdb-hero"><div className="container">
                <div className="ppdb-hero-badge"><FiCalendar /> Tahun Ajaran 2026/2027</div>
                <h1>Penerimaan Peserta Didik Baru</h1>
                <p>Bergabunglah bersama kami dan jadilah bagian dari keluarga besar Madrasah Aliyah Annur</p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="ppdb-submit-btn" onClick={handleMulaiDaftar} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <FiArrowRight /> {isAuthenticated ? 'Buka Dashboard Pendaftaran' : 'Mulai Pendaftaran'}
                    </button>
                    <button
                        className="ppdb-submit-btn"
                        onClick={() => navigate('/cek-status')}
                        style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                    >
                        🔍 Cek Status Pendaftaran
                    </button>
                </div>
            </div></div>

            <div className="container"><div className="ppdb-info-row">
                {infoCards.map((card, i) => (
                    <div className="ppdb-info-card" key={i}>
                        <div className="ppdb-info-icon">{card.icon}</div>
                        <h3>{card.value}</h3><p>{card.label}</p>
                    </div>
                ))}
            </div></div>

            <div className="section"><div className="container">
                <div className="section-header"><h2>Alur Pendaftaran</h2><p>Ikuti langkah-langkah berikut untuk mendaftar sebagai siswa baru</p></div>
                <div className="ppdb-timeline">
                    {steps.map((step) => (
                        <div className="timeline-step" key={step.num}>
                            <div className="timeline-number">{step.num}</div>
                            <div><h4>{step.title}</h4><p>{step.desc}</p></div>
                        </div>
                    ))}
                </div>
            </div></div>

            <div className="ppdb-form-section"><div className="container"><div className="ppdb-form-wrapper">
                <div className="ppdb-form-info">
                    <h2>Persyaratan Pendaftaran</h2>
                    <p>Pastikan Anda telah menyiapkan seluruh dokumen berikut sebelum melakukan pendaftaran.</p>
                    <div className="ppdb-checklist">
                        {requirements.map((req, i) => (
                            <div className="ppdb-checklist-item" key={i}>
                                <div className="ppdb-checklist-icon"><FiCheckCircle /></div>
                                <span>{req}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="ppdb-form-card">
                    <h3>📋 Siap Mendaftar?</h3>
                    <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                        Untuk memulai proses pendaftaran, Anda perlu membuat akun terlebih dahulu.
                        Setelah login, Anda akan diarahkan ke Dashboard Pendaftaran untuk mengisi biodata,
                        melakukan pembayaran, dan mengikuti proses seleksi.
                    </p>
                    <button className="ppdb-submit-btn" onClick={handleMulaiDaftar} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <FiArrowRight /> {isAuthenticated ? 'Buka Dashboard Pendaftaran' : 'Mulai Pendaftaran'}
                    </button>
                    <button
                        onClick={() => navigate('/cek-status')}
                        style={{
                            width: '100%', marginTop: '0.75rem', padding: '12px', borderRadius: '10px',
                            background: 'none', border: '1px solid var(--gray-300)', color: 'var(--gray-600)',
                            fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', gap: '8px',
                            transition: 'all 0.2s',
                        }}
                    >
                        🔍 Cek Status Pendaftaran
                    </button>
                </div>
            </div></div></div>
        </div>
    );
};

export default PPDBPage;
