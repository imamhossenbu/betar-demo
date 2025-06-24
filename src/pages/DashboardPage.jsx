// components/DashboardPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
    const navigate = useNavigate();

    const handleNavigateToAddSong = () => {
        navigate('/add-song');
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full mx-auto font-[kalpurush] text-gray-800">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">স্বাগতম, ড্যাশবোর্ড!</h2>
            <p className="text-center text-lg mb-8">নেভিগেশন বার থেকে একটি দিন এবং অধিবেশন নির্বাচন করুন অথবা নতুন কিছু যোগ করুন।</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Feature Card: View Daily Programs */}
                <div className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                    <span className="text-5xl mb-4" role="img" aria-label="Calendar">🗓️</span>
                    <h3 className="text-xl font-semibold mb-2">দৈনিক প্রোগ্রাম দেখুন</h3>
                    <p className="text-gray-600 mb-4">দিনের শিফট অনুযায়ী আপনার কিউ শিট দেখুন এবং পরিচালনা করুন।</p>
                    <button
                        onClick={() => navigate('/schedule/mon/সকাল')} // Example navigation, user will use Navbar
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        প্রোগ্রাম শুরু করুন
                    </button>
                </div>

                {/* Feature Card: Add New Song */}
                <div className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                    <span className="text-5xl mb-4" role="img" aria-label="Music Note">🎵</span>
                    <h3 className="text-xl font-semibold mb-2">নতুন সঙ্গীত যোগ করুন</h3>
                    <p className="text-gray-600 mb-4">আপনার সংগ্রহে নতুন গান যোগ করুন।</p>
                    <button
                        onClick={handleNavigateToAddSong}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        গান যোগ করুন
                    </button>
                </div>

                {/* Feature Card: Generate Report (Example) */}
                <div className="bg-purple-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                    <span className="text-5xl mb-4" role="img" aria-label="Chart">📊</span>
                    <h3 className="text-xl font-semibold mb-2">রিপোর্ট তৈরি করুন</h3>
                    <p className="text-gray-600 mb-4">আপনার প্রোগ্রামগুলির উপর ভিত্তি করে রিপোর্ট তৈরি করুন।</p>
                    <button
                        onClick={() => navigate('/report')}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        রিপোর্ট দেখুন
                    </button>
                </div>
            </div>

            {/* Optional: Quick links or recent activity */}
            <div className="mt-12 text-center">
                <p className="text-gray-500">আরো দ্রুত অ্যাকশনের জন্য উপরের নেভিগেশন বার ব্যবহার করুন।</p>
            </div>
        </div>
    );
};

export default DashboardPage;
