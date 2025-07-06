import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../provider/AuthProvider';
import { FaGoogle } from 'react-icons/fa6';
import Loading from './Loading';
import useAxiosPublic from '../useAxiosPublic';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showReset, setShowReset] = useState(false);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();
    const { login, googleLogin, resetPassword, loading, setUser } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            Swal.fire('Warning!', 'ইমেইল এবং পাসওয়ার্ড উভয়ই প্রয়োজন।', 'warning');
            return;
        }

        try {
            await login(email, password);
            Swal.fire('লগইন সফল হয়েছে!', '', 'success');
            navigate('/');
        } catch (error) {
            console.error('Login failed:', error);
            Swal.fire('Error!', error.message || 'লগইন ব্যর্থ হয়েছে।', 'error');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await googleLogin(); // Firebase Google login
            const user = result.user;

            const email = user.email;
            const uid = user.uid;
            const name = user.displayName;

            // Step 1: Save user to the database
            await axiosPublic.post('/users', {
                email,
                uid,
                displayName: name,
                role: 'user' // default role
            });

            // Step 2: Get JWT token
            const tokenRes = await axiosPublic.post('/jwt', {
                email,
                uid
            });

            // Step 3: Store JWT token
            if (tokenRes.data.token) {
                localStorage.setItem('token', tokenRes.data.token);
            }

            // Step 4: Set user context
            setUser(user);

            // Step 5: Navigate and notify
            Swal.fire("গুগল লগইন সম্পন্ন হয়েছে!", '', 'success');
            navigate('/');

        } catch (error) {
            console.error('Google login failed:', error);
            Swal.fire('Error!', error.message || 'গুগল লগইন ব্যর্থ হয়েছে।', 'error');
        }
    };


    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!email) {
            Swal.fire('Warning!', 'অনুগ্রহ করে আপনার ইমেইল প্রদান করুন।', 'warning');
            return;
        }

        try {
            await resetPassword(email);
            Swal.fire('সফল!', 'আপনার ইমেইলে একটি রিসেট লিংক পাঠানো হয়েছে।', 'success');
            setShowReset(false); // return to login form
        } catch (error) {
            console.error('Password reset error:', error);
            Swal.fire('Error!', error.message || 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে।', 'error');
        }
    };

    if (loading) return <Loading />;

    return (
        <div className="bg-gradient-to-br from-gray-100 to-blue-200 flex items-center justify-center font-kalpurush sm:p-6 lg:p-8 min-h-screen">
            <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
                {/* Left Panel */}
                <div className="md:w-1/2 bg-yellow-200 text-black flex flex-col items-center justify-center text-center p-6">
                    <div className="bg-white rounded-full p-4 shadow-xl mb-6">
                        <img src="/logo.png" alt="Bangladesh Betar Logo" className="h-32 w-32 rounded-full object-contain" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-2 leading-tight">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</h2>
                    <h3 className="text-xl sm:text-2xl font-semibold mt-1">বাংলাদেশ বেতার</h3>
                    <p className="mt-4 text-base opacity-90">আপনার দৈনিক কর্মসূচী সহজে পরিচালনা করুন।</p>
                </div>

                {/* Right Panel */}
                <div className="md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
                        {showReset ? 'পাসওয়ার্ড রিসেট করুন' : 'লগইন করুন'}
                    </h2>

                    <form onSubmit={showReset ? handleResetPassword : handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">ইমেইল:</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="আপনার ইমেইল দিন"
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {!showReset && (
                            <div>
                                <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">পাসওয়ার্ড:</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="*******"
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                type="submit"
                                className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-blue-700 transition"
                            >
                                {showReset ? 'রিসেট লিংক পাঠান' : 'লগইন'}
                            </button>
                            {!showReset && (
                                <button
                                    type="button"
                                    onClick={() => setShowReset(true)}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    পাসওয়ার্ড ভুলে গেছেন?
                                </button>
                            )}
                            {showReset && (
                                <button
                                    type="button"
                                    onClick={() => setShowReset(false)}
                                    className="text-sm text-gray-500 hover:underline"
                                >
                                    লগইন পেজে ফিরে যান
                                </button>
                            )}
                        </div>
                    </form>

                    {!showReset && (
                        <>
                            <div className="mt-6 flex flex-col items-center">
                                <div className="relative w-full text-center mb-6">
                                    <span className="absolute left-0 top-1/2 w-5/12 h-px bg-gray-300 -translate-y-1/2"></span>
                                    <span className="text-gray-500 font-semibold text-sm">অথবা</span>
                                    <span className="absolute right-0 top-1/2 w-5/12 h-px bg-gray-300 -translate-y-1/2"></span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full bg-white border border-gray-300 font-bold py-3 px-6 rounded-lg shadow-md hover:bg-gray-50 flex items-center justify-center space-x-2 transition"
                                >
                                    <FaGoogle />
                                    <span>গুগল দিয়ে লগইন করুন</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="mt-6 w-full text-center text-blue-600 hover:underline text-base"
                            >
                                নতুন একাউন্ট?
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
