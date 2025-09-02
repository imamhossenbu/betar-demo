
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

// ===== LOCAL STORAGE HELPERS =====
const STORAGE_PREFIX = 'schedule_v2';
const getStorageKey = (dayKey, shiftKey) =>
    `${STORAGE_PREFIX}::day=${dayKey || ''}::shift=${shiftKey || ''}`;

const safeParse = (raw) => {
    try { return JSON.parse(raw); } catch { return null; }
};

const loadScheduleFromLS = (dayKey, shiftKey) => {
    if (typeof window === 'undefined') return [];
    const key = getStorageKey(dayKey, shiftKey);
    const raw = localStorage.getItem(key);
    const val = safeParse(raw);
    if (Array.isArray(val)) return val;

    // legacy fallback
    const legacy = safeParse(localStorage.getItem('scheduleData'));
    return Array.isArray(legacy) ? legacy : [];
};

const saveScheduleToLS = (dayKey, shiftKey, data) => {
    if (typeof window === 'undefined') return;
    const key = getStorageKey(dayKey, shiftKey);
    localStorage.setItem(key, JSON.stringify(data));
};

const TableView = ({ scheduleData, setScheduleData, selectedCeremonies, setSelectedCeremonies }) => {
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

    const banglaShift =
        urlShiftKey === 'সকাল' ? 'সকাল' : (urlShiftKey === 'বিকাল' ? 'বিকাল' : urlShiftKey);

    // ===== stale-read fix =====
    const scheduleDataRef = useRef(scheduleData);
    useEffect(() => { scheduleDataRef.current = scheduleData; }, [scheduleData]);

    // ===== bootstrapping guard =====
    const [hydrated, setHydrated] = useState(false);

    // ===== server fetch helper =====
    const fetchScheduleFromServer = async (day, shift) => {
        try {
            const { data } = await axiosSecure.get('/api/programs', { params: { day, shift } });
            return Array.isArray(data) ? data : [];
        } catch (e) {
            console.error('Server fetch failed:', e);
            return [];
        }
    };

    // digit utils
    const convertToBengaliNumber = (num) => {
        const en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(num).split('').map(d => {
            const i = en.indexOf(d);
            return i !== -1 ? bn[i] : d;
        }).join('');
    };
    const convertToEnglishNumber = (num) => {
        const en = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
        const bn = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return String(num).split('').map(d => {
            const i = bn.indexOf(d);
            return i !== -1 ? en[i] : d;
        }).join('');
    };

    // show layer (serial -> Bangla)
    useEffect(() => {
        const formatted = (Array.isArray(scheduleData) ? scheduleData : []).map(item => {
            if (item?.serial && typeof item.serial === 'string' && /^\d+$/.test(item.serial)) {
                return { ...item, serial: convertToBengaliNumber(item.serial) };
            }
            return item;
        });
        setDisplayedScheduleData(formatted);
    }, [scheduleData]);

    // ===== Bootstrapping: LS first -> else server =====
    useEffect(() => {
        let cancelled = false;

        (async () => {
            setHydrated(false); // reset guard

            // day/shift undefined হলে কিছু করো না
            if (!urlDayKey || !banglaShift) {
                setHydrated(true);
                return;
            }

            // 1) try LS
            const lsData = loadScheduleFromLS(urlDayKey, banglaShift);
            if (!cancelled && Array.isArray(lsData) && lsData.length > 0) {
                setScheduleData(lsData);
                setHydrated(true);
                return;
            }

            // 2) else server
            const serverData = await fetchScheduleFromServer(urlDayKey, banglaShift);
            if (!cancelled) {
                setScheduleData(serverData);
                setHydrated(true);
            }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlDayKey, banglaShift]);

    // ===== Safe auto-save: only after hydrated; never overwrite with [] =====
    useEffect(() => {
        if (!hydrated) return;
        if (!urlDayKey || !banglaShift) return;

        const current = Array.isArray(scheduleData) ? scheduleData : [];
        const existing = loadScheduleFromLS(urlDayKey, banglaShift);

        // যদি current ফাঁকা হয় কিন্তু existing আছে, সেভ করবো না (ওভাররাইট আটকানো)
        if (current.length === 0 && Array.isArray(existing) && existing.length > 0) {
            return;
        }
        // নাহলে সেভ
        saveScheduleToLS(urlDayKey, banglaShift, current);
    }, [hydrated, scheduleData, urlDayKey, banglaShift]);

    // ===== CD Cut change handler =====
    const handleInlineCdCutChange = (e, index) => {
        const newCdCut = e.target.value;

        setScheduleData(prev => {
            const updated = [...(prev || [])];
            if (!updated[index]) updated[index] = {};
            updated[index] = { ...updated[index], cdCut: newCdCut };
            return updated;
        });

        if (debounceTimeoutRefs.current[index]) {
            clearTimeout(debounceTimeoutRefs.current[index]);
        }

        const programTypeNow = scheduleDataRef.current?.[index]?.programType;

        if (newCdCut && programTypeNow === 'Song') {
            setLoadingCdCutIndex(index);

            debounceTimeoutRefs.current[index] = setTimeout(async () => {
                try {
                    const { data } = await axiosSecure.get(`/api/songs/byCdCut/${newCdCut}`);

                    if (data) {
                        setScheduleData(prev => {
                            const updated = [...(prev || [])];
                            const row = updated[index] || {};
                            updated[index] = {
                                ...row,
                                programDetails: data.programDetails || '',
                                artist: data.artist || '',
                                lyricist: data.lyricist || '',
                                composer: data.composer || '',
                                duration: data.duration || '',
                                programType: data.programType || 'Song',
                            };
                            return updated;
                        });
                        Swal.fire('Success', `CD Cut ${newCdCut} এর ডেটা লোড হয়েছে!`, 'success');
                    } else {
                        Swal.fire('Info', `CD Cut ${newCdCut} এর জন্য কোনো ডেটা পাওয়া যায়নি।`, 'info');
                        setScheduleData(prev => {
                            const updated = [...(prev || [])];
                            const row = updated[index] || {};
                            updated[index] = {
                                ...row,
                                programDetails: '',
                                artist: '',
                                lyricist: '',
                                composer: '',
                                duration: '',
                                programType: 'General',
                            };
                            return updated;
                        });
                    }
                } catch (error) {
                    console.error('সিডি কাটের ডেটা আনতে ব্যর্থ:', error);
                    Swal.fire('Error', 'সিডি কাটের ডেটা আনতে ব্যর্থ হয়েছে।', 'error');
                } finally {
                    setLoadingCdCutIndex(null);
                }
            }, 800);
        } else {
            setLoadingCdCutIndex(null);
            if (!newCdCut) {
                setScheduleData(prev => {
                    const updated = [...(prev || [])];
                    const row = updated[index] || {};
                    updated[index] = {
                        ...row,
                        programDetails: '',
                        artist: '',
                        lyricist: '',
                        composer: '',
                        duration: '',
                    };
                    return updated;
                });
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

    // ===== Drag & Drop =====
    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const items = Array.from(scheduleData || []);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatesForBackend = [];
        let serialCounter = 1;

        const newSchedule = items.map((item, newIndex) => {
            const originalItem = (scheduleData || []).find(s => s._id === item._id);
            if (!originalItem) return item;

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
            };

            const originalSerialBackendFormat = originalItem.serial
                ? convertToEnglishNumber(originalItem.serial)
                : '';

            if (serialForBackend !== originalSerialBackendFormat) {
                updatedItemForBackend.serial = serialForBackend;
            }

            if (
                newOrderIndex !== originalItem.orderIndex ||
                (updatedItemForBackend.hasOwnProperty('serial') &&
                    updatedItemForBackend.serial !== originalSerialBackendFormat)
            ) {
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
                    return axiosSecure.put(`/api/programs/${_id}`, fieldsToUpdate);
                });
                await Promise.all(updatePromises);
                Swal.fire('Success', 'তালিকার ক্রম সফলভাবে আপডেট হয়েছে!', 'success');
            } catch (error) {
                console.error('সিরিয়াল/ক্রম আপডেট করতে ব্যর্থ:', error);
                Swal.fire('Error', 'তালিকার ক্রম আপডেট করতে ব্যর্থ হয়েছে।', 'error');
            }
        }
    };

    // ===== Delete =====
    const handleDelete = (indexToDelete) => {
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
                    const del = await axiosSecure.delete(`/api/programs/${itemToDelete._id}`);
                    if (del.status === 200 || del.status === 204) {
                        const updatedSchedule = (scheduleData || []).filter((_, idx) => idx !== indexToDelete);

                        let serialCounter = 1;
                        const reIndexed = updatedSchedule.map((item, newIndex) => {
                            if (item.serial && item.serial.trim() !== '') {
                                return {
                                    ...item,
                                    serial: convertToBengaliNumber(serialCounter++),
                                    orderIndex: newIndex,
                                };
                            }
                            return { ...item, orderIndex: newIndex };
                        });

                        setScheduleData(reIndexed);

                        const updatedSelected = (selectedCeremonies || []).filter(
                            (item) => item._id !== itemToDelete._id
                        );
                        setSelectedCeremonies(updatedSelected);

                        Swal.fire('Deleted!', 'The entry has been deleted.', 'success');

                        const updates = reIndexed.map(item => ({
                            _id: item._id,
                            serial: item.serial && item.serial.trim() !== ''
                                ? convertToEnglishNumber(item.serial)
                                : '',
                            orderIndex: item.orderIndex
                        }));

                        try {
                            const updatePromises = updates
                                .filter(u => u._id)
                                .map(u => {
                                    const { _id, ...fieldsToUpdate } = u;
                                    return axiosSecure.put(`/api/programs/${_id}`, fieldsToUpdate);
                                });
                            if (updatePromises.length > 0) await Promise.all(updatePromises);
                        } catch (updateError) {
                            console.error("Order index update failed (but deletion succeeded):", updateError);
                        }
                    } else {
                        throw new Error(`Unexpected delete status: ${del.status}`);
                    }
                } catch (error) {
                    console.error("Deletion error:", error);
                    Swal.fire('Error!', `Failed to delete entry: ${error.message}`, 'error');
                }
            }
        });
    };

    // ===== Edit / Add =====
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

    const handleAddNewClick = () => {
        setCurrentEditIndex(null);

        const baseData = {
            serial: '',
            broadcastTime: '',
            programDetails: '',
            day: urlDayKey,
            shift: banglaShift,
            period: banglaShift,
            programType: 'General',
            artist: '',
            lyricist: '',
            composer: '',
            cdCut: '',
            duration: '',
            orderIndex: (scheduleData || []).length
        };

        setModalInitialData(baseData);
        setIsModalOpen(true);
    };

    const handleSaveModalData = async (savedData) => {
        const payload = { ...savedData };
        const bengaliNumericRegex = /^[\u09E6-\u09EF]+$/;

        if (typeof payload.serial === 'string' && bengaliNumericRegex.test(payload.serial)) {
            payload.serial = convertToEnglishNumber(payload.serial);
        } else {
            payload.serial = String(payload.serial || '');
        }

        if (currentEditIndex !== null) {
            try {
                payload.orderIndex = (scheduleData || [])[currentEditIndex].orderIndex;

                await axiosSecure.put(`/api/programs/${scheduleData[currentEditIndex]._id}`, payload);
                const updated = [...(scheduleData || [])];
                updated[currentEditIndex] = {
                    ...updated[currentEditIndex],
                    ...payload,
                    serial: (payload.serial === '' ? '' : convertToBengaliNumber(payload.serial))
                };
                setScheduleData(updated);
                setIsModalOpen(false);
                Swal.fire('Success', 'Program updated successfully!', 'success');
            } catch (err) {
                console.error('Failed to update program:', err.response?.data || err.message);
                Swal.fire('Error', 'Failed to update program', 'error');
            }
        } else {
            try {
                payload.day = urlDayKey;
                payload.shift = banglaShift;
                payload.period = payload.period;
                payload.orderIndex = (scheduleData || []).length;

                if (typeof payload.serial === 'string' && bengaliNumericRegex.test(payload.serial)) {
                    payload.serial = convertToEnglishNumber(payload.serial);
                } else {
                    payload.serial = String(payload.serial || '');
                }

                const res = await axiosSecure.post('/api/programs', payload);
                const newProgram = {
                    ...res.data,
                    serial: (res.data.serial === '' ? '' : convertToBengaliNumber(res.data.serial))
                };
                setScheduleData(prev => ([...(prev || []), newProgram]));
                setIsModalOpen(false);
                Swal.fire('Success', 'Program added successfully!', 'success');
            } catch (err) {
                console.error('Failed to add program:', err.response?.data || err.message);
                Swal.fire('Error', 'Failed to add program', 'error');
            }
        }
    };

    // dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const banglaDateObj = getDate(tomorrow, { format: 'D MMMM, YYYYb', calculationMethod: 'BD' });
    const banglaDate = banglaDateObj;

    const toBanglaNumber = (input) =>
        input.toString().replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

    const engDate = `${toBanglaNumber(tomorrow.getDate())}/${toBanglaNumber(tomorrow.getMonth() + 1)}/${toBanglaNumber(tomorrow.getFullYear())}`;
    const dayShift = urlShiftKey === 'সকাল' ? 'প্রথম অধিবেশন' : 'দ্বিতীয় অধিবেশন';

    const handleShowReport = (item) => {
        navigate('/report', { state: { ceremony: item } });
    };

    const handleSubmit = () => {
        navigate('/print', { state: { selectedRows: selectedCeremonies, dayName: urlDayKey, engDate: engDate, dayShift: dayShift } });
    };

    const handlePrint = () => { window.print(); };

    if (adminLoading) return <Loading />;

    return (
        <div className="bg-white p-2 sm:p-3 w-full font-kalpurush print:font-kalpurush relative  overflow-x-auto print:overflow-visible print:w-auto print:mx-auto print:max-w-none">
            {/* (rest of your JSX exactly as আগে ছিল) */}
            {/* ... হেডার/টেবিল/ফুটার—আমি নিচে তোমার আগের JSX-টাই রেখে দিয়েছি ... */}

            <header className="mb-6 w-full">
                <div className="flex flex-col relative md:flex-row justify-between items-center mt-3 text-center md:text-right overflow-x-auto print:overflow-visible">
                    <div className="flex-1 hidden md:block"></div>
                    <div className=' border px-4 py-1'><h2>কিউশীট</h2></div>
                    <div className="flex flex-col items-center justify-center text-sm mb-4 md:mb-0 relative w-full md:w-auto">
                        <img className="w-20 h-20 mb-2" src="/logo.png" alt="logo" />
                        <div className="text-center leading-5">
                            <p contentEditable suppressContentEditableWarning>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                            <p contentEditable suppressContentEditableWarning>বাংলাদেশ বেতার, বরিশাল।</p>
                            <p contentEditable suppressContentEditableWarning><span className="font-semibold">ওয়েবসাইটঃ</span> www.betar.gov.bd <span className="font-semibold">অ্যাপঃ </span> Bangladesh Betar</p>
                            <p contentEditable suppressContentEditableWarning>ফ্রিকোয়েন্সিঃ মধ্যম তরঙ্গ ২৩৩.১০ মিটার অর্থাৎ ১২৮৭ কিলহার্জ এবং এফ.এম. ১০৫.২ মেগাহার্জ</p>
                        </div>
                    </div>
                    <div className='border print:mr-4 px-4 py-1'><h2>{dayShift}</h2></div>
                    <div className="flex-1 text-center md:text-right text-sm mt-4 md:mt-0">
                        <p contentEditable suppressContentEditableWarning className="whitespace-nowrap ">{urlDayKey}</p>
                        <p contentEditable suppressContentEditableWarning className=" whitespace-nowrap">{banglaDate} </p>
                        <p contentEditable suppressContentEditableWarning className="whitespace-nowrap">{engDate} খ্রিষ্টাব্দ</p>
                    </div>
                </div>
            </header>

            <div className="w-full print:w-full print:min-w-full print:max-w-none overflow-x-auto print:overflow-visible">
                <table className="w-full table-fixed border-collapse border border-gray-700 print:w-full print:min-w-full print:max-w-none">
                    <GlobalPersistentHeaderRow />
                </table>
            </div>

            <div className="print:w-full print:min-w-full print:max-w-none w-full overflow-x-auto">
                <table border="1" className="w-full table-auto border-collapse border border-gray-700 divide-y divide-gray-200 print:w-full print:min-w-full print:max-w-none">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-1 px-2 w-[45px] min-w-[45px] max-w-[45px] text-left text-xs sm:text-sm font-semibold uppercase border border-gray-700 rounded-tl-lg whitespace-nowrap">ক্রমিক</th>
                            <th colSpan={2} className="py-1 px-2 w-[40px] min-w-[40px] max-w-[40px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap">প্রচার সময়</th>
                            <th className="py-1 px-2 w-[240px] min-w-[240px] max-w-[240px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap">অনুষ্ঠান বিবরণী</th>
                            <th className="py-1 px-2 w-[40px] min-w-[40px] max-w-[40px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap">শিল্পী</th>
                            <th className="py-1 px-2 text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap">গীতিকার</th>
                            <th className="py-1 px-2 text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap">সুরকার</th>
                            <th className="py-1 px-2 w-[70px] min-w-[70px] max-w-[70px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap">আইডি</th>
                            <th className="py-1 px-2 w-[40px] min-w-[40px] max-w-[40px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap">স্থিতি</th>
                            <th className="py-1 px-2 w-[45px] min-w-[45px] max-w-[45px] text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap">প্রচার <br /> মন্তব্য</th>
                            <th className="py-1 px-2 w-[45px] min-w-[45px] max-w-[45px] text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider whitespace-nowrap">ডি/ও <br /> স্বাক্ষর</th>
                            {isAdmin && (
                                <th className="py-1 print:hidden px-2 text-center text-xs sm:text-sm font-semibold uppercase border border-gray-700 tracking-wider rounded-tr-lg whitespace-nowrap">Action</th>
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
                                                    className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors duration-200`}
                                                >
                                                    <td className="py-1 px-2 w-[20px] min-w-[20px] max-w-[20px] border border-gray-700 text-center whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 break-words">{item.serial || ' '}</td>
                                                    <td className="py-1 w-[45px] min-w-[45px] max-w-[45px] px-2 border border-gray-700 text-center whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">{item.period || ' '}</td>
                                                    <td className="py-1 w-[70px] min-w-[70px] max-w-[70px] px-2 border border-gray-700 text-center whitespace-nowrap text-xs sm:text-sm text-gray-700">{item.broadcastTime || ' '}</td>
                                                    <td className="py-1 px-2 text-xs sm:text-sm border border-gray-700 text-gray-700 w-[240px] min-w-[240px] max-w-[240px] overflow-hidden break-words">
                                                        <label className="flex items-start gap-1 sm:gap-2">
                                                            {isAdmin && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={(selectedCeremonies || []).some((c) => c._id === item._id)}
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
                                                    <td className="py-1 px-2 border border-gray-700 text-xs sm:text-sm text-gray-700 whitespace-nowrap">
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
                                                                {loadingCdCutIndex === index && <span className="text-blue-500 text-xs">...</span>}
                                                            </>
                                                        ) : (' ')}
                                                    </td>
                                                    <td className="py-1 px-2 border border-gray-700 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                                                        {item.programType === 'Song' ? (item.duration || ' ') : ''}
                                                    </td>
                                                    <td className="py-1 px-2 w-[20px] min-w-[20px] max-w-[20px] border border-gray-700 whitespace-nowrap text-xs sm:text-sm text-gray-700"></td>
                                                    <td className="py-1 px-2 border w-[20px] min-w-[20px] max-w-[20px] border-gray-700 whitespace-nowrap text-xs sm:text-sm text-gray-700"></td>
                                                    {isAdmin && (
                                                        <td className="py-1 print:hidden px-2 border border-gray-700 whitespace-nowrap text-center text-xs sm:text-sm font-medium">
                                                            <button type="button" onClick={() => handleEdit(index)} className="text-white mr-1 px-1.5 py-1.5 rounded-full bg-black border border-white hover:bg-gray-800 transition-colors text-base sm:text-md">
                                                                <FaEdit />
                                                            </button>
                                                            <button type="button" onClick={() => handleDelete(index)} className="text-red-600 hover:text-red-900 px-1.5 py-1.5 rounded-full border border-red-600 hover:bg-red-50 transition-colors text-base sm:text-md">
                                                                <MdDelete />
                                                            </button>
                                                            <button type="button" onClick={() => handleShowReport(item)} className="text-blue-600 hover:text-blue-800 px-1.5 py-1.5 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors ml-1 text-base sm:text-md">
                                                                <FaRegFileAlt />
                                                            </button>
                                                        </td>
                                                    )}
                                                </tr>
                                            )}
                                        </Draggable>
                                    ))}
                                </tbody>
                            )}
                        </Droppable>
                    </DragDropContext>
                </table>
            </div>

            {isAdmin && (
                <div className="flex print:hidden flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-6">
                    <button type="button" onClick={handleAddNewClick} className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 sm:px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
                        Add New
                    </button>
                    <button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-4 sm:px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
                        অনুষ্ঠান সূচি
                    </button>
                </div>
            )}

            <EntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={modalInitialData}
                onSave={handleSaveModalData}
                title={currentEditIndex !== null ? 'Edit Entry' : 'Add New Entry'}
                currentProgramType={currentEditIndex !== null ? scheduleData[currentEditIndex].programType : 'General'}
            />

            {/* <footer className="flex flex-col sm:flex-row items-center justify-between my-10 text-xs sm:text-sm text-center sm:text-left space-y-4 sm:space-y-0">
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
            </footer> */}
            <GlobalPersistentFooter />

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
        </div>
    );
};

export default TableView;



function GlobalPersistentHeaderRow() {
    const STORAGE_KEY = 'schedule_header_global_v1';

    // ডিফল্ট টেক্সট (তোমার এখনকার ভ্যালুগুলো)
    const defaults = {
        h1: 'অফিসার ইনচার্জঃ হাসনাইন ইমতিয়াজ',
        h2: 'অধিবেশন তত্ত্বাবধায়কঃ মো. মাইনুল ইসলাম/ মো. হাবিবুর রহমান',
        h3: 'ঘোষক/ঘোষিকাঃ শিপ্রা দেউরী/ অমিতা রায়/ মঞ্জুর রাশেদ/ মো. তানভীর হোসেন',
    };

    // uncontrolled contentEditable রাখার জন্য refs
    const refs = {
        h1: React.useRef(null),
        h2: React.useRef(null),
        h3: React.useRef(null),
    };

    // প্রথম লোডে লোকালস্টোরেজ → না থাকলে defaults বসাও
    React.useEffect(() => {
        let fromLS = null;
        try { fromLS = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { }
        const data = { ...defaults, ...(fromLS || {}) };
        Object.entries(data).forEach(([k, v]) => {
            if (refs[k]?.current) refs[k].current.textContent = v || '';
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // সেভ হেল্পার
    const saveKV = React.useCallback((key, val) => {
        let obj = {};
        try { obj = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { }
        obj[key] = val ?? '';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    }, []);

    // টাইপ করলেই সেভ (চাইলে onBlur ব্যবহার করতে পারো)
    const onInput = (k) => (e) => {
        saveKV(k, e.currentTarget.textContent || '');
    };

    return (
        <thead>
            <tr className="text-sm text-left">
                <td
                    ref={refs.h1}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={onInput('h1')}
                    className="border border-gray-700 px-2 py-1 w-[25%] whitespace-normal break-words"
                >
                    {defaults.h1}
                </td>
                <td
                    ref={refs.h2}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={onInput('h2')}
                    className="border border-gray-700 px-2 py-1 w-[37.5%] whitespace-normal break-words"
                >
                    {defaults.h2}
                </td>
                <td
                    ref={refs.h3}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={onInput('h3')}
                    className="border border-gray-700 px-2 py-1 w-[37.5%] whitespace-normal break-words"
                >
                    {defaults.h3}
                </td>
            </tr>
        </thead>
    );
}


function GlobalPersistentFooter() {
    const STORAGE_KEY = 'schedule_footer_global_v1';

    // ডিফল্ট টেক্সট (চাইলে বদলাও)
    const defaults = {
        c1n: 'মো. ফারুক হাওলাদার',
        c1t: 'টেপরেকর্ড লাইব্রেরীয়ান',
        c2n: 'হাসনাইন ইমতিয়াজ',
        c2t: 'সহকারী পরিচালক(অনুষ্ঠান)',
        c3n: 'মো. রফিকুল ইসলাম ',
        c3t: 'উপ-আঞ্চলিক পরিচালক ',
        c3x: 'আঞ্চলিক পরিচালকের পক্ষে ',
    };

    // প্রতিটি লাইনের জন্য ref (uncontrolled contentEditable → caret jump হবে না)
    const refs = {
        c1n: React.useRef(null), c1t: React.useRef(null),
        c2n: React.useRef(null), c2t: React.useRef(null),
        c3n: React.useRef(null), c3t: React.useRef(null), c3x: React.useRef(null),
    };

    // প্রথম লোডে লোকালস্টোরেজ → না থাকলে defaults
    React.useEffect(() => {
        let fromLS = null;
        try { fromLS = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { }
        const data = { ...defaults, ...(fromLS || {}) };
        Object.entries(data).forEach(([k, v]) => {
            if (refs[k]?.current) refs[k].current.textContent = v || '';
        });
    }, []);

    // সেভ হেল্পার
    const saveKV = React.useCallback((key, val) => {
        let obj = {};
        try { obj = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { }
        obj[key] = val ?? '';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    }, []);

    // টাইপ করলেই সেভ (চাইলে onBlur ব্যবহার করতে পারো)
    const onInput = (k) => (e) => {
        saveKV(k, e.currentTarget.textContent || '');
    };

    return (
        <footer className="flex flex-col sm:flex-row items-center justify-between my-10 text-xs sm:text-sm text-center sm:text-left space-y-4 sm:space-y-0">
            <div className='w-full sm:w-auto text-center'>
                <p ref={refs.c1n} contentEditable suppressContentEditableWarning onInput={onInput('c1n')}>{defaults.c1n}</p>
                <p ref={refs.c1t} contentEditable suppressContentEditableWarning onInput={onInput('c1t')}>{defaults.c1t}</p>
            </div>
            <div className='w-full sm:w-auto text-center'>
                <p ref={refs.c2n} contentEditable suppressContentEditableWarning onInput={onInput('c2n')}>{defaults.c2n}</p>
                <p ref={refs.c2t} contentEditable suppressContentEditableWarning onInput={onInput('c2t')}>{defaults.c2t}</p>
            </div>
            <div className='w-full sm:w-auto text-center'>
                <p ref={refs.c3n} contentEditable suppressContentEditableWarning onInput={onInput('c3n')}>{defaults.c3n}</p>
                <p ref={refs.c3t} contentEditable suppressContentEditableWarning onInput={onInput('c3t')}>{defaults.c3t}</p>
                <p ref={refs.c3x} contentEditable suppressContentEditableWarning onInput={onInput('c3x')}>{defaults.c3x}</p>
            </div>
        </footer>
    );
}
