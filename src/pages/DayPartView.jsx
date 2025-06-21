// pages/DayPartView.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

const DayPartView = () => {
    const { day, part } = useParams();

    return (
        <div className="text-center mt-8">
            <h2 className="text-xl font-bold">Selected Day: {day.toUpperCase()}</h2>
            <p className="text-lg mt-2">Part: {part === 'morning' ? 'সকাল' : 'বিকাল'}</p>

            {/* You can fetch and show the schedule for this day+part here */}
            <p className="mt-6 text-gray-500">[TableView content will go here later]</p>
        </div>
    );
};

export default DayPartView;
