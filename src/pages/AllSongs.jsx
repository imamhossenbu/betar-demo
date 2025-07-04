import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { axiosSecure } from '../useAxiosSecure';
import EntryModal from '../components/EntryModal';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

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

    const normalize = (str) => str?.normalize('NFC').toLowerCase();

    const filteredSongs = searchTerm
        ? songs.filter(song =>
            normalize(song.programDetails || '').includes(normalize(searchTerm))
        )
        : songs;

    return (
        <div className="p-6 font-kalpurush">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-green-700 mb-1">🎵 সকল গান/অনুষ্ঠান তালিকা</h2>
                <p className="text-sm text-gray-600">সকল গান/অনুষ্ঠান  দেখুন, এডিট ও ডিলিট করুন</p>
            </div>

            {/* Search bar */}
            <div className="mb-6 text-center">
                <input
                    type="text"
                    placeholder="🔍 গানের নাম দিয়ে অনুসন্ধান করুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 text-sm px-4 py-2 rounded shadow-sm w-full max-w-md focus:outline-none focus:ring-2 focus:ring-green-300"
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto print:w-full print:min-w-full print:max-w-none">
                <table className="table-fixed min-w-full border-collapse shadow-sm text-sm">
                    <thead>
                        <tr className="bg-green-100">
                            <th className="w-[40px] px-2 py-3 border border-gray-300 text-center">#</th>
                            <th className="w-[280px] px-2 py-3 border border-gray-300 text-left">গানের নাম</th>
                            <th className="w-[150px] px-2 py-3 border border-gray-300 text-center">শিল্পী</th>
                            <th className="w-[150px] px-2 py-3 border border-gray-300 text-center">গীতিকার</th>
                            <th className="w-[150px] px-2 py-3 border border-gray-300 text-center">সুরকার</th>
                            <th className="w-[80px] px-2 py-3 border border-gray-300 text-center">সিডি/কাট</th>
                            <th className="w-[80px] px-2 py-3 border border-gray-300 text-center">স্থিতি</th>
                            <th className="w-[120px] px-2 py-3 border border-gray-300 text-center">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSongs.map((song, index) => (
                            <tr key={song._id} className="hover:bg-gray-50 text-center">
                                <td className="w-[40px] px-2 py-3 border border-gray-300">{toBanglaNumber(index + 1)}</td>
                                <td className="w-[280px] px-2 py-3 border border-gray-300 text-left break-words">
                                    <div className="flex flex-col space-y-0.5">
                                        {(song.programDetails || '').split(',').map((item, idx) => (
                                            <span key={idx}>{item.trim()}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="w-[150px] px-2 py-3 border border-gray-300">{song.artist}</td>
                                <td className="w-[150px] px-2 py-3 border border-gray-300">{song.lyricist}</td>
                                <td className="w-[150px] px-2 py-3 border border-gray-300">{song.composer}</td>
                                <td className="w-[80px] px-2 py-3 border border-gray-300">{song.cdCut}</td>
                                <td className="w-[80px] px-2 py-3 border border-gray-300">{song.duration}</td>
                                <td className="w-[120px] px-2 py-3 border border-gray-300 space-x-2">
                                    <button
                                        onClick={() => handleEdit(song)}
                                        className="bg-green-500 hover:bg-green-300 text-black text-base px-2 py-2 rounded-full"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(song._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white text-base px-2 py-2 rounded-full"
                                    >
                                        <MdDelete />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredSongs.length === 0 && (
                            <tr>
                                <td colSpan="8" className="text-center p-4 text-gray-500">
                                    কোন গান/অনুষ্ঠান পাওয়া যায়নি।
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
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
