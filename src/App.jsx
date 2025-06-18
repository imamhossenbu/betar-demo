import React, { useState } from 'react';

// Import components from the new components folder
import EntryModal from './components/EntryModal'; // This is imported in TableView now
import TableView from './components/TableView';
import PrintView from './components/PrintView';

// Import initial data from the JSON file
import initialScheduleData from './data/scheduleData.json';

// Main App component that manages page state
const App = () => {
  // State to hold all the schedule data for the table, initialized from the JSON file
  const [scheduleData, setScheduleData] = useState(initialScheduleData);

  // State to hold the programDetails of selected (checked) ceremonies
  const [selectedCeremonies, setSelectedCeremonies] = useState([]);

  // State to control which page is currently displayed: 'table' or 'print'
  const [currentPage, setCurrentPage] = useState('table');

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex items-start justify-center font-inter">
      {/* Conditional rendering based on currentPage state */}
      {currentPage === 'table' ? (
        // If currentPage is 'table', render the TableView component
        <TableView
          scheduleData={scheduleData}
          setScheduleData={setScheduleData}
          selectedCeremonies={selectedCeremonies}
          setSelectedCeremonies={setSelectedCeremonies}
          setCurrentPage={setCurrentPage} // Pass function to change page
        />
      ) : (
        // If currentPage is 'print', render the PrintView component
        <PrintView
          selectedCeremonies={selectedCeremonies}
          setCurrentPage={setCurrentPage} // Pass function to change page
        />
      )}
    </div>
  );
};

export default App;
