import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginDirectus, logoutDirectus, getCurrentUser, getToken, clearToken } from '../lib/directus';
import { AuthError } from '../lib/directus';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount, check if we already have a token and fetch user
    useEffect(() => {
        const token = getToken();
        if (token) {
            getCurrentUser()
                .then((u) => setUser(u))
                .catch(() => {
                    clearToken();
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            await loginDirectus(email, password);
            const u = await getCurrentUser();
            setUser(u);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message || 'Login gagal' };
        }
    };

    const logout = useCallback(async () => {
        await logoutDirectus();
        setUser(null);
    }, []);

    /**
     * Call this when a component catches an AuthError (401/403).
     * It clears the user state so the UI reacts accordingly.
     */
    const handleAuthError = useCallback(() => {
        clearToken();
        setUser(null);
    }, []);

    // Check role from backend user data
    const isAdmin = user?.role === 'admin';
    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAdmin, isAuthenticated, loading, handleAuthError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export { AuthError };
