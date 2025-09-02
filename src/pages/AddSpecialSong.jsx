import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAxiosSecure from '../useAxiosSecure';

const AddSpecialSong = ({ onSongAdded }) => {
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();

    const programType = 'Song'; // Fixed for special song
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        programDetails: '',
        artist: '',
        lyricist: '',
        composer: '',
        cdCut: '',
        duration: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();


        const payload = {
            ...formData,
            programType,
            serial: '', // Serial is handled by backend or re-indexed on front-end after fetch
            broadcastTime: '',
            day: '',
            shift: '',
            period: '',
            orderIndex: 0, // This will be set by the backend based on current max or re-indexed
            source: '', // <--- IMPORTANT: Added this line to tag the source
        };

        try {
            setLoading(true);
            await axiosSecure.post('/api/special', payload);

            Swal.fire({
                icon: 'success',
                title: 'সফল!',
                text: 'বিশেষ গান/অনুষ্ঠান সফলভাবে যোগ হয়েছে।',
                timer: 2000,
                showConfirmButton: false,
            });

            // Call the callback function to notify the parent to re-fetch data
            if (onSongAdded) {
                onSongAdded();
            }

            navigate('/'); // Navigate back to the special schedule page
        } catch (err) {
            console.error(err);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: err.response?.data?.message || 'যোগ করতে ব্যর্থ হয়েছে।',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl mx-auto font-kalpurush">
            <h2 className="text-2xl font-bold mb-6 text-center text-green-700">🎵 বিশেষ গান/অনুষ্ঠান যোগ করুন</h2>

            <form onSubmit={handleSubmit}>
                {/* Program details (optional) */}
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">অনুষ্ঠান বিবরণ (ঐচ্ছিক):</label>
                    <textarea
                        name="programDetails"
                        value={formData.programDetails}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        placeholder="অনুষ্ঠানের বিবরণ দিন"
                    ></textarea>
                </div>

                {/* Artist & Lyricist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">শিল্পী:</label>
                        <input
                            type="text"
                            name="artist"
                            value={formData.artist}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700"

                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">গীতিকার:</label>
                        <input
                            type="text"
                            name="lyricist"
                            value={formData.lyricist}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>
                </div>

                {/* Composer & CD Cut */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">সুরকার:</label>
                        <input
                            type="text"
                            name="composer"
                            value={formData.composer}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-bold mb-2">আইডি:</label>
                        <input
                            type="text"
                            name="cdCut"
                            value={formData.cdCut}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>
                </div>

                {/* Duration */}
                <div className="mb-6">
                    <label className="block text-gray-700 font-bold mb-2">স্থিতি (HH:MM:SS):</label>
                    <input
                        type="text"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="shadow border rounded w-full py-2 px-3 text-gray-700"
                    />
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg"
                        disabled={loading}
                    >
                        বাতিল
                    </button>
                    <button
                        type="submit"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg"
                        disabled={loading}
                    >
                        {loading ? 'যোগ করা হচ্ছে...' : 'সংরক্ষণ করুন'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddSpecialSong;
