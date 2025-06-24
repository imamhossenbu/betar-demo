// Layout.jsx
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';

// Layout component now accepts setScheduleData and handleLogout as props
const Layout = ({ setScheduleData, handleLogout }) => { // Removed setCueSheetId
    const navigate = useNavigate();

    // This function will be passed to Navbar and execute the logout logic
    const onLogout = () => {
        handleLogout(); // Call the original logout logic from AppRouter
        navigate('/login'); // Directly navigate to login page after logout
    };

    return (
        <div>
            {/* Pass the setters and the new onLogout function to Navbar */}
            {/* Removed setCueSheetId from Navbar props */}
            <Navbar setScheduleData={setScheduleData} handleLogout={onLogout} />
            <main className="container mx-auto px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
