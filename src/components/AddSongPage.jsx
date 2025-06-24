import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosPublic from '../axiosPublic';
import Swal from 'sweetalert2';

const AddSongPage = () => {
    const navigate = useNavigate();

    const programType = 'Song'; // Fixed as Song

    // Get current date, day, and a default shift for initial form state
    const today = new Date();
    const optionsDay = { weekday: 'long' };
    const optionsDate = { year: 'numeric', month: '2-digit', day: '2-digit' };

    const currentDayName = today.toLocaleDateString('bn-BD', optionsDay); // Example: 'সোমবার'
    const currentDate = today.toLocaleDateString('en-CA', optionsDate).replace(/\//g, '-'); // Format YYYY-MM-DD
    const defaultShift = 'সকাল'; // Default shift for new song entries

    const [formData, setFormData] = useState({
        artist: '',
        lyricist: '',
        composer: '',
        cdCut: '',
        duration: '',
        day: currentDayName, // Initialized with current day name
        date: currentDate, // Initialized with current date
        shift: defaultShift, // Initialized with a default shift
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation for AddSongPage
        if (!formData.artist.trim()) {
            Swal.fire('Error', 'শিল্পীর নাম অবশ্যই দিতে হবে।', 'error');
            return;
        }
        if (!formData.day.trim()) {
            Swal.fire('Error', 'দিনের নাম আবশ্যক।', 'error');
            return;
        }
        if (!formData.date.trim()) {
            Swal.fire('Error', 'তারিখ আবশ্যক।', 'error');
            return;
        }
        if (!formData.shift.trim()) {
            Swal.fire('Error', 'সেশন আবশ্যক।', 'error');
            return;
        }

        setLoading(true);

        const payload = {
            ...formData,
            programType,
            serial: '', // Not required for Song type, send as empty string
            broadcastTime: '', // Not required for Song type, send as empty string
            programDetails: 'সঙ্গীত', // Default program details for a song
            period: formData.shift, // Often period is same as shift
            orderIndex: 0, // A default orderIndex. This might need dynamic calculation if many songs exist.
            // However, TableView handles reordering persistently, so a default of 0 is fine for new additions.
        };

        try {
            await axiosPublic.post('/api/programs', payload);
            Swal.fire('Success!', 'সঙ্গীত সফলভাবে যোগ হয়েছে!', 'success');
            navigate('/'); // Navigate back to the main table view or dashboard
        } catch (error) {
            console.error('Error adding song:', error.response?.data?.message || error.message);
            Swal.fire('Error!', error.response?.data?.message || 'যোগ করতে ব্যর্থ হয়েছে।', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl mx-auto font-[kalpurush]">
            <h2 className="text-2xl font-bold mb-6 text-center">নতুন সঙ্গীত যোগ করুন</h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">শিল্পী (Artist):</label>
                        <input
                            type="text"
                            name="artist"
                            value={formData.artist}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">গীতিকার (Lyricist):</label>
                        <input
                            type="text"
                            name="lyricist"
                            value={formData.lyricist}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">সুরকার (Composer):</label>
                        <input
                            type="text"
                            name="composer"
                            value={formData.composer}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">সিডি ও কাট (CD & Cut):</label>
                        <input
                            type="text"
                            name="cdCut"
                            value={formData.cdCut}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2">স্থিতি (Duration - HH:MM:SS):</label>
                    <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        placeholder="00:05:30"
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                    />
                </div>

                {/* Hidden fields for day, date, shift to ensure they are sent with data */}
                <input type="hidden" name="day" value={formData.day} />
                <input type="hidden" name="date" value={formData.date} />
                <input type="hidden" name="shift" value={formData.shift} />

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow"
                        disabled={loading}
                    >
                        বাতিল (Cancel)
                    </button>
                    <button
                        type="submit"
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow"
                        disabled={loading}
                    >
                        {loading ? 'সংরক্ষণ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddSongPage;
