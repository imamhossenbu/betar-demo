import React, { useState } from 'react';
import EntryModal from './EntryModal'; // Import EntryModal from the same components folder
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

// Component for the main table view
const TableView = ({
    scheduleData,
    setScheduleData,
    selectedCeremonies,
    setSelectedCeremonies,
    setCurrentPage,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false); // Controls if the modal is open
    const [currentEditIndex, setCurrentEditIndex] = useState(null); // Index of the item being edited
    const [modalInitialData, setModalInitialData] = useState({}); // Data to pre-fill the modal

    const defaultNewEntry = {
        serial: '',
        broadcastTime: '',
        programDetails: '',
        artist: '',
        lyricist: '',
        composer: '',
        cdCut: '',
        duration: '',
    };

    // Function to handle deleting a row
    const handleDelete = (indexToDelete) => {
        // Show a confirmation message using a custom div instead of alert
        const confirmation = window.confirm("Are you sure you want to delete this entry?");
        if (confirmation) {
            // Remove the item from selectedCeremonies if it was checked
            const updatedSelectedCeremonies = selectedCeremonies.filter(
                (item) => item !== scheduleData[indexToDelete].programDetails
            );
            setSelectedCeremonies(updatedSelectedCeremonies);

            // Remove the row from scheduleData
            const updatedSchedule = scheduleData.filter((_, index) => index !== indexToDelete);
            setScheduleData(updatedSchedule);
            console.log('Deleted row at index:', indexToDelete);
        }
    };

    // Function to handle editing a row
    const handleEdit = (indexToEdit) => {
        setCurrentEditIndex(indexToEdit);
        // Create a deep copy of the object to avoid direct state mutation
        setModalInitialData({ ...scheduleData[indexToEdit] });
        setIsModalOpen(true);
    };

    // Function to handle opening the modal for adding a new entry
    const handleAddNewClick = () => {
        setCurrentEditIndex(null); // Indicates we are adding, not editing
        setModalInitialData(defaultNewEntry); // Provide empty data for a new entry
        setIsModalOpen(true);
    };

    // Function to handle saving data from the modal
    const handleSaveModalData = (savedData) => {
        if (currentEditIndex !== null) {
            // Editing existing entry
            const updatedSchedule = [...scheduleData];
            updatedSchedule[currentEditIndex] = savedData;
            setScheduleData(updatedSchedule);
        } else {
            // Adding new entry
            const newSerial = (scheduleData.length + 1).toString(); // Simple serial generation
            setScheduleData((prev) => [...prev, { ...savedData, serial: newSerial }]);
        }
        // No need to close modal here, it's handled by EntryModal itself
        // alert('Data saved successfully!'); // Using alert as per previous pattern
    };

    // Function to handle checkbox changes
    const handleCheckboxChange = (programDetails) => {
        setSelectedCeremonies((prevSelected) =>
            prevSelected.includes(programDetails)
                ? prevSelected.filter((item) => item !== programDetails)
                : [...prevSelected, programDetails]
        );
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-7xl">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
                বাংলাদেশ বেতার : অনুষ্ঠান কিউশিট ও সিডি চার্ট
            </h1>

            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
                <table border="1" className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                        <tr>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold uppercase border border-gray-300  rounded-tl-lg"
                            >
                                ক্রমিক
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold border border-gray-300 uppercase tracking-wider"
                            >
                                প্রচার সময়
                            </th>
                            <th
                                scope="col"
                                className="py-3 px-4 text-left text-sm font-semibold uppercase border border-gray-300 tracking-wider"
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
                                className="py-3 px-4 text-center text-sm font-semibold uppercase border border-gray-300 tracking-wider rounded-tr-lg"
                            >
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {scheduleData.map((item, index) => (
                            <tr
                                key={index}
                                className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                    } hover:bg-gray-100 transition-colors duration-200`}
                            >
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {item.serial || ' '}
                                </td>
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-sm text-gray-700">
                                    {item.broadcastTime || ' '}
                                </td>
                                <td className="py-3 px-4 text-sm border border-gray-300 text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={selectedCeremonies.includes(item.programDetails)}
                                        onChange={() => handleCheckboxChange(item.programDetails)}
                                        className="mt-3 h-3 w-3 mr-2 text-blue-600 focus:ring-blue-500 rounded"
                                    />
                                    <span>{item.programDetails || ' '}</span>
                                </td>

                                <td className="py-3 px-4 border border-gray-300 text-sm text-gray-700">
                                    {/* Display artist names one by one line */}
                                    {item.artist
                                        ? item.artist.split(/, /).map((artistName, artistIndex) => (
                                            <div key={artistIndex}>{artistName.trim() || ' '}</div>
                                        ))
                                        : ' '}
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
                                <td className="py-3 px-4 border border-gray-300 whitespace-nowrap text-center text-sm font-medium">
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
                                </td>
                            </tr>
                        ))}
                    </tbody>
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
                    onClick={() => setCurrentPage('print')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
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
            />

            {/* Example Footer / Additional Info */}
            <div className="mt-8 text-right text-gray-600 text-sm">
                <p>অধিবেশন তত্ত্বাবধায়ক : মোঃ মঈনুল ইসলাম</p>
                <p>অফিসার ইন-চার্জ : হাসনাইন ইমতিয়াজ</p>
                <p>ঘোষক/মোনিকা : মো. আজিজুর রহমান/গায়ত্রী সমসমার/তারমিনা বেগম</p>
                <p className="mt-2 text-xs text-gray-500">
                    Source: বাংলাদেশ বেতার, বরিশাল - www.betar.gov.bd
                </p>
            </div>
        </div>
    );
};

export default TableView;
