import React, { useState, useEffect } from 'react';

// Reusable Modal Component for adding/editing entries
const EntryModal = ({ isOpen, onClose, initialData, onSave, title }) => {
    const [formData, setFormData] = useState(initialData);

    // Update form data when initialData changes (e.g., when editing a different row)
    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation for required fields
        if (!formData.broadcastTime || !formData.programDetails) {
            alert('Broadcast Time and Program Details are required.');
            return;
        }
        onSave(formData);
        onClose(); // Close modal after saving
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto max-h-[90vh]">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">{title}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {Object.keys(initialData).map((key) => (
                            <div key={key}>
                                <label className="block text-gray-700 text-sm font-bold mb-2 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </label>
                                <input
                                    type="text"
                                    name={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                                    required={key === 'broadcastTime' || key === 'programDetails'} // Make these fields required
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EntryModal;
