import { FiEye, FiTarget, FiUsers, FiAward, FiBookOpen, FiHeart } from 'react-icons/fi';
import './PageStyles.css';

const ProfilPage = () => {
    const stats = [
        { icon: <FiUsers />, value: '500+', label: 'Siswa Aktif' },
        { icon: <FiAward />, value: '50+', label: 'Tenaga Pengajar' },
        { icon: <FiBookOpen />, value: '15+', label: 'Tahun Berdiri' },
        { icon: <FiHeart />, value: '98%', label: 'Tingkat Kelulusan' },
    ];

    return (
        <div className="page-wrapper">
            <div className="page-hero">
                <div className="container">
                    <div className="page-hero-badge">🏫 Tentang Kami</div>
                    <h1>Profil Madrasah Aliyah Annur</h1>
                    <p>Mengenal lebih dekat lembaga pendidikan Islam yang telah membentuk generasi unggul</p>
                </div>
            </div>

            <div className="page-content">
                <div className="container">
                    {/* Principal Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem', alignItems: 'center', marginBottom: '4rem' }}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src="/images/principal.png"
                                alt="Kepala Madrasah"
                                style={{ width: '100%', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'relative', zIndex: 1 }}
                            />
                            <div style={{
                                position: 'absolute', top: '-12px', left: '-12px', right: '12px', bottom: '12px',
                                border: '3px solid var(--emerald-300)', borderRadius: '16px', zIndex: 0
                            }} />
                        </div>
                        <div>
                            <h2 style={{ color: 'var(--sage-700)', marginBottom: '1rem' }}>Sambutan Kepala Madrasah</h2>
                            <div style={{ paddingLeft: '1.5rem', borderLeft: '4px solid var(--emerald-300)', marginBottom: '1.5rem' }}>
                                <p style={{ fontStyle: 'italic', color: 'var(--gray-600)', lineHeight: 1.9, fontSize: '1.05rem' }}>
                                    "Pendidikan bukan hanya soal mengejar nilai akademis, tetapi juga membentuk karakter dan
                                    akhlakul karimah. Di Madrasah Aliyah Annur, kami berkomitmen mencetak generasi yang tidak
                                    hanya cerdas secara intelektual, tetapi juga kuat dalam iman dan taqwa kepada Allah SWT.
                                    Setiap siswa adalah amanah yang kami didik dengan penuh kasih sayang dan profesionalisme."
                                </p>
                            </div>
                            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--sage-700)' }}>
                                Ustadz H. Ahmad Fauzan, S.Pd.I, M.Pd
                            </p>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Kepala Madrasah Aliyah Annur</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '4rem'
                    }}>
                        {stats.map((s, i) => (
                            <div key={i} style={{
                                background: 'var(--white)', borderRadius: '16px', padding: '2rem',
                                boxShadow: '0 4px 14px rgba(0,0,0,0.08)', textAlign: 'center',
                                border: '1px solid var(--gray-100)', transition: 'all 0.3s ease'
                            }}>
                                <div style={{
                                    width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--sage-100), var(--emerald-100))',
                                    borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.5rem', color: 'var(--sage-600)', margin: '0 auto 1rem'
                                }}>{s.icon}</div>
                                <h3 style={{ fontSize: '2rem', color: 'var(--sage-700)', fontWeight: 800 }}>{s.value}</h3>
                                <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Visi Misi */}
                    <div className="section-header">
                        <h2>Visi & Misi</h2>
                        <p>Landasan dan arah pendidikan Madrasah Aliyah Annur</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                        <div style={{
                            background: 'var(--white)', borderRadius: '16px', padding: '2rem',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                                background: 'linear-gradient(90deg, var(--sage-400), var(--emerald-400))'
                            }} />
                            <div style={{
                                width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--sage-100), var(--emerald-100))',
                                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', color: 'var(--sage-600)', marginBottom: '1.5rem'
                            }}><FiEye /></div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--sage-700)' }}>Visi</h3>
                            <p style={{ color: 'var(--gray-500)', fontSize: '0.95rem', lineHeight: 1.8 }}>
                                Unggul Dalam Intelektual, Berkarakter Islami, Berkompetensi Dalam Persaingan Global
                            </p>
                        </div>

                        <div style={{
                            background: 'var(--white)', borderRadius: '16px', padding: '2rem',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{
                                position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
                                background: 'linear-gradient(90deg, var(--sage-400), var(--emerald-400))'
                            }} />
                            <div style={{
                                width: '56px', height: '56px', background: 'linear-gradient(135deg, var(--sage-100), var(--emerald-100))',
                                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem', color: 'var(--sage-600)', marginBottom: '1.5rem'
                            }}><FiTarget /></div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--sage-700)' }}>Misi</h3>
                            <ul style={{ color: 'var(--gray-500)', fontSize: '0.95rem', lineHeight: 1.8, paddingLeft: '1rem' }}>
                                {[
                                    'Membentuk siswa yang cerdas, dan berwawasan luas serta berakhlak mulia',
                                    'Meningkatkan kompetensi belajar siswa yang mampu bersaing di dunia global',
                                    'Meningkatkan budaya disiplin, bersih, dan tertib',
                                ].map((m, i) => (
                                    <li key={i} style={{ paddingLeft: '1rem', marginBottom: '0.5rem', position: 'relative', listStyle: 'none' }}>
                                        <span style={{ position: 'absolute', left: '-0.5rem', color: 'var(--emerald-400)', fontSize: '0.7rem', top: '4px' }}>✦</span>
                                        {m}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Sejarah */}
                    <div style={{ marginTop: '4rem' }}>
                        <div className="section-header">
                            <h2>Sejarah Singkat</h2>
                        </div>
                        <div style={{
                            background: 'var(--white)', borderRadius: '16px', padding: '2.5rem',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.08)', maxWidth: '800px', margin: '0 auto'
                        }}>
                            <p style={{ color: 'var(--gray-600)', lineHeight: 1.9, fontSize: '1rem', textAlign: 'justify' }}>
                                Madrasah Aliyah Annur didirikan pada tahun 2010 oleh Yayasan Pendidikan Islam Annur
                                dengan visi menjadi lembaga pendidikan Islam modern yang mampu mencetak generasi unggul.
                                Bermula dari <strong>3 ruang kelas</strong> dan <strong>45 siswa</strong>, kini MA Annur telah berkembang menjadi
                                madrasah yang memiliki fasilitas lengkap dengan lebih dari <strong>500 siswa</strong> dan <strong>50 tenaga pengajar</strong> profesional.
                            </p>
                            <br />
                            <p style={{ color: 'var(--gray-600)', lineHeight: 1.9, fontSize: '1rem', textAlign: 'justify' }}>
                                Sepanjang perjalanannya, MA Annur telah meraih berbagai prestasi baik di bidang akademik
                                maupun non-akademik, termasuk juara Olimpiade Sains tingkat provinsi, juara MTQ,
                                serta menjadi salah satu madrasah percontohan di wilayah Jawa Barat. Kami terus berkomitmen
                                untuk meningkatkan kualitas pendidikan dan mencetak lulusan yang siap menghadapi tantangan
                                masa depan dengan berbekal iman, ilmu, dan akhlak mulia.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilPage;
