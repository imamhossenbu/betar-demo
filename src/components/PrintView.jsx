import React from 'react';

// Component for the print view
const PrintView = ({ selectedCeremonies, setCurrentPage }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-3xl print:shadow-none print:rounded-none">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 print:hidden">
                Selected Ceremonies for Print
            </h1>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8 hidden print:block">
                বাংলাদেশ বেতার : নির্বাচিত অনুষ্ঠান
            </h1>

            {selectedCeremonies.length === 0 ? (
                <p className="text-center text-gray-600 text-lg">No ceremonies selected for printing.</p>
            ) : (
                <ul className="list-disc list-inside text-gray-700 text-lg space-y-2 mb-8">
                    {selectedCeremonies.map((ceremony, index) => (
                        <li key={index}>{ceremony}</li>
                    ))}
                </ul>
            )}

            <div className="flex justify-end space-x-4 mt-6 print:hidden">
                <button
                    onClick={() => setCurrentPage('table')}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Back to Table
                </button>
                {selectedCeremonies.length > 0 && (
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
