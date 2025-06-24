// components/AddSongPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosPublic from '../axiosPublic';
import Swal from 'sweetalert2';

const AddSongPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        programDetails: '', // General description of the song (e.g., "আধুনিক গান")
        artist: '',
        lyricist: '',
        composer: '',
        cdCut: '',
        duration: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            programType: 'Song', // Explicitly set program type to 'Song'
            // Add placeholder/default values for required fields that are schedule-specific
            // These will be overridden when the song is actually added to a daily schedule later
            serial: '0', // Placeholder serial, will be assigned a real serial when used in a schedule
            broadcastTime: '00:00', // Placeholder broadcast time
            day: 'Placeholder Day', // Placeholder day
            date: '2000-01-01', // Placeholder date
            shift: 'Placeholder Shift', // Placeholder shift
            period: 'Placeholder Period', // Placeholder period
        };

        // Ensure essential fields for a song are provided
        if (!payload.artist) {
            Swal.fire('Error', 'Program Details and Artist are required for a song.', 'error');
            setLoading(false);
            return;
        }

        try {
            await axiosPublic.post('/api/programs', payload);
            Swal.fire('Success!', 'Song added successfully to the library!', 'success');
            navigate('/'); // Navigate back to dashboard after success
        } catch (error) {
            console.error('Error adding song:', error.response?.data || error.message);
            Swal.fire('Error!', error.response?.data?.message || 'Failed to add song.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl mx-auto font-[kalpurush]">
            <h2 className="text-2xl font-bold mb-6 text-center">নতুন সঙ্গীত যোগ করুন</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="programDetails" className="block text-gray-700 text-sm font-bold mb-2">
                        সঙ্গীতের বিবরণ (Program Details - e.g., আধুনিক গান):
                    </label>
                    <textarea
                        id="programDetails"
                        name="programDetails"
                        value={formData.programDetails}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-20"
                        required
                    ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="artist" className="block text-gray-700 text-sm font-bold mb-2">
                            শিল্পী (Artist):
                        </label>
                        <input
                            type="text"
                            id="artist"
                            name="artist"
                            value={formData.artist}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="lyricist" className="block text-gray-700 text-sm font-bold mb-2">
                            গীতিকার (Lyricist):
                        </label>
                        <input
                            type="text"
                            id="lyricist"
                            name="lyricist"
                            value={formData.lyricist}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="composer" className="block text-gray-700 text-sm font-bold mb-2">
                            সুরকার (Composer):
                        </label>
                        <input
                            type="text"
                            id="composer"
                            name="composer"
                            value={formData.composer}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                    <div>
                        <label htmlFor="cdCut" className="block text-gray-700 text-sm font-bold mb-2">
                            সিডি ও কাট (CD & Cut):
                        </label>
                        <input
                            type="text"
                            id="cdCut"
                            name="cdCut"
                            value={formData.cdCut}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="duration" className="block text-gray-700 text-sm font-bold mb-2">
                        স্থিতি (Duration - HH:MM:SS):
                    </label>
                    <input
                        type="text"
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="HH:MM:SS (e.g., 00:05:30)"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')} // Go back to dashboard/home
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow transition-all duration-300 transform hover:scale-105"
                        disabled={loading}
                    >
                        বাতিল (Cancel)
                    </button>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
                        disabled={loading}
                    >
                        {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন (Save Song)'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddSongPage;
