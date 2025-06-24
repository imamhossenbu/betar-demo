// Router.jsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useState } from 'react';
import TableView from './components/TableView';
import PrintView from './components/PrintView';
import ReportView from './components/ReportView';
import Layout from './Layout';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AddSongPage from './components/AddSongPage';
import Swal from 'sweetalert2';
import DashboardPage from './pages/DashboardPage';

const AppRouter = () => {
    const [scheduleData, setScheduleData] = useState([]);
    const [selectedCeremonies, setSelectedCeremonies] = useState([]);

    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    console.log('AppRouter: isAuthenticated initial state:', isAuthenticated);

    const handleLogout = () => {
        console.log('AppRouter: handleLogout function called.');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        console.log('AppRouter: localStorage cleared. Token exists?', !!localStorage.getItem('token'));

        Swal.fire({
            icon: 'success',
            title: 'Logged Out!',
            text: 'You have been successfully logged out.',
            showConfirmButton: false,
            timer: 1500
        }).then(() => {
            setIsAuthenticated(false);
            console.log('AppRouter: setIsAuthenticated(false) called.');
            setScheduleData([]);
            console.log('AppRouter: All states cleared after logout.');
        });
    };

    const router = createBrowserRouter([
        {
            path: '/login',
            element: isAuthenticated ? (
                <Navigate to="/" replace />
            ) : (
                <LoginPage setIsAuthenticated={setIsAuthenticated} />
            ),
        },
        {
            path: '/signup',
            element: isAuthenticated ? (
                <Navigate to="/" replace />
            ) : (
                <SignupPage />
            ),
        },
        {
            path: '/',
            element: isAuthenticated ? (
                <Layout
                    setScheduleData={setScheduleData}
                    handleLogout={handleLogout}
                />
            ) : (
                <Navigate to="/login" replace />
            ),
            children: [
                {
                    index: true,
                    element: <DashboardPage />, // <-- Now renders DashboardPage component
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
            ],
        },
    ]);

    return <RouterProvider router={router} />;
};

export default AppRouter;
