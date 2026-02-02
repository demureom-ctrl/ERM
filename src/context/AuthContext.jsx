
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

import { api } from '../services/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const userData = await api.login(username, password);

            if (userData) {
                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));

                // Track Login
                api.logActivity(userData, 'تسجيل دخول', { time: new Date().toISOString() });
                return true;
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    };

    const logout = () => {
        if (user) {
            api.logActivity(user, 'تسجيل خروج', { time: new Date().toISOString() });
        }
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
