import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollButtons from './components/ScrollButtons';

// Utility to convert English digits to Bangla
const toBanglaNumber = (num) =>
    String(num).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

const Layout = ({ setScheduleData }) => {
    const currentYear = toBanglaNumber(new Date().getFullYear());

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar setScheduleData={setScheduleData} />

            <main className="container mx-auto px-4 py-6 flex-grow">
                <Outlet />
            </main>

            <footer className="bg-gray-100 print:hidden text-center text-sm text-gray-600 py-4 border-t border-gray-200 font-kalpurush mt-auto">
                © {currentYear} বাংলাদেশ বেতার | সর্বস্বত্ব সংরক্ষিত
            </footer>

            <ScrollButtons />
        </div>
    );
};

export default Layout;
