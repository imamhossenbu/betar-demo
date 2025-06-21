import { useLocation, useNavigate } from 'react-router-dom';

const SelectedRowsView = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const selectedRows = state?.selectedRows || [];

    const handlePrint = () => {
        window.print();
    }

    return (
        <div className="p-6">
            <header>
                <div className="flex justify-between items-center mt-12">
                    <div></div>
                    <div className="text-center text-sm">
                        <p>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                        <p>বাংলাদেশ বেতার, বরিশাল।</p>
                        <p><span className="font-semibold">ওয়েবসাইটঃ</span> www.betar.gov.bd <span className="font-semibold">এপঃ</span> Bangladesh Betar</p>
                        <p className="border-b border-b-black">ফ্রিকোয়েন্সিঃ মধ্যম তরঙ্গ ২৩৩.১০ মিটার অর্থাৎ ১২৮৭ কিলহার্জ এবং এফ.এম. ১০৫.২ মেগাহার্জ</p>
                    </div>
                    <div className="text-left text-sm ">
                        <p
                            contentEditable
                            suppressContentEditableWarning
                            className="outline-none border border-dashed border-gray-400 px-1 hover:border-black"
                        >
                            সোমবার
                        </p>
                        <p
                            contentEditable
                            suppressContentEditableWarning
                            className="border-b border-b-black outline-none border-dashed border-gray-400 px-1 hover:border-black"
                        >
                            ২৫ ফাল্গুন, ১৪৩১ বঙ্গাব্দ
                        </p>
                        <p
                            contentEditable
                            suppressContentEditableWarning
                            className="outline-none border-dashed border-gray-400 px-1 hover:border-black"
                        >
                            ১০/০৩/২০২৫ খ্রিষ্টাব্দ
                        </p>
                    </div>

                </div>
            </header>
            <table className=" mt-4 border-collapse border border-black mx-auto">
                <tr className="border border-black text-sm">
                    <td className="border border-black px-2">অফিসার ইনচার্জঃ হাসনাইন ইমতিয়াজ </td>
                    <td className="border border-black px-2">অধিবেশন তত্ত্বাবধায়কঃ মো. মাইনুল ইসলাম/ মো. হাবিবুর রহমান </td>
                    <td className="border border-black px-2">ঘোষক/ঘোষিকাঃ শিপ্রা দেউরী/ অমিতা রায়/ মঞ্জুর রাশেদ/ মো. তানভীর হোসেন</td>
                </tr>
            </table>

            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
                <table border="1" className="min-w-[1440px] divide-y table-auto w-full divide-gray-200">
                    <thead className="">
                        <tr>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold uppercase border border-gray-300  rounded-tl-lg"
                            >
                                ক্রমিক
                            </th>
                            <th colSpan={2}
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold border border-gray-300 uppercase tracking-wider"
                            >
                                প্রচার সময়
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-4 w-[200px] text-left text-sm font-semibold uppercase border border-gray-300 tracking-wider"
                            >
                                অনুষ্ঠান বিবরণী
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold uppercase border border-gray-300 tracking-wider"
                            >
                                শিল্পী
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold uppercase border border-gray-300 tracking-wider"
                            >
                                গীতিকার
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold uppercase border border-gray-300 tracking-wider"
                            >
                                সুরকার
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold uppercase border border-gray-300 tracking-wider"
                            >
                                সিডি ও কাট
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold uppercase border border-gray-300 tracking-wider"
                            >
                                স্থিতি
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold uppercase border border-gray-300 tracking-wider"
                            >
                                প্রচার মন্তব্য
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold uppercase border border-gray-300 tracking-wider"
                            >
                                ডি/ও স্বাক্ষর
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRows.map((item, index) => (
                            <tr
                                key={index}
                                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                    } hover:bg-gray-100 transition-colors duration-200`}
                            >
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.serial || ' '}
                                </td>
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.shift || ' '}
                                </td>
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm text-gray-700">
                                    {item.broadcastTime || ' '}
                                </td>

                                <td className="py-3 px-4 w-[240px] sm:w-[280px] text-sm border border-gray-300 text-gray-700">
                                    <label className="flex items-start gap-2">

                                        <span className="flex flex-col">
                                            {item.programDetails
                                                ? item.programDetails.split(',').map((detail, i) => (
                                                    <span key={i} className="mb-0.5 leading-snug">{detail.trim()}</span>
                                                ))
                                                : ' '}
                                        </span>
                                    </label>
                                </td>


                                <td className="py-3 px-4  border border-gray-300 text-sm text-gray-700">
                                    {/* Display artist names one by one line */}
                                    {item.artist
                                        || ' '}
                                </td>
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm text-gray-700">
                                    {item.lyricist || ' '}
                                </td>
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm text-gray-700">
                                    {item.composer || ' '}
                                </td>
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm text-gray-700">
                                    {item.cdCut || ' '}
                                </td>
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm text-gray-700">
                                    {item.duration || ' '}
                                </td>
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm text-gray-700">

                                </td>
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm text-gray-700">

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className='flex items-center justify-between my-28 text-sm'>
                <div className='text-center'>
                    <p>মো. ফারুক হাওলাদার</p>
                    <p>টেপরেকর্ড লাইব্রেরীয়ান</p>
                </div>
                <div className='text-center'>
                    <p>হাসনাইন ইমতিয়াজ</p>
                    <p>সহকারী পরিচালক(অনুষ্ঠান)</p>
                </div>
                <div className='text-center'>
                    <p>মো. রফিকুল ইসলাম </p>
                    <p>উপ-আঞ্চলিক পরিচালক </p>
                    <p>আঞ্চলিক পরিচালকের পক্ষে </p>
                </div>
            </footer>
            <div className="flex gap-4 mt-4 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                    Back
                </button>
                <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-gray-600 text-white rounded"
                >
                    Print
                </button>
            </div>

        </div>
    );
};

export default SelectedRowsView;
