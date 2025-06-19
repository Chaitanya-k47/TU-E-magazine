// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../utils/api'; // Our API client
import { jwtDecode } from 'jwt-decode'; // For decoding JWT to get user info

// Install jwt-decode: npm install jwt-decode

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores decoded user info { id, role, name (if added to token) }
  const [token, setToken] = useState(localStorage.getItem('token')); // Get token from localStorage
  const [loading, setLoading] = useState(true); // To handle initial auth check

  useEffect(() => {
    // Check for token in localStorage on initial load
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        // Optional: Check token expiration (jwtDecode doesn't do this by default)
        // const currentTime = Date.now() / 1000;
        // if (decodedUser.exp < currentTime) {
        //   logout(); // Token expired
        // } else {
          setUser(decodedUser.user); // Assuming payload is { user: { id, role } }
          setToken(storedToken);
        // }
      } catch (error) {
        console.error("Invalid token:", error);
        logout(); // Clear invalid token
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: newToken } = response.data;

      localStorage.setItem('token', newToken);
      const decodedUser = jwtDecode(newToken);
      setUser(decodedUser.user); // Assuming payload is { user: { id, role } }
      setToken(newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`; // Update axios default header
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data?.error || error.message);
      logout(); // Clear any partial auth state on failure
      return { success: false, error: error.response?.data?.error || 'Login failed. Please try again.' };
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const response = await apiClient.post('/auth/register', { name, email, password, role });
      const { token: newToken } = response.data;

      localStorage.setItem('token', newToken);
      const decodedUser = jwtDecode(newToken);
      setUser(decodedUser.user);
      setToken(newToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.error || error.message);
      // No need to logout here as they weren't logged in
      return { success: false, error: error.response?.data?.error || 'Registration failed. Please try again.' };
    }
  };


  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  // Don't render children until loading is false to prevent UI flicker
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, isAuthenticated: !!token, isLoading: loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};