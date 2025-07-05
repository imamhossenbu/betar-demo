import axios from 'axios';



const axiosSecurePublic = axios.create({
    baseURL: 'https://betar-server.onrender.com'
})
const useAxiosPublic = () => {
    return axiosSecurePublic;
};

export default useAxiosPublic;