import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import News from './components/News';
import LoginModal from './components/LoginModal';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ProfilPage from './pages/ProfilPage';
import PPDBPage from './pages/PPDBPage';
import BeritaPage from './pages/BeritaPage';
import BeritaDetailPage from './pages/BeritaDetailPage';
import GaleriPage from './pages/GaleriPage';
import RuangBacaPage from './pages/RuangBacaPage';
import CekStatus from './pages/CekStatus';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import BeritaManager from './admin/BeritaManager';
import GaleriManager from './admin/GaleriManager';
import PPDBManager from './admin/PPDBManager';
import BukuManager from './admin/BukuManager';
import VerifikasiManager from './admin/VerifikasiManager';
import KelulusanManager from './admin/KelulusanManager';

function HomePage() {
  return (
    <>
      <Hero />
      <News />
    </>
  );
}

function PublicLayout({ onLoginClick }) {
  return (
    <>
      <Navbar onLoginClick={onLoginClick} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/profil" element={<ProfilPage />} />
        <Route path="/ppdb" element={<PPDBPage />} />
        <Route path="/berita" element={<BeritaPage />} />
        <Route path="/berita/:slug" element={<BeritaDetailPage />} />
        <Route path="/galeri" element={<GaleriPage />} />
        <Route path="/ruang-baca" element={<RuangBacaPage />} />
        <Route path="/cek-status" element={<CekStatus />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="berita" element={<BeritaManager />} />
            <Route path="galeri" element={<GaleriManager />} />
            <Route path="ppdb" element={<PPDBManager />} />
            <Route path="verifikasi" element={<VerifikasiManager />} />
            <Route path="kelulusan" element={<KelulusanManager />} />
            <Route path="buku" element={<BukuManager />} />
          </Route>

          {/* Public routes */}
          <Route path="*" element={<PublicLayout onLoginClick={() => setLoginOpen(true)} />} />
        </Routes>
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      </Router>
    </AuthProvider>
  );
}

export default App;
