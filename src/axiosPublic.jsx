// axiosPublic.js
import axios from 'axios';

const axiosPublic = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', // Adjust base URL as needed
});

// Add a request interceptor to include the token in headers
axiosPublic.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Get token from localStorage
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Optional: Add a response interceptor to handle token expiration/invalidity
axiosPublic.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Token expired or invalid, log out the user
            console.error('Authentication error: Token expired or invalid. Logging out.');
            localStorage.removeItem('token');
            localStorage.removeItem('userId'); // Remove userId too
            // You might want to dispatch a global logout action here
            window.location.href = '/login'; // Redirect to login page
        }
        return Promise.reject(error);
    }
);

export default axiosPublic;