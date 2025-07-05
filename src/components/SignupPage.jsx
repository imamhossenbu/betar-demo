import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../provider/AuthProvider';
import Loading from './Loading';
import { FaGoogle } from 'react-icons/fa6';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const { signup, googleLogin, loading } = useContext(AuthContext);

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!name || !email || !password) {
            Swal.fire('Warning!', 'সকল ফিল্ড পূরণ করা প্রয়োজন।', 'warning');
            return;
        }

        try {
            await signup(email, password, name); // ✅ name passed here
            Swal.fire('Success!', 'সাইনআপ সফল হয়েছে! এখন লগইন করুন।', 'success');
            navigate('/');
        } catch (error) {
            console.error('Signup error:', error.message);
            Swal.fire('Error!', error.message || 'সাইনআপ ব্যর্থ হয়েছে।', 'error');
        }
    };


    const handleGoogleSignup = async () => {
        try {
            await googleLogin();
            Swal.fire("গুগল লগইন সম্পন্ন হয়েছে!", '', 'success');
            navigate('/');
        } catch (error) {
            console.error('Google login failed:', error);
            Swal.fire('Error!', error.message || 'গুগল লগইন ব্যর্থ হয়েছে।', 'error');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex items-center justify-center font-kalpurush sm:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row  w-full max-w-5xl bg-white sm:rounded-xl shadow-2xl overflow-hidden">
                {/* Left Panel */}
                <div className="md:w-1/2 p-8 sm:p-10 bg-gradient-to-tl from-teal-500 via-emerald-600 to-lime-500 text-white flex flex-col items-center justify-center text-center">
                    <div className="bg-white rounded-full p-4 shadow-xl mb-6">
                        <img src="logo.png" alt="Logo" className="h-32 w-32 rounded-full object-contain" />
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold mb-2 leading-tight">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h2>
                    <h3 className="text-xl sm:text-2xl font-semibold mt-1">বাংলাদেশ বেতার</h3>
                    <p className="mt-4 text-base opacity-90">সহজে আপনার নতুন অ্যাকাউন্ট তৈরি করুন।</p>
                </div>

                {/* Form Panel */}
                <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8">সাইন আপ করুন</h2>
                    <form onSubmit={handleSignup} className="space-y-2">
                        <div>
                            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">নাম:</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="আপনার পুরো নাম দিন"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">ইমেইল:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="আপনার ইমেইল লিখুন"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">পাসওয়ার্ড:</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="একটি শক্তিশালী পাসওয়ার্ড দিন"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-green-700 transition transform hover:scale-105"
                            >
                                সাইন আপ
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-sm text-green-600 hover:underline"
                            >
                                লগইন পেজে যান
                            </button>
                        </div>
                    </form>

                    {/* Google Signup Button */}
                    <div className="mt-6 flex flex-col items-center">
                        <div className="relative w-full text-center mb-6">
                            <span className="absolute left-0 top-1/2 w-5/12 h-px bg-gray-300 -translate-y-1/2"></span>
                            <span className="text-gray-500 font-semibold text-sm">অথবা</span>
                            <span className="absolute right-0 top-1/2 w-5/12 h-px bg-gray-300 -translate-y-1/2"></span>
                        </div>
                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center space-x-2 transform hover:scale-[1.01]"
                        >
                            <FaGoogle />
                            <span>গুগল দিয়ে সাইন আপ করুন</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
