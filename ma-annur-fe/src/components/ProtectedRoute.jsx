import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — guards routes based on authentication/role.
 *
 * Props:
 *   requireAdmin (boolean) — if true, only admins can access.
 *                             if false (default), any logged-in user can access.
 */
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { user, isAdmin, loading } = useAuth();

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

    // Not logged in at all
    if (!user) return <Navigate to="/" replace />;

    // Needs admin but user is not admin
    if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

    return children;
};

export default ProtectedRoute;
