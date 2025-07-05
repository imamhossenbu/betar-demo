// Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollButtons from './components/ScrollButtons';

// Layout component now accepts setScheduleData and handleLogout as props
const Layout = ({ setScheduleData }) => { // Removed setCueSheetId


    return (
        <div>
            {/* Pass the setters and the new onLogout function to Navbar */}
            {/* Removed setCueSheetId from Navbar props */}
            <Navbar setScheduleData={setScheduleData} />
            <main className="container mx-auto px-4 py-6">
                <Outlet />
            </main>
            <ScrollButtons />
        </div>
    );
};

export default Layout;
