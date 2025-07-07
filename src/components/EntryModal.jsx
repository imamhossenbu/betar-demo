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
    const [formData, setFormData] = useState(initialData);
    const [programType, setProgramType] = useState(
        initialData.programType || currentProgramType || 'General'
    );

    useEffect(() => {
        setFormData(initialData);
        setProgramType(initialData.programType || currentProgramType || 'General');
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
                // Clear general program fields when switching to Song
                cleared.serial = '';
                cleared.broadcastTime = '';
                cleared.period = ''; // Period is cleared for songs
                cleared.day = '';
                cleared.shift = '';
                cleared.programDetails = '';
            } else {
                // Clear song-specific fields when switching to General
                cleared.artist = '';
                cleared.lyricist = '';
                cleared.composer = '';
                cleared.cdCut = '';
                cleared.duration = '';
                // For General type, period, day, shift, programDetails are retained
                // as they are relevant for general programs.
            }
            return cleared;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        let missingFields = [];

        if (!formData.programType) missingFields.push('Program Type');
        // Removed orderIndex validation as it's no longer managed by the modal form.
        // if (formData.orderIndex === undefined || formData.orderIndex === null)
        //     missingFields.push('Order Index');

        if (programType === 'Song') {
            if (!formData.artist) missingFields.push('Artist');
        } else {
            // For General type programs
            if (!formData.programDetails) missingFields.push('Program Details');
            if (!formData.serial) missingFields.push('Serial');
            if (!formData.broadcastTime) missingFields.push('Broadcast Time');

            // Period is required for General programs ONLY if it's NOT a special schedule
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

        // Ensure unnecessary fields are cleared for 'Song'
        if (programType === 'Song') {
            cleanedFormData.serial = '';
            cleanedFormData.broadcastTime = '';
            cleanedFormData.day = '';
            cleanedFormData.shift = '';
            cleanedFormData.period = ''; // Explicitly clear period for Song type
            cleanedFormData.programDetails = '';
        } else {
            // For General type special programs, ensure day and shift are explicitly empty
            // Period is NOT cleared here for General type, it retains its value from formData.
            if (isSpecialSchedule) {
                cleanedFormData.day = '';
                cleanedFormData.shift = '';
            }
        }

        onSave(cleanedFormData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 sm:p-6">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-2xl font-kalpurush overflow-y-auto max-h-[90vh] relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-black text-2xl"
                >
                    <MdOutlineClose />
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">অনুষ্ঠান ধরণ:</label>
                        <select
                            name="programType"
                            value={programType}
                            onChange={handleProgramTypeChange}
                            className="border rounded px-3 py-2 w-full"
                        >
                            <option value="General">General(সাধারণ)</option>
                            <option value="Song">গান/অনুষ্ঠান</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-bold mb-1">অনুষ্ঠান বিবরণী:</label>
                        <textarea
                            name="programDetails"
                            value={formData.programDetails || ''}
                            onChange={handleChange}
                            className="border rounded w-full px-3 py-2"
                            required={programType !== 'Song'}
                        />
                    </div>

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
                                    required // Serial is always required for General programs
                                />
                                <input
                                    type="text"
                                    name="broadcastTime"
                                    value={formData.broadcastTime || ''}
                                    onChange={handleChange}
                                    placeholder="Broadcast Time"
                                    className="border rounded px-3 py-2"
                                    required // Broadcast Time is always required for General programs
                                />
                            </div>
                            <input
                                type="text"
                                name="period"
                                value={formData.period || ''}
                                onChange={handleChange}
                                placeholder="Period"
                                className="border rounded px-3 py-2 w-full mb-4"
                                required={isSpecialSchedule} // Period is required only if NOT a special schedule
                            />
                        </>
                    )}

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
