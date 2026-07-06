import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const { isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                height: '100vh', fontSize: '1.1rem', color: '#666'
            }}>
                Memuat...
            </div>
        );
    }

    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
};

export default ProtectedRoute;
