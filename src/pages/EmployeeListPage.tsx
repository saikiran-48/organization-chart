import { EmployeeList } from '../components/SidebarContainer/EmployeeList/EmployeeList';
import { SearchBox } from '../components/SidebarContainer/SearchBox/SearchBox';
import { TeamFilter } from '../components/SidebarContainer/TeamFilter/TeamFilter';
import { useEmployees } from '../hooks/useEmployees';
import type { Employee } from '../types/employeeTypes';
import './pageStyles.css';
import { useMemo } from 'react';

export function EmployeeListPage() {
  const {
    employees,
    searchQuery,
    setSearchQuery,
    selectedTeam,
    setSelectedTeam,
    loading,
    error,
  } = useEmployees();

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp: Employee) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.email?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTeam = !selectedTeam || emp.team === selectedTeam;

      return matchesSearch && matchesTeam;
    });
  }, [employees, searchQuery, selectedTeam]);

  const employeeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach((emp) => {
      counts[emp.team] = (counts[emp.team] || 0) + 1;
    });
    return counts;
  }, [employees]);

  if (loading) {
    return <div className="page-loading">Loading employees...</div>;
  }

  if (error) {
    return <div className="page-error">Error: {error}</div>;
  }

  return (
    <div className="page-container employee-list-page">
      <div className="page-header">
        <h1>Team Members</h1>
        <p className="page-subtitle">
          Manage and view all team members across your organization
        </p>
      </div>

      <div className="page-controls">
        <div className="controls-group">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, or role..."
          />
          <TeamFilter
            value={selectedTeam}
            onChange={setSelectedTeam}
            employeeCounts={employeeCounts}
          />
        </div>

        <div className="controls-summary">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>

      <div className="page-content">
        {filteredEmployees.length > 0 ? (
          <EmployeeList employees={filteredEmployees} />
        ) : (
          <div className="empty-state">
            <p>No employees found matching your criteria.</p>
            {selectedTeam && (
              <p className="empty-state-hint">Try clearing the team filter</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}