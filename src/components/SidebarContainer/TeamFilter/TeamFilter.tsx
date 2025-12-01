/**
 * TeamFilter Component
 * 
 * Dropdown filter for selecting a team
 */

import { useCallback, useMemo } from 'react';
import './TeamFilter.css';
import { TEAMS } from '../../../types/employeeTypes';

interface TeamFilterProps {
  value: string | null;
  onChange: (team: string | null) => void;
  employeeCounts?: Record<string, number>;
}

export function TeamFilter({ value, onChange, employeeCounts }: TeamFilterProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newValue = e.target.value;
      onChange(newValue === '' ? null : newValue);
    },
    [onChange]
  );

  const totalEmployees = useMemo(() => {
    if (!employeeCounts) return null;
    return Object.values(employeeCounts).reduce((sum, count) => sum + count, 0);
  }, [employeeCounts]);

  return (
    <div className="team-filter">
      {/* <label className="team-filter__label" htmlFor="team-select">
        Filter by Team
      </label> */}
      
      <div className="team-filter__select-wrapper">
        <select
          id="team-select"
          className="team-filter__select"
          value={value ?? ''}
          onChange={handleChange}
        >
          <option value="">
            All Teams {totalEmployees !== null && `(${totalEmployees})`}
          </option>
          {TEAMS.map((team:any) => (
            <option key={team} value={team}>
              {team} {employeeCounts && `(${employeeCounts[team] || 0})`}
            </option>
          ))}
        </select>
        
        <svg
          className="team-filter__chevron"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}