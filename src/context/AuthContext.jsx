
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

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

    const login = (username, password) => {
        // Mock login logic
        if (username === 'admin' && password === 'admin') {
            const userData = { name: 'Admin User', role: 'admin' };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        } else if (username === 'sales' && password === 'sales') {
            const userData = { name: 'Sales User', role: 'sales' };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return true;
        }

        return false;
    };

    const logout = () => {
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
