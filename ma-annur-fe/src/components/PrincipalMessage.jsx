import { FiEye, FiTarget } from 'react-icons/fi';
import './PrincipalMessage.css';

const PrincipalMessage = () => {
    return (
        <section className="section principal" id="profil">
            <div className="container">
                <div className="section-header">
                    <h2>Sambutan Kepala Madrasah</h2>
                    <p>Pesan hangat dari pimpinan Madrasah Aliyah Annur untuk seluruh civitas akademika</p>
                </div>

                <div className="principal-content">
                    <div className="principal-image">
                        <img src="/images/principal.png" alt="Kepala Madrasah Aliyah Annur" />
                    </div>
                    <div className="principal-text">
                        <div className="principal-quote">
                            <p>
                                Pendidikan bukan hanya soal mengejar nilai akademis, tetapi juga
                                membentuk karakter dan akhlakul karimah. Di Madrasah Aliyah Annur,
                                kami berkomitmen mencetak generasi yang tidak hanya cerdas secara
                                intelektual, tetapi juga kuat dalam iman dan taqwa kepada Allah SWT.
                                Setiap siswa adalah amanah yang kami didik dengan penuh kasih sayang
                                dan profesionalisme.
                            </p>
                        </div>
                        <p className="principal-name">Ustadz H. Ahmad Fauzan, S.Pd.I, M.Pd</p>
                        <p className="principal-title">Kepala Madrasah Aliyah Annur</p>
                    </div>
                </div>

                <div className="visi-misi-grid">
                    <div className="vm-card">
                        <div className="vm-card-icon">
                            <FiEye />
                        </div>
                        <h3>Visi</h3>
                        <p>
                            Terwujudnya madrasah yang unggul dalam prestasi, kokoh dalam iman dan
                            taqwa, serta berkarakter Islami yang mampu bersaing di era global dengan
                            tetap menjunjung tinggi nilai-nilai keislaman dan keindonesiaan.
                        </p>
                    </div>

                    <div className="vm-card">
                        <div className="vm-card-icon">
                            <FiTarget />
                        </div>
                        <h3>Misi</h3>
                        <ul>
                            <li>Menyelenggarakan pendidikan berbasis kurikulum nasional dan keislaman</li>
                            <li>Membina akhlakul karimah dan karakter Islami pada seluruh siswa</li>
                            <li>Mengembangkan potensi akademik dan non-akademik siswa secara optimal</li>
                            <li>Menciptakan lingkungan belajar yang kondusif, modern, dan Islami</li>
                            <li>Menjalin kerjasama dengan masyarakat dan lembaga pendidikan lainnya</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrincipalMessage;
