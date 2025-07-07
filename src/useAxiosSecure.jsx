import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { AuthContext } from './provider/AuthProvider';

// Create the instance once
const axiosSecure = axios.create({
  baseURL: 'https://server.equesheet.com',
});

// Register interceptors only once
let interceptorsRegistered = false;

const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    if (!interceptorsRegistered) {
      interceptorsRegistered = true;

      // Request Interceptor
      axiosSecure.interceptors.request.use(
        config => {
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.authorization = `Bearer ${token}`;
          }
          return config;
        },
        error => Promise.reject(error)
      );

      // Response Interceptor
      axiosSecure.interceptors.response.use(
        response => response,
        async (error) => {
          const status = error?.response?.status;
          if (status === 401 || status === 403) {
            console.warn('🔒 Unauthorized, logging out...');
            await logout();
            navigate('/login');
          }
          return Promise.reject(error);
        }
      );
    }
  }, [logout, navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
