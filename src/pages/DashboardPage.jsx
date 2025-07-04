import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAdmin from '../hooks/useAdmin';
import Loading from '../components/Loading';

const DashboardPage = () => {
    const navigate = useNavigate();
    const [isAdmin, adminLoading] = useAdmin();
    console.log(isAdmin);

    if (adminLoading) return <Loading />

    const handleNavigateToAddSong = () => {
        navigate('/add-song');
    };

    const handleNavigateToAllSongs = () => {
        navigate('/all-songs');
    };



    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full mx-auto font-kalpurush text-gray-800">
            <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">স্বাগতম, ড্যাশবোর্ড!</h2>
            <p className="text-center text-lg mb-8">নেভিগেশন বার থেকে একটি দিন এবং অধিবেশন নির্বাচন করুন অথবা নতুন কিছু গান/অনুষ্ঠান যোগ করুন।</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">



                {/* Add New Song */}
                <div className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                    <span className="text-5xl mb-4" role="img" aria-label="Music Note">🎵</span>
                    <h3 className="text-xl font-semibold mb-2">নতুন গান/অনুষ্ঠান যোগ করুন</h3>
                    <p className="text-gray-600 mb-4">আপনার সংগ্রহে নতুন গান/অনুষ্ঠান যোগ করুন।</p>
                    <button
                        onClick={handleNavigateToAddSong}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        গান/অনুষ্ঠান যোগ করুন
                    </button>
                </div>

                {/* All Songs */}
                <div className="bg-yellow-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                    <span className="text-5xl mb-4" role="img" aria-label="Songs">📂</span>
                    <h3 className="text-xl font-semibold mb-2">সকল গান/অনুষ্ঠান</h3>
                    <p className="text-gray-600 mb-4">আপনার সমস্ত সংরক্ষিত গান/অনুষ্ঠান দেখুন এবং পরিচালনা করুন।</p>
                    <button
                        onClick={handleNavigateToAllSongs}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                        গান/অনুষ্ঠান সমূহ দেখুন
                    </button>
                </div>
                {isAdmin && (
                    <div className="bg-red-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
                        <span className="text-5xl mb-4">👥</span>
                        <h3 className="text-xl font-semibold mb-2">সকল ইউজার</h3>
                        <p className="text-gray-600 mb-4">সিস্টেমে রেজিস্টারকৃত সকল ইউজার দেখুন।</p>
                        <button
                            onClick={() => navigate('/all-users')}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                        >
                            ইউজার তালিকা
                        </button>
                    </div>
                )}

            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-500">আরো দ্রুত অ্যাকশনের জন্য উপরের নেভিগেশন বার ব্যবহার করুন।</p>
            </div>
        </div>
    );
};

export default DashboardPage;
