import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout/AppLayout';
import { EmployeeListPage } from './pages/EmployeeListPage';
import { OrgChartPage } from './pages/OrgChartPage';
import ErrorPage from './components/ErrorPage/ErrorPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/employee-list" element={<AppLayout><EmployeeListPage /></AppLayout>} />
      <Route path="/org-chart" element={<AppLayout><OrgChartPage /></AppLayout>} />
      <Route path="/" element={<AppLayout><EmployeeListPage /></AppLayout>} />
      <Route path="*" element={<AppLayout><ErrorPage /></AppLayout>} />
    </Routes>
  );
}