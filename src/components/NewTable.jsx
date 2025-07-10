import React, { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EntryModal from './EntryModal';
import { FaEdit, FaRegFileAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAxiosSecure from '../useAxiosSecure';
import { getDate } from 'bangla-calendar';
import useAdmin from '../hooks/useAdmin';
import Loading from './Loading';
import useAxiosPublic from '../useAxiosPublic';


// NewTable component now accepts a 'scheduleType' prop
const NewTable = ({ scheduleData, setScheduleData, selectedCeremonies, setSelectedCeremonies, scheduleType }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditIndex, setCurrentEditIndex] = useState(null);
    const [modalInitialData, setModalInitialData] = useState({});
    const [isAdmin, adminLoading] = useAdmin();

    const axiosSecure = useAxiosSecure();
    const axiosPublic = useAxiosPublic();

    const [loadingCdCutIndex, setLoadingCdCutIndex] = useState(null);
    const debounceTimeoutRefs = useRef({});

    const [displayedScheduleData, setDisplayedScheduleData] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const { shift: urlShiftKey, dayKey: urlDayKey } = useParams();

    // Determine if it's a special schedule based on the scheduleType prop
    const isSpecialSchedule = scheduleType === 'special';

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

    // useEffect to format scheduleData for display when it changes
    useEffect(() => {
        const formattedForDisplay = scheduleData.map(item => {
            const newItem = { ...item };

            // Convert serial to Bengali for display
            if (newItem.serial && typeof newItem.serial === 'string' && /^\d+$/.test(newItem.serial)) {
                newItem.serial = convertToBengaliNumber(newItem.serial);
            }

            // IMPORTANT: Only clear song details for initial display if it's from 'addSpecialSongPage'
            // AND the cdCut is currently empty. This prevents clearing data after a successful lookup.
            if (newItem.programType === 'Song' && newItem.source === 'addSpecialSongPage' && !newItem.cdCut) {
                newItem.programDetails = '';
                newItem.artist = '';
                newItem.lyricist = '';
                newItem.composer = '';
                newItem.duration = '';
            }
            return newItem;
        });
        setDisplayedScheduleData(formattedForDisplay);
    }, [scheduleData]);


    // Handle CD Cut input change and fetch song data
    const handleInlineCdCutChange = (e, index) => {
        const newCdCut = e.target.value;
        const currentItem = scheduleData[index]; // Get the item from the original scheduleData

        // Update the schedule data immediately with the new CD Cut value
        setScheduleData(prevSchedule => {
            const updatedSchedule = [...prevSchedule];
            updatedSchedule[index] = { ...updatedSchedule[index], cdCut: newCdCut };
            return updatedSchedule;
        });

        if (debounceTimeoutRefs.current[index]) {
            clearTimeout(debounceTimeoutRefs.current[index]);
        }

        // Now, trigger API call if it's a Song program type AND a newCdCut value is present,
        // regardless of the source.
        if (newCdCut && currentItem?.programType === 'Song') { // Source check removed here
            setLoadingCdCutIndex(index);
            debounceTimeoutRefs.current[index] = setTimeout(async () => {
                try {
                    const response = await axiosSecure.get(`/api/specialSongs/byCdCut/${newCdCut}`);
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
                                programType: response.data.programType || 'Song',
                                // Do NOT update 'source' here, it remains as is
                            };
                            return updatedSchedule;
                        });
                        Swal.fire('Success', `CD Cut ${newCdCut} এর ডেটা লোড হয়েছে!`, 'success');
                    } else {
                        Swal.fire('Info', `CD Cut ${newCdCut} এর জন্য কোনো ডেটা পাওয়া যায়নি।`, 'info');
                        setScheduleData(prevSchedule => {
                            const updatedSchedule = [...prevSchedule];
                            updatedSchedule[index] = {
                                ...updatedSchedule[index],
                                programDetails: '',
                                artist: '',
                                lyricist: '',
                                composer: '',
                                duration: '',
                                // Keep programType as Song if it was originally Song
                            };
                            return updatedSchedule;
                        });
                    }
                } catch (error) {
                    console.error("সিডি কাটের ডেটা আনতে ব্যর্থ:", error);
                    Swal.fire('Error', 'সিডি কাটের ডেটা আনতে ব্যর্থ হয়েছে।', 'error');
                } finally {
                    setLoadingCdCutIndex(null);
                }
            }, 1000);
        } else if (!newCdCut && currentItem?.programType === 'Song') {
            // If CD Cut is cleared for any Song program, also clear associated song details
            setLoadingCdCutIndex(null);
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
        } else {
            setLoadingCdCutIndex(null);
        }
    };


    // Handles drag and drop to reorder items and updates backend
    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(scheduleData);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatesForBackend = [];
        let serialCounter = 1;

        const newSchedule = items.map((item, newIndex) => {
            const originalItem = scheduleData.find(s => s._id === item._id);

            if (!originalItem) {
                return item;
            }

            let serialForDisplay = originalItem.serial;
            let serialForBackend = originalItem.serial;

            if (originalItem.serial && originalItem.serial.trim() !== '') {
                serialForDisplay = convertToBengaliNumber(serialCounter);
                serialForBackend = convertToEnglishNumber(serialCounter);
                serialCounter++;
            }

            const newOrderIndex = newIndex;

            const updatedItemForBackend = {
                _id: item._id,
                orderIndex: newOrderIndex,
                type: scheduleType, // Pass the schedule type to the backend
            };

            const originalSerialBackendFormat = originalItem.serial ? convertToEnglishNumber(originalItem.serial) : '';
            if (serialForBackend !== originalSerialBackendFormat) {
                updatedItemForBackend.serial = serialForBackend;
            }

            if (newOrderIndex !== originalItem.orderIndex || (updatedItemForBackend.hasOwnProperty('serial') && updatedItemForBackend.serial !== originalSerialBackendFormat)) {
                updatesForBackend.push(updatedItemForBackend);
            }

            return {
                ...item,
                serial: serialForDisplay,
                orderIndex: newOrderIndex,
            };
        });

        setScheduleData(newSchedule);

        if (updatesForBackend.length > 0) {
            try {
                const updatePromises = updatesForBackend.map(update => {
                    const { _id, ...fieldsToUpdate } = update;
                    // CORRECTED API ENDPOINT: Use /api/special/:id for PUT requests
                    return axiosSecure.put(`/api/special/${_id}`, fieldsToUpdate);
                });
                await Promise.all(updatePromises);
                Swal.fire('Success', 'তালিকার ক্রম সফলভাবে আপডেট হয়েছে!', 'success');
            } catch (error) {
                console.error('সিরিয়াল/ক্রম আপডেট করতে ব্যর্থ:', error);
                Swal.fire('Error', 'তালিকার ক্রম আপডেট করতে ব্যর্থ হয়েছে।', 'error');
            }
        }
    };

    // Handles deletion of an item and updates backend
    const handleDelete = async (indexToDelete) => {
        const itemToDelete = displayedScheduleData[indexToDelete];
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
                    // CORRECTED API ENDPOINT: Use /api/special/:id for DELETE requests
                    await axiosSecure.delete(`/api/special/${itemToDelete._id}?type=${scheduleType}`);
                    const updatedSchedule = scheduleData.filter((_, idx) => idx !== indexToDelete);

                    let serialCounter = 1;
                    const reIndexedSchedule = updatedSchedule.map((item, newIndex) => {
                        if (item.serial && item.serial.trim() !== '') {
                            return {
                                ...item,
                                serial: convertToBengaliNumber(serialCounter++),
                                orderIndex: newIndex
                            };
                        }
                        return { ...item, orderIndex: newIndex };
                    });
                    setScheduleData(reIndexedSchedule);

                    // Ensure selectedCeremonies is an array before filtering
                    const updatedSelectedCeremonies = Array.isArray(selectedCeremonies)
                        ? selectedCeremonies.filter((item) => item._id !== itemToDelete._id)
                        : []; // Initialize as empty array if not already an array
                    setSelectedCeremonies(updatedSelectedCeremonies);

                    Swal.fire('Deleted!', 'The entry has been deleted.', 'success');

                    const updatesForBackendAfterDelete = reIndexedSchedule.map(item => ({
                        _id: item._id,
                        serial: (item.serial && item.serial.trim() !== '') ? convertToEnglishNumber(item.serial) : '',
                        orderIndex: item.orderIndex,
                        type: scheduleType, // Include scheduleType for re-indexing updates
                    }));

                    if (updatesForBackendAfterDelete.length > 0) {
                        try {
                            const updatePromises = updatesForBackendAfterDelete.map(update => {
                                const { _id, ...fieldsToUpdate } = update;
                                // CORRECTED API ENDPOINT: Use /api/special/:id for PUT requests
                                return axiosSecure.put(`/api/special/${_id}`, fieldsToUpdate);
                            });
                            await Promise.all(updatePromises);
                        } catch (updateError) {
                            console.error("Failed to update backend orderIndexes after deletion:", updateError);
                        }
                    }

                } catch (error) {
                    // This catch block will now correctly fire if the DELETE operation itself fails.
                    console.error('Error deleting entry:', error.response?.data || error.message);
                    Swal.fire('Error!', 'Failed to delete entry.', 'error');
                }
            }
        });
    };

    // Opens the modal for editing an existing item
    const handleEdit = (indexToEdit) => {
        setCurrentEditIndex(indexToEdit);
        const dataForModal = {
            ...scheduleData[indexToEdit],
            serial: (scheduleData[indexToEdit].serial && String(scheduleData[indexToEdit].serial).trim() !== '')
                ? convertToBengaliNumber(scheduleData[indexToEdit].serial)
                : ''
        };
        setModalInitialData(dataForModal);
        setIsModalOpen(true);
    };

    // Opens the modal for adding a new item
    const handleAddNewClick = () => {
        setCurrentEditIndex(null);
        const isGeneral = true;

        const baseData = {
            serial: '',
            broadcastTime: '',
            programDetails: '',
            // Conditionally include day, shift, period based on scheduleType
            day: isSpecialSchedule ? '' : (urlDayKey || ''),
            shift: isSpecialSchedule ? '' : (urlShiftKey || ''),
            period: isGeneral ? (urlShiftKey || '') : '',
            programType: 'General',
            artist: '',
            lyricist: '',
            composer: '',
            cdCut: '',
            duration: '',
            orderIndex: scheduleData.length,
            source: 'entryModal', // Source for new entries from this modal
        };

        setModalInitialData(baseData);
        setIsModalOpen(true);
    };

    // Handles saving data from the modal (add or edit)
    const handleSaveModalData = async (savedData) => {
        const payload = { ...savedData };
        payload.type = scheduleType; // Add scheduleType to the payload for backend

        const bengaliNumericRegex = /^[\u09E6-\u09EF]+$/; // Corrected Bengali number regex

        // Convert serial to English if needed
        if (typeof payload.serial === 'string' && bengaliNumericRegex.test(payload.serial)) {
            payload.serial = convertToEnglishNumber(payload.serial);
        } else {
            payload.serial = String(payload.serial || '');
        }

        if (currentEditIndex !== null) {
            // Update existing program
            try {
                payload.orderIndex = scheduleData[currentEditIndex].orderIndex;
                // Preserve the original source when updating
                payload.source = scheduleData[currentEditIndex].source || 'entryModal'; // Default to entryModal if source is missing

                await axiosSecure.put(`/api/special/${scheduleData[currentEditIndex]._id}`, payload);

                const updatedSchedule = [...scheduleData];
                updatedSchedule[currentEditIndex] = {
                    ...updatedSchedule[currentEditIndex],
                    ...payload,
                    serial: payload.serial === '' ? '' : convertToBengaliNumber(payload.serial)
                };

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
                if (!isSpecialSchedule) {
                    // Regular schedule
                    payload.day = urlDayKey;
                    payload.shift = urlShiftKey;
                    payload.period = payload.period || urlShiftKey || '';
                } else {
                    // Special schedule
                    payload.day = '';
                    payload.shift = '';
                    if (payload.programType === 'Song') {
                        payload.period = ''; // Not required
                    } else {
                        // Required for 'General' in special
                        payload.period = payload.period || ' ';
                    }
                }

                payload.orderIndex = scheduleData.length;
                // The 'source' field is already set in handleAddNewClick for new entries from modal

                // Re-check Bengali serial conversion
                if (typeof payload.serial === 'string' && bengaliNumericRegex.test(payload.serial)) {
                    payload.serial = convertToEnglishNumber(payload.serial);
                } else {
                    payload.serial = String(payload.serial || '');
                }

                const res = await axiosSecure.post('/api/special', payload);

                const newProgram = {
                    ...res.data,
                    serial: res.data.serial === '' ? '' : convertToBengaliNumber(res.data.serial)
                };

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
            // Ensure prevSelected is an array before calling .find()
            const currentSelected = Array.isArray(prevSelected) ? prevSelected : [];
            const exists = currentSelected.find((c) => c._id === item._id);
            if (exists) {
                return currentSelected.filter((c) => c._id !== item._id);
            } else {
                return [...currentSelected, item];
            }
        });
    };

    const today = new Date();

    // Don't convert to Bangla before passing into getDate
    const banglaDateObj = getDate(today, {
        format: 'D MMMM, YYYYb',
        calculationMethod: 'BD',
    });
    const banglaDate = banglaDateObj;

    const toBanglaNumber = (input) =>
        input.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

    const engDate = `${toBanglaNumber(today.getDate())}/${toBanglaNumber(today.getMonth() + 1)}/${toBanglaNumber(today.getFullYear())}`;

    const dayNames = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    // Display day name based on whether it's a special schedule or a regular day
    const displayDayName = isSpecialSchedule ? 'বিশেষ অনুষ্ঠান' : (urlDayKey || dayNames[today.getDay()]);
    // Display shift based on whether it's a special schedule or a regular shift
    const displayShift = isSpecialSchedule ? '' : (urlShiftKey === 'সকাল' ? 'প্রথম অধিবেশন' : (urlShiftKey === 'বিকাল' ? 'দ্বিতীয় অধিবেশন' : ''));


    const handleShowReport = (item) => {
        navigate('/report', { state: { ceremony: item } });
    };

    const handleSubmit = () => {
        // Pass relevant data for print view, including whether it's special
        navigate('/print', {
            state: {
                selectedRows: selectedCeremonies,
                dayName: displayDayName, // Use the dynamically determined display name
                engDate: engDate,
                dayShift: displayShift, // Use the dynamically determined display shift
                isSpecial: isSpecialSchedule // Pass this flag to PrintView if needed
            }
        });
    };

    const handlePrint = () => {
        window.print();
    }

    if (adminLoading) return <Loading />

    return (
        <div className="bg-white p-2 sm:p-3 w-full font-kalpurush print:font-kalpurush relative overflow-x-auto print:overflow-visible print:w-auto print:mx-auto print:max-w-none">
            <header className="mb-6 w-full">
                <div className="flex flex-col relative md:flex-row justify-between items-center mt-3 text-center md:text-right overflow-x-auto print:overflow-visible">
                    <div className="flex-1 hidden md:block"></div>
                    <div className=' border px-4 py-1'>
                        <h2>কিউশীট </h2>
                    </div>
                    <div className="flex flex-col items-center justify-center text-sm mb-4 md:mb-0 relative w-full md:w-auto">
                        <img className="w-20 h-20 mb-2" src="/logo.png" alt="logo" />
                        <div className="text-center leading-5">
                            <p>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                            <p>বাংলাদেশ বেতার, বরিশাল।</p>
                            <p><span className="font-semibold">ওয়েবসাইটঃ</span> www.betar.gov.bd <span className="font-semibold">এপঃ</span> Bangladesh Betar</p>
                            <p>ফ্রিকোয়েন্সিঃ মধ্যম তরঙ্গ ২৩৩.১০ মিটার অর্থাৎ ১২৮৭ কিলহার্জ এবং এফ.এম. ১০৫.২ মেগাহার্জ</p>
                        </div>
                    </div>
                    <div className="flex-1 hidden md:block">

                    </div>

                    <div className="flex-1 text-center md:text-right text-sm mt-4 md:mt-0">
                        <p contentEditable suppressContentEditableWarning className="whitespace-nowrap ">{displayDayName}</p> {/* Use displayDayName here */}
                        <p contentEditable suppressContentEditableWarning className=" whitespace-nowrap">{banglaDate} </p>
                        <p contentEditable suppressContentEditableWarning className="whitespace-nowrap">{engDate} খ্রিষ্টাব্দ</p>
                    </div>
                </div >
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
                                    {displayedScheduleData.map((item, index) => (
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
                                                        {item.period || ' '}
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
                currentProgramType={currentEditIndex !== null ? scheduleData[currentEditIndex].programType : 'General'}
                isSpecialSchedule={isSpecialSchedule} // Pass this prop to EntryModal
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
                <div>লগবইয়ে অন্তর্ভূক্ত</div>
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

export default NewTable;
