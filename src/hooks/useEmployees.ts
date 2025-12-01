import { useState, useEffect, useCallback } from 'react';
import type { Employee } from '../types/employeeTypes';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');
      const data = await response.json();
      setEmployees(data.employees);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const updateEmployeeManager = useCallback(
    async (employeeId: string, newManagerId: string | null) => {
      try {
        const response = await fetch(`/api/employees/${employeeId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ managerId: newManagerId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update manager');
        }

        const data = await response.json();
        
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === employeeId ? { ...emp, managerId: newManagerId } : emp
          )
        );

        return data.employee;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update manager';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const createEmployee = useCallback(
    async (employeeData: Omit<Employee, 'id'>) => {
      try {
        const response = await fetch('/api/employees', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(employeeData),
        });

        if (!response.ok) {
          throw new Error('Failed to create employee');
        }

        const data = await response.json();
        setEmployees((prev) => [...prev, data.employee]);
        return data.employee;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create employee';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  const deleteEmployee = useCallback(
    async (employeeId: string) => {
      try {
        const response = await fetch(`/api/employees/${employeeId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete employee');
        }

        setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete employee';
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  return {
    employees,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedTeam,
    setSelectedTeam,
    updateEmployeeManager,
    createEmployee,
    deleteEmployee,
    fetchEmployees,
  };
}