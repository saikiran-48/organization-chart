/**
 * Employee Data Model
 * 
 * Represents an employee in the organization hierarchy.
 * The Manager field creates the tree structure by pointing to another employee's ID.
 */

export interface Employee {
  id: string;
  name: string;
  designation: string;
  team: string;
  managerId: string | null; // null means top-level (CEO)
  email?: string;
  avatar?: string;
}

/**
 * Tree node representation for the org chart
 * Extends Employee with children for hierarchical rendering
 */
export interface EmployeeTreeNode extends Employee {
  children: EmployeeTreeNode[];
}

/**
 * Available teams in the organization
 */
export type Team = 
  | 'Engineering' 
  | 'Product' 
  | 'Sales' 
  | 'Marketing' 
  | 'Operations' 
  | 'Finance';

export const TEAMS: Team[] = [
  'Engineering',
  'Product',
  'Sales',
  'Marketing',
  'Operations',
  'Finance',
];

/**
 * API response types
 */
export interface EmployeesResponse {
  employees: Employee[];
}

export interface UpdateManagerPayload {
  employeeId: string;
  newManagerId: string | null;
}