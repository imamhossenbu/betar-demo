import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ReportView = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const item = state?.ceremony;

    const handlePrint = () => window.print();

    if (!item) return <p className="text-red-500 text-center">No report data available.</p>;

    return (
        <div className="p-10 max-w-4xl mx-auto bg-white text-[16px] leading-relaxed print:text-black print:shadow-none print:p-0 print:max-w-full print:rounded-none font-kalpurush">
            {/* Header */}
            <div className="text-center mb-4">
                <p contentEditable suppressContentEditableWarning>বাংলাদেশ বেতার, বরিশাল</p>
                <p contentEditable suppressContentEditableWarning>পাঠ প্রতিবেদন</p>
            </div>

            {/* অনুষ্ঠান সূচি */}
            <table className="mb-6 w-full text-[15px]">
                <tbody>
                    <tr>
                        <td className="py-1 w-[220px]"><strong>অনুষ্ঠানের শিরোনামঃ</strong></td>
                        <td contentEditable suppressContentEditableWarning>
                            {item.programTitle || item.programDetails?.split(',')[0]?.trim() || ''}
                        </td>
                    </tr>
                    <tr>
                        <td className="py-1"><strong>প্রচার তারিখঃ</strong></td>
                        <td contentEditable suppressContentEditableWarning>{item.broadcastDate || '১৫-০৬-২০২৫ই.'}</td>
                    </tr>
                    <tr>
                        <td className="py-1"><strong>প্রচার সময়ঃ</strong></td>
                        <td contentEditable suppressContentEditableWarning>{item.broadcastTime || 'বিকেল ০৪.৩০ মিঃ'}</td>
                    </tr>
                    <tr>
                        <td className="py-1"><strong>স্থিতিঃ</strong></td>
                        <td contentEditable suppressContentEditableWarning>{item.duration || '২৫ মিনিট'}</td>
                    </tr>
                    <tr>
                        <td className="py-1"><strong>উপস্থাপক/পরিচালকঃ</strong></td>
                        <td contentEditable suppressContentEditableWarning>{item.presenter || 'মোঃ হুমায়ুন কবির খান'}</td>
                    </tr>
                    <tr>
                        <td className="py-1"><strong>রচনা/ গ্রন্থনাঃ   </strong></td>
                        <td contentEditable suppressContentEditableWarning>{item.technician || 'মোঃ রফিকুল ইসলাম'}</td>
                    </tr>
                    <tr>
                        <td className="py-1"><strong>প্রযোজকঃ</strong></td>
                        <td contentEditable suppressContentEditableWarning>{item.producer || 'হাসনাইন ইমতিয়াজ'}</td>
                    </tr>
                </tbody>
            </table>

            {/* Separator Line */}
            <hr className="border border-dashed border-black my-6" />
            {/* অনুষ্ঠান সূচি Content Block */}
            <div className="mb-6">
                <p className="mb-1 font-bold" contentEditable suppressContentEditableWarning>
                    অনুষ্ঠান সূচিঃ
                </p>
                <div contentEditable suppressContentEditableWarning className="pl-4">
                    {/* উদাহরণ ডেটা, আপনি চাইলে ডাইনামিক করে নিতে পারেন */}
                    <p>ক) পুকুরে চুন প্রয়োগের উপকারিতা — পরিচালক</p>
                    <p>খ) সর্জান পদ্ধতিতে সারা বছর সবজি চাষ — মোঃ আব্দুল আজিজ খান</p>
                    <p>গ) গান — দুই চাকার এই আজিব গাড়ি... শিল্পীঃ সুধীর তালুকদার</p>
                    <p>ঘ) স্বাস্থ্য বিষয়ক টিপস</p>
                </div>
            </div>

            <hr className="border border-dashed border-black my-6" />
            {/* Opening Announcement */}
            <div className="mb-6 text-center">
                <p className="mb-1 font-bold" contentEditable suppressContentEditableWarning>উদ্বোধনী ঘোষণাঃ</p>
                <p contentEditable suppressContentEditableWarning>
                    প্রিয় শ্রোতা, এখন শুনবেন কৃষি বিষয়ক আঞ্চলিক অনুষ্ঠান “{item.programTitle || item.programDetails?.split(',')[0]?.trim() || ''}”<br />
                    গ্রন্থনা ও পরিচালনা করেছেন - {item.presenter || 'মোঃ হুমায়ুন কবির খান'}
                </p>
            </div>
            <hr className="border border-dashed border-black my-6" />
            {/* Closing Announcement */}
            <div className="mb-6 text-center">
                <p className="mb-1 font-bold" contentEditable suppressContentEditableWarning>সমাপ্তি ঘোষণাঃ</p>
                <p contentEditable suppressContentEditableWarning>
                    প্রিয় শ্রোতা, এক্ষণ শুনলেন কৃষি বিষয়ক আঞ্চলিক অনুষ্ঠান “{item.programTitle || item.programDetails?.split(',')[0]?.trim() || ''}”<br />
                    গ্রন্থনা ও পরিচালনা করেছেন - {item.presenter || 'মোঃ হুমায়ুন কবির খান'}<br />
                    সহযোগিতায় - মোঃ ইমরান এবং অনুষ্ঠানটি প্রযোজনা করেছেন - {item.producer || 'হাসনাইন ইমতিয়াজ'}
                </p>
            </div>
            <hr className="border border-dashed border-black my-6" />

            {/* Footer Signatures */}
            <div className="grid grid-cols-3 text-center text-sm mt-20 gap-y-2 print:mt-10">
                <div contentEditable suppressContentEditableWarning>
                    <p>মোঃ ইমরান</p>
                    <p>অনুষ্ঠান সচিব</p>
                    <p>বাংলাদেশ বেতার বরিশাল</p>
                </div>
                <div contentEditable suppressContentEditableWarning>
                    <p>হাসনাইন ইমতিয়াজ</p>
                    <p>সহকারী পরিচালক (অনুষ্ঠান)</p>
                    <p>বাংলাদেশ বেতার বরিশাল</p>
                </div>
                <div contentEditable suppressContentEditableWarning>
                    <p>মোঃ রফিকুল ইসলাম</p>
                    <p>উপ আঞ্চলিক পরিচালক</p>
                    <p>বাংলাদেশ বেতার বরিশাল</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-3 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                    Back
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Print
                </button>
            </div>
        </div>
    );
};

export default ReportView;
