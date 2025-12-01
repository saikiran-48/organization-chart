import { Avatar } from '../../../shared/Avatar/Avatar';
import { TeamBadge } from '../../../shared/TeamBadge/TeamBadge';
import type { Employee } from '../../../types/employeeTypes';
import { useState } from 'react';
import './EmployeeList.css';

interface EmployeeListProps {
  employees: Employee[];
}

export function EmployeeList({ employees }: EmployeeListProps) {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2000);
  };

  if (employees.length === 0) {
    return (
      <div className="employee-list__empty">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
        <p>No employees found</p>
      </div>
    );
  }

  return (
    <div className="employee-list" role="listbox" aria-label="Employee list">
      {employees.map((employee:any) => (
        <div key={employee.id} className="employee-list__item">
          <Avatar name={employee.name} size="md" />
          <span className="employee-list__name">{employee.name}</span>
          <span className="employee-list__designation">{employee.designation}</span>
          <div className="employee-list__email-wrapper">
            <span className="employee-list__email">{employee.email}</span>
            <div className="employee-list__copy-container">
              <button
                className="employee-list__copy-btn"
                onClick={() => handleCopyEmail(employee?.email)}
                title="Copy email"
                aria-label={`Copy ${employee.email}`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </button>
              {copiedEmail === employee.email && (
                <div className="employee-list__toast">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Copied!
                </div>
              )}
            </div>
          </div>
          <TeamBadge team={employee.team} size="sm" />
        </div>
      ))}
    </div>
  );
}