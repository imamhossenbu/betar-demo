import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ReportView = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const item = state?.ceremony;
    const handlePrint = () => {
        window.print();
    }

    if (!item) {
        return <p className="text-red-500 text-center">No report data available.</p>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-xl">
            <h2 className="text-2xl font-bold mb-4 text-center">Reader's Report</h2>

            <div className="space-y-2 text-sm">
                <p><strong>ক্রমিক:</strong> {item.serial}</p>
                <p><strong>প্রচার সময়:</strong> {item.broadcastTime}</p>
                <p><strong>অনুষ্ঠানের নাম:</strong> {item.programDetails}</p>
                <p><strong>শিল্পী:</strong> {item.artist}</p>
                <p><strong>গীতিকার:</strong> {item.lyricist}</p>
                <p><strong>সুরকার:</strong> {item.composer}</p>
                <p><strong>সিডি ও কাট:</strong> {item.cdCut}</p>
                <p><strong>স্থিতি:</strong> {item.duration}</p>
            </div>

            <div className="mt-6 flex gap-3 justify-end print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Back
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Print
                </button>
            </div>
        </div>
    );
};

export default ReportView;
