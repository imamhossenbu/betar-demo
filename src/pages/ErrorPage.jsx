import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ErrorPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center  px-4 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="max-w-md w-full"
            >
                <DotLottieReact
                    src="/animation.lottie" // ✅ Put your .lottie file inside `public/` and update path
                    autoplay
                    loop
                    style={{ width: '100%', height: '300px' }}
                />
                <p className="text-lg text-gray-700 mb-6">এই পৃষ্ঠাটি খুঁজে পাওয়া যায়নি।</p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg shadow hover:bg-red-600 transition"
                >
                    হোমে ফিরে যান
                </motion.button>
            </motion.div>
        </div>
    );
};

export default ErrorPage;
