// src/hooks/useAxiosSecure.js or wherever appropriate
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './provider/AuthProvider'

// ✅ Axios instance
const axiosSecure = axios.create({
  baseURL:
    process.env.NODE_ENV === 'development'
      ? import.meta.env.VITE_API_BASE_URL
      : 'http://localhost:3000',
  withCredentials: true,
});

// ✅ Custom hook that uses the same instance
const useAxiosSecure = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const interceptor = axiosSecure.interceptors.response.use(
      res => res,
      async (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          await logout();
          navigate('/login', { replace: true });
        }
        return Promise.reject(error);
      }
    );

    return () => axiosSecure.interceptors.response.eject(interceptor);
  }, [logout, navigate]);

  return axiosSecure;
};

// ✅ Named export for the instance (for use outside React)
export { axiosSecure };

// ✅ Default export for hook usage
export default useAxiosSecure;
