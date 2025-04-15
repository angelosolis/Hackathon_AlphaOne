import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    token: string | null;
    userId: string | null;
    userType: 'Client' | 'Agent' | null;
    isLoading: boolean;
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
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Load token from localStorage on initial load
    useEffect(() => {
        try {
            console.log("AuthProvider: Attempting to load auth state from localStorage...");
            const storedToken = localStorage.getItem('authToken');
            const storedUserId = localStorage.getItem('userId');
            const storedUserType = localStorage.getItem('userType') as 'Client' | 'Agent' | null;

            if (storedToken && storedUserId && storedUserType) {
                console.log("AuthProvider: Found stored auth state.", { storedUserId, storedUserType });
                setToken(storedToken);
                setUserId(storedUserId);
                setUserType(storedUserType);
            } else {
                console.log("AuthProvider: No valid auth state found in localStorage.");
            }
        } catch (error) {
             console.error("AuthProvider: Error reading from localStorage:", error);
             // Handle potential errors if localStorage is blocked or fails
        } finally {
             console.log("AuthProvider: Finished loading state, setting isLoading to false.");
             setIsLoading(false);
        }
    }, []);

    const login = (newToken: string, newUserId: string, newUserType: 'Client' | 'Agent') => {
        console.log(`AuthProvider: Logging in user ${newUserId} as ${newUserType}`);
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('userId', newUserId);
        localStorage.setItem('userType', newUserType);
        setToken(newToken);
        setUserId(newUserId);
        setUserType(newUserType);
        // Navigate based on user type
        if (newUserType === 'Agent') {
            console.log("AuthProvider: Navigating Agent to /agent-dashboard");
            navigate('/agent-dashboard');
        } else {
             console.log("AuthProvider: Navigating Client to /profile");
            navigate('/profile');
        }
    };

    const logout = () => {
        console.log("AuthProvider: Logging out user.");
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
        <AuthContext.Provider value={{ token, userId, userType, isLoading, login, logout, isAuthenticated }}>
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