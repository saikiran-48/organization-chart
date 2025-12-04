import { OrgChart } from '../components/OrgChart/OrgChart';
import { useEmployees } from '../hooks/useEmployees';
import './pageStyles.css';

export function OrgChartPage() {
    const {
        employees,
        updateEmployeeManager,
        loading,
        error,
    } = useEmployees();

    if (loading) {
        return <div className="page-loading">Loading organization chart...</div>;
    }

    if (error) {
        return <div className="page-error">Error: {error}</div>;
    }

    return (
        <div className="page-container org-chart-page">
            <div className="page-header">
                <h1>Organization Chart</h1>
                <p className="page-subtitle">
                    View and manage your organization's structure
                </p>
            </div>

            <div className="page-content org-chart-wrapper">
                <OrgChart
                    employees={employees}
                    onManagerChange={updateEmployeeManager} selectedTeam={null} />
            </div>
        </div>
    );
}