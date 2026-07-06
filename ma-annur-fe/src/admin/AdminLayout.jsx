import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiGrid, FiFileText, FiImage, FiUsers, FiLogOut, FiBook, FiCheckSquare, FiAward } from 'react-icons/fi';
import { GiMoon } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">
                    <div className="logo-icon"><GiMoon /></div>
                    <div>
                        MA Annur
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav className="admin-nav">
                    <div className="admin-nav-section">Menu Utama</div>
                    <NavLink to="/admin" end><FiGrid /> Dashboard</NavLink>
                    <NavLink to="/admin/berita"><FiFileText /> Kelola Berita</NavLink>
                    <NavLink to="/admin/galeri"><FiImage /> Kelola Galeri</NavLink>
                    <NavLink to="/admin/ppdb"><FiUsers /> Kelola PPDB</NavLink>
                    <NavLink to="/admin/verifikasi"><FiCheckSquare /> Verifikasi Pembayaran</NavLink>
                    <NavLink to="/admin/kelulusan"><FiAward /> Kelola Kelulusan</NavLink>
                    <NavLink to="/admin/buku"><FiBook /> Kelola Buku</NavLink>

                    <div className="admin-nav-section" style={{ marginTop: 'auto' }}>Akun</div>
                    <button onClick={handleLogout}><FiLogOut /> Keluar</button>
                </nav>
            </aside>

            <div className="admin-main">
                <header className="admin-header">
                    <h2>Admin Panel</h2>
                    <div className="admin-header-user">
                    <span>{user?.email || 'Admin'}</span>
                        <div className="admin-header-avatar">
                            {(user?.email || 'A').charAt(0).toUpperCase()}
                        </div>
                    </div>
                </header>
                <div className="admin-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
