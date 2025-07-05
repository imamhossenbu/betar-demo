import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../useAxiosSecure'

import Swal from 'sweetalert2';

const AddSongPage = () => {
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();

    const programType = 'Song'; // Fixed for this page

    const [formData, setFormData] = useState({
        programDetails: '', // Optional for songs
        artist: '',
        lyricist: '',
        composer: '',
        cdCut: '',
        duration: '',
        // These fields will be emptied before sending if programType === 'Song'
        day: '',
        shift: '',
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        let missingFields = [];

        if (!formData.artist.trim()) {
            missingFields.push('Artist');
        }

        if (missingFields.length > 0) {
            Swal.fire({
                icon: 'error',
                title: 'ভুল হয়েছে!',
                text: `নিম্নলিখিত তথ্যগুলি পূরণ করা আবশ্যক: ${missingFields.join(', ')}।`,
            });
            return;
        }

        setLoading(true);

        const payload = {
            ...formData,
            programType,
            serial: '',
            broadcastTime: '',
            shift: '',
            day: '',
            period: '',
            orderIndex: 0,
        };

        try {
            await axiosSecure.post('/api/programs', payload);
            Swal.fire('Success!', 'সঙ্গীত সফলভাবে যোগ হয়েছে!', 'success');
            navigate('/');
        } catch (error) {
            console.error('Error adding song:', error.response?.data?.message || error.message);
            Swal.fire('Error!', error.response?.data?.message || 'যোগ করতে ব্যর্থ হয়েছে।', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl mx-auto font-kalpurush">
            <h2 className="text-2xl font-bold mb-6 text-center">নতুন সঙ্গীত যোগ করুন</h2>

            <form onSubmit={handleSubmit}>
                {/* Optional program details */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">অনুষ্ঠান বিবরণী (Program Details):</label>
                    <textarea
                        name="programDetails"
                        value={formData.programDetails}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="সঙ্গীতের বিস্তারিত বিবরণ (ঐচ্ছিক)"
                    ></textarea>
                </div>

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
