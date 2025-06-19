import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Wrap functions in useCallback to prevent unnecessary recreations
    const login = useCallback(async (username, password) => {
        try {
            setLoading(true);
            const response = await axios.post('http://127.0.0.1:8000/users/token/', { username, password });
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            setUser(jwtDecode(response.data.access));
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Re-throw to handle in the component
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    }, []);

    const refreshToken = useCallback(async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            if (!refresh) {
                throw new Error('No refresh token available');
            }
            
            const response = await axios.post('http://127.0.0.1:8000/users/token/refresh/', { refresh });
            localStorage.setItem('access_token', response.data.access);
            setUser(jwtDecode(response.data.access));
            return response.data.access;
        } catch (err) {
            logout();
            throw err;
        }
    }, [logout]);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (token) {
                    // Verify token isn't expired before setting user
                    const decoded = jwtDecode(token);
                    if (decoded.exp * 1000 > Date.now()) {
                        setUser(decoded);
                    } else {
                        // Attempt to refresh token if expired
                        await refreshToken();
                    }
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
                logout();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [logout, refreshToken]);

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            logout, 
            refreshToken 
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}