// components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import useAdmin from '../hooks/useAdmin';
import Loading from '../components/Loading';


const AdminRoute = ({ children }) => {
    const [isAdmin, adminLoading] = useAdmin();

    if (adminLoading) return <Loading />;
    if (!isAdmin) return <Navigate to="/" replace />;

    return children;
};

export default AdminRoute;
