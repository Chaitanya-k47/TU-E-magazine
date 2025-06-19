// src/utils/api.js
import axios from 'axios'; // We'll use axios for easier API calls

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; // Get from .env or default

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    //'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token to requests if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Or get from your auth context/state manager
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;