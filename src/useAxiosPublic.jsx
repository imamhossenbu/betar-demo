import axios from 'axios';



const axiosSecurePublic = axios.create({
    baseURL: 'https://server.equesheet.com'
})
const useAxiosPublic = () => {
    return axiosSecurePublic;
};

export default useAxiosPublic;