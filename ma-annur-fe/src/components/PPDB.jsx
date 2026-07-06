import { FiFileText, FiCalendar, FiClipboard, FiCheckCircle, FiArrowRight, FiUser, FiDollarSign } from 'react-icons/fi';
import './PPDB.css';

const PPDB = () => {
    const steps = [
        { num: 1, title: 'Registrasi Online', desc: 'Isi formulir pendaftaran secara online' },
        { num: 2, title: 'Upload Berkas', desc: 'Lengkapi dokumen persyaratan' },
        { num: 3, title: 'Tes Seleksi', desc: 'Ikuti ujian dan wawancara' },
        { num: 4, title: 'Pengumuman', desc: 'Cek hasil seleksi penerimaan' },
    ];

    const requirements = [
        {
            icon: <FiFileText />,
            title: 'Dokumen Akademik',
            desc: 'Ijazah / SKL, rapor semester 1-5, dan SKHUN dari SMP/MTs',
        },
        {
            icon: <FiUser />,
            title: 'Identitas Pribadi',
            desc: 'Fotokopi KK, Akta Kelahiran, pas foto 3x4 (4 lembar)',
        },
        {
            icon: <FiClipboard />,
            title: 'Formulir & Surat',
            desc: 'Formulir pendaftaran terisi, surat keterangan sehat dari dokter',
        },
        {
            icon: <FiCalendar />,
            title: 'Usia & Waktu',
            desc: 'Maksimal usia 18 tahun. Pendaftaran dibuka Juni - Juli 2026',
        },
        {
            icon: <FiDollarSign />,
            title: 'Biaya Pendaftaran',
            desc: 'Biaya formulir Rp 150.000 (tidak termasuk biaya seragam)',
        },
        {
            icon: <FiCheckCircle />,
            title: 'Tes Seleksi',
            desc: 'Tes baca Al-Quran, tes akademik, dan wawancara orang tua',
        },
    ];

    return (
        <section className="section ppdb" id="ppdb">
            <div className="container">
                <div className="section-header">
                    <h2>Penerimaan Peserta Didik Baru (PPDB)</h2>
                    <p>Bergabunglah bersama kami dan jadilah bagian dari keluarga besar Madrasah Aliyah Annur</p>
                </div>

                <div className="ppdb-timeline">
                    {steps.map((step) => (
                        <div className="timeline-step" key={step.num}>
                            <div className="timeline-number">{step.num}</div>
                            <div>
                                <h4>{step.title}</h4>
                                <p>{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="ppdb-requirements">
                    {requirements.map((req, i) => (
                        <div className="req-card" key={i}>
                            <div className="req-card-icon">{req.icon}</div>
                            <h4>{req.title}</h4>
                            <p>{req.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="ppdb-cta">
                    <a href="#" className="btn-primary">
                        Daftar Sekarang <FiArrowRight />
                    </a>
                    <p>Kuota terbatas — Segera daftarkan putra/putri Anda!</p>
                </div>
            </div>
        </section>
    );
};

export default PPDB;
