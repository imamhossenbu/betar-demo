
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import EntryModal from './EntryModal';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const TableView = ({ scheduleData, setScheduleData, selectedCeremonies, setSelectedCeremonies }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEditIndex, setCurrentEditIndex] = useState(null);
    const [modalInitialData, setModalInitialData] = useState({});
    const [selectedIndexes, setSelectedIndexes] = useState([]);
    const navigate = useNavigate();

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(scheduleData);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setScheduleData(items);
    };

    const handleRowCheckboxChange = (index) => {
        setSelectedIndexes((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };

    const handleShowSelectedClick = () => {
        const selectedRows = selectedIndexes.map((i) => scheduleData[i]);
        navigate('/selected', { state: { selectedRows } });
    };

    const handleDelete = (indexToDelete) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedSelectedCeremonies = selectedCeremonies.filter(
                    (item) => item !== scheduleData[indexToDelete].programDetails
                );
                setSelectedCeremonies(updatedSelectedCeremonies);

                const updatedSchedule = scheduleData.filter((_, index) => index !== indexToDelete);
                setScheduleData(updatedSchedule);

                Swal.fire('Deleted!', 'The entry has been deleted.', 'success');
            }
        });
    };

    const handleSubmit = () => {
        navigate('/print', { state: { selectedRows: selectedCeremonies } });
    };

    const handleEdit = (indexToEdit) => {
        setCurrentEditIndex(indexToEdit);
        setModalInitialData({ ...scheduleData[indexToEdit] });
        setIsModalOpen(true);
    };

    const handleAddNewClick = () => {
        setCurrentEditIndex(null);
        setModalInitialData({
            serial: '',
            broadcastTime: '',
            programDetails: '',
            artist: '',
            lyricist: '',
            composer: '',
            cdCut: '',
            duration: '',
        });
        setIsModalOpen(true);
    };

    const handleSaveModalData = (savedData) => {
        if (currentEditIndex !== null) {
            const updatedSchedule = [...scheduleData];
            updatedSchedule[currentEditIndex] = savedData;
            setScheduleData(updatedSchedule);
        } else {
            const newSerial = (scheduleData.length + 1).toString();
            setScheduleData((prev) => [...prev, { ...savedData, serial: newSerial }]);
        }
    };

    const handleCheckboxChange = (item) => {
        setSelectedCeremonies((prevSelected) => {
            const alreadySelected = prevSelected.find(
                (ceremony) =>
                    ceremony.programDetails === item.programDetails &&
                    ceremony.broadcastTime === item.broadcastTime
            );
            if (alreadySelected) {
                return prevSelected.filter(
                    (ceremony) =>
                        !(ceremony.programDetails === item.programDetails &&
                            ceremony.broadcastTime === item.broadcastTime)
                );
            } else {
                return [...prevSelected, item];
            }
        });
    };

    const handleShowReport = (item) => {
        navigate('/report', { state: { ceremony: item } });
    };


    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full font-[kalpurush] max-w-[1800px]">
            <header>
                <div className="flex justify-between items-center mt-12">
                    <div></div>
                    <div className="text-center text-sm">
                        <p>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</p>
                        <p>বাংলাদেশ বেতার, বরিশাল।</p>
                        <p><span className="font-semibold">ওয়েবসাইটঃ</span> www.betar.gov.bd <span className="font-semibold">এপঃ</span> Bangladesh Betar</p>
                        <p className="border-b border-b-black">ফ্রিকোয়েন্সিঃ মধ্যম তরঙ্গ ২৩৩.১০ মিটার অর্থাৎ ১২৮৭ কিলহার্জ এবং এফ.এম. ১০৫.২ মেগাহার্জ</p>
                    </div>
                    <div className="text-left text-sm">
                        <p>সোমবার</p>
                        <p className="border-b border-b-black">২৫ ফাল্গুন, ১৪৩১ বঙ্গাব্দ </p>
                        <p>১০/০৩/২০২৫ খ্রিষ্টাব্দ </p>
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
                <table border="1" className="min-w-[1500px] divide-y table-auto w-full divide-gray-200">
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
                            <th
                                scope="col"
                                className="py-3 px-4 text-center text-sm font-semibold uppercase border border-gray-300 tracking-wider rounded-tr-lg"
                            >
                                Action
                            </th>
                        </tr>
                    </thead>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId="schedule">
                            {(provided) => (
                                <tbody ref={provided.innerRef} {...provided.droppableProps}>
                                    {scheduleData.map((item, index) => (
                                        <Draggable key={index} draggableId={index.toString()} index={index}>
                                            {(provided) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
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
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCeremonies.some(
                                                                    (ceremony) =>
                                                                        ceremony.programDetails === item.programDetails &&
                                                                        ceremony.broadcastTime === item.broadcastTime
                                                                )}
                                                                onChange={() => handleCheckboxChange(item)}
                                                                className="mt-1.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />

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
                                                    <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-center text-sm font-medium">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIndexes.includes(index)}
                                                            onChange={() => handleRowCheckboxChange(index)}
                                                            className="mr-2"
                                                        />

                                                        <button
                                                            type="button"
                                                            onClick={() => handleEdit(index)}
                                                            className="text-white  mr-2 px-2 py-2 rounded-full bg-black border border-white hover:bg-gray-800 transition-colors"
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(index)}
                                                            className="text-red-600 hover:text-red-900 px-2 py-2 rounded-full border border-red-600 hover:bg-red-50 transition-colors"
                                                        >
                                                            <MdDelete />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleShowReport(item)}
                                                            className="text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-600 rounded-full hover:bg-blue-50 transition-colors ml-2"
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

            <div className="flex justify-end space-x-4 mt-6">
                <button
                    type="button"
                    onClick={handleAddNewClick}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Add New
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                >
                    Submit
                </button>
                <button
                    onClick={handleShowSelectedClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Show Selected
                </button>

            </div>

            {/* Entry Modal for both Add and Edit */}
            <EntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={modalInitialData}
                onSave={handleSaveModalData}
                title={currentEditIndex !== null ? 'Edit Entry' : 'Add New Entry'}
            />

            {/* Example Footer / Additional Info */}
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


        </div>
    );
};

export default TableView;
