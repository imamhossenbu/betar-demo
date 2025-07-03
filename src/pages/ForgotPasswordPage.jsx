import React, { useState, useContext } from 'react';
import Swal from 'sweetalert2';
import { AuthContext } from '../provider/AuthProvider';


const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const { resetPassword } = useContext(AuthContext);

    const handleReset = async (e) => {
        e.preventDefault();
        if (!email) {
            Swal.fire('Warning!', 'ইমেইল প্রদান করুন।', 'warning');
            return;
        }

        try {
            await resetPassword(email);
            Swal.fire('সফল!', 'পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে আপনার ইমেইলে।', 'success');
        } catch (error) {
            console.error('Reset failed:', error);
            Swal.fire('Error!', error.message || 'রিসেট করতে ব্যর্থ হয়েছে।', 'error');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-200 font-kalpurush p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                <h2 className="text-2xl font-bold mb-4 text-blue-700">পাসওয়ার্ড রিসেট করুন</h2>
                <p className="text-gray-600 mb-6 text-sm">আপনার অ্যাকাউন্টে রিসেট লিংক পাঠাতে ইমেইল প্রদান করুন।</p>

                <form onSubmit={handleReset} className="space-y-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="আপনার ইমেইল দিন"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                    >
                        রিসেট লিংক পাঠান
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
