import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Component for the print view
const PrintView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedRows = location.state?.selectedRows || [];
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full font-kalpurush  max-w-3xl mx-auto print:shadow-none print:rounded-none">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 print:hidden">
                Selected Ceremonies for Print
            </h1>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 hidden print:block">
                বাংলাদেশ বেতার : নির্বাচিত অনুষ্ঠান
            </h1>

            {selectedRows.length === 0 ? (
                <p className="text-center text-gray-600 text-lg">No data selected for printing.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="table-auto border-collapse w-full border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-center">অনুষ্ঠানের নাম</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">শুনতে পাবেন</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">প্রচার সময়</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedRows.map((item, index) => (
                                <tr key={index}>

                                    <td className="border border-gray-300 px-4 py-2">
                                        {item.programDetails?.split(',').map((name, i) => (
                                            <p key={i}>{name.trim()}</p>
                                        ))}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2 text-center">,,</td>
                                    <td className="border border-gray-300 px-4 py-2">{item.broadcastTime || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}


            <div className="flex justify-end space-x-4 mt-6 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Back to Table
                </button>
                {selectedRows.length > 0 && (
                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                    >
                        Print Page
                    </button>
                )}
            </div>
        </div>
    );
};

export default PrintView;
