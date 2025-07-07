import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import EntryModal from '../components/EntryModal';
import { FaEdit } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import useAdmin from '../hooks/useAdmin';
import Loading from '../components/Loading';
import useAxiosSecure from '../useAxiosSecure';

const AllSpecialSong = () => {
    const [songs, setSongs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSong, setEditingSong] = useState(null);
    const [isAdmin, adminLoading] = useAdmin();
    const axiosSecure = useAxiosSecure();

    useEffect(() => {
        axiosSecure.get('api/specialSongs')
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
                await axiosSecure.delete(`/specialSongs/${id}`);
                setSongs(songs.filter(song => song._id !== id));
                Swal.fire('সফল!', 'গানটি মুছে ফেলা হয়েছে।', 'success');
            } catch (err) {
                console.error('Delete failed:', err);
                Swal.fire('ত্রুটি!', 'গানটি ডিলিট করতে ব্যর্থ হয়েছে!', 'error');
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
            await axiosSecure.put(`/api/special/${_id}`, rest);
            const updated = songs.map(song => song._id === _id ? { ...song, ...rest } : song);
            setSongs(updated);
            setIsModalOpen(false);
            setEditingSong(null);
            Swal.fire('সফল', 'তথ্য সফলভাবে আপডেট হয়েছে!', 'success');
        } catch (err) {
            console.error('Update failed:', err);
            Swal.fire('ত্রুটি!', 'আপডেট করতে ব্যর্থ হয়েছে!', 'error');
        }
    };

    const filteredSongs = searchTerm
        ? songs.filter(song =>
            (song.programDetails || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        : songs;

    if (adminLoading) return <Loading />;

    return (
        <div className="p-6 font-kalpurush">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-green-700 mb-2">🎶 বিশেষ গান/অনুষ্ঠান তালিকা</h2>
                <p className="text-gray-600">এখানে বিশেষ গান এবং অনুষ্ঠানের তথ্য দেখুন ও সম্পাদনা করুন</p>
            </div>

            {/* Search bar */}
            <div className="mb-6 text-center">
                <input
                    type="text"
                    placeholder="🔍 গানের নাম দিয়ে খুঁজুন..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 text-sm px-4 py-2 rounded w-full max-w-md focus:outline-none focus:ring-2 focus:ring-green-400 shadow"
                />
            </div>

            {/* Song table */}
            <div className="overflow-x-auto">
                <table className="table-auto w-full border border-gray-300 text-sm text-center shadow-md">
                    <thead className="bg-green-100 text-gray-700">
                        <tr>
                            <th className="px-2 py-3 border">#</th>
                            <th className="px-2 py-3 border text-left">গানের নাম</th>
                            <th className="px-2 py-3 border">শিল্পী</th>
                            <th className="px-2 py-3 border">গীতিকার</th>
                            <th className="px-2 py-3 border">সুরকার</th>
                            <th className="px-2 py-3 border">CD/কাট</th>
                            <th className="px-2 py-3 border">স্থিতি</th>
                            {isAdmin && <th className="px-2 py-3 border">অ্যাকশন</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSongs.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 8 : 7} className="py-4 text-gray-500">কোনো তথ্য পাওয়া যায়নি।</td>
                            </tr>
                        ) : (
                            filteredSongs.map((song, idx) => (
                                <tr key={song._id} className="hover:bg-gray-50">
                                    <td className="px-2 py-3 border">{toBanglaNumber(idx + 1)}</td>
                                    <td className="px-2 py-3 border text-left">
                                        {(song.programDetails || '').split(',').map((line, i) => (
                                            <p key={i} className="text-left">{line.trim()}</p>
                                        ))}
                                    </td>
                                    <td className="px-2 py-3 border">{song.artist || '-'}</td>
                                    <td className="px-2 py-3 border">{song.lyricist || '-'}</td>
                                    <td className="px-2 py-3 border">{song.composer || '-'}</td>
                                    <td className="px-2 py-3 border">{song.cdCut || '-'}</td>
                                    <td className="px-2 py-3 border">{song.duration || '-'}</td>
                                    {isAdmin && (
                                        <td className="px-2 py-3 border space-x-2">
                                            <button
                                                onClick={() => handleEdit(song)}
                                                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(song._id)}
                                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                                            >
                                                <MdDelete />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isAdmin && isModalOpen && (
                <EntryModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingSong(null);
                    }}
                    initialData={editingSong}
                    onSave={handleSave}
                    title="বিশেষ গান/অনুষ্ঠান আপডেট করুন"
                    currentProgramType="Song"
                    isSpecialSchedule={true}
                />
            )}
        </div>
    );
};

export default AllSpecialSong;
