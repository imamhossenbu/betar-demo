// components/EntryModal.jsx
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2'; // Ensure Swal is imported for notifications

const EntryModal = ({ isOpen, onClose, initialData, onSave, title, currentProgramType }) => {
    const [formData, setFormData] = useState(initialData);
    // Initialize programType based on initialData or default to 'General'
    const [programType, setProgramType] = useState(initialData.programType || 'General');

    useEffect(() => {
        // Update form data and program type when initialData changes
        // This ensures the modal correctly reflects the data when editing different items.
        setFormData(initialData);
        setProgramType(initialData.programType || 'General');
    }, [initialData]); // Depend only on initialData for state update

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProgramTypeChange = (e) => {
        const newType = e.target.value;
        setProgramType(newType);
        setFormData(prev => {
            const newFormData = { ...prev, programType: newType };
            // Clear song-specific fields if switching to General, to avoid sending empty data
            if (newType === 'General') {
                newFormData.artist = '';
                newFormData.lyricist = '';
                newFormData.composer = '';
                newFormData.cdCut = '';
                newFormData.duration = '';
            }
            return newFormData;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData); // Pass the entire formData including programType and conditional fields
        // The parent (TableView) will close the modal on success or handle errors.
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 sm:p-6">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto max-h-[90vh] font-[kalpurush]">
                <h2 className="text-2xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">{title}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">ক্রমিক (Serial):</label>
                            <input
                                type="text"
                                name="serial"
                                value={formData.serial || ''}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">প্রচার সময় (Broadcast Time):</label>
                            <input
                                type="text"
                                name="broadcastTime"
                                value={formData.broadcastTime || ''}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">অনুষ্ঠান ধরণ (Program Type):</label>
                            <select
                                name="programType"
                                value={programType} // Controlled by programType state
                                onChange={handleProgramTypeChange}
                                className="shadow border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                required
                            >
                                <option value="General">সাধারণ অনুষ্ঠান (General Program)</option>
                                <option value="Song">সঙ্গীত (Song)</option>
                                {/* Add other program types as needed */}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">অধিবেশন (Period):</label>
                            <input
                                type="text"
                                name="period"
                                value={formData.period || ''}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                required // Period is always required
                            />
                        </div>
                    </div>


                    <div className="mb-4 sm:mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">অনুষ্ঠান বিবরণী (Program Details):</label>
                        <textarea
                            name="programDetails"
                            value={formData.programDetails || ''}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent h-20 text-sm sm:text-base"
                            // programDetails is NOT required if programType is 'Song'
                            required={programType !== 'Song'}
                        ></textarea>
                    </div>

                    {/* Conditionally rendered fields for 'Song' type */}
                    {programType === 'Song' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">শিল্পী (Artist):</label>
                                    <input
                                        type="text"
                                        name="artist"
                                        value={formData.artist || ''}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">গীতিকার (Lyricist):</label>
                                    <input
                                        type="text"
                                        name="lyricist"
                                        value={formData.lyricist || ''}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 sm:mb-6">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">সুরকার (Composer):</label>
                                    <input
                                        type="text"
                                        name="composer"
                                        value={formData.composer || ''}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">সিডি ও কাট (CD & Cut):</label>
                                    <input
                                        type="text"
                                        name="cdCut"
                                        value={formData.cdCut || ''}
                                        onChange={handleChange}
                                        className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                    />
                                </div>
                            </div>
                            <div className="mb-4 sm:mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">স্থিতি (Duration - HH:MM:SS):</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration || ''}
                                    onChange={handleChange}
                                    placeholder="HH:MM:SS (e.g., 00:05:30)"
                                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-sm sm:text-base"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end space-x-3 sm:space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 text-sm sm:text-base"
                        >
                            বাতিল (Cancel)
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 text-sm sm:text-base"
                        >
                            সংরক্ষণ (Save)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntryModal;
