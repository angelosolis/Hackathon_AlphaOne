import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    token: string | null;
    userId: string | null;
    userType: 'Client' | 'Agent' | null;
    login: (token: string, userId: string, userType: 'Client' | 'Agent') => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userType, setUserType] = useState<'Client' | 'Agent' | null>(null);
    const navigate = useNavigate();

    // Load token from localStorage on initial load
    useEffect(() => {
        const storedToken = localStorage.getItem('authToken');
        const storedUserId = localStorage.getItem('userId');
        const storedUserType = localStorage.getItem('userType') as 'Client' | 'Agent' | null;

        if (storedToken && storedUserId && storedUserType) {
            setToken(storedToken);
            setUserId(storedUserId);
            setUserType(storedUserType);
        }
    }, []);

    const login = (newToken: string, newUserId: string, newUserType: 'Client' | 'Agent') => {
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('userId', newUserId);
        localStorage.setItem('userType', newUserType);
        setToken(newToken);
        setUserId(newUserId);
        setUserType(newUserType);
        // Navigate to home or dashboard after login
        navigate('/');
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userId');
        localStorage.removeItem('userType');
        setToken(null);
        setUserId(null);
        setUserType(null);
        // Navigate to login page after logout
        navigate('/login');
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ token, userId, userType, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 