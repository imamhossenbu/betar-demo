import React, { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EntryModal from './EntryModal'; // Assuming EntryModal is in the same directory
import { FaEdit, FaRegFileAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAxiosSecure from '../useAxiosSecure'

import {
    getDate,
} from 'bangla-calendar';
import useAdmin from '../hooks/useAdmin';
import Loading from './Loading';
import useAxiosPublic from '../useAxiosPublic';


const TableView = ({ scheduleData, setScheduleData, selectedCeremonies, setSelectedCeremonies }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditIndex, setCurrentEditIndex] = useState(null);
    const [modalInitialData, setModalInitialData] = useState({});
    const [isAdmin, adminLoading] = useAdmin();

    const axiosSecure = useAxiosSecure();
    const axiosPublic = useAxiosPublic();


    // প্রতি রো-এর জন্য CD Cut অনুসন্ধানের লোডিং অবস্থা ট্র্যাক করার জন্য নতুন স্টেট
    const [loadingCdCutIndex, setLoadingCdCutIndex] = useState(null);
    const debounceTimeoutRefs = useRef({}); // প্রতিটি রো-এর জন্য ডিবাউন্স টাইমআউট রেফারেন্স সংরক্ষণ করার জন্য

    // নতুন স্টেট যা প্রদর্শনের জন্য বাংলা সিরিয়াল সহ ডেটা রাখবে
    const [displayedScheduleData, setDisplayedScheduleData] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const { shift: urlShiftKey, dayKey: urlDayKey } = useParams();
    console.log(urlDayKey, 'day');

    const queryParams = new URLSearchParams(location.search);



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
        // Ensure num is treated as a string to handle mixed or non-numeric Bengali characters
        return String(num).split('').map(digit => {
            const index = bengaliNumbers.indexOf(digit);
            return index !== -1 ? englishNumbers[index] : digit;
        }).join('');
    };

    // useEffect to format scheduleData for display when it changes
    // এটি নিশ্চিত করবে যে প্রাথমিক লোড এবং scheduleData prop এর যেকোনো পরিবর্তনের সময় serial গুলো বাংলায় থাকবে।
    useEffect(() => {
        const formattedForDisplay = scheduleData.map(item => {
            // যদি item.serial থাকে এবং এটি একটি স্ট্রিং হয় এবং এটি সংখ্যাসূচক ইংরেজি হয়
            if (item.serial && typeof item.serial === 'string' && /^\d+$/.test(item.serial)) {
                return { ...item, serial: convertToBengaliNumber(item.serial) };
            }
            // যদি এটি ইতিমধ্যেই বাংলা, অথবা খালি, অথবা অ-সংখ্যাসূচক স্ট্রিং হয়, তাহলে যেমন আছে তেমনই রাখুন
            return item;
        });
        setDisplayedScheduleData(formattedForDisplay);
    }, [scheduleData]); // scheduleData prop পরিবর্তিত হলে পুনরায় চালান


    // টেবিল রো-এর মধ্যে CD Cut ইনপুট পরিবর্তন হলে ডেটা লোড করার হ্যান্ডলার
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
                    const response = await axiosSecure.get(`/api/songs/byCdCut/${newCdCut}`);
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
            }, 1000); // 500ms debounce
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


    // Drag and drop শেষ হলে সিরিয়াল এবং orderIndex আপডেট করার হ্যান্ডলার (এবং ডেটাবেসে সংরক্ষণ)
    const handleDragEnd = async (result) => {
        if (!result.destination) return; // যদি ড্রপ করার স্থান না থাকে, তাহলে কিছু করবেন না

        const items = Array.from(scheduleData); // সময়সূচী ডেটার একটি পরিবর্তনযোগ্য কপি তৈরি করুন
        const [reorderedItem] = items.splice(result.source.index, 1); // ড্র্যাগ করা আইটেমটি সরান
        items.splice(result.destination.index, 0, reorderedItem); // নতুন অবস্থানে এটি ঢোকান

        const updatesForBackend = []; // ডেটাবেসে আপডেট করার জন্য আইটেম সংরক্ষণ করবে
        let serialCounter = 1; // শুধুমাত্র যাদের serial আছে তাদের জন্য কাউন্টার

        const newSchedule = items.map((item, newIndex) => {
            // Find the original item from the initial scheduleData to determine if it had a serial
            const originalItem = scheduleData.find(s => s._id === item._id); // Use original scheduleData for comparison

            if (!originalItem) {
                // এটি এমন একটি আইটেম যা originalScheduleData-তে পাওয়া যায়নি।
                // এটি এমন ক্ষেত্রে ঘটতে পারে যেখানে একটি নতুন আইটেম যোগ করা হয়েছে কিন্তু এখনও ডাটাবেসে সেভ করা হয়নি।
                // এই ধরনের আইটেমগুলির জন্য serial বা orderIndex পরিবর্তন করা হবে না।
                return item;
            }

            let serialForDisplay = originalItem.serial; // ডিফল্ট হিসেবে original serial থাকবে
            let serialForBackend = originalItem.serial; // ডিফল্ট হিসেবে original serial থাকবে

            // যদি originalItem-এর serial থাকে (অর্থাৎ খালি নয়), তাহলেই re-index করুন
            // এখানে originalItem.serial-এর .trim() ব্যবহার করা হয়েছে যাতে শুধুমাত্র whitespace-কে empty ধরা হয়।
            if (originalItem.serial && originalItem.serial.trim() !== '') {
                serialForDisplay = convertToBengaliNumber(serialCounter); // নতুন বাংলা সিরিয়াল
                serialForBackend = convertToEnglishNumber(serialCounter); // নতুন ইংরেজি সিরিয়াল
                serialCounter++; // কাউন্টার বৃদ্ধি করুন
            }
            // else { serialForDisplay and serialForBackend remain as original empty strings, which is the desired behavior }

            // orderIndex সবসময় আপডেটেড ক্রম অনুযায়ী সেট হবে, কারণ এটি ভিজ্যুয়াল অর্ডারের জন্য অপরিহার্য।
            const newOrderIndex = newIndex;

            // ডেটাবেসের জন্য আপডেট করা আইটেম
            const updatedItemForBackend = {
                _id: item._id,
                orderIndex: newOrderIndex, // Always update orderIndex for persistence
            };

            // যদি সিরিয়াল পরিবর্তিত হয়, তবে সিরিয়ালও আপডেট payloads এ যোগ করুন
            const originalSerialBackendFormat = originalItem.serial ? convertToEnglishNumber(originalItem.serial) : '';
            if (serialForBackend !== originalSerialBackendFormat) {
                updatedItemForBackend.serial = serialForBackend;
            }

            // যদি orderIndex বা serial পরিবর্তিত হয়, তবেই backend আপডেটের জন্য push করুন
            if (newOrderIndex !== originalItem.orderIndex || (updatedItemForBackend.hasOwnProperty('serial') && updatedItemForBackend.serial !== originalSerialBackendFormat)) {
                updatesForBackend.push(updatedItemForBackend);
            }

            return {
                ...item,
                serial: serialForDisplay, // Local state এর জন্য বাংলা/খালি সিরিয়াল
                orderIndex: newOrderIndex, // Local state এর জন্য নতুন orderIndex
            };
        });

        setScheduleData(newSchedule); // Local state অবিলম্বে আপডেট করুন

        // ডেটাবেসে আপডেট পাঠান
        if (updatesForBackend.length > 0) {
            try {
                const updatePromises = updatesForBackend.map(update => {
                    const { _id, ...fieldsToUpdate } = update; // _id আলাদা করুন
                    return axiosSecure.put(`/api/programs/${_id}`, fieldsToUpdate);
                });
                await Promise.all(updatePromises);
                Swal.fire('Success', 'তালিকার ক্রম সফলভাবে আপডেট হয়েছে!', 'success');
            }
            catch (error) {
                console.error('সিরিয়াল/ক্রম আপডেট করতে ব্যর্থ:', error);
                Swal.fire('Error', 'তালিকার ক্রম আপডেট করতে ব্যর্থ হয়েছে।', 'error');
            }
        }
    };

    const handleDelete = (indexToDelete) => {
        const itemToDelete = displayedScheduleData[indexToDelete]; // Use displayed data for deletion

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
                    // Attempt deletion from backend
                    const deleteRes = await axiosSecure.delete(`/api/programs/${itemToDelete._id}`);
                    if (deleteRes.status === 200 || deleteRes.status === 204) {
                        // Update frontend state
                        const updatedSchedule = scheduleData.filter((_, idx) => idx !== indexToDelete);

                        let serialCounter = 1;
                        const reIndexedSchedule = updatedSchedule.map((item, newIndex) => {
                            if (item.serial && item.serial.trim() !== '') {
                                return {
                                    ...item,
                                    serial: convertToBengaliNumber(serialCounter++),
                                    orderIndex: newIndex,
                                };
                            }
                            return { ...item, orderIndex: newIndex };
                        });

                        setScheduleData(reIndexedSchedule);

                        // Update selectedCeremonies
                        const updatedSelectedCeremonies = selectedCeremonies.filter(
                            (item) => item._id !== itemToDelete._id
                        );
                        setSelectedCeremonies(updatedSelectedCeremonies);

                        Swal.fire('Deleted!', 'The entry has been deleted.', 'success');

                        // Prepare orderIndex updates for backend
                        const updatesForBackendAfterDelete = reIndexedSchedule.map(item => ({
                            _id: item._id,
                            serial: item.serial && item.serial.trim() !== ''
                                ? convertToEnglishNumber(item.serial)
                                : '',
                            orderIndex: item.orderIndex
                        }));

                        // Separate backend update in its own try-catch
                        try {
                            const updatePromises = updatesForBackendAfterDelete
                                .filter(update => update._id) // Ensure _id exists
                                .map(update => {
                                    const { _id, ...fieldsToUpdate } = update;
                                    return axiosSecure.put(`/api/programs/${_id}`, fieldsToUpdate);
                                });

                            if (updatePromises.length > 0) {
                                await Promise.all(updatePromises);
                                // console.log("Backend orderIndexes updated.");
                            }
                        } catch (updateError) {
                            console.error("Order index update failed (but deletion succeeded):", updateError);
                        }
                    } else {
                        throw new Error(`Unexpected delete status: ${deleteRes.status}`);
                    }
                } catch (error) {
                    console.error("Deletion error:", error);
                    Swal.fire('Error!', `Failed to delete entry: ${error.message}`, 'error');
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
            serial: (scheduleData[indexToEdit].serial && String(scheduleData[indexToEdit].serial).trim() !== '')
                ? convertToBengaliNumber(scheduleData[indexToEdit].serial)
                : '' // Keep empty if original was empty
        };
        setModalInitialData(dataForModal);
        setIsModalOpen(true);
    };

    const handleAddNewClick = () => {
        setCurrentEditIndex(null);
        console.log(urlDayKey);



        // Populate initial data for the modal
        const baseData = {
            serial: '', // Default to empty string for new entries
            broadcastTime: '',
            programDetails: '',
            day: urlDayKey,
            shift: banglaShift,
            period: banglaShift, // Initialized with banglaShift
            programType: 'General', // Default program type
            artist: '',
            lyricist: '',
            composer: '',
            cdCut: '',
            duration: '',
            orderIndex: scheduleData.length // New items get the next order index
        };

        setModalInitialData(baseData); // Simply use baseData
        setIsModalOpen(true);
    };

    const handleSaveModalData = async (savedData) => {
        const payload = { ...savedData };

        // Serial conversion to English for backend happens here before API call.
        const bengaliNumericRegex = /^[\u09E৬-\u09EF]+$/;

        // Only convert serial if it's a Bengali numeric string, otherwise keep it as is (including empty)
        if (typeof payload.serial === 'string' && bengaliNumericRegex.test(payload.serial)) {
            payload.serial = convertToEnglishNumber(payload.serial);
        } else {
            // If it's an English number string, or mixed, or empty, keep it as is.
            // Ensure it's explicitly a string even if it was number 0 or undefined.
            payload.serial = String(payload.serial || '');
        }

        if (currentEditIndex !== null) {
            // Update existing program
            try {
                // Ensure orderIndex is maintained when updating
                payload.orderIndex = scheduleData[currentEditIndex].orderIndex;

                await axiosSecure.put(`/api/programs/${scheduleData[currentEditIndex]._id}`, payload);
                const updatedSchedule = [...scheduleData];
                // Local state update: ensure serial is Bengali for display after successful save
                updatedSchedule[currentEditIndex] = {
                    ...updatedSchedule[currentEditIndex],
                    ...payload,
                    // Convert back to Bengali for local display, but only if it's not an empty string
                    serial: (payload.serial === '' ? '' : convertToBengaliNumber(payload.serial))
                };
                setScheduleData(updatedSchedule); // এই আপডেট useEffect কে ট্রিগার করবে
                setIsModalOpen(false);
                Swal.fire('Success', 'Program updated successfully!', 'success');
            } catch (err) {
                console.error('Failed to update program:', err.response?.data || err.message);
                Swal.fire('Error', 'Failed to update program', 'error');
            }
        } else {
            // Add new program
            try {
                payload.day = urlDayKey;
                payload.shift = banglaShift;
                payload.period = payload.period;
                payload.orderIndex = scheduleData.length; // New item gets the last order index

                // Before sending to backend, ensure serial is in correct format (handled by general conversion above)
                if (typeof payload.serial === 'string' && bengaliNumericRegex.test(payload.serial)) {
                    payload.serial = convertToEnglishNumber(payload.serial);
                } else {
                    payload.serial = String(payload.serial || '');
                }

                const res = await axiosSecure.post('/api/programs', payload);
                // After adding, ensure serial is Bengali for local state, as backend might return English
                const newProgram = {
                    ...res.data,
                    // Convert to Bengali for display, but only if it's not an empty string
                    serial: (res.data.serial === '' ? '' : convertToBengaliNumber(res.data.serial))
                };
                setScheduleData(prev => [...prev, newProgram]); // এই আপডেট useEffect কে ট্রিগার করবে
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


    const today = new Date();

    // Don't convert to Bangla before passing into getDate
    const banglaDateObj = getDate(today, {
        format: 'D MMMM, YYYYb',
        calculationMethod: 'BD',
    });

    // Convert the final output to Bangla if needed (optional)
    const banglaDate = banglaDateObj; // already Bangla formatted

    // English date in Bangla numerals
    const toBanglaNumber = (input) =>
        input.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

    const engDate = `${toBanglaNumber(today.getDate())}/${toBanglaNumber(today.getMonth() + 1)}/${toBanglaNumber(today.getFullYear())}`;

    const dayShift = urlShiftKey === 'সকাল' ? 'প্রথম অধিবেশন' : 'দ্বিতীয় অধিবেশন'

    const handleShowReport = (item) => {
        navigate('/report', { state: { ceremony: item } });
    };

    const handleSubmit = () => {
        navigate('/print', { state: { selectedRows: selectedCeremonies, dayName: urlDayKey, engDate: engDate, dayShift: dayShift } });
    };

    const handlePrint = () => {
        window.print();
    }

    if (adminLoading) return <Loading />

    return (
        <div className="bg-white p-2 sm:p-3 w-full font-kalpurush print:font-kalpurush relative  overflow-x-auto print:overflow-visible print:w-auto print:mx-auto print:max-w-none">
            {/* <div className='absolute top-0 mb-20 right-[60%]'>
                <img className='w-20 h-20' src="/logo.png" alt="logo" />
            </div> */}
            <header className="mb-6 w-full">
                <div className="flex flex-col relative md:flex-row justify-between items-center mt-3 text-center md:text-right overflow-x-auto print:overflow-visible">
                    {/* Empty div for spacing on left */}
                    <div className="flex-1 hidden md:block"></div>
                    <div className=' border px-4 py-1'>
                        <h2>কিউশীট</h2>
                    </div>
                    <div className="flex flex-col items-center justify-center text-sm mb-4 md:mb-0 relative w-full md:w-auto">
                        {/* Logo */}
                        <img className="w-20 h-20 mb-2" src="/logo.png" alt="logo" />

                        {/* Text Below Logo */}
                        <div className="text-center leading-5">
                            <p>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                            <p>বাংলাদেশ বেতার, বরিশাল।</p>
                            <p><span className="font-semibold">ওয়েবসাইটঃ</span> www.betar.gov.bd <span className="font-semibold">অ্যাপঃ </span> Bangladesh Betar</p>
                            <p>ফ্রিকোয়েন্সিঃ মধ্যম তরঙ্গ ২৩৩.১০ মিটার অর্থাৎ ১২৮৭ কিলহার্জ এবং এফ.এম. ১০৫.২ মেগাহার্জ</p>
                        </div>
                    </div>
                    <div className='border print:mr-4 px-4 py-1'>
                        <h2>{dayShift}</h2>
                    </div>

                    {/* Dynamic Date/Time/Shift Info on the right */}
                    <div className="flex-1 text-center md:text-right text-sm mt-4 md:mt-0">
                        <p contentEditable suppressContentEditableWarning className="whitespace-nowrap ">{urlDayKey}</p>
                        <p contentEditable suppressContentEditableWarning className=" whitespace-nowrap">{banglaDate} </p>
                        <p contentEditable suppressContentEditableWarning className="whitespace-nowrap">{engDate} খ্রিষ্টাব্দ</p>
                    </div>
                </div>
            </header >

            {/* Officer/Supervisor/Announcer Table */}
            <div className="w-full print:w-full print:min-w-full print:max-w-none overflow-x-auto print:overflow-visible">
                <table className="w-full table-fixed border-collapse border border-gray-700 print:w-full print:min-w-full print:max-w-none">
                    <thead>
                        <tr className="text-sm text-left">
                            <td
                                contentEditable
                                suppressContentEditableWarning
                                className="border border-gray-700 px-2 py-1 w-[25%] whitespace-normal break-words"
                            >
                                অফিসার ইনচার্জঃ হাসনাইন ইমতিয়াজ
                            </td>
                            <td
                                contentEditable
                                suppressContentEditableWarning
                                className="border border-gray-700 px-2 py-1 w-[37.5%] whitespace-normal break-words"
                            >
                                অধিবেশন তত্ত্বাবধায়কঃ মো. মাইনুল ইসলাম/ মো. হাবিবুর রহমান
                            </td>
                            <td
                                contentEditable
                                suppressContentEditableWarning
                                className="border border-gray-700 px-2 py-1 w-[37.5%] whitespace-normal break-words"
                            >
                                ঘোষক/ঘোষিকাঃ শিপ্রা দেউরী/ অমিতা রায়/ মঞ্জুর রাশেদ/ মো. তানভীর হোসেন
                            </td>
                        </tr>
                    </thead>
                </table>
            </div>




            {/* Main Program Table */}
            < div className="print:w-full print:min-w-full print:max-w-none w-full overflow-x-auto" >
                <table border="1" className="w-full table-auto border-collapse border border-gray-700 divide-y divide-gray-200 print:w-full print:min-w-full print:max-w-none">
                    <thead className="bg-gray-50">
                        <tr >
                            <th
                                scope="col"
                                className="py-1 px-2 w-[45px] min-w-[45px] max-w-[45px] text-left text-xs sm:text-sm font-semibold uppercase border border-gray-700 rounded-tl-lg whitespace-nowrap"
                            >
                                ক্রমিক
                            </th>
                            <th colSpan={2}
                                scope="col"
                                className="py-1 px-2 w-[40px] min-w-[40px] max-w-[40px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap"
                            >
                                প্রচার সময়
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-2 w-[240px] min-w-[240px] max-w-[240px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap"
                            >
                                অনুষ্ঠান বিবরণী
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-2 w-[40px] min-w-[40px] max-w-[40px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap"
                            >
                                শিল্পী
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-2 text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap"
                            >
                                গীতিকার
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-2 text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap"
                            >
                                সুরকার
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-2 w-[70px] min-w-[70px] max-w-[70px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap"
                            >
                                আইডি
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-2 w-[40px] min-w-[40px] max-w-[40px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap"
                            >
                                স্থিতি
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-2 w-[45px] min-w-[45px] max-w-[45px] text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap"
                            >
                                প্রচার <br /> মন্তব্য
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-2 w-[45px] min-w-[45px] max-w-[45px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap"
                            >
                                ডি/ও <br /> স্বাক্ষর
                            </th>
                            {isAdmin && (
                                <th
                                    scope="col"
                                    className="py-1 print:hidden px-2 text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider rounded-tr-lg whitespace-nowrap"
                                >
                                    Action
                                </th>
                            )}
                        </tr>
                    </thead>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="schedule">
                            {(provided) => (
                                <tbody ref={provided.innerRef} {...provided.droppableProps} className="bg-white divide-y divide-gray-200">
                                    {displayedScheduleData.map((item, index) => ( // এখানে displayedScheduleData ব্যবহার করা হয়েছে
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
                                                    <td className="py-1 px-2 w-[20px] min-w-[20px] max-w-[20px]  border border-gray-700 text-center whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 break-words">
                                                        {item.serial || ' '}
                                                    </td>
                                                    <td className="py-1 w-[45px] min-w-[45px] max-w-[45px] px-2 border border-gray-700 text-center whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                                                        {item.period || ' '} {/* Displaying Period here */}
                                                    </td>
                                                    <td className="py-1 w-[70px] min-w-[70px] max-w-[70px] px-2 border border-gray-700 text-center whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                        {item.broadcastTime || ' '}
                                                    </td>

                                                    <td className="py-1 px-2 text-xs sm:text-sm border border-gray-700 text-gray-700 w-[240px] min-w-[240px] max-w-[240px] overflow-hidden break-words">
                                                        <label className="flex items-start gap-1 sm:gap-2">
                                                            {isAdmin && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedCeremonies.some(
                                                                        (ceremony) =>
                                                                            ceremony._id === item._id
                                                                    )}
                                                                    onChange={() => handleCheckboxChange(item)}
                                                                    className="mt-0.5 sm:mt-1.5 h-3 w-3 sm:h-4 sm:w-4 text-blue-600 focus:ring-blue-500 border-gray-700 rounded print:hidden"
                                                                />
                                                            )}

                                                            <span className="flex flex-col flex-grow">
                                                                {item.programDetails
                                                                    ? item.programDetails.split(',').map((detail, i) => (
                                                                        <span key={i} className="mb-0.5 leading-tight">{detail.trim()}</span>
                                                                    ))
                                                                    : ' '}
                                                            </span>
                                                        </label>
                                                    </td>

                                                    <td className="py-1 px-2  border border-gray-700 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
                                                        {item.programType === 'Song' ? (item.artist || ' ') : ''}
                                                    </td>
                                                    <td className="py-1 px-2 border border-gray-700 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                        {item.programType === 'Song' ? (item.lyricist || ' ') : ''}
                                                    </td>
                                                    <td className="py-1 px-2 border border-gray-700 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                        {item.programType === 'Song' ? (item.composer || ' ') : ''}
                                                    </td>
                                                    <td className="py-1 px-2 w-[30px] min-w-[30px] max-w-[30px] border border-gray-700 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                        {item.programType === 'Song' ? (
                                                            <>
                                                                <input
                                                                    type="text"
                                                                    value={item.cdCut || ''}
                                                                    onChange={(e) => handleInlineCdCutChange(e, index)}
                                                                    className="w-full h-full focus:ring-blue-500 focus:border-blue-500 text-sm py-1 px-2"
                                                                    placeholder="আইডি"
                                                                />
                                                                {loadingCdCutIndex === index && (
                                                                    <span className="text-blue-500 text-xs">...</span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            ' '
                                                        )}
                                                    </td>
                                                    <td className="py-1 px-2 border border-gray-700 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                        {item.programType === 'Song' ? (item.duration || ' ') : ''}
                                                    </td>

                                                    <td className="py-1 px-2 w-[20px] min-w-[20px] max-w-[20px] border border-gray-700 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                    </td>
                                                    <td className="py-1 px-2 border w-[20px] min-w-[20px] max-w-[20px] border-gray-700 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="py-1 print:hidden px-2 border border-gray-700 whitespace-nowrap text-center text-xs sm:text-sm font-medium">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleEdit(index)}
                                                                className="text-white mr-1 px-1.5 py-1.5 rounded-full bg-black border border-white hover:bg-gray-800 transition-colors text-base sm:text-md"
                                                            >
                                                                <FaEdit />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(index)}
                                                                className="text-red-600 hover:text-red-900 px-1.5 py-1.5 rounded-full border border-red-600 hover:bg-red-50 transition-colors text-base sm:text-md"
                                                            >
                                                                <MdDelete />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleShowReport(item)}
                                                                className="text-blue-600 hover:text-blue-800 px-1.5 py-1.5 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors ml-1 text-base sm:text-md"
                                                            >
                                                                <FaRegFileAlt />
                                                            </button>
                                                        </td>
                                                    )}
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
            </div >

            {isAdmin && (
                <div className="flex print:hidden flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                    <button
                        type="button"
                        onClick={handleAddNewClick}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 sm:px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                    >
                        Add New
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 sm:px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                    >
                        অনুষ্ঠান সূচি
                    </button>
                </div>
            )}

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

            <footer className="flex flex-col sm:flex-row items-center justify-between my-10  text-xs sm:text-sm text-center sm:text-left space-y-4 sm:space-y-0">
                <div className='w-full sm:w-auto text-center'>
                    <p contentEditable suppressContentEditableWarning>মো. ফারুক হাওলাদার</p>
                    <p contentEditable suppressContentEditableWarning>টেপরেকর্ড লাইব্রেরীয়ান</p>
                </div>
                <div className='w-full sm:w-auto text-center'>
                    <p contentEditable suppressContentEditableWarning>হাসনাইন ইমতিয়াজ</p>
                    <p contentEditable suppressContentEditableWarning>সহকারী পরিচালক(অনুষ্ঠান)</p>
                </div>
                <div className='w-full sm:w-auto text-center'>
                    <p contentEditable suppressContentEditableWarning>মো. রফিকুল ইসলাম </p>
                    <p contentEditable suppressContentEditableWarning>উপ-আঞ্চলিক পরিচালক </p>
                    <p contentEditable suppressContentEditableWarning>আঞ্চলিক পরিচালকের পক্ষে </p>
                </div>
            </footer>
            <div className='flex justify-between text-sm mb-10'>
                <div>পরীক্ষিত</div>
                <div>লগ বইয়ে অন্তর্ভূক্ত</div>
                <div>ভারপ্রাপ্ত কর্মকর্তা</div>
                <div>উপ-আঞ্চলিক পরিচালক</div>
                <div>আঞ্চলিক পরিচালক</div>
            </div>
            {isAdmin && (
                <div>
                    <button className='print:hidden px-4 py-1 bg-blue-500 hover:bg-blue-300 border-0 outline-0 text-white rounded-md font-semibold' onClick={handlePrint}>Print Page</button>
                </div>
            )}
        </div >
    );
};

export default TableView;
