import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Loading = () => {
    return (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <div className="w-48 h-48">
                    <DotLottieReact
                        src="https://lottie.host/d8fd83d5-f130-4642-9c30-e08234e82cf6/kvVSOqMhR3.lottie"
                        loop
                        autoplay
                    />
                </div>
                <p className="text-gray-700 text-lg font-semibold animate-pulse">লোড হচ্ছে...</p>
            </div>
        </div>
    );
};

export default Loading;
