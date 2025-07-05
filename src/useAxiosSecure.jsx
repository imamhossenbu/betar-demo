import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './provider/AuthProvider';



const axiosSecure = axios.create({
  baseURL: 'https://betar-server.onrender.com'
})
const useAxiosSecure = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  axiosSecure.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => {
      return Promise.reject(error);
    });


  axiosSecure.interceptors.response.use(response => {
    return response;
  }, async (error) => {
    const status = error.response.status;
    if (status === 401 || status === 403) {
      await logout();
      navigate('/login');
    }
    return Promise.reject(error);
  });

  return axiosSecure;
};

export default useAxiosSecure;