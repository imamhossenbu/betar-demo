import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { MdOutlineClose } from 'react-icons/md';

const EntryModal = ({
    isOpen,
    onClose,
    initialData,
    onSave,
    title,
    currentProgramType,
    isSpecialSchedule,
}) => {
    const [formData, setFormData] = useState(initialData || {});
    const [programType, setProgramType] = useState(
        initialData?.programType || currentProgramType || 'General'
    );

    useEffect(() => {
        setFormData(initialData || {});
        setProgramType(initialData?.programType || currentProgramType || 'General');
    }, [initialData, currentProgramType]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleProgramTypeChange = (e) => {
        const newType = e.target.value;
        setProgramType(newType);
        setFormData((prev) => {
            const cleared = { ...prev, programType: newType };
            if (newType === 'Song') {
                // Clear fields not needed for songs
                cleared.serial = '';
                cleared.broadcastTime = '';
                cleared.period = '';
                cleared.day = '';
                cleared.shift = '';
            } else {
                // Clear song-specific fields
                cleared.artist = '';
                cleared.lyricist = '';
                cleared.composer = '';
                cleared.cdCut = '';
                cleared.duration = '';
            }
            return cleared;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let missingFields = [];

        if (!formData.programType) missingFields.push('Program Type');
        if (!formData.programDetails) missingFields.push('Program Details');

        if (programType === 'Song') {
            if (!formData.artist) missingFields.push('Artist');
        } else {
            if (!formData.serial) missingFields.push('Serial');
            if (!formData.broadcastTime) missingFields.push('Broadcast Time');
            if (!isSpecialSchedule && !formData.period) missingFields.push('Period');
        }

        if (missingFields.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'ভুল হয়েছে!',
                text: `নিম্নলিখিত তথ্যগুলি পূরণ করা আবশ্যক: ${missingFields.join(', ')}।`,
            });
            return;
        }

        const cleanedFormData = {
            ...formData,
            programType,
        };

        if (programType === 'Song') {
            cleanedFormData.serial = '';
            cleanedFormData.broadcastTime = '';
            cleanedFormData.period = '';
            cleanedFormData.day = '';
            cleanedFormData.shift = '';
            // ✅ keep programDetails for Song
        } else {
            if (isSpecialSchedule) {
                cleanedFormData.day = '';
                cleanedFormData.shift = '';
            }
        }

        onSave(cleanedFormData);
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-black to-blue-900 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50 p-4 sm:p-6">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl font-kalpurush overflow-y-auto max-h-[90vh] relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-black text-2xl"
                >
                    <MdOutlineClose />
                </button>

                <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>

                <form onSubmit={handleSubmit}>
                    {/* Program Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">অনুষ্ঠান ধরণ:</label>
                        <select
                            name="programType"
                            value={programType}
                            onChange={handleProgramTypeChange}
                            className="border rounded px-3 py-2 w-full"
                        >
                            <option value="General">General (সাধারণ)</option>
                            <option value="Song">গান/অনুষ্ঠান</option>
                        </select>
                    </div>

                    {/* Program Details */}
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">অনুষ্ঠান বিবরণী:</label>
                        <textarea
                            name="programDetails"
                            value={formData.programDetails || ''}
                            onChange={handleChange}
                            className="border rounded w-full px-3 py-2"
                            required
                        />
                    </div>

                    {/* General Fields */}
                    {programType !== 'Song' && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    name="serial"
                                    value={formData.serial || ''}
                                    onChange={handleChange}
                                    placeholder="Serial"
                                    className="border rounded px-3 py-2"
                                    required
                                />
                                <input
                                    type="text"
                                    name="broadcastTime"
                                    value={formData.broadcastTime || ''}
                                    onChange={handleChange}
                                    placeholder="Broadcast Time"
                                    className="border rounded px-3 py-2"
                                    required
                                />
                            </div>

                            <input
                                type="text"
                                name="period"
                                value={formData.period || ''}
                                onChange={handleChange}
                                placeholder="Period"
                                className="border rounded px-3 py-2 w-full mb-4"
                                required
                            />
                        </>
                    )}

                    {/* Song Fields */}
                    {programType === 'Song' && (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    name="artist"
                                    value={formData.artist || ''}
                                    onChange={handleChange}
                                    placeholder="Artist"
                                    className="border rounded px-3 py-2"
                                    required
                                />
                                <input
                                    type="text"
                                    name="lyricist"
                                    value={formData.lyricist || ''}
                                    onChange={handleChange}
                                    placeholder="Lyricist"
                                    className="border rounded px-3 py-2"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <input
                                    type="text"
                                    name="composer"
                                    value={formData.composer || ''}
                                    onChange={handleChange}
                                    placeholder="Composer"
                                    className="border rounded px-3 py-2"
                                />
                                <input
                                    type="text"
                                    name="cdCut"
                                    value={formData.cdCut || ''}
                                    onChange={handleChange}
                                    placeholder="CD Cut"
                                    className="border rounded px-3 py-2"
                                />
                            </div>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration || ''}
                                onChange={handleChange}
                                placeholder="Duration (HH:MM:SS)"
                                className="border rounded px-3 py-2 w-full mb-4"
                            />
                        </>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold px-4 py-2 rounded"
                        >
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded"
                        >
                            সংরক্ষণ করুন
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntryModal;
