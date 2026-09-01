import React, { createContext, useState, useEffect } from 'react';
import api from '../api/client';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aviator_token') || null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to restore user session:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('aviator_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setAuthModalOpen(false);
    return res.data;
  };

  const register = async (fullName, phone, password) => {
    const res = await api.post('/auth/register', { fullName, phone, password });
    const { token: jwtToken, user: userData } = res.data;
    localStorage.setItem('aviator_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
    setAuthModalOpen(false);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('aviator_token');
    setToken(null);
    setUser(null);
  };

  const updateUserBalance = (newBalance) => {
    if (user && newBalance !== undefined) {
      setUser(prev => ({ ...prev, balance: newBalance }));
    }
  };

  const openLogin = () => {
    setAuthTab('login');
    setAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthTab('register');
    setAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        authModalOpen,
        setAuthModalOpen,
        authTab,
        setAuthTab,
        login,
        register,
        logout,
        updateUserBalance,
        openLogin,
        openRegister,
        fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
