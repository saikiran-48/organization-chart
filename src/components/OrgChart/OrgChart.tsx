import { useMemo, useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { buildEmployeeTree, buildTeamTree, wouldCreateCycle } from '../../utils/treeUtils';
import './OrgChart.css';
import type { Employee, EmployeeTreeNode } from '../../types/employeeTypes';
import { EmployeeNode } from '../EmployeeNodes/EmployeeNodes';
import { Avatar } from '../../shared/Avatar/Avatar';
import { TeamBadge } from '../../shared/TeamBadge/TeamBadge';

interface OrgChartProps {
  employees: Employee[];    
  selectedTeam: string | null;
  highlightedEmployeeId?: string | null;
  onManagerChange: (employeeId: string, newManagerId: string | null) => Promise<void>;
}

export function OrgChart({
  employees,
  selectedTeam,
  highlightedEmployeeId,
  onManagerChange,
}: OrgChartProps) {
  const [activeEmployee, setActiveEmployee] = useState<EmployeeTreeNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tree = useMemo(() => {
    if (selectedTeam) {
      return buildTeamTree(employees, selectedTeam);
    }
    return buildEmployeeTree(employees);
  }, [employees, selectedTeam]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const employee = active.data.current?.employee as EmployeeTreeNode;
    setActiveEmployee(employee);
    setError(null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveEmployee(null);

      if (!over) return;

      const draggedId = String(active.id);
      const dropIdRaw = String(over.id);
      const dropTargetId = dropIdRaw.startsWith('drop-') ? dropIdRaw.slice(5) : dropIdRaw;

      if (draggedId === dropTargetId) return;

      if (wouldCreateCycle(employees, draggedId, dropTargetId)) {
        setError("Can't assign someone to report to their own subordinate!");
        setTimeout(() => setError(null), 3000);
        return;
      }

      try {
        await onManagerChange(draggedId, dropTargetId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update manager');
        setTimeout(() => setError(null), 3000);
      }
    },
    [employees, onManagerChange]
  );


  if (tree.length === 0) {
    return (
      <div className="org-chart__empty">
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        <h3>No employees to display</h3>
        <p>
          {selectedTeam
            ? `No employees found in ${selectedTeam} team`
            : 'Add employees to see the organization chart'}
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="org-chart">
        {/* Header */}
        <div className="org-chart__header">
          <div className="org-chart__title">
            <h2>Organization Structure</h2>
            <span className="org-chart__count">
              {employees.length} Employees
              {selectedTeam && ` in ${selectedTeam}`}
            </span>
          </div>

          <div className="org-chart__legend">
            <span className="org-chart__legend-item">
              <span className="org-chart__legend-icon org-chart__legend-icon--drag" />
              Drag to reassign
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="org-chart__error" role="alert">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
            {error}
          </div>
        )}

        {/* Chart Content with Zoom */}
        <div 
          className="org-chart__content" 
        >
          <div className="org-chart__tree">
            {tree.map((root) => (
              <EmployeeNode
                key={root.id}
                node={root}
                isHighlighted={highlightedEmployeeId === root.id}
              />
            ))}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeEmployee && (
            <div className="org-chart__drag-preview">
              <Avatar name={activeEmployee.name} size="md" />
              <div className="org-chart__drag-preview-info">
                <span className="org-chart__drag-preview-name">
                  {activeEmployee.name}
                </span>
                <TeamBadge team={activeEmployee.team} size="sm" />
              </div>
            </div>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}