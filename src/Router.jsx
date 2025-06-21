// Router.jsx
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import TableView from './components/TableView';
import PrintView from './components/PrintView';
import initialScheduleData from './data/scheduleData.json';
import SelectedRowsView from './components/SelectedRowView';
import ReportView from './components/ReportView';

const Layout = () => (
    <div>
        <Outlet />
    </div>
);

const AppRouter = () => {
    const [scheduleData, setScheduleData] = useState(initialScheduleData);
    const [selectedCeremonies, setSelectedCeremonies] = useState([]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route
                        path="schedule/:day/:part"
                        element={
                            <TableView
                                scheduleData={scheduleData}
                                setScheduleData={setScheduleData}
                                selectedCeremonies={selectedCeremonies}
                                setSelectedCeremonies={setSelectedCeremonies}
                            />
                        }
                    />
                    <Route
                        path="print"
                        element={<PrintView selectedCeremonies={selectedCeremonies} />}
                    />
                    <Route path="selected" element={<SelectedRowsView />} />
                    <Route path="report" element={<ReportView />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default AppRouter;
