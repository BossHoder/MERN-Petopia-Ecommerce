import API from './api';

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get auth token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Set auth token
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Set user data
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};

export default authService;
