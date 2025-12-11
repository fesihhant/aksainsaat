import { createContext, useState, useContext, useEffect } from 'react';
import { apiUrl } from '../utils/utils';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini al
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    const isAdmin = () => {
        return user && user.role === 'admin';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Anonim token oluşturma middleware'i
export const fetchAnonymousToken = async () => {
    try {
        const response = await fetch(`${apiUrl}/auth/anonymousToken`);
        const data = await response.json();

        if (data.success) {
            return data.token; // Anonim token'ı döndür
        } else {
            throw new Error('Anonim token alınamadı');
        }
    } catch (error) {
        console.error('Anonim token alınırken hata:', error);
    }
};
 
