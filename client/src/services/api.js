import axios from 'axios';
import { safeRedirectToLogin } from '../utils/authRedirect';

// Debug environment variables
console.log('🔍 Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
console.log('REACT_APP_BASE_URL:', process.env.REACT_APP_BASE_URL);
console.log('REACT_APP_SERVER_URL:', process.env.REACT_APP_SERVER_URL);

// Determine base URL based on environment
const getBaseURL = () => {
    // If REACT_APP_API_URL is explicitly set, use it
    if (process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }

    // If in development, use proxy (empty string)
    if (process.env.NODE_ENV === 'development') {
        return '';
    }

    // If in production but no API URL set, use current domain
    if (process.env.NODE_ENV === 'production') {
        return window.location.origin;
    }

    // Fallback
    return 'http://localhost:5000';
};

// Create axios instance with default config
const API = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('🌐 API Base URL:', API.defaults.baseURL);

// Request interceptor to add auth token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Backend expects x-auth-token header, not Authorization Bearer
            config.headers['x-auth-token'] = token;
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

        // Handle 401 errors more gracefully
        if (error.response?.status === 401) {
            // Clear invalid token
            localStorage.removeItem('token');

            // Use safe redirect utility to prevent loops
            safeRedirectToLogin();
        }
        return Promise.reject(error);
    },
);

export default API;
