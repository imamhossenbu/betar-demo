import React from 'react'
import axios from 'axios';

const axiosPublic = axios.create({
    baseURL:
        process.env.NODE_ENV === 'development'
            ? import.meta.env.VITE_API_BASE_URL
            : 'http://localhost:3000',
    withCredentials: true,
});

const useAxiosPublic = () => {
    return axiosPublic;
}

export default useAxiosPublic;