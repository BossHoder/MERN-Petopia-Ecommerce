import axios from 'axios';

// Create axios instance with default config
const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // For FormData, remove Content-Type to let browser set it automatically
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        console.log('API Request:', {
            method: config.method,
            url: config.url,
            headers: config.headers,
            data: config.data instanceof FormData ? 'FormData' : config.data,
        });

        return config;
    },
    (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    },
);

// Response interceptor to handle errors
API.interceptors.response.use(
    (response) => {
        console.log('API Response:', {
            status: response.status,
            url: response.config.url,
            data: response.data,
        });
        return response;
    },
    (error) => {
        console.error('API Response Error:', {
            status: error.response?.status,
            url: error.config?.url,
            message: error.message,
            response: error.response?.data,
        });

        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default API;
