import React from 'react';

const Loading = () => {
    return (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
                <svg
                    className="animate-spin h-10 w-10 text-green-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                </svg>
                <p className="text-gray-700 text-lg font-semibold animate-pulse">লোড হচ্ছে...</p>
            </div>
        </div>
    );
};

export default Loading;
