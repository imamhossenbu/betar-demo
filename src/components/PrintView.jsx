import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// Component for the print view
const PrintView = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const selectedRows = location.state?.selectedRows || [];
    const dayName = location.state?.dayName;
    const engDate = location.state?.engDate;
    const dayShift = location.state?.dayShift;
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full font-kalpurush  max-w-3xl mx-auto print:shadow-none print:rounded-none">

            <div className="mb-8 flex flex-col md:flex-row justify-between items-center print:flex-row print:justify-between print:items-center text-sm">
                {/* Left spacer (only visible in md+) */}
                <div className=" md:block md:w-[30%]  print:w-[30%]">
                    {/* Optional content can go here */}
                    <img className='h-20 w-20' src="/logo.png" alt="logo" />
                </div>

                {/* Center content */}
                <div className="w-full md:w-[40%] print:w-[40%] text-center  md:mb-0">
                    <p className="text-gray-800 leading-5">
                        গণপ্রজাতন্ত্রী বাংলাদেশ সরকার <br />
                        বাংলাদেশ বেতার, বরিশাল
                    </p>
                    <p>{dayShift}</p>
                    <h1 className="text-xl font-semibold mt-2 border-b border-dotted w-[160px] mx-auto">
                        অনুষ্ঠান পরিচিতি
                    </h1>
                </div>

                {/* Right section for date */}
                <div className="w-full md:w-[30%] print:w-[30%] text-center md:text-right print:text-right space-y-1">
                    <h3 className="font-semibold">{dayName}</h3>
                    <h3 className="font-normal">তারিখঃ {engDate} খ্রিষ্টাব্দ</h3>
                </div>
            </div>


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
