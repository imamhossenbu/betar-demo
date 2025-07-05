// hooks/useAdmin.js
import { useContext, useEffect, useState } from 'react';
import useAxiosSecure from '../useAxiosSecure';
import { AuthContext } from '../provider/AuthProvider';

const useAdmin = () => {
    const { user, loading } = useContext(AuthContext);
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminLoading, setAdminLoading] = useState(true);
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        if (!user?.email || loading) return;

        axiosSecure.get(`/users/admin/${user.email}`)
            .then(res => {
                setIsAdmin(res.data?.isAdmin);
                setAdminLoading(false);
            })
            .catch(err => {
                console.error('Error checking admin status:', err);
                setIsAdmin(false);
                setAdminLoading(false);
            });

    }, [user, loading, axiosSecure]);

    return [isAdmin, adminLoading];
};

export default useAdmin;
