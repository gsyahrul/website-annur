import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiMail, FiLock, FiUserPlus, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../lib/directus';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const switchMode = () => {
        setMode(mode === 'login' ? 'register' : 'login');
        setError('');
        setConfirmPassword('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'register' && password !== confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok.');
            return;
        }
        if (password.length < 6) {
            setError('Password minimal 6 karakter.');
            return;
        }

        setSubmitting(true);
        try {
            if (mode === 'register') {
                await registerUser(email, password);
            }
            const result = await login(email, password);
            if (result.success) {
                onClose();
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setMode('login');
                const currentUser = JSON.parse(atob(localStorage.getItem('auth_token')?.split('.')[1] || '{}'));
                if (currentUser.role === 'admin') {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan. Coba lagi.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>
                    <FiX />
                </button>

                <div className="modal-header">
                    <div className="modal-logo">
                        <img src="/images/logo-annur.png" alt="Logo MA Annur" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    </div>
                    <h3>{mode === 'login' ? 'Masuk ke Akun' : 'Buat Akun Baru'}</h3>
                    <p>{mode === 'login' ? 'Madrasah Aliyah Annur' : 'Daftar untuk memulai proses PPDB'}</p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem',
                        borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 500
                    }}>
                        {error}
                    </div>
                )}

                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="modal-email">
                            <FiMail style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Email
                        </label>
                        <input
                            id="modal-email"
                            type="email"
                            className="form-input"
                            placeholder="email@contoh.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="modal-password">
                            <FiLock style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Password
                        </label>
                        <input
                            id="modal-password"
                            type="password"
                            className="form-input"
                            placeholder="Minimal 6 karakter"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="form-group">
                            <label htmlFor="modal-confirm-password">
                                <FiLock style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                Konfirmasi Password
                            </label>
                            <input
                                id="modal-confirm-password"
                                type="password"
                                className="form-input"
                                placeholder="Ketik ulang password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    )}

                    <button type="submit" className="modal-submit" disabled={submitting}>
                        {submitting ? 'Memproses...' : mode === 'login' ? (
                            <><FiLogIn style={{ marginRight: '6px' }} /> Masuk</>
                        ) : (
                            <><FiUserPlus style={{ marginRight: '6px' }} /> Daftar & Masuk</>
                        )}
                    </button>
                </form>

                <div className="modal-footer">
                    {mode === 'login' ? (
                        <>Belum punya akun? <a href="#" onClick={(e) => { e.preventDefault(); switchMode(); }}>Daftar di sini</a></>
                    ) : (
                        <>Sudah punya akun? <a href="#" onClick={(e) => { e.preventDefault(); switchMode(); }}>Masuk di sini</a></>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
