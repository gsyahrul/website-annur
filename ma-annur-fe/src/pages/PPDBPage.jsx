import { useState, useRef, useEffect } from 'react';
import { FiCalendar, FiUsers, FiClipboard, FiCheckCircle, FiUser, FiDollarSign, FiSend, FiX, FiCopy, FiSearch, FiClock, FiAlertCircle, FiDownload, FiArrowLeft } from 'react-icons/fi';
import { GiMoon } from 'react-icons/gi';
import { useAuth, AuthError } from '../context/AuthContext';
import { createBiodata, updateBiodata, getBiodata, uploadDokumen, getDokumen, cekStatusPPDB, registerUser } from '../lib/directus';
import html2pdf from 'html2pdf.js';
import './PPDBPage.css';

const PPDBPage = () => {
    const { user, isAuthenticated, login: authLogin, handleAuthError } = useAuth();

    // Registration/Login state
    const [authMode, setAuthMode] = useState('register'); // 'register' | 'login'
    const [authForm, setAuthForm] = useState({ email: '', password: '' });
    const [authError, setAuthError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    const [formData, setFormData] = useState({
        namaLengkap: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: '',
        asalSekolah: '', nisn: '', noHp: '', alamat: '', jurusan: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [copied, setCopied] = useState(false);
    const [existingBiodata, setExistingBiodata] = useState(null);
    const [biodataLoading, setBiodataLoading] = useState(false);
    const [uploadedDocs, setUploadedDocs] = useState([]);
    const [uploadingDoc, setUploadingDoc] = useState(null);

    // Cek Status state
    const [statusNisn, setStatusNisn] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusResult, setStatusResult] = useState(null);
    const [statusError, setStatusError] = useState('');
    const [downloading, setDownloading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);
    const kartuRef = useRef(null);

    // Check existing biodata only when user is authenticated
    useEffect(() => {
        if (!user) {
            setExistingBiodata(null);
            setBiodataLoading(false);
            return;
        }
        setBiodataLoading(true);
        getBiodata()
            .then(data => {
                if (data) {
                    setExistingBiodata(data);
                }
            })
            .catch((err) => {
                // If auth error, clear auth state
                if (err instanceof AuthError) {
                    handleAuthError();
                }
                // No biodata yet — that's fine, show the form
                setExistingBiodata(null);
            })
            .finally(() => setBiodataLoading(false));
    }, [user, handleAuthError]);

    // Load existing documents when biodata is loaded
    useEffect(() => {
        if (existingBiodata) {
            getDokumen()
                .then(docs => setUploadedDocs(docs || []))
                .catch(() => setUploadedDocs([]));
        }
    }, [existingBiodata]);

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setAuthLoading(true);
        try {
            if (authMode === 'register') {
                await registerUser(authForm.email, authForm.password);
            }
            const result = await authLogin(authForm.email, authForm.password);
            if (result.success) {
                // AuthContext will update `user` and `isAuthenticated` automatically
            } else {
                setAuthError(result.message);
            }
        } catch (err) {
            setAuthError(err.message || 'Terjadi kesalahan');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                nisn: formData.nisn, nama_lengkap: formData.namaLengkap,
                tempat_lahir: formData.tempatLahir, tanggal_lahir: formData.tanggalLahir,
                jenis_kelamin: formData.jenisKelamin, asal_sekolah: formData.asalSekolah,
                jurusan: formData.jurusan, no_hp: formData.noHp, alamat: formData.alamat,
            };

            let result;
            if (existingBiodata) {
                // Update existing biodata
                result = await updateBiodata(payload);
            } else {
                // Create new biodata
                result = await createBiodata(payload);
            }

            // Reload biodata to get latest data
            const latestBiodata = await getBiodata();
            setExistingBiodata(latestBiodata);
            setPaymentData({
                kode_unik: latestBiodata?.kode_unik || result?.kode_unik,
                nominal_pembayaran: latestBiodata?.nominal_pembayaran || result?.nominal_pembayaran,
            });
            setJustSubmitted(true);
            setFormData({ namaLengkap: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: '', asalSekolah: '', nisn: '', noHp: '', alamat: '', jurusan: '' });
        } catch (err) {
            alert('Gagal mengirim pendaftaran: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

    const handleCopyNominal = () => {
        if (!paymentData) return;
        navigator.clipboard.writeText(String(paymentData.nominal_pembayaran));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleStatusSubmit = async (e) => {
        e.preventDefault();
        if (!statusNisn.trim()) return;
        setStatusLoading(true); setStatusResult(null); setStatusError(''); setDownloaded(false);
        try {
            const data = await cekStatusPPDB(statusNisn.trim());
            setStatusResult(data || 'not_found');
        } catch (err) { setStatusError(err.message || 'Terjadi kesalahan.'); }
        finally { setStatusLoading(false); }
    };

    const handleDownloadPDF = async () => {
        if (!kartuRef.current) return;
        setDownloading(true);
        try {
            await html2pdf().set({
                margin: [15, 15, 15, 15],
                filename: `Kartu_Peserta_Tes_${statusResult.nama_lengkap?.replace(/\s+/g, '_') || 'PPDB'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: [250, 353], orientation: 'portrait' },
            }).from(kartuRef.current).save();
            setDownloaded(true);
        } catch (err) { alert('Gagal mengunduh PDF: ' + err.message); }
        finally { setDownloading(false); }
    };

    const handleStatusReset = () => { setStatusResult(null); setStatusNisn(''); setStatusError(''); setDownloaded(false); };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try { return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
        catch { return dateStr; }
    };

    const isVerified = statusResult && typeof statusResult === 'object' && statusResult.status_pendaftaran === 'terverifikasi';
    const isPending = statusResult && typeof statusResult === 'object' && ['belum_lengkap', 'menunggu_verifikasi'].includes(statusResult.status_pendaftaran);
    const isLulus = statusResult && typeof statusResult === 'object' && statusResult.status_pendaftaran === 'lulus';
    const isTidakLulus = statusResult && typeof statusResult === 'object' && statusResult.status_pendaftaran === 'tidak_lulus';
    const notFound = statusResult === 'not_found';

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
        { num: 4, title: 'Tes & Pengumuman', desc: 'Ikuti tes seleksi dan cek hasilnya', icon: <FiCheckCircle /> },
    ];

    return (
        <div className="ppdb-page">
            <div className="ppdb-hero"><div className="container">
                <div className="ppdb-hero-badge"><FiCalendar /> Tahun Ajaran 2026/2027</div>
                <h1>Penerimaan Peserta Didik Baru</h1>
                <p>Bergabunglah bersama kami dan jadilah bagian dari keluarga besar Madrasah Aliyah Annur</p>
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
                    {!isAuthenticated ? (
                        <>
                            <h3>{authMode === 'register' ? 'Buat Akun Baru' : 'Masuk ke Akun'}</h3>
                            <p>{authMode === 'register' ? 'Daftar akun untuk memulai proses PPDB' : 'Masuk dengan akun yang sudah terdaftar'}</p>
                            {authError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem' }}>{authError}</div>}
                            <form onSubmit={handleAuthSubmit}>
                                <div className="form-group"><label>Email *</label>
                                    <input type="email" className="form-input" placeholder="email@contoh.com" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required /></div>
                                <div className="form-group"><label>Password *</label>
                                    <input type="password" className="form-input" placeholder="Minimal 6 karakter" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required minLength={6} /></div>
                                <button type="submit" className="ppdb-submit-btn" disabled={authLoading}>
                                    {authLoading ? 'Memproses...' : authMode === 'register' ? 'Daftar & Masuk' : 'Masuk'}
                                </button>
                            </form>
                            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--gray-500)' }}>
                                {authMode === 'register' ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
                                <button onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setAuthError(''); }}
                                    style={{ background: 'none', border: 'none', color: 'var(--sage-600)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                                    {authMode === 'register' ? 'Masuk di sini' : 'Daftar di sini'}
                                </button>
                            </p>
                        </>
                    ) : biodataLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>Memuat data...</div>
                    ) : existingBiodata ? (
                        <>
                            <h3>✅ Pendaftaran Anda Sudah Tercatat</h3>
                            <p style={{ color: 'var(--gray-500)', marginBottom: '1rem' }}>Berikut adalah ringkasan data pendaftaran Anda</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                                {[
                                    ['Nama Lengkap', existingBiodata.nama_lengkap],
                                    ['NISN', existingBiodata.nisn],
                                    ['Tempat Lahir', existingBiodata.tempat_lahir],
                                    ['Tanggal Lahir', existingBiodata.tanggal_lahir ? new Date(existingBiodata.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'],
                                    ['Jenis Kelamin', existingBiodata.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'],
                                    ['Jurusan', existingBiodata.jurusan || '-'],
                                    ['Asal Sekolah', existingBiodata.asal_sekolah],
                                    ['No. HP', existingBiodata.no_hp || '-'],
                                ].map(([label, value], i) => (
                                    <div key={i}>
                                        <p style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                                        <p style={{ fontSize: '0.88rem', color: 'var(--gray-700)', fontWeight: 500 }}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: '12px', border: '1px solid #a7f3d0', marginBottom: '1rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginBottom: '4px' }}>Kode Unik</p>
                                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#065f46', letterSpacing: '2px' }}>{existingBiodata.kode_unik ? String(existingBiodata.kode_unik).padStart(3, '0') : '-'}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginBottom: '4px' }}>Nominal Pembayaran</p>
                                    <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857' }}>{existingBiodata.nominal_pembayaran ? formatCurrency(existingBiodata.nominal_pembayaran) : '-'}</p>
                                </div>
                            </div>

                            <div style={{ padding: '0.75rem 1rem', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.82rem', color: '#166534' }}>
                                    <strong>Status:</strong>{' '}
                                    {existingBiodata.status_pendaftaran === 'belum_lengkap' && '📝 Belum Lengkap — Silakan lengkapi dokumen dan lakukan pembayaran.'}
                                    {existingBiodata.status_pendaftaran === 'menunggu_verifikasi' && '⏳ Menunggu Verifikasi — Pembayaran sedang diverifikasi oleh admin.'}
                                    {existingBiodata.status_pendaftaran === 'terverifikasi' && '✅ Terverifikasi — Cek jadwal tes di halaman Cek Status.'}
                                    {existingBiodata.status_pendaftaran === 'lulus' && '🎉 Selamat! Anda dinyatakan LULUS.'}
                                    {existingBiodata.status_pendaftaran === 'tidak_lulus' && '❌ Mohon maaf, Anda tidak lulus seleksi.'}
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setExistingBiodata(null);
                                    setFormData({
                                        namaLengkap: existingBiodata.nama_lengkap || '',
                                        tempatLahir: existingBiodata.tempat_lahir || '',
                                        tanggalLahir: existingBiodata.tanggal_lahir ? existingBiodata.tanggal_lahir.split('T')[0] : '',
                                        jenisKelamin: existingBiodata.jenis_kelamin || '',
                                        asalSekolah: existingBiodata.asal_sekolah || '',
                                        nisn: existingBiodata.nisn || '',
                                        noHp: existingBiodata.no_hp || '',
                                        alamat: existingBiodata.alamat || '',
                                        jurusan: existingBiodata.jurusan || '',
                                    });
                                }}
                                style={{
                                    background: 'none', border: '1px solid var(--gray-300)', color: 'var(--gray-600)',
                                    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500
                                }}
                            >
                                ✏️ Edit Biodata
                            </button>

                            {/* Upload Dokumen Section */}
                            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
                                <h4 style={{ fontSize: '1rem', color: 'var(--gray-700)', marginBottom: '0.75rem' }}>📁 Upload Dokumen</h4>
                                <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '1rem' }}>Upload dokumen persyaratan pendaftaran (JPEG, PNG, atau PDF, maks 5MB)</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {[
                                        { key: 'kk', label: 'Kartu Keluarga (KK)' },
                                        { key: 'akta_kelahiran', label: 'Akta Kelahiran' },
                                        { key: 'skl', label: 'Surat Keterangan Lulus (SKL)' },
                                        { key: 'pas_foto', label: 'Pas Foto 3x4' },
                                    ].map(doc => {
                                        const uploaded = uploadedDocs.find(d => d.jenis_dokumen === doc.key);
                                        return (
                                            <div key={doc.key} style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: '0.75rem 1rem', borderRadius: '10px',
                                                border: uploaded ? '1px solid #a7f3d0' : '1px solid var(--gray-200)',
                                                background: uploaded ? '#f0fdf4' : 'var(--gray-50)',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ fontSize: '1.1rem' }}>{uploaded ? '✅' : '📄'}</span>
                                                    <div>
                                                        <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--gray-700)' }}>{doc.label}</p>
                                                        {uploaded && (
                                                            <p style={{ fontSize: '0.72rem', color: '#059669' }}>
                                                                {uploaded.status_validasi === 'valid' ? '✓ Divalidasi' : uploaded.status_validasi === 'revisi' ? '⚠️ Perlu Revisi' : 'Menunggu validasi'}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <label style={{
                                                    padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                                                    fontSize: '0.78rem', fontWeight: 600,
                                                    background: uploaded ? '#d1fae5' : 'linear-gradient(135deg, var(--sage-500), var(--emerald-600))',
                                                    color: uploaded ? '#065f46' : '#fff', border: 'none',
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                }}>
                                                    {uploadingDoc === doc.key ? 'Mengunggah...' : uploaded ? '🔄 Ganti' : '📤 Upload'}
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        style={{ display: 'none' }}
                                                        disabled={uploadingDoc === doc.key}
                                                        onChange={async (e) => {
                                                            const file = e.target.files[0];
                                                            if (!file) return;
                                                            setUploadingDoc(doc.key);
                                                            try {
                                                                await uploadDokumen(file, doc.key);
                                                                const docs = await getDokumen();
                                                                setUploadedDocs(docs || []);
                                                            } catch (err) {
                                                                alert('Gagal upload: ' + err.message);
                                                            } finally {
                                                                setUploadingDoc(null);
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                    />
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>

                    ) : (
                        <>
                            <h3>Formulir Pendaftaran</h3>
                            <p>Isi data berikut dengan lengkap dan benar</p>
                            <form className="ppdb-form" onSubmit={handleSubmit}>
                                <div className="ppdb-form-row">
                                    <div className="form-group"><label>Nama Lengkap *</label>
                                        <input type="text" name="namaLengkap" className="form-input" placeholder="Nama lengkap siswa" value={formData.namaLengkap} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>NISN *</label>
                                        <input type="text" name="nisn" className="form-input" placeholder="10 digit NISN" value={formData.nisn} onChange={handleChange} required maxLength={10} /></div>
                                </div>
                                <div className="ppdb-form-row">
                                    <div className="form-group"><label>Tempat Lahir *</label>
                                        <input type="text" name="tempatLahir" className="form-input" placeholder="Kota kelahiran" value={formData.tempatLahir} onChange={handleChange} required /></div>
                                    <div className="form-group"><label>Tanggal Lahir *</label>
                                        <input type="date" name="tanggalLahir" className="form-input" value={formData.tanggalLahir} onChange={handleChange} required /></div>
                                </div>
                                <div className="ppdb-form-row">
                                    <div className="form-group"><label>Jenis Kelamin *</label>
                                        <select name="jenisKelamin" className="form-input" value={formData.jenisKelamin} onChange={handleChange} required>
                                            <option value="">Pilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option>
                                        </select></div>
                                    <div className="form-group"><label>Jurusan Pilihan *</label>
                                        <select name="jurusan" className="form-input" value={formData.jurusan} onChange={handleChange} required>
                                            <option value="">Pilih Jurusan</option><option value="IPA">IPA</option><option value="IPS">IPS</option><option value="Keagamaan">Keagamaan</option>
                                        </select></div>
                                </div>
                                <div className="form-group"><label>Asal Sekolah (SMP/MTs) *</label>
                                    <input type="text" name="asalSekolah" className="form-input" placeholder="Nama sekolah asal" value={formData.asalSekolah} onChange={handleChange} required /></div>
                                <div className="ppdb-form-row">
                                    <div className="form-group"><label>No. HP / WhatsApp *</label>
                                        <input type="tel" name="noHp" className="form-input" placeholder="08xxxxxxxxxx" value={formData.noHp} onChange={handleChange} required /></div>
                                </div>
                                <div className="form-group"><label>Alamat Lengkap *</label>
                                    <textarea name="alamat" className="form-input" placeholder="Alamat lengkap" rows="3" value={formData.alamat} onChange={handleChange} required style={{ resize: 'vertical' }} /></div>
                                <button type="submit" className="ppdb-submit-btn" disabled={submitting}>
                                    {submitting ? 'Mengirim...' : <><FiSend /> Kirim Pendaftaran</>}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div></div></div>

            {/* CEK STATUS WIDGET */}
            <div className="ppdb-status-section"><div className="container">
                <div className="section-header">
                    <div className="ppdb-hero-badge" style={{ background: 'var(--sage-100)', color: 'var(--sage-700)' }}><FiSearch /> Cek Status Pendaftaran</div>
                    <h2>Cek Status PPDB</h2>
                    <p>Masukkan NISN untuk mengecek status pendaftaran dan mengunduh Kartu Peserta Tes</p>
                </div>
                {!isVerified && !isLulus && !isTidakLulus && (
                    <div className="status-widget-card"><form onSubmit={handleStatusSubmit}><div className="status-widget-row">
                        <input type="text" className="form-input" placeholder="Masukkan NISN (contoh: 0012345678)" value={statusNisn} onChange={(e) => setStatusNisn(e.target.value)} maxLength={20} required />
                        <button type="submit" className="ppdb-submit-btn" disabled={statusLoading || !statusNisn.trim()} style={{ width: 'auto', minWidth: '160px' }}>
                            {statusLoading ? 'Mencari...' : <><FiSearch /> Cek Status</>}
                        </button>
                    </div></form></div>
                )}
                {statusError && <div className="status-alert alert-danger"><FiAlertCircle size={20} /><span>{statusError}</span></div>}
                {notFound && <div className="status-alert alert-danger"><FiAlertCircle size={20} /><span>Data pendaftaran dengan NISN tersebut tidak ditemukan.</span></div>}
                {isPending && <div className="status-alert alert-warning"><FiClock size={20} /><span>Data ditemukan atas nama <strong>{statusResult.nama_lengkap}</strong>. Status sedang dalam proses verifikasi.</span></div>}

                {isLulus && (
                    <div className="kartu-section">
                        <div className="kartu-actions-top"><button className="btn-back" onClick={handleStatusReset}><FiArrowLeft /> Cari Ulang</button></div>
                        <div style={{
                            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                            border: '2px solid #10b981',
                            borderRadius: '16px',
                            padding: '2.5rem',
                            textAlign: 'center',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                            <h2 style={{ color: '#065f46', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Selamat, Anda Dinyatakan LULUS!</h2>
                            <p style={{ color: '#047857', fontSize: '1.05rem', marginBottom: '1rem' }}>
                                <strong>{statusResult.nama_lengkap}</strong> — NISN: {statusResult.nisn}
                            </p>
                            <p style={{ color: '#065f46', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Anda telah dinyatakan lulus seleksi penerimaan siswa baru Madrasah Aliyah Annur Tahun Ajaran 2026/2027.
                                Silakan lakukan daftar ulang sesuai jadwal yang telah ditentukan.
                            </p>
                        </div>
                    </div>
                )}

                {isTidakLulus && (
                    <div className="kartu-section">
                        <div className="kartu-actions-top"><button className="btn-back" onClick={handleStatusReset}><FiArrowLeft /> Cari Ulang</button></div>
                        <div style={{
                            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                            border: '2px solid #ef4444',
                            borderRadius: '16px',
                            padding: '2.5rem',
                            textAlign: 'center',
                            marginBottom: '2rem'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
                            <h2 style={{ color: '#991b1b', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Tidak Lulus Seleksi</h2>
                            <p style={{ color: '#dc2626', fontSize: '1.05rem', marginBottom: '1rem' }}>
                                <strong>{statusResult.nama_lengkap}</strong> — NISN: {statusResult.nisn}
                            </p>
                            <p style={{ color: '#991b1b', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                Mohon maaf, Anda belum dinyatakan lulus pada seleksi penerimaan siswa baru Madrasah Aliyah Annur
                                Tahun Ajaran 2026/2027. Terima kasih atas partisipasi Anda.
                            </p>
                        </div>
                    </div>
                )}

                {isVerified && (
                    <div className="kartu-section">
                        <div className="kartu-actions-top"><button className="btn-back" onClick={handleStatusReset}><FiArrowLeft /> Cari Ulang</button></div>
                        <div className="kartu-peserta" ref={kartuRef}>
                            <div className="kartu-stripe"></div>
                            <div className="kartu-kop"><div className="kartu-logo"><GiMoon /></div><div className="kartu-kop-text"><div className="kartu-institution">MADRASAH ALIYAH ANNUR</div><div className="kartu-address">Jl. Pendidikan No. 1 — Terakreditasi A</div></div></div>
                            <div className="kartu-title-band"><span>KARTU PESERTA TES MASUK</span><span className="kartu-tahun">T.A 2026/2027</span></div>
                            <div className="kartu-body">
                                <div className="kartu-main-layout">
                                    <div className="kartu-photo-area"><div className="kartu-photo-placeholder"><span>FOTO</span><span className="photo-size">3×4</span></div><div className="kartu-no-peserta"><div className="no-peserta-label">NO. PESERTA</div><div className="no-peserta-value">{String(statusResult.id).padStart(4, '0')}</div></div></div>
                                    <div className="kartu-info"><table className="kartu-table"><tbody>
                                        {[['Nama Lengkap', statusResult.nama_lengkap],['NISN', statusResult.nisn],['Asal Sekolah', statusResult.asal_sekolah],['Jurusan Pilihan', statusResult.jurusan],['Jenis Kelamin', statusResult.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan']].map(([label, val], i) => (
                                            <tr key={i}><td className="td-label">{label}</td><td className="td-sep">:</td><td className="td-value">{val}</td></tr>
                                        ))}
                                    </tbody></table></div>
                                </div>
                                <div className="kartu-jadwal"><div className="jadwal-header"><FiCalendar /> JADWAL TES MASUK</div><div className="jadwal-grid">
                                    <div className="jadwal-item"><div className="jadwal-icon-circle">📅</div><div className="jadwal-detail"><div className="jadwal-label">Hari / Tanggal</div><div className="jadwal-value">{formatDate(statusResult.jadwal_tes_tanggal)}</div></div></div>
                                    <div className="jadwal-item"><div className="jadwal-icon-circle">🕐</div><div className="jadwal-detail"><div className="jadwal-label">Waktu</div><div className="jadwal-value">{statusResult.jadwal_tes_waktu || '-'} WIB</div></div></div>
                                    <div className="jadwal-item"><div className="jadwal-icon-circle">📍</div><div className="jadwal-detail"><div className="jadwal-label">Tempat</div><div className="jadwal-value">{statusResult.jadwal_tes_lokasi || 'Gedung Utama MA Annur'}</div></div></div>
                                </div></div>
                                <div className="kartu-catatan"><p><strong>Catatan:</strong> Kartu ini wajib dibawa saat mengikuti tes masuk.</p></div>
                                <div className="kartu-signature">
                                    <div className="sig-block"><div className="sig-label">Peserta,</div><div className="sig-space"></div><div className="sig-name">{statusResult.nama_lengkap}</div></div>
                                    <div className="sig-block"><div className="sig-label">Panitia PPDB,</div><div className="sig-space"></div><div className="sig-name">____________________</div></div>
                                </div>
                            </div>
                            <div className="kartu-stripe-bottom"></div>
                        </div>
                        <div className="kartu-download-area">
                            {!downloaded ? (
                                <button className="btn-download" onClick={handleDownloadPDF} disabled={downloading}>
                                    {downloading ? <><span className="spinner-inline"></span> Mengunduh...</> : <><FiDownload size={20} /> Unduh Kartu Peserta (PDF)</>}
                                </button>
                            ) : (<div className="download-success"><FiCheckCircle size={20} /><span>Kartu peserta berhasil diunduh!</span></div>)}
                        </div>
                    </div>
                )}
            </div></div>

            {/* PAYMENT MODAL — only show after fresh form submission */}
            {paymentData && justSubmitted && (
                <div className="payment-modal-overlay" onClick={() => { setPaymentData(null); setJustSubmitted(false); }}>
                    <div className="payment-modal" onClick={e => e.stopPropagation()}>
                        <button className="payment-modal-close" onClick={() => { setPaymentData(null); setJustSubmitted(false); }}><FiX /></button>
                        <div className="payment-modal-icon"><FiCheckCircle /></div>
                        <h2>Pendaftaran Berhasil!</h2>
                        <p className="payment-modal-subtitle">Silakan lakukan pembayaran biaya formulir sesuai nominal berikut:</p>
                        <div className="payment-nominal-box">
                            <div className="payment-nominal-label">Total Pembayaran</div>
                            <div className="payment-nominal-value">{formatCurrency(paymentData.nominal_pembayaran)}</div>
                            <div className="payment-kode-unik">Kode Unik: <strong>{String(paymentData.kode_unik).padStart(3, '0')}</strong></div>
                            <button className="payment-copy-btn" onClick={handleCopyNominal}><FiCopy /> {copied ? 'Tersalin!' : 'Salin Nominal'}</button>
                        </div>
                        <div className="payment-info-box">
                            <h4>Instruksi Pembayaran</h4>
                            <div className="payment-info-item"><span className="payment-info-label">Bank Tujuan</span><span className="payment-info-value">Bank Syariah Indonesia (BSI)</span></div>
                            <div className="payment-info-item"><span className="payment-info-label">No. Rekening</span><span className="payment-info-value">1234-5678-9012</span></div>
                            <div className="payment-info-item"><span className="payment-info-label">Atas Nama</span><span className="payment-info-value">Yayasan MA Annur</span></div>
                        </div>
                        <div className="payment-warning"><FiAlertCircle /><span>Transfer <strong>tepat</strong> sesuai nominal di atas (termasuk 3 digit terakhir).</span></div>
                        <button className="payment-done-btn" onClick={() => { setPaymentData(null); setJustSubmitted(false); }}>Saya Sudah Mengerti</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PPDBPage;
