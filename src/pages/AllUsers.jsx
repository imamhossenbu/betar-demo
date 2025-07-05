import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../useAxiosSecure';
import useAdmin from '../hooks/useAdmin';
import Loading from '../components/Loading';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { MdDelete } from 'react-icons/md';

const AllUsers = () => {
    const [users, setUsers] = useState([]);
    const [isAdmin, adminLoading] = useAdmin();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();

    const toBanglaNumber = (number) => {
        const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
        return number.toString().split('').map(d => banglaDigits[d] || d).join('');
    };

    const fetchUsers = () => {
        axiosSecure.get('/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error('Error fetching users:', err));
    };


    useEffect(() => {
        if (isAdmin) {
            fetchUsers();
        }
    }, [isAdmin]);

    const handleRoleToggle = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            const res = await axiosSecure.patch(`/users/${userId}`, { role: newRole });
            if (res.data.modifiedCount > 0) {
                Swal.fire('সফল!', `ইউজার এখন ${newRole === 'admin' ? 'অ্যাডমিন' : 'ইউজার'}!`, 'success');
                fetchUsers();
            }
        } catch (err) {
            Swal.fire('ত্রুটি!', 'ভূমিকা পরিবর্তন করা যায়নি।', 'error');
        }
    };

    const handleDeleteUser = async (id) => {
        const confirm = await Swal.fire({
            title: 'আপনি কি নিশ্চিত?',
            text: 'এই ইউজারটি মুছে ফেলা হবে!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, মুছে ফেলুন!',
            cancelButtonText: 'বাতিল',
        });

        if (confirm.isConfirmed) {
            try {
                // 1. Delete from your MongoDB
                console.log(id);
                const res = await axiosSecure.delete(`/users/${id}`);

                Swal.fire('Deleted!', 'ইউজারটি মুছে ফেলা হয়েছে।', 'success');
                fetchUsers();
            } catch (err) {
                Swal.fire('ত্রুটি!', 'মুছে ফেলা যায়নি।', 'error');
            }
        }
    };


    if (adminLoading) return <Loading />;
    if (!isAdmin) {
        navigate('/');
        return null;
    }

    return (
        <div className="p-6 font-kalpurush">
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-800">সকল ইউজার</h2>
            <div className="overflow-x-auto rounded-lg shadow">
                <table className="table-auto w-full border text-center text-sm">
                    <thead className="bg-blue-200 text-gray-700">
                        <tr>
                            <th className="px-4 py-2 border">#</th>
                            <th className="px-4 py-2 border">ইমেইল</th>
                            <th className="px-4 py-2 border">ভূমিকা</th>
                            <th className="px-4 py-2 border">অ্যাকশন</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr key={user._id} className="border-t">
                                <td className="px-4 py-2 border">{toBanglaNumber(index + 1)}</td>
                                <td className="px-4 py-2 border">{user.email}</td>
                                <td className="px-4 py-2 border">{user.role || 'user'}</td>
                                <td className="px-4 py-2 border">
                                    <button
                                        onClick={() => handleRoleToggle(user._id, user.role)}
                                        className={`px-4 py-1 text-sm font-bold rounded-full shadow-md transition-all duration-300 transform hover:scale-105 mx-2
                                    ${user.role === 'admin'
                                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {user.role === 'admin' ? 'ইউজার করুন' : 'অ্যাডমিন করুন'}
                                    </button>

                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="text-red-600 hover:text-white hover:bg-red-600 p-2 rounded-full transition-all duration-300 shadow-md"
                                        title="ইউজার ডিলিট করুন"
                                    >
                                        <MdDelete size={20} />
                                    </button>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AllUsers;
