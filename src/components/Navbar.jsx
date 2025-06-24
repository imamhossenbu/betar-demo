// components/Navbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axiosPublic from '../axiosPublic';
import Swal from 'sweetalert2';

const days = [
    { name: 'সোমবার', key: 'mon', date: '2025-06-23' },
    { name: 'মঙ্গলবার', key: 'tue', date: '2025-06-24' },
    { name: 'বুধবার', key: 'wed', date: '2025-06-25' },
    { name: 'বৃহস্পতিবার', key: 'thu', date: '2025-06-26' },
    { name: 'শুক্রবার', key: 'fri', date: '2025-06-27' },
    { name: 'শনিবার', key: 'sat', date: '2025-06-28' },
    { name: 'রবিবার', key: 'sun', date: '2025-06-29' },
];

const Navbar = ({ setScheduleData, handleLogout }) => {
    const [openDay, setOpenDay] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // State for mobile menu
    const navigate = useNavigate();

    const loggedInUserId = localStorage.getItem('userId');

    const toggleDropdown = (key) => {
        setOpenDay(openDay === key ? null : key);
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => { // Helper to close mobile menu
        setMobileMenuOpen(false);
        setOpenDay(null); // Also close any open day dropdown
    };

    const getDayDetails = (dayKey) => {
        return days.find(d => d.key === dayKey);
    };

    const handleLoadPrograms = async (dayKey, shift) => {
        setOpenDay(null); // Close day dropdown
        closeMobileMenu(); // Close mobile menu when a day/shift is selected

        const dayDetails = getDayDetails(dayKey);

        if (!dayDetails || !shift) {
            Swal.fire('Error', 'Day or Shift information missing.', 'error');
            return;
        }

        const { name: dayName, date } = dayDetails;

        if (!loggedInUserId) {
            Swal.fire('Error', 'Please log in to view programs.', 'error');
            navigate('/login');
            return;
        }

        try {
            const programsResponse = await axiosPublic.get(
                `/api/programs?day=${encodeURIComponent(dayName)}&shift=${encodeURIComponent(shift)}`
            );
            console.log(programsResponse.data);
            setScheduleData(programsResponse.data);

            Swal.fire('Info', `Loading programs for ${dayName} (${shift}).`, 'info');

            navigate(`/schedule/${dayKey}/${encodeURIComponent(shift)}?dayName=${encodeURIComponent(dayName)}`);

        } catch (error) {
            console.error("Error loading programs:", error.response?.data || error.message);
            if (error.response && error.response.status === 404) {
                setScheduleData([]);
                Swal.fire('Info', `No programs found for ${dayName} (${shift}). You can add new ones.`, 'info');
                navigate(`/schedule/${dayKey}/${encodeURIComponent(shift)}?dayName=${encodeURIComponent(dayName)}&date=${encodeURIComponent(date)}`);
            } else {
                Swal.fire('Error', `Failed to load programs: ${error.response?.data?.message || error.message}`, 'error');
            }
        }
    };

    const onLogoutClick = () => {
        handleLogout();
        closeMobileMenu(); // Close mobile menu on logout
    };

    return (
        <nav className="bg-blue-100 py-4 px-6 shadow mb-6 flex items-center justify-between font-[kalpurush] relative">
            {/* Left Section: Logo */}
            <div className="flex items-center flex-shrink-0">
                <NavLink to="/" className="text-blue-800 font-bold text-2xl whitespace-nowrap" onClick={closeMobileMenu}>
                    <img src="https://placehold.co/40x40/000000/FFFFFF?text=Logo" alt="Betar Logo" className="h-10 w-10 mr-2 inline-block rounded-md" />
                    বেতার
                </NavLink>
            </div>

            {/* Hamburger Button (visible on small screens only) */}
            <div className="md:hidden">
                <button
                    onClick={toggleMobileMenu}
                    className="text-blue-800 focus:outline-none"
                    aria-label="Toggle navigation"
                    aria-expanded={mobileMenuOpen}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {mobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                        )}
                    </svg>
                </button>
            </div>

            {/* Main Navigation Links (hidden on small, flex on medium and up) */}
            {/* When mobile menu is open, display as flex-col, otherwise hidden */}
            <div className={`
                ${mobileMenuOpen ? 'flex' : 'hidden'}
                md:flex md:flex-row md:items-center md:justify-between md:flex-grow
                absolute md:static top-full left-0 right-0
                bg-blue-100 md:bg-transparent shadow-md md:shadow-none
                flex-col w-full py-4 md:py-0 px-6 md:px-0
                z-40
            `}>
                {/* Middle Section: Days with Dropdowns - vertical on mobile */}
                <div className="flex flex-col md:flex-row gap-2 sm:gap-4 md:justify-start md:flex-grow mb-4 md:mb-0">
                    {days.map((day) => (
                        <div key={day.key} className="relative">
                            <button
                                onClick={() => toggleDropdown(day.key)}
                                className="text-blue-800 font-semibold hover:bg-blue-200 px-3 py-1.5 rounded-md focus:outline-none text-sm md:text-base w-full text-left md:text-center"
                                aria-expanded={openDay === day.key}
                            >
                                {day.name}
                            </button>
                            {openDay === day.key && (
                                <div className="md:absolute z-10 md:mt-2 bg-white shadow-md rounded-md overflow-hidden min-w-[120px] left-0 md:left-auto md:right-auto md:w-auto mt-1 md:mt-0">
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-blue-100 focus:outline-none text-sm"
                                        onClick={() => handleLoadPrograms(day.key, 'সকাল')}
                                    >
                                        সকাল
                                    </button>
                                    <button
                                        className="block w-full text-left px-4 py-2 hover:bg-blue-100 focus:outline-none text-sm"
                                        onClick={() => handleLoadPrograms(day.key, 'বিকাল')}
                                    >
                                        বিকাল
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Right Section: Dashboard, New Song, & Logout Links - vertical on mobile */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 sm:gap-4 md:justify-end md:flex-grow-0">
                    <NavLink
                        to="/"
                        className="text-blue-800 font-semibold hover:bg-blue-200 px-3 py-1.5 rounded-md text-sm md:text-base w-full text-center"
                        onClick={closeMobileMenu}
                    >
                        ড্যাশবোর্ড
                    </NavLink>
                    <NavLink
                        to="/add-song"
                        className="text-green-600 font-semibold hover:bg-green-100 px-3 py-1.5 rounded-md text-sm md:text-base w-full text-center"
                        onClick={closeMobileMenu}
                    >
                        নতুন সঙ্গীত যোগ করুন
                    </NavLink>
                    <button
                        onClick={onLogoutClick}
                        className="text-red-600 font-semibold hover:bg-red-100 px-3 py-1.5 rounded-md text-sm md:text-base w-full text-center"
                    >
                        লগআউট
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
