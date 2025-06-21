// components/Navbar.jsx
import { NavLink } from 'react-router-dom';
import { useState } from 'react';

const days = [
    { name: 'সোম', key: 'mon' },
    { name: 'মঙ্গল', key: 'tue' },
    { name: 'বুধ', key: 'wed' },
    { name: 'বৃহস্পতি', key: 'thu' },
    { name: 'শুক্র', key: 'fri' },
    { name: 'শনি', key: 'sat' },
    { name: 'রবি', key: 'sun' },
];

const Navbar = () => {
    const [openDay, setOpenDay] = useState(null);

    const toggleDropdown = (key) => {
        setOpenDay(openDay === key ? null : key);
    };

    return (
        <nav className="bg-blue-100 py-4 px-6 shadow mb-6">
            <div className="flex gap-6 justify-center flex-wrap">
                {days.map((day) => (
                    <div key={day.key} className="relative">
                        <button
                            onClick={() => toggleDropdown(day.key)}
                            className="text-blue-800 font-semibold hover:bg-blue-200 px-4 py-2 rounded"
                        >
                            {day.name}
                        </button>
                        {openDay === day.key && (
                            <div className="absolute z-10 mt-2 bg-white shadow-md rounded-md">
                                <NavLink
                                    to={`/schedule/${day.key}/morning`}
                                    className="block px-4 py-2 hover:bg-blue-100"
                                    onClick={() => setOpenDay(null)}
                                >
                                    সকাল
                                </NavLink>
                                <NavLink
                                    to={`/schedule/${day.key}/evening`}
                                    className="block px-4 py-2 hover:bg-blue-100"
                                    onClick={() => setOpenDay(null)}
                                >
                                    বিকাল
                                </NavLink>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default Navbar;
