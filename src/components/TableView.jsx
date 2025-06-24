import React, { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EntryModal from './EntryModal'; // Assuming EntryModal is in the same directory
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import axiosPublic from '../axiosPublic'; // আপনার আসল axiosPublic ব্যবহার করা হয়েছে

const TableView = ({ scheduleData, setScheduleData, selectedCeremonies, setSelectedCeremonies }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditIndex, setCurrentEditIndex] = useState(null);
    const [modalInitialData, setModalInitialData] = useState({});

    // প্রতি রো-এর জন্য CD Cut অনুসন্ধানের লোডিং অবস্থা ট্র্যাক করার জন্য নতুন স্টেট
    const [loadingCdCutIndex, setLoadingCdCutIndex] = useState(null);
    const debounceTimeoutRefs = useRef({}); // প্রতিটি রো-এর জন্য ডিবাউন্স টাইমআউট রেফারেন্স সংরক্ষণ করার জন্য

    const navigate = useNavigate();
    const location = useLocation();
    const { shift: urlShiftKey } = useParams();

    const queryParams = new URLSearchParams(location.search);
    const dayName = queryParams.get('dayName') ? decodeURIComponent(queryParams.get('dayName')) : 'দিন';
    const displayDate = queryParams.get('date') ? decodeURIComponent(queryParams.get('date')) : '';

    const formattedBanglaDate = displayDate
        ? `${new Date(displayDate).toLocaleDateString('bn-BD', { day: 'numeric' })} ${new Date(displayDate).toLocaleDateString('bn-BD', { month: 'long' })}, ${new Date(displayDate).getFullYear()} বঙ্গাব্দ`
        : 'তারিখ';

    const banglaShift = urlShiftKey === 'সকাল' ? 'সকাল' : (urlShiftKey === 'বিকাল' ? 'বিকাল' : urlShiftKey);

    // Utility function to convert English numbers to Bengali numbers
    const convertToBengaliNumber = (num) => {
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(num).split('').map(digit => {
            const index = englishNumbers.indexOf(digit);
            return index !== -1 ? bengaliNumbers[index] : digit;
        }).join('');
    };

    // Utility function to convert Bengali numbers to English numbers
    const convertToEnglishNumber = (num) => {
        const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(num).split('').map(digit => {
            const index = bengaliNumbers.indexOf(digit);
            return index !== -1 ? englishNumbers[index] : digit;
        }).join('');
    };


    // নতুন: টেবিল রো-এর মধ্যে CD Cut ইনপুট পরিবর্তন হলে ডেটা লোড করার হ্যান্ডলার
    const handleInlineCdCutChange = (e, index) => {
        const newCdCut = e.target.value;
        setScheduleData(prevSchedule => {
            const updatedSchedule = [...prevSchedule];
            // শুধু cdCut আপডেট করুন, বাকি ফিল্ড API কল থেকে আসবে
            updatedSchedule[index] = { ...updatedSchedule[index], cdCut: newCdCut };
            return updatedSchedule;
        });

        // যদি আগের কোনো ডিবাউন্স টাইমআউট থাকে তা পরিষ্কার করুন
        if (debounceTimeoutRefs.current[index]) {
            clearTimeout(debounceTimeoutRefs.current[index]);
        }

        // যদি CD Cut মান থাকে এবং প্রোগ্রাম টাইপ 'Song' হয় তবে API কল করুন
        if (newCdCut && scheduleData[index]?.programType === 'Song') {
            setLoadingCdCutIndex(index); // এই রো-এর জন্য লোডিং সেট করুন

            debounceTimeoutRefs.current[index] = setTimeout(async () => {
                try {
                    const response = await axiosPublic.get(`/api/songs/byCdCut/${newCdCut}`);
                    if (response.data) {
                        setScheduleData(prevSchedule => {
                            const updatedSchedule = [...prevSchedule];
                            updatedSchedule[index] = {
                                ...updatedSchedule[index],
                                programDetails: response.data.programDetails || '',
                                artist: response.data.artist || '',
                                lyricist: response.data.lyricist || '',
                                composer: response.data.composer || '',
                                duration: response.data.duration || '',
                                programType: response.data.programType || 'Song', // নিশ্চিত করুন যে এটি 'Song'
                            };
                            return updatedSchedule;
                        });
                        Swal.fire('Success', `CD Cut ${newCdCut} এর ডেটা লোড হয়েছে!`, 'success');
                    } else {
                        Swal.fire('Info', `CD Cut ${newCdCut} এর জন্য কোনো ডেটা পাওয়া যায়নি।`, 'info');
                        // যদি ডেটা না পাওয়া যায় তাহলে গান-নির্দিষ্ট ফিল্ডগুলি পরিষ্কার করুন
                        setScheduleData(prevSchedule => {
                            const updatedSchedule = [...prevSchedule];
                            updatedSchedule[index] = {
                                ...updatedSchedule[index],
                                programDetails: '',
                                artist: '',
                                lyricist: '',
                                composer: '',
                                duration: '',
                                programType: 'General', // ডেটা না পাওয়া গেলে General এ সেট করুন
                            };
                            return updatedSchedule;
                        });
                    }
                } catch (error) {
                    console.error("সিডি কাটের ডেটা আনতে ব্যর্থ:", error);
                    Swal.fire('Error', 'সিডি কাটের ডেটা আনতে ব্যর্থ হয়েছে।', 'error');
                } finally {
                    setLoadingCdCutIndex(null); // লোডিং শেষ
                }
            }, 500); // 500ms debounce
        } else {
            // যদি ইনপুট খালি হয় বা প্রোগ্রাম টাইপ Song না হয়, তাহলে লোডিং বন্ধ করুন
            setLoadingCdCutIndex(null);
            // যদি CD Cut খালি করা হয়, তবে গান-নির্দিষ্ট ফিল্ডগুলি পরিষ্কার করুন
            if (!newCdCut) {
                setScheduleData(prevSchedule => {
                    const updatedSchedule = [...prevSchedule];
                    updatedSchedule[index] = {
                        ...updatedSchedule[index],
                        programDetails: '',
                        artist: '',
                        lyricist: '',
                        composer: '',
                        duration: '',
                    };
                    return updatedSchedule;
                });
            }
        }
    };


    // No useEffect for fetching data here, as Navbar now fetches and sets scheduleData directly.

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(scheduleData);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({
            ...item,
            serial: convertToBengaliNumber(index + 1), // Convert to Bengali number after reorder
        }));

        setScheduleData(updatedItems);
        // TODO: Optionally send update to server to save new order
        // If sending to backend, convert to English if backend expects numbers, or ensure backend stores Bengali string
    };

    const handleDelete = (indexToDelete) => {
        const itemToDelete = scheduleData[indexToDelete];
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axiosPublic.delete(`/api/programs/${itemToDelete._id}`);
                    const updatedSchedule = scheduleData.filter((_, idx) => idx !== indexToDelete);
                    // Re-index serials after deletion to maintain order
                    const reIndexedSchedule = updatedSchedule.map((item, idx) => ({
                        ...item,
                        serial: convertToBengaliNumber(idx + 1)
                    }));
                    setScheduleData(reIndexedSchedule);

                    const updatedSelectedCeremonies = selectedCeremonies.filter(
                        (item) => item._id !== itemToDelete._id
                    );
                    setSelectedCeremonies(updatedSelectedCeremonies);

                    Swal.fire('Deleted!', 'The entry has been deleted.', 'success');
                } catch (error) {
                    Swal.fire('Error!', 'Failed to delete entry.', 'error');
                }
            }
        });
    };

    const handleEdit = (indexToEdit) => {
        setCurrentEditIndex(indexToEdit);
        // Ensure modalInitialData has Bengali serial if original data had English
        const dataForModal = {
            ...scheduleData[indexToEdit],
            // Convert existing serial from potentially English to Bengali for display in modal
            serial: convertToBengaliNumber(scheduleData[indexToEdit].serial)
        };
        setModalInitialData(dataForModal);
        setIsModalOpen(true);
    };

    const handleAddNewClick = () => {
        setCurrentEditIndex(null);
        // Populate initial data for the modal
        const baseData = {
            serial: convertToBengaliNumber(scheduleData.length + 1), // Initialize with Bengali number
            broadcastTime: '',
            programDetails: '',
            day: dayName,
            date: displayDate,
            shift: banglaShift,
            period: banglaShift, // Initialized with banglaShift
            programType: 'General', // Default program type
            artist: '',
            lyricist: '',
            composer: '',
            cdCut: '',
            duration: '',
        };

        setModalInitialData(baseData); // Simply use baseData, no merging with searchedSongData here
        setIsModalOpen(true);
    };

    const handleSaveModalData = async (savedData) => {
        const payload = { ...savedData };

        // EntryModal is now responsible for converting the serial to English if needed.
        // It's also responsible for clearing song-specific fields if programType becomes General.

        if (currentEditIndex !== null) {
            // Update existing program
            try {
                // Before sending to backend, convert serial from Bengali to English if it's numeric Bengali
                const englishNumericRegex = /^\d+$/; // Matches only English digits
                const bengaliNumericRegex = /^[\u09E৬-\u09EF]+$/; // Matches only Bengali digits

                if (bengaliNumericRegex.test(payload.serial)) {
                    payload.serial = convertToEnglishNumber(payload.serial);
                } else if (englishNumericRegex.test(payload.serial)) {
                    payload.serial = payload.serial; // Already English, keep as is
                } else {
                    payload.serial = String(payload.serial); // Ensure it's a string
                }


                await axiosPublic.put(`/api/programs/${scheduleData[currentEditIndex]._id}`, payload);
                const updatedSchedule = [...scheduleData];
                updatedSchedule[currentEditIndex] = { ...updatedSchedule[currentEditIndex], ...payload };
                setScheduleData(updatedSchedule);
                setIsModalOpen(false);
                Swal.fire('Success', 'Program updated successfully!', 'success');
            } catch (err) {
                console.error('Failed to update program:', err.response?.data || err.message);
                Swal.fire('Error', 'Failed to update program', 'error');
            }
        } else {
            // Add new program
            try {
                payload.day = dayName;
                payload.date = displayDate;
                payload.shift = banglaShift;
                payload.period = payload.period; // Period comes from savedData (now visible in modal)

                // Before sending to backend, convert serial from Bengali to English if it's numeric Bengali
                const englishNumericRegex = /^\d+$/; // Matches only English digits
                const bengaliNumericRegex = /^[\u09E৬-\u09EF]+$/; // Matches only Bengali digits

                if (bengaliNumericRegex.test(payload.serial)) {
                    payload.serial = convertToEnglishNumber(payload.serial);
                } else if (englishNumericRegex.test(payload.serial)) {
                    payload.serial = payload.serial; // Already English, keep as is
                } else {
                    payload.serial = String(payload.serial); // Ensure it's a string
                }

                const res = await axiosPublic.post('/api/programs', payload);
                // After adding, ensure serial is Bengali for local state, as backend might return English
                const newProgram = { ...res.data, serial: convertToBengaliNumber(res.data.serial) };
                setScheduleData(prev => [...prev, newProgram]);
                setIsModalOpen(false);
                Swal.fire('Success', 'Program added successfully!', 'success');
            } catch (err) {
                console.error('Failed to add program:', err.response?.data || err.message);
                Swal.fire('Error', 'Failed to add program', 'error');
            }
        }
    };

    const handleCheckboxChange = (item) => {
        setSelectedCeremonies(prevSelected => {
            const exists = prevSelected.find((c) => c._id === item._id);
            if (exists) {
                return prevSelected.filter((c) => c._id !== item._id);
            } else {
                return [...prevSelected, item];
            }
        });
    };

    const handleShowReport = (item) => {
        navigate('/report', { state: { ceremony: item } });
    };

    const handleSubmit = () => {
        navigate('/print', { state: { selectedRows: selectedCeremonies } });
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-4 sm:p-6 w-full mx-auto font-[kalpurush] max-w-full lg:max-w-[1800px]">
            <header className="mb-6">
                <div className="flex flex-col md:flex-row justify-between items-center mt-6 md:mt-12 text-center md:text-left">
                    {/* Empty div for spacing on left */}
                    <div className="flex-1 hidden md:block"></div>

                    {/* Central Government/Radio Info */}
                    <div className="flex-none w-full md:w-auto text-sm mb-4 md:mb-0">
                        <p>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                        <p>বাংলাদেশ বেতার, বরিশাল।</p>
                        <p><span className="font-semibold">ওয়েবসাইটঃ</span> www.betar.gov.bd <span className="font-semibold">এপঃ</span> Bangladesh Betar</p>
                        <p className="border-b border-b-black pb-1">ফ্রিকোয়েন্সিঃ মধ্যম তরঙ্গ ২৩৩.১০ মিটার অর্থাৎ ১২৮৭ কিলহার্জ এবং এফ.এম. ১০৫.২ মেগাহার্জ</p>
                    </div>

                    {/* Dynamic Date/Time/Shift Info on the right */}
                    <div className="flex-1 text-right text-sm mt-4 md:mt-0">
                        <p className="whitespace-nowrap">{dayName}</p>
                        <p className="border-b border-b-black pb-1 whitespace-nowrap">{formattedBanglaDate} </p>
                        <p className="whitespace-nowrap">{displayDate} খ্রিষ্টাব্দ ({banglaShift} অধিবেশন)</p>
                    </div>
                </div>
            </header>

            {/* Officer/Supervisor/Announcer Table */}
            <div className="overflow-x-auto mb-4">
                <table className="min-w-full md:min-w-0 border-collapse border border-black mx-auto text-sm">
                    <thead>
                        <tr>
                            <td className="border border-black px-2 py-1 whitespace-nowrap">অফিসার ইনচার্জঃ হাসনাইন ইমতিয়াজ </td>
                            <td className="border border-black px-2 py-1 whitespace-nowrap">অধিবেশন তত্ত্বাবধায়কঃ মো. মাইনুল ইসলাম/ মো. হাবিবুর রহমান </td>
                            <td className="border border-black px-2 py-1 whitespace-nowrap">ঘোষক/ঘোষিকাঃ শিপ্রা দেউরী/ অমিতা রায়/ মঞ্জুর রাশেদ/ মো. তানভীর হোসেন</td>
                        </tr>
                    </thead>
                </table>
            </div>

            {/* Main Program Table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
                <table border="1" className="min-w-[1200px] lg:min-w-[1500px] divide-y table-auto w-full divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="py-3 px-2 text-left text-xs sm:text-sm font-semibold uppercase border border-gray-300 rounded-tl-lg whitespace-nowrap"
                            >
                                ক্রমিক
                            </th>
                            <th colSpan={2}
                                scope="col"
                                className="py-3 px-2 text-left text-xs sm:text-sm font-semibold uppercase border border-gray-300 tracking-wider whitespace-nowrap"
                            >
                                প্রচার সময়
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-2 w-[180px] sm:w-[200px] text-left text-xs sm:text-sm font-semibold uppercase border border-gray-300 tracking-wider whitespace-nowrap"
                            >
                                অনুষ্ঠান বিবরণী
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-2 text-left text-xs sm:text-sm font-semibold uppercase border border-gray-300 tracking-wider whitespace-nowrap"
                            >
                                শিল্পী
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-2 text-left text-xs sm:text-sm font-semibold uppercase border border-gray-300 tracking-wider whitespace-nowrap"
                            >
                                গীতিকার
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-2 text-left text-xs sm:text-sm font-semibold uppercase border border-gray-300 tracking-wider whitespace-nowrap"
                            >
                                সুরকার
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-2 text-left text-xs sm:text-sm font-semibold uppercase border border-gray-300 tracking-wider whitespace-nowrap"
                            >
                                সিডি ও কাট
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-2 text-left text-xs sm:text-sm font-semibold uppercase border border-gray-300 tracking-wider whitespace-nowrap"
                            >
                                স্থিতি
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-2 text-left text-xs sm:text-sm font-semibold uppercase border border-gray-300 tracking-wider whitespace-nowrap"
                            >
                                প্রচার মন্তব্য
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-2 text-left text-xs sm:text-sm font-semibold uppercase border border-gray-300 tracking-wider whitespace-nowrap"
                            >
                                ডি/ও স্বাক্ষর
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-2 text-center text-xs sm:text-sm font-semibold uppercase border border-gray-300 tracking-wider rounded-tr-lg whitespace-nowrap"
                            >
                                Action
                            </th>
                        </tr>
                    </thead>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="schedule">
                            {(provided) => (
                                <tbody ref={provided.innerRef} {...provided.droppableProps} className="bg-white divide-y divide-gray-200">
                                    {scheduleData.map((item, index) => (
                                        <Draggable key={item._id || `program-${index}`} draggableId={item._id || `program-${index}`} index={index}>
                                            {(provided) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    key={item._id || `program-${index}`}
                                                    className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                                        } hover:bg-gray-100 transition-colors duration-200`}
                                                >
                                                    <td className="py-3 px-2 border border-gray-300 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                                                        {item.serial || ' '}
                                                    </td>
                                                    <td className="py-3 px-2 border border-gray-300 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                                                        {item.period || ' '} {/* Displaying Period here */}
                                                    </td>
                                                    <td className="py-3 px-2 border border-gray-300 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                        {item.broadcastTime || ' '}
                                                    </td>

                                                    <td className="py-3 px-2 w-[180px] sm:w-[280px] text-xs sm:text-sm border border-gray-300 text-gray-700">
                                                        <label className="flex items-start gap-1 sm:gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCeremonies.some(
                                                                    (ceremony) =>
                                                                        ceremony._id === item._id
                                                                )}
                                                                onChange={() => handleCheckboxChange(item)}
                                                                className="mt-0.5 sm:mt-1.5 h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />

                                                            <span className="flex flex-col flex-grow">
                                                                {item.programDetails
                                                                    ? item.programDetails.split(',').map((detail, i) => (
                                                                        <span key={i} className="mb-0.5 leading-tight">{detail.trim()}</span>
                                                                    ))
                                                                    : ' '}
                                                            </span>
                                                        </label>
                                                    </td>

                                                    <td className="py-3 px-2 border border-gray-300 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                                                        {item.programType === 'Song' ? (item.artist || ' ') : ''}
                                                    </td>
                                                    <td className="py-3 px-2 border border-gray-300 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                        {item.programType === 'Song' ? (item.lyricist || ' ') : ''}
                                                    </td>
                                                    <td className="py-3 px-2 border border-gray-300 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                        {item.programType === 'Song' ? (item.composer || ' ') : ''}
                                                    </td>
                                                    <td className="py-3 px-2 border border-gray-300 whitespace-nowrap text-xs sm:text-sm text-gray-700 flex items-center gap-2">
                                                        {item.programType === 'Song' ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={item.cdCut || ''}
                                                                    onChange={(e) => handleInlineCdCutChange(e, index)}
                                                                    className="w-full bg-white border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm py-1 px-2"
                                                                    placeholder="CD Cut"
                                                                />
                                                                {loadingCdCutIndex === index && (
                                                                    <span className="text-blue-500 text-xs">...</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            ' '
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 border border-gray-300 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                        {item.programType === 'Song' ? (item.duration || ' ') : ''}
                                                    </td>

                                                    <td className="py-3 px-2 border border-gray-300 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                    </td>
                                                    <td className="py-3 px-2 border border-gray-300 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                    </td>
                                                    <td className="py-3 px-2 border border-gray-300 whitespace-nowrap text-center text-xs sm:text-sm font-medium">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEdit(index)}
                                                            className="text-white mr-1 px-1.5 py-1.5 rounded-full bg-black border border-white hover:bg-gray-800 transition-colors text-base sm:text-xl"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(index)}
                                                            className="text-red-600 hover:text-red-900 px-1.5 py-1.5 rounded-full border border-red-600 hover:bg-red-50 transition-colors text-base sm:text-xl"
                                                        >
                                                            <MdDelete />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleShowReport(item)}
                                                            className="text-blue-600 hover:text-blue-800 px-1.5 py-0.5 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors ml-1 text-xs sm:text-sm"
                                                        >
                                                            Report
                                                        </button>
                                                    </td>
                                                </tr>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </tbody>
                            )}
                        </Droppable>
                    </DragDropContext>
                </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                <button
                    type="button"
                    onClick={handleAddNewClick}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 sm:px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                    Add New
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 sm:px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                    Submit
                </button>
            </div>

            {/* Entry Modal for both Add and Edit */}
            <EntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={modalInitialData}
                onSave={handleSaveModalData}
                title={currentEditIndex !== null ? 'Edit Entry' : 'Add New Entry'}
                // Pass the program type of the item being edited for correct modal behavior
                currentProgramType={currentEditIndex !== null ? scheduleData[currentEditIndex].programType : 'General'}
            />

            <footer className='flex flex-col sm:flex-row items-center justify-between my-10 sm:my-28 text-xs sm:text-sm text-center sm:text-left space-y-4 sm:space-y-0'>
                <div className='w-full sm:w-auto'>
                    <p>মো. ফারুক হাওলাদার</p>
                    <p>টেপরেকর্ড লাইব্রেরীয়ান</p>
                </div>
                <div className='w-full sm:w-auto'>
                    <p>হাসনাইন ইমতিয়াজ</p>
                    <p>সহকারী পরিচালক(অনুষ্ঠান)</p>
                </div>
                <div className='w-full sm:w-auto'>
                    <p>মো. রফিকুল ইসলাম </p>
                    <p>উপ-আঞ্চলিক পরিচালক </p>
                    <p>আঞ্চলিক পরিচালকের পক্ষে </p>
                </div>
            </footer>
        </div>
    );
};

export default TableView;
