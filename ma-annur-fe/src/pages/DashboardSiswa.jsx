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
  { num: 5, label: 'Pengumuman Ujian' },
  { num: 6, label: 'Upload Berkas' },
  { num: 7, label: 'Daftar Ulang' },
];

const DOC_TYPES = [
  { key: 'kk', label: 'Kartu Keluarga (KK)' },
  { key: 'akta_kelahiran', label: 'Akta Kelahiran' },
  { key: 'skl', label: 'Surat Keterangan Lulus (SKL)' },
  { key: 'pas_foto', label: 'Pas Foto 3x4' },
];

/**
 * Determine which step the user is currently on based on their biodata status.
 * 
 * Flow:
 *   1 Login (already logged in)
 *   2 Isi Biodata (no biodata yet)
 *   3 Pembayaran (biodata exists, status belum_lengkap / menunggu_verifikasi)
 *   4 Kartu Ujian (pembayaran terverifikasi, belum ada hasil seleksi)
 *   5 Pengumuman Ujian (terverifikasi + has hasil_seleksi OR waiting for result)
 *   6 Upload Berkas (lulus ujian, uploading documents)
 *   7 Pengumuman Daftar Ulang (all berkas valid / final)
 */
function getActiveStep(biodata, docs, proceedToBerkas) {
  if (!biodata) return 2;
  const s = biodata.status_pendaftaran;
  const h = biodata.hasil_seleksi;

  // Step 3: Pembayaran — belum_lengkap or menunggu_verifikasi
  if (s === 'belum_lengkap' || s === 'menunggu_verifikasi') return 3;

  // Step 4: Kartu Ujian — terverifikasi, no hasil seleksi yet
  if (s === 'terverifikasi' && !h) return 4;

  // Step 5: Pengumuman Ujian — terverifikasi + hasil_seleksi exists, or tidak_lulus
  if (s === 'terverifikasi' && h) return 5;
  if (h === 'tidak_lulus') return 5;

  // Step 6: Upload Berkas — lulus ujian, but berkas not all valid yet
  if (h === 'lulus' && s === 'lulus') {
    const hasBerkas = (docs || []).some(d => d.jenis_dokumen !== 'bukti_pembayaran');
    if (!hasBerkas && !proceedToBerkas) {
      return 5;
    }
    // Check if all required docs are uploaded and valid
    const requiredKeys = DOC_TYPES.map(d => d.key);
    const allValid = requiredKeys.every(key => {
      const doc = (docs || []).find(d => d.jenis_dokumen === key);
      return doc && doc.status_validasi === 'valid';
    });
    if (allValid) return 7;
    return 6;
  }

  // Step 7: Daftar Ulang — status diterima or all berkas valid
  if (s === 'diterima') return 7;

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
  const [proceedToBerkas, setProceedToBerkas] = useState(false);
  const [selectedBukti, setSelectedBukti] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState({});
  const [isSubmittingDocs, setIsSubmittingDocs] = useState(false);
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

  const activeStep = getActiveStep(biodata, docs, proceedToBerkas);
  const progressPercent = ((Math.min(activeStep, 7) - 1) / 6) * 100;

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

  const handleBulkUpload = async () => {
    const keysToUpload = Object.keys(selectedDocs);
    if (keysToUpload.length === 0) return;
    setIsSubmittingDocs(true);
    try {
      for (const key of keysToUpload) {
        await uploadDokumen(selectedDocs[key], key);
      }
      setSelectedDocs({});
      await loadData();
      alert('Semua dokumen berhasil disimpan!');
    } catch (err) { alert('Gagal menyimpan dokumen: ' + err.message); }
    finally { setIsSubmittingDocs(false); }
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

  // ==================== DERIVED STATE FOR CONDITIONAL LOGIC ====================
  const API_URL = import.meta.env.VITE_API_URL || '';
  const buktiDoc = docs.find(d => d.jenis_dokumen === 'bukti_pembayaran');
  const buktiIsValid = biodata?.status_pendaftaran === 'terverifikasi' || biodata?.status_pendaftaran === 'lulus' || biodata?.status_pendaftaran === 'diterima' || buktiDoc?.status_validasi === 'valid';
  const buktiIsRevisi = buktiDoc?.status_validasi === 'revisi';

  // Check if all berkas (non-bukti_pembayaran) are valid
  const allBerkasValid = DOC_TYPES.every(dt => {
    const doc = docs.find(d => d.jenis_dokumen === dt.key);
    return doc && doc.status_validasi === 'valid';
  });

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

                {/* === STATUS PILL === */}
                <div className={`status-pill ${buktiIsValid ? 'verified' : biodata.status_pendaftaran === 'menunggu_verifikasi' ? 'waiting' : 'incomplete'}`} style={{ marginBottom: '1.5rem', width: '100%', justifyContent: 'center' }}>
                  {buktiIsValid
                    ? '✅ Pembayaran sudah diverifikasi admin'
                    : biodata.status_pendaftaran === 'menunggu_verifikasi'
                    ? '⏳ Pembayaran sedang diverifikasi admin'
                    : '📝 Silakan transfer tepat sesuai nominal di atas lalu unggah foto bukti pendaftaran'}
                </div>

                {/* === CATATAN REVISI DARI ADMIN (PEMBAYARAN) === */}
                {buktiIsRevisi && buktiDoc?.catatan_admin && (
                  <div className="admin-notes-box revisi">
                    <div className="admin-notes-header">
                      <span className="admin-notes-icon">⚠️</span>
                      <span className="admin-notes-title">Catatan Revisi dari Admin</span>
                    </div>
                    <p className="admin-notes-content">{buktiDoc.catatan_admin}</p>
                  </div>
                )}

                {/* === UPLOAD BUKTI PEMBAYARAN CARD ===
                     CONDITIONAL: Hidden if status is valid/terverifikasi */}
                {!buktiIsValid && (
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
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {selectedBukti && <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedBukti.name}</span>}
                        <label className={`upload-btn-label ${buktiDoc ? 'replace' : 'new'}`} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                          {buktiDoc ? '🔄 Pilih File Lain' : '📤 Pilih File'}
                          <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" style={{ display: 'none' }} disabled={uploadingDoc === 'bukti_pembayaran'}
                            onChange={(e) => { setSelectedBukti(e.target.files[0]); e.target.value = ''; }} />
                        </label>
                        <button 
                          onClick={() => { handleUpload(selectedBukti, 'bukti_pembayaran'); setSelectedBukti(null); }} 
                          disabled={!selectedBukti || uploadingDoc === 'bukti_pembayaran'}
                          style={{
                            padding: '8px 16px', fontSize: '0.85rem', fontWeight: 600, border: 'none', borderRadius: '6px', cursor: (!selectedBukti || uploadingDoc === 'bukti_pembayaran') ? 'not-allowed' : 'pointer',
                            background: (!selectedBukti || uploadingDoc === 'bukti_pembayaran') ? 'var(--gray-300)' : 'linear-gradient(135deg, var(--emerald-600), var(--emerald-700))', color: '#fff'
                          }}>
                          {uploadingDoc === 'bukti_pembayaran' ? 'Mengunggah...' : 'Kirim / Submit'}
                        </button>
                      </div>
                    </div>

                    {buktiDoc ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#fff', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--gray-200)' }}>
                        {/\.(jpg|jpeg|png|webp)$/i.test(buktiDoc.file_path) ? (
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
                            background: buktiIsRevisi ? '#fee2e2' : '#fef3c7',
                            color: buktiIsRevisi ? '#991b1b' : '#92400e'
                          }}>
                            {buktiIsRevisi ? '⚠️ Perlu Revisi Foto Bukti' : '⏳ Menunggu Verifikasi Admin'}
                          </div>
                          <div style={{ marginTop: '6px' }}>
                            <button onClick={() => setPreviewModalDoc({ url: `${API_URL}${buktiDoc.file_path}`, label: 'Bukti Pembayaran Pendaftaran', isImage: /\.(jpg|jpeg|png|webp)$/i.test(buktiDoc.file_path) })}
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
                )}

                {/* === SHOW VERIFIED BADGE IF BUKTI IS VALID (form hidden) === */}
                {buktiIsValid && buktiDoc && (
                  <div className="admin-notes-box valid" style={{ marginTop: '1rem' }}>
                    <div className="admin-notes-header">
                      <span className="admin-notes-icon">✅</span>
                      <span className="admin-notes-title">Bukti Pembayaran Sudah Diverifikasi</span>
                    </div>
                    <p className="admin-notes-content">
                      Bukti pembayaran Anda telah diverifikasi oleh admin. Anda akan segera mendapatkan jadwal tes masuk.
                    </p>
                    {/\.(jpg|jpeg|png|webp)$/i.test(buktiDoc.file_path) && (
                      <div style={{ marginTop: '0.75rem' }}>
                        <img src={`${API_URL}${buktiDoc.file_path}`} alt="Bukti Pembayaran"
                          onClick={() => setPreviewModalDoc({ url: `${API_URL}${buktiDoc.file_path}`, label: 'Bukti Pembayaran Pendaftaran', isImage: true })}
                          style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer', border: '1px solid #a7f3d0' }} />
                      </div>
                    )}
                  </div>
                )}
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

        {/* ====== STEP 5: PENGUMUMAN HASIL UJIAN ====== */}
        {activeStep === 5 && biodata && (
          <div className="step-card">
            <div className="step-card-header">
              <div className="step-card-icon">📢</div>
              <div><h2>Pengumuman Hasil Ujian</h2><p>Hasil seleksi tes masuk calon siswa baru</p></div>
            </div>
            {biodata.hasil_seleksi === 'lulus' ? (
              <div className="announcement-lulus">
                <div className="emoji">🎉</div>
                <h2>Selamat, Anda Dinyatakan LULUS Ujian!</h2>
                <p className="subtitle"><strong>{biodata.nama_lengkap}</strong> — NISN: {biodata.nisn}</p>
                <p style={{ color: '#065f46', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  Anda telah lulus seleksi tes masuk. Silakan lanjut ke tahap berikutnya untuk upload berkas persyaratan.
                </p>
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button onClick={() => setProceedToBerkas(true)} style={{ padding: '10px 24px', background: 'linear-gradient(135deg, var(--emerald-600), var(--emerald-700))', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    Lanjut ke Upload Berkas ➔
                  </button>
                </div>
              </div>
            ) : biodata.hasil_seleksi === 'tidak_lulus' ? (
              <div className="announcement-gagal">
                <div className="emoji">📋</div>
                <h2>Tidak Lulus Seleksi</h2>
                <p><strong>{biodata.nama_lengkap}</strong> — NISN: {biodata.nisn}</p>
                <p style={{ marginTop: '0.5rem' }}>Mohon maaf, Anda belum dinyatakan lulus pada seleksi tes masuk MA Annur Tahun Ajaran 2026/2027. Terima kasih atas partisipasi Anda.</p>
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

        {/* ====== STEP 6: UPLOAD BERKAS ====== */}
        {activeStep === 6 && biodata && (
          <div className="step-card">
            <div className="step-card-header">
              <div className="step-card-icon">📁</div>
              <div><h2>Upload & Kelola Berkas</h2><p>Selamat, Anda lulus ujian! Silakan upload berkas persyaratan pendaftaran (JPEG, PNG, atau PDF, maks 5MB)</p></div>
            </div>

            {/* Global admin notes if any berkas has revisi */}
            {docs.some(d => d.status_validasi === 'revisi' && d.jenis_dokumen !== 'bukti_pembayaran' && d.catatan_admin) && (
              <div className="admin-notes-box revisi" style={{ marginBottom: '1.5rem' }}>
                <div className="admin-notes-header">
                  <span className="admin-notes-icon">📝</span>
                  <span className="admin-notes-title">Catatan dari Admin</span>
                </div>
                <p className="admin-notes-content">Beberapa berkas Anda perlu direvisi. Lihat catatan per dokumen di bawah.</p>
              </div>
            )}

            {/* All berkas valid notice */}
            {allBerkasValid && (
              <div className="admin-notes-box valid" style={{ marginBottom: '1.5rem' }}>
                <div className="admin-notes-header">
                  <span className="admin-notes-icon">✅</span>
                  <span className="admin-notes-title">Semua Berkas Sudah Diverifikasi</span>
                </div>
                <p className="admin-notes-content">Seluruh dokumen persyaratan Anda telah diverifikasi dan disetujui oleh admin.</p>
              </div>
            )}

            <div className="upload-list">
              {DOC_TYPES.map(doc => {
                const uploaded = docs.find(d => d.jenis_dokumen === doc.key);
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
                        {selectedDocs[doc.key] && <span style={{ fontSize: '0.8rem', color: 'var(--gray-600)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedDocs[doc.key].name}</span>}
                        {uploaded && (
                          <button onClick={() => setPreviewModalDoc({ url: `${API_URL}${uploaded.file_path}`, label: doc.label, isImage })}
                            style={{ padding: '6px 12px', borderRadius: '6px', background: '#dbeafe', color: '#2563eb', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            👁️ Lihat
                          </button>
                        )}
                        {/* CONDITIONAL: Hide upload button if document is already valid */}
                        {uploaded?.status_validasi !== 'valid' && (
                          <label className="upload-btn-label" style={{ padding: '6px 14px', fontSize: '0.78rem', cursor: 'pointer', background: (uploaded || selectedDocs[doc.key]) ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'linear-gradient(135deg, var(--sage-500), var(--emerald-600))', color: '#fff' }}>
                            {(uploaded || selectedDocs[doc.key]) ? '🔄 Pilih File Ulang' : '📤 Pilih File'}
                            <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" style={{ display: 'none' }}
                              onChange={(e) => { 
                                const file = e.target.files[0];
                                if (file) setSelectedDocs(prev => ({ ...prev, [doc.key]: file }));
                                e.target.value = ''; 
                              }} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Per-document admin notes (catatan revisi) */}
                    {isRevisi && uploaded?.catatan_admin && (
                      <div className="admin-notes-box revisi compact">
                        <div className="admin-notes-header">
                          <span className="admin-notes-icon">⚠️</span>
                          <span className="admin-notes-title">Catatan Revisi</span>
                        </div>
                        <p className="admin-notes-content">{uploaded.catatan_admin}</p>
                      </div>
                    )}

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
            {/* BULK UPLOAD SUBMIT BUTTON */}
            {Object.keys(selectedDocs).length > 0 && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--gray-200)', paddingTop: '1.5rem' }}>
                <button 
                  onClick={handleBulkUpload} 
                  disabled={isSubmittingDocs}
                  style={{
                    padding: '12px 24px', background: 'linear-gradient(135deg, var(--emerald-600), var(--emerald-700))', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: isSubmittingDocs ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.2)'
                  }}>
                  {isSubmittingDocs ? 'Menyimpan...' : 'Simpan Perubahan 💾'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ====== STEP 7: PENGUMUMAN DAFTAR ULANG ====== */}
        {activeStep === 7 && biodata && (
          <div className="step-card" style={{ marginTop: '1.5rem' }}>
            <div className="step-card-header">
              <div className="step-card-icon">🎓</div>
              <div><h2>Pengumuman Daftar Ulang</h2><p>Informasi registrasi ulang siswa baru</p></div>
            </div>
            <div className="announcement-lulus">
              <div className="emoji">🎉</div>
              <h2>Selamat, Anda Diterima di MA Annur!</h2>
              <p className="subtitle"><strong>{biodata.nama_lengkap}</strong> — NISN: {biodata.nisn}</p>
              <p style={{ color: '#065f46', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Seluruh proses pendaftaran telah selesai. Silakan lakukan registrasi ulang sesuai informasi di bawah ini.
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
