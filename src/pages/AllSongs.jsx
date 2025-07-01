import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { axiosSecure } from '../useAxiosSecure';
import EntryModal from '../components/EntryModal';

const AllSongs = () => {
    const [songs, setSongs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState(null);

    useEffect(() => {
        axiosSecure.get('/songs')
            .then(res => setSongs(res.data))
            .catch(err => console.error('Error fetching songs:', err));
    }, []);

    const toBanglaNumber = (num) =>
        String(num).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: "এই গানটি মুছে ফেলা হবে!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'হ্যাঁ, ডিলিট করুন',
            cancelButtonText: 'বাতিল'
        });

        if (result.isConfirmed) {
            try {
                await axiosSecure.delete(`/songs/${id}`);
                setSongs(songs.filter(song => song._id !== id));

                Swal.fire({
                    title: 'ডিলিট সফল',
                    text: 'গানটি মুছে ফেলা হয়েছে।',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error('Delete failed:', err);
                Swal.fire({
                    title: 'ত্রুটি',
                    text: 'গানটি ডিলিট করতে ব্যর্থ হয়েছে!',
                    icon: 'error',
                });
            }
        }
    };

    const handleEdit = (song) => {
        setEditingSong(song);
        setIsModalOpen(true);
    };

    const handleSave = async (updatedData) => {
        try {
            const { _id, ...rest } = updatedData;
            await axiosSecure.put(`/api/programs/${_id}`, rest);

            const updated = songs.map(song =>
                song._id === _id ? { ...song, ...rest } : song
            );
            setSongs(updated);

            Swal.fire({
                icon: 'success',
                title: 'আপডেট সফল',
                text: 'গানের তথ্য সফলভাবে আপডেট হয়েছে!',
                timer: 2000,
                showConfirmButton: false,
            });

            setIsModalOpen(false);
            setEditingSong(null);
        } catch (err) {
            console.error('Update failed:', err);
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: 'আপডেট করতে ব্যর্থ হয়েছে!',
            });
        }
    };

    // Normalize Bengali text for better matching
    const normalize = (str) => str?.normalize('NFC').toLowerCase();

    const filteredSongs = songs.filter(song =>
        normalize(song.programDetails).includes(normalize(searchTerm))
    );

    return (
        <div className="p-6 font-[kalpurush]">
            <h2 className="text-2xl font-bold mb-4 text-green-700 text-center">সকল সঙ্গীত তালিকা</h2>

            {/* Search bar */}
            <div className="mb-4 text-center">
                <input
                    type="text"
                    placeholder="গানের নাম দিয়ে অনুসন্ধান করুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded w-full max-w-md"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-3 border">#</th>
                            <th className="p-3 border">গানের নাম</th>
                            <th className="p-3 border">শিল্পী</th>
                            <th className="p-3 border">সিডি/কাট</th>
                            <th className="p-3 border">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSongs.map((song, index) => (
                            <tr key={song._id} className="hover:bg-gray-50">
                                <td className="p-3 border">{toBanglaNumber(index + 1)}</td>
                                <td className="p-3 border">{song.programDetails}</td>
                                <td className="p-3 border">{song.artist}</td>
                                <td className="p-3 border">{song.cdCut}</td>
                                <td className="p-3 border space-x-2">
                                    <button
                                        onClick={() => handleEdit(song)}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                                    >
                                        এডিট
                                    </button>
                                    <button
                                        onClick={() => handleDelete(song._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                        ডিলিট
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredSongs.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center p-4 text-gray-500">কোন গান পাওয়া যায়নি।</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Entry Modal for Edit */}
            {isModalOpen && (
                <EntryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    initialData={editingSong}
                    onSave={handleSave}
                    title="গানের তথ্য এডিট করুন"
                    currentProgramType="Song"
                />
            )}
        </div>
    );
};

export default AllSongs;
