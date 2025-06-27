import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from './provider/AuthProvider';
import TableView from './components/TableView';
import PrintView from './components/PrintView';
import ReportView from './components/ReportView';
import Layout from './Layout';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AddSongPage from './components/AddSongPage';
import Swal from 'sweetalert2';
import DashboardPage from './pages/DashboardPage';
import ErrorPage from './pages/ErrorPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Loading from './components/Loading';

const AppRouter = () => {
    const { user, loading, logout } = useContext(AuthContext); // ✅ use context logout
    const [scheduleData, setScheduleData] = useState([]);
    const [selectedCeremonies, setSelectedCeremonies] = useState([]);

    const handleLogout = async () => {
        try {
            await logout(); // ✅ logout handles Firebase and clears token
            setScheduleData([]); // clear table data
            Swal.fire({
                icon: 'success',
                title: 'Logged Out!',
                text: 'You have been successfully logged out.',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (err) {
            Swal.fire('Error!', 'Failed to log out. Try again.', 'error');
        }
    };


    const isAuthenticated = !!user;

    const router = createBrowserRouter([
        {
            path: '/login',
            element: isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />,
        },
        {
            path: '/signup',
            element: isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />,
        },
        {
            path: '/forgot-password',
            element: isAuthenticated ? <Navigate to="/" replace /> : <ForgotPasswordPage />,
        },
        {
            path: '/',
            element: isAuthenticated ? (
                <Layout setScheduleData={setScheduleData} handleLogout={handleLogout} />
            ) : (
                <Navigate to="/login" replace />
            ),
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: 'schedule/:dayKey/:shift',
                    element: (
                        <TableView
                            scheduleData={scheduleData}
                            setScheduleData={setScheduleData}
                            selectedCeremonies={selectedCeremonies}
                            setSelectedCeremonies={setSelectedCeremonies}
                        />
                    ),
                },
                {
                    path: 'print',
                    element: <PrintView selectedCeremonies={selectedCeremonies} />,
                },
                {
                    path: 'report',
                    element: <ReportView />,
                },
                {
                    path: 'add-song',
                    element: <AddSongPage />,
                },
                {
                    path: '*',
                    element: <ErrorPage />,
                },
            ],
        },
    ]);

    return <RouterProvider router={router} />;
};

export default AppRouter;
