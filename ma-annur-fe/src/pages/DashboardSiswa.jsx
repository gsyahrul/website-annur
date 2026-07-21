import { useState, useEffect, useRef, useCallback } from 'react';
import { FiLogOut, FiSend, FiCopy, FiCheckCircle, FiDownload, FiCalendar } from 'react-icons/fi';
import { useAuth, AuthError } from '../context/AuthContext';
import { getBiodata, createBiodata, updateBiodata, getDokumen, uploadDokumen } from '../lib/directus';
import html2pdf from 'html2pdf.js';
import './DashboardSiswa.css';

// --- Constants ---
const REGISTRASI_INFO = {
  tanggal: '21 Juli 2026',
  biaya: 'Rp 2.500.000',
  barang: [
    'Ijazah / SKL asli dan fotokopi (2 lembar)',
    'Kartu Keluarga asli dan fotokopi (2 lembar)',
    'Akta Kelahiran asli dan fotokopi (2 lembar)',
    'Pas foto 3x4 (6 lembar)',
    'Biaya registrasi ulang',
  ],
};
const STEPS = [
  { num: 1, label: 'Login' },
  { num: 2, label: 'Isi Biodata' },
  { num: 3, label: 'Pembayaran' },
  { num: 4, label: 'Kartu Ujian' },
  { num: 5, label: 'Upload Berkas' },
  { num: 6, label: 'Pengumuman' },
];
const DOC_TYPES = [
  { key: 'bukti_pembayaran', label: 'Bukti Pembayaran Pendaftaran' },
  { key: 'kk', label: 'Kartu Keluarga (KK)' },
  { key: 'akta_kelahiran', label: 'Akta Kelahiran' },
  { key: 'skl', label: 'Surat Keterangan Lulus (SKL)' },
  { key: 'pas_foto', label: 'Pas Foto 3x4' },
];

function getActiveStep(biodata) {
  if (!biodata) return 2;
  const s = biodata.status_pendaftaran;
  const h = biodata.hasil_seleksi;
  if (s === 'belum_lengkap' || s === 'menunggu_verifikasi') return 3;
  if (s === 'terverifikasi' && !h) return 4;
  if ((s === 'terverifikasi' || s === 'lulus') && h === 'lulus') return biodata.status_pendaftaran === 'lulus' ? 6 : 5;
  if (h === 'tidak_lulus') return 6;
  return 3;
}

const fmt = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const fmtDate = (d) => { if (!d) return '-'; try { return new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); } catch { return d; } };

// ==================== MAIN COMPONENT ====================
const DashboardSiswa = () => {
  const { user, logout, handleAuthError } = useAuth();
  const [biodata, setBiodata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [previewModalDoc, setPreviewModalDoc] = useState(null);
  const kartuRef = useRef(null);

  const [form, setForm] = useState({
    namaLengkap: '', tempatLahir: '', tanggalLahir: '', jenisKelamin: '',
    asalSekolah: '', nisn: '', noHp: '', alamat: '', jurusan: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBiodata();
      setBiodata(data);
      if (data) { const d = await getDokumen(); setDocs(d || []); }
    } catch (err) {
      if (err instanceof AuthError) handleAuthError();
      setBiodata(null);
    } finally { setLoading(false); }
  }, [handleAuthError]);

  useEffect(() => { loadData(); }, [loadData]);

  const activeStep = getActiveStep(biodata);
  const progressPercent = ((Math.min(activeStep, 6) - 1) / 5) * 100;

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        nisn: form.nisn, nama_lengkap: form.namaLengkap, tempat_lahir: form.tempatLahir,
        tanggal_lahir: form.tanggalLahir, jenis_kelamin: form.jenisKelamin,
        asal_sekolah: form.asalSekolah, jurusan: form.jurusan, no_hp: form.noHp, alamat: form.alamat,
      };
      if (biodata && editMode) await updateBiodata(payload);
      else await createBiodata(payload);
      setEditMode(false);
      await loadData();
    } catch (err) { alert('Gagal: ' + err.message); }
    finally { setSubmitting(false); }
  };

  const startEdit = () => {
    setForm({
      namaLengkap: biodata.nama_lengkap || '', tempatLahir: biodata.tempat_lahir || '',
      tanggalLahir: biodata.tanggal_lahir ? biodata.tanggal_lahir.split('T')[0] : '',
      jenisKelamin: biodata.jenis_kelamin || '', asalSekolah: biodata.asal_sekolah || '',
      nisn: biodata.nisn || '', noHp: biodata.no_hp || '', alamat: biodata.alamat || '', jurusan: biodata.jurusan || '',
    });
    setEditMode(true);
  };

  const handleCopy = () => {
    if (!biodata?.nominal_pembayaran) return;
    navigator.clipboard.writeText(String(biodata.nominal_pembayaran));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleUpload = async (file, key) => {
    if (!file) return;
    setUploadingDoc(key);
    try {
      await uploadDokumen(file, key);
      await loadData();
    } catch (err) { alert('Gagal upload: ' + err.message); }
    finally { setUploadingDoc(null); }
  };

  const handleDownloadPDF = async () => {
    if (!kartuRef.current) return;
    setDownloading(true);
    try {
      await html2pdf().set({
        margin: [15, 15, 15, 15],
        filename: `Kartu_Peserta_${biodata?.nama_lengkap?.replace(/\s+/g, '_') || 'PPDB'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: [250, 353], orientation: 'portrait' },
      }).from(kartuRef.current).save();
    } catch (err) { alert('Gagal unduh: ' + err.message); }
    finally { setDownloading(false); }
  };

  if (loading) return (
    <div className="dashboard-siswa"><div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <p style={{ color: 'var(--gray-400)', fontSize: '1.1rem' }}>Memuat dashboard...</p>
    </div></div>
  );

  // ==================== RENDER ====================
  return (
    <div className="dashboard-siswa">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-header-top">
            <div className="dashboard-greeting">
              <div className="dashboard-avatar">{(biodata?.nama_lengkap || user?.email || 'U').charAt(0).toUpperCase()}</div>
              <div>
                <h1>Selamat Datang{biodata ? `, ${biodata.nama_lengkap}` : ''}!</h1>
                <p>{user?.email}</p>
              </div>
            </div>
            <button className="dashboard-logout-btn" onClick={logout}><FiLogOut /> Keluar</button>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="progress-tracker">
          <div className="progress-line-fill" style={{ width: `calc(${progressPercent}% - 40px)` }} />
          {STEPS.map((s) => {
            const cls = s.num < activeStep ? 'completed' : s.num === activeStep ? 'active' : 'locked';
            return (
              <div className={`progress-step ${cls}`} key={s.num}>
                <div className="progress-circle">{s.num < activeStep ? '✓' : s.num}</div>
                <span className="progress-step-label">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* ====== STEP 2: FORM BIODATA ====== */}
        {activeStep === 2 && (
          <div className="step-card">
            <div className="step-card-header">
              <div className="step-card-icon">📋</div>
              <div><h2>Isi Biodata</h2><p>Lengkapi formulir biodata calon siswa</p></div>
            </div>
            {renderForm(form, handleFormChange, handleFormSubmit, submitting)}
          </div>
        )}

        {/* ====== STEP 3: PEMBAYARAN & UPLOAD BUKTI ====== */}
        {activeStep === 3 && biodata && (
          <div className="step-card">
            <div className="step-card-header">
              <div className="step-card-icon">💳</div>
              <div><h2>Pembayaran & Upload Bukti Pendaftaran</h2><p>Lakukan pembayaran biaya pendaftaran dan unggah foto bukti transfer/pendaftaran</p></div>
            </div>
            {/* Biodata summary */}
            {!editMode && renderBiodataSummary(biodata, startEdit)}
            {editMode && renderForm(form, handleFormChange, handleFormSubmit, submitting)}
            {!editMode && (
              <>
                <div className="payment-info-card">
                  <div className="payment-grid">
                    <div className="payment-grid-item">
                      <label>Kode Unik</label>
                      <div className="value kode">{biodata.kode_unik ? String(biodata.kode_unik).padStart(3, '0') : '-'}</div>
                    </div>
                    <div className="payment-grid-item">
                      <label>Nominal Pembayaran</label>
                      <div className="value nominal">{biodata.nominal_pembayaran ? fmt(biodata.nominal_pembayaran) : '-'}</div>
                    </div>
                  </div>
                  <button className="btn-copy" onClick={handleCopy}><FiCopy /> {copied ? 'Tersalin!' : 'Salin Nominal'}</button>
                  <div className="bank-info">
                    <h4>Instruksi Pembayaran</h4>
                    <div className="bank-info-row"><span className="label">Bank Tujuan</span><span className="val">Bank Syariah Indonesia (BSI)</span></div>
                    <div className="bank-info-row"><span className="label">No. Rekening</span><span className="val">1234-5678-9012</span></div>
                    <div className="bank-info-row"><span className="label">Atas Nama</span><span className="val">Yayasan MA Annur</span></div>
                  </div>
                </div>

                <div className={`status-pill ${biodata.status_pendaftaran === 'menunggu_verifikasi' ? 'waiting' : 'incomplete'}`} style={{ marginBottom: '1.5rem', width: '100%', justifyContent: 'center' }}>
                  {biodata.status_pendaftaran === 'menunggu_verifikasi'
                    ? '⏳ Pembayaran sedang diverifikasi admin'
                    : '📝 Silakan transfer tepat sesuai nominal di atas lalu unggah foto bukti pendaftaran'}
                </div>

                {/* Upload Bukti Pembayaran Card */}
                {(() => {
                  const API_URL = import.meta.env.VITE_API_URL || '';
                  const buktiDoc = docs.find(d => d.jenis_dokumen === 'bukti_pembayaran');
                  const isImage = buktiDoc && /\.(jpg|jpeg|png|webp)$/i.test(buktiDoc.file_path);
                  return (
                    <div className="bukti-upload-card" style={{ marginTop: '1rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--gray-800)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📷 Upload Bukti Pendaftaran / Transfer Pembayaran
                          </h3>
                          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--gray-500)' }}>
                            Unggah foto bukti transfer atau bukti pendaftaran Anda (Format: JPG, PNG, atau PDF, maks 5MB)
                          </p>
                        </div>
                        <label className={`upload-btn-label ${buktiDoc ? 'replace' : 'new'}`} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                          {uploadingDoc === 'bukti_pembayaran' ? 'Mengunggah...' : buktiDoc ? '🔄 Update Berkas' : '📤 Upload Bukti Pendaftaran'}
                          <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" style={{ display: 'none' }} disabled={uploadingDoc === 'bukti_pembayaran'}
                            onChange={(e) => { handleUpload(e.target.files[0], 'bukti_pembayaran'); e.target.value = ''; }} />
                        </label>
                      </div>

                      {buktiDoc ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                          {isImage ? (
                            <img src={`${API_URL}${buktiDoc.file_path}`} alt="Bukti Pembayaran"
                              onClick={() => setPreviewModalDoc({ url: `${API_URL}${buktiDoc.file_path}`, label: 'Bukti Pembayaran Pendaftaran', isImage: true })}
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #cbd5e1' }} />
                          ) : (
                            <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>📄</div>
                          )}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '4px' }}>
                              Bukti Pembayaran Pendaftaran
                            </div>
                            <div style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '4px', fontWeight: 600,
                              background: biodata.status_pendaftaran === 'terverifikasi' || buktiDoc.status_validasi === 'valid' ? '#d1fae5' : buktiDoc.status_validasi === 'revisi' ? '#fee2e2' : '#fef3c7',
                              color: biodata.status_pendaftaran === 'terverifikasi' || buktiDoc.status_validasi === 'valid' ? '#065f46' : buktiDoc.status_validasi === 'revisi' ? '#991b1b' : '#92400e'
                            }}>
                              {biodata.status_pendaftaran === 'terverifikasi' || buktiDoc.status_validasi === 'valid'
                                ? '✅ Sudah Diverifikasi Admin'
                                : buktiDoc.status_validasi === 'revisi'
                                ? '⚠️ Perlu Revisi Foto Bukti'
                                : '⏳ Menunggu Verifikasi Admin'}
                            </div>
                            <div style={{ marginTop: '6px' }}>
                              <button onClick={() => setPreviewModalDoc({ url: `${API_URL}${buktiDoc.file_path}`, label: 'Bukti Pembayaran Pendaftaran', isImage })}
                                style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}>
                                🔍 Lihat Foto Ukuran Penuh
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '1rem', border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', background: '#fff', color: 'var(--gray-400)', fontSize: '0.85rem' }}>
                          Belum ada foto bukti pendaftaran yang diunggah. Silakan klik tombol "Upload Bukti Pendaftaran" di atas.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        )}

        {/* ====== STEP 4: KARTU UJIAN ====== */}
        {activeStep === 4 && biodata && (
          <div className="step-card">
            <div className="step-card-header">
              <div className="step-card-icon">🎫</div>
              <div><h2>Kartu Peserta Ujian</h2><p>Unduh dan cetak kartu peserta tes masuk</p></div>
            </div>
            <div className="dashboard-kartu-section">
              <div className="jadwal-info-grid">
                <div className="jadwal-info-item">
                  <div className="icon">📅</div>
                  <div className="label">Tanggal</div>
                  <div className="value">{fmtDate(biodata.jadwal_tes_tanggal)}</div>
                </div>
                <div className="jadwal-info-item">
                  <div className="icon">🕐</div>
                  <div className="label">Waktu</div>
                  <div className="value">{biodata.jadwal_tes_waktu || '-'} WIB</div>
                </div>
                <div className="jadwal-info-item">
                  <div className="icon">📍</div>
                  <div className="label">Lokasi</div>
                  <div className="value">{biodata.jadwal_tes_lokasi || 'Gedung Utama MA Annur'}</div>
                </div>
              </div>
              {/* Printable Kartu */}
              <div className="kartu-peserta" ref={kartuRef} style={{ maxWidth: '600px', margin: '0 auto 1.5rem', background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--sage-300)', textAlign: 'left' }}>
                <div style={{ height: '6px', background: 'linear-gradient(90deg, var(--sage-500), var(--emerald-500))' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid var(--gray-200)' }}>
                  <img src="/images/logo-annur.png" alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                  <div><div style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'var(--font-heading)', color: 'var(--sage-800)' }}>MADRASAH ALIYAH ANNUR</div><div style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Jl. Pendidikan No. 1 — Terakreditasi A</div></div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, var(--sage-600), var(--emerald-700))', color: '#fff', padding: '8px 20px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, letterSpacing: '1px' }}>
                  <span>KARTU PESERTA TES MASUK</span><span>T.A 2026/2027</span>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                    <tbody>
                      {[['No. Peserta', String(biodata.id).padStart(4, '0')], ['Nama', biodata.nama_lengkap], ['NISN', biodata.nisn], ['Asal Sekolah', biodata.asal_sekolah], ['Jurusan', biodata.jurusan], ['Jenis Kelamin', biodata.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan']].map(([l, v]) => (
                        <tr key={l}><td style={{ padding: '4px 0', color: 'var(--gray-500)', width: '35%' }}>{l}</td><td style={{ padding: '4px 0', fontWeight: 500 }}>: {v}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--gray-500)', fontStyle: 'italic' }}>Kartu ini wajib dibawa saat tes. Hadir 30 menit sebelum tes dimulai.</p>
                </div>
                <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--sage-500), var(--emerald-500))' }} />
              </div>
              <button className="btn-download-kartu" onClick={handleDownloadPDF} disabled={downloading}>
                <FiDownload /> {downloading ? 'Mengunduh...' : 'Unduh Kartu Peserta (PDF)'}
              </button>
            </div>
          </div>
        )}

        {/* ====== STEP 6: PENGUMUMAN ====== */}
        {activeStep === 6 && biodata && (
          <div className="step-card">
            <div className="step-card-header">
              <div className="step-card-icon">📢</div>
              <div><h2>Pengumuman Kelulusan</h2><p>Hasil seleksi penerimaan siswa baru</p></div>
            </div>
            {biodata.hasil_seleksi === 'lulus' ? (
              <div className="announcement-lulus">
                <div className="emoji">🎉</div>
                <h2>Selamat, Anda Dinyatakan LULUS!</h2>
                <p className="subtitle"><strong>{biodata.nama_lengkap}</strong> — NISN: {biodata.nisn}</p>
                <p style={{ color: '#065f46', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Anda telah dinyatakan lulus seleksi penerimaan siswa baru Madrasah Aliyah Annur Tahun Ajaran 2026/2027.
                </p>
                <div className="registrasi-ulang-card">
                  <h3>📌 Informasi Registrasi Ulang</h3>
                  <div className="registrasi-ulang-grid">
                    <div className="registrasi-ulang-item"><div className="label">Tanggal Masuk</div><div className="value">{REGISTRASI_INFO.tanggal}</div></div>
                    <div className="registrasi-ulang-item"><div className="label">Biaya Registrasi Ulang</div><div className="value">{REGISTRASI_INFO.biaya}</div></div>
                  </div>
                  <div className="registrasi-ulang-barang">
                    <div className="label">Barang yang harus dibawa</div>
                    <ul>{REGISTRASI_INFO.barang.map((b, i) => <li key={i}>✅ {b}</li>)}</ul>
                  </div>
                </div>
              </div>
            ) : biodata.hasil_seleksi === 'tidak_lulus' ? (
              <div className="announcement-gagal">
                <div className="emoji">📋</div>
                <h2>Tidak Lulus Seleksi</h2>
                <p><strong>{biodata.nama_lengkap}</strong> — NISN: {biodata.nisn}</p>
                <p style={{ marginTop: '0.5rem' }}>Mohon maaf, Anda belum dinyatakan lulus pada seleksi penerimaan siswa baru MA Annur Tahun Ajaran 2026/2027. Terima kasih atas partisipasi Anda.</p>
              </div>
            ) : (
              <div className="announcement-waiting">
                <div className="emoji">⏳</div>
                <h2>Menunggu Pengumuman</h2>
                <p>Hasil seleksi belum diumumkan. Silakan cek kembali secara berkala.</p>
              </div>
            )}
          </div>
        )}

        {/* ====== STEP 5 & 6: UPLOAD BERKAS ====== */}
        {(activeStep === 5 || activeStep === 6) && biodata && (
          <div className="step-card">
            <div className="step-card-header">
              <div className="step-card-icon">📁</div>
              <div><h2>Upload & Kelola Berkas</h2><p>Selamat, Anda lulus ujian! Silakan upload dan perbarui berkas persyaratan pendaftaran (JPEG, PNG, atau PDF, maks 5MB)</p></div>
            </div>
            <div className="upload-list">
              {DOC_TYPES.map(doc => {
                const uploaded = docs.find(d => d.jenis_dokumen === doc.key);
                const API_URL = import.meta.env.VITE_API_URL || '';
                const isImage = uploaded && /\.(jpg|jpeg|png|webp)$/i.test(uploaded.file_path);
                const isVerified = uploaded?.status_validasi === 'valid';
                const isRevisi = uploaded?.status_validasi === 'revisi';

                return (
                  <div className={`upload-item ${uploaded ? 'uploaded' : 'pending'}`} key={doc.key} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div className="upload-item-info">
                        <span className="upload-item-icon">{uploaded ? (isVerified ? '✅' : isRevisi ? '⚠️' : '⏳') : '📄'}</span>
                        <div>
                          <div className="upload-item-name" style={{ fontSize: '0.92rem', fontWeight: 600 }}>{doc.label}</div>
                          <div style={{ marginTop: '2px' }}>
                            {uploaded ? (
                              <span className={`upload-item-status ${isRevisi ? 'revisi' : isVerified ? '' : 'waiting'}`} style={{
                                display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem',
                                background: isVerified ? '#d1fae5' : isRevisi ? '#fee2e2' : '#fef3c7',
                                color: isVerified ? '#065f46' : isRevisi ? '#991b1b' : '#92400e'
                              }}>
                                {isVerified ? '✓ Sudah Diverifikasi Admin' : isRevisi ? '⚠️ Perlu Revisi' : '⏳ Menunggu Verifikasi Admin'}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>Belum diunggah</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {uploaded && (
                          <button onClick={() => setPreviewModalDoc({ url: `${API_URL}${uploaded.file_path}`, label: doc.label, isImage })}
                            style={{ padding: '6px 12px', borderRadius: '6px', background: '#dbeafe', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            👁️ Lihat
                          </button>
                        )}
                        <label className={`upload-btn-label ${uploaded ? 'replace' : 'new'}`} style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                          {uploadingDoc === doc.key ? 'Mengunggah...' : uploaded ? '🔄 Update Berkas' : '📤 Upload'}
                          <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" style={{ display: 'none' }} disabled={uploadingDoc === doc.key}
                            onChange={(e) => { handleUpload(e.target.files[0], doc.key); e.target.value = ''; }} />
                        </label>
                      </div>
                    </div>
                    {/* Thumbnail preview if uploaded image */}
                    {uploaded && isImage && (
                      <div style={{ marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={`${API_URL}${uploaded.file_path}`} alt={doc.label}
                          onClick={() => setPreviewModalDoc({ url: `${API_URL}${uploaded.file_path}`, label: doc.label, isImage: true })}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid var(--gray-300)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Klik gambar untuk melihat pratinjau lengkap</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      {previewModalDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setPreviewModalDoc(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: '1px solid var(--gray-200)' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--gray-800)', margin: 0 }}>{previewModalDoc.label}</h3>
              <button onClick={() => setPreviewModalDoc(null)} style={{ background: 'var(--gray-100)', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
              {previewModalDoc.isImage ? (
                <img src={previewModalDoc.url} alt={previewModalDoc.label} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }} />
              ) : (
                <iframe src={previewModalDoc.url} title={previewModalDoc.label} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '8px' }} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== SUBCOMPONENTS ====================

function renderBiodataSummary(b, onEdit) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="biodata-summary">
        {[['Nama Lengkap', b.nama_lengkap], ['NISN', b.nisn], ['Tempat Lahir', b.tempat_lahir],
          ['Tanggal Lahir', b.tanggal_lahir ? new Date(b.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'],
          ['Jenis Kelamin', b.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'], ['Jurusan', b.jurusan || '-'],
          ['Asal Sekolah', b.asal_sekolah], ['No. HP', b.no_hp || '-'],
        ].map(([l, v], i) => (
          <div className="biodata-item" key={i}><label>{l}</label><span>{v}</span></div>
        ))}
      </div>
      <button className="btn-edit-biodata" onClick={onEdit}>✏️ Edit Biodata</button>
    </div>
  );
}

function renderForm(form, onChange, onSubmit, submitting) {
  return (
    <form className="dashboard-form" onSubmit={onSubmit}>
      <div className="form-row">
        <div className="form-group"><label>Nama Lengkap *</label><input type="text" name="namaLengkap" className="form-input" placeholder="Nama lengkap" value={form.namaLengkap} onChange={onChange} required /></div>
        <div className="form-group"><label>NISN *</label><input type="text" name="nisn" className="form-input" placeholder="10 digit NISN" value={form.nisn} onChange={onChange} required maxLength={10} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Tempat Lahir *</label><input type="text" name="tempatLahir" className="form-input" placeholder="Kota kelahiran" value={form.tempatLahir} onChange={onChange} required /></div>
        <div className="form-group"><label>Tanggal Lahir *</label><input type="date" name="tanggalLahir" className="form-input" value={form.tanggalLahir} onChange={onChange} required /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label>Jenis Kelamin *</label>
          <select name="jenisKelamin" className="form-input" value={form.jenisKelamin} onChange={onChange} required>
            <option value="">Pilih</option><option value="L">Laki-laki</option><option value="P">Perempuan</option>
          </select></div>
        <div className="form-group"><label>Jurusan Pilihan *</label>
          <select name="jurusan" className="form-input" value={form.jurusan} onChange={onChange} required>
            <option value="">Pilih Jurusan</option><option value="IPA">IPA</option><option value="IPS">IPS</option><option value="Keagamaan">Keagamaan</option>
          </select></div>
      </div>
      <div className="form-group"><label>Asal Sekolah *</label><input type="text" name="asalSekolah" className="form-input" placeholder="Nama sekolah asal" value={form.asalSekolah} onChange={onChange} required /></div>
      <div className="form-group"><label>No. HP / WhatsApp *</label><input type="tel" name="noHp" className="form-input" placeholder="08xxxxxxxxxx" value={form.noHp} onChange={onChange} required /></div>
      <div className="form-group"><label>Alamat Lengkap *</label><textarea name="alamat" className="form-input" placeholder="Alamat lengkap" rows="3" value={form.alamat} onChange={onChange} required style={{ resize: 'vertical' }} /></div>
      <button type="submit" className="btn-submit" disabled={submitting}>{submitting ? 'Mengirim...' : <><FiSend /> Kirim Biodata</>}</button>
    </form>
  );
}

export default DashboardSiswa;
