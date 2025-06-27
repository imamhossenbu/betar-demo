import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Swal from 'sweetalert2';
import { axiosSecure } from '../useAxiosSecure'


const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!email.trim()) {
            // যদি Swal বিশ্বব্যাপী উপলব্ধ থাকে, তাহলে এটি কাজ করবে
            if (typeof Swal !== 'undefined') {
                Swal.fire('ভুল!', 'অনুগ্রহ করে আপনার ইমেল লিখুন।', 'error');
            } else {
                console.error('Swal is not defined. Please ensure SweetAlert2 is loaded.');
                alert('অনুগ্রহ করে আপনার ইমেল লিখুন।'); // Fallback for environments without Swal
            }
            setLoading(false);
            return;
        }

        try {
            const response = await axiosSecure.post('/api/forgot-password', { email });

            if (typeof Swal !== 'undefined') {
                Swal.fire(
                    'সফল!',
                    response.data.message || 'পাসওয়ার্ড রিসেটের নির্দেশাবলী আপনার ইমেইলে পাঠানো হয়েছে (যদি একাউন্ট বিদ্যমান থাকে)।',
                    'success'
                );
            } else {
                console.log(response.data.message || 'পাসওয়ার্ড রিসেটের নির্দেশাবলী আপনার ইমেইলে পাঠানো হয়েছে (যদি একাউন্ট বিদ্যমান থাকে)।');
                alert(response.data.message || 'পাসওয়ার্ড রিসেটের নির্দেশাবলী আপনার ইমেইলে পাঠানো হয়েছে (যদি একাউন্ট বিদ্যমান থাকে)।');
            }
            navigate('/login'); // অনুরোধ সফল হলে লগইন পেজে ফিরে যান
        } catch (error) {
            console.error('Forgot password error:', error.response?.data || error.message);
            if (typeof Swal !== 'undefined') {
                Swal.fire(
                    'ভুল!',
                    error.response?.data?.message || 'পাসওয়ার্ড রিসেট অনুরোধ ব্যর্থ হয়েছে। অনুগ্রহ করে ইমেল যাচাই করুন।',
                    'error'
                );
            } else {
                console.error(error.response?.data?.message || 'পাসওয়ার্ড রিসেট অনুরোধ ব্যর্থ হয়েছে। অনুগ্রহ করে ইমেল যাচাই করুন।');
                alert(error.response?.data?.message || 'পাসওয়ার্ড রিসেট অনুরোধ ব্যর্থ হয়েছে। অনুগ্রহ করে ইমেল যাচাই করুন।');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-300 flex items-center justify-center font-[kalpurush] px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 sm:p-10">
                <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">পাসওয়ার্ড রিসেট করুন</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-5">
                        <label className="block text-gray-700 font-semibold mb-1" htmlFor="email">
                            ইমেল:
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="আপনার নিবন্ধিত ইমেল ঠিকানা দিন"
                            className="w-full border rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-6 py-2 rounded-md shadow hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'পাঠানো হচ্ছে...' : 'রিসেট লিঙ্ক পাঠান'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="text-sm text-blue-600 hover:underline"
                            disabled={loading}
                        >
                            লগইন পেজে ফিরে যান
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
