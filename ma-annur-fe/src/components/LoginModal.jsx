import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiMail, FiLock } from 'react-icons/fi';
import { GiMoon } from 'react-icons/gi';
import { useAuth } from '../context/AuthContext';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                onClose();
                setEmail('');
                setPassword('');
                navigate('/admin');
            } else {
                setError(result.message);
            }
        } catch {
            setError('Terjadi kesalahan. Coba lagi.');
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
                        <GiMoon />
                    </div>
                    <h3>Masuk ke Portal Admin</h3>
                    <p>Madrasah Aliyah Annur</p>
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
                        <label htmlFor="email">
                            <FiMail style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="admin@madrasahannur.sch.id"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <FiLock style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="modal-submit" disabled={submitting}>
                        {submitting ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <div className="modal-footer">
                    Lupa password? <a href="#">Hubungi Admin</a>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
