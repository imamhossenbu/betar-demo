import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../provider/AuthProvider';
import Loading from './Loading';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        // Or a spinner component while waiting for auth state
        return <Loading />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default PrivateRoute;
