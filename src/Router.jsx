// Router.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useState } from 'react';
import TableView from './components/TableView';
import PrintView from './components/PrintView';
import initialScheduleData from './data/scheduleData.json';
import SelectedRowsView from './components/SelectedRowView';
import ReportView from './components/ReportView';
import Layout from './Layout';

const AppRouter = () => {
    const [scheduleData, setScheduleData] = useState(initialScheduleData);
    const [selectedCeremonies, setSelectedCeremonies] = useState([]);

    const router = createBrowserRouter([
        {
            path: '/',
            element: <Layout />,
            children: [
                {
                    path: '/',
                    element: (
                        <TableView
                            scheduleData={scheduleData}
                            setScheduleData={setScheduleData}
                            selectedCeremonies={selectedCeremonies}
                            setSelectedCeremonies={setSelectedCeremonies}
                        />
                    )
                },
                {
                    path: 'print',
                    element: <PrintView selectedCeremonies={selectedCeremonies} />
                },
                {
                    path: 'selected',
                    element: <SelectedRowsView />
                },
                {
                    path: 'report',
                    element: <ReportView />
                }
            ]
        }
    ]);

    return <RouterProvider router={router} />;
};

export default AppRouter;
