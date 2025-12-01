/**
 * Tree Utilities
 * 
 * Functions to convert flat employee list to tree structure
 * and other tree-related operations.
 */

import type { Employee, EmployeeTreeNode } from "../types/employeeTypes";

    
/**
 * Convert a flat list of employees into a tree structure
 * based on the managerId relationships.
 * 
 * Time Complexity: O(n) where n is the number of employees
 * Space Complexity: O(n) for the map and resulting tree
 */
export function buildEmployeeTree(employees: Employee[]): EmployeeTreeNode[] {
  // Create a map for O(1) lookup
  const employeeMap = new Map<string, EmployeeTreeNode>();
  
  // Initialize all employees as tree nodes with empty children
  employees.forEach((emp) => {
    employeeMap.set(emp.id, {
      ...emp,
      children: [],
    });
  });

  const roots: EmployeeTreeNode[] = [];

  // Build the tree by linking children to parents
  employees.forEach((emp) => {
    const node = employeeMap.get(emp.id)!;
    
    if (emp.managerId === null) {
      // No manager = root node
      roots.push(node);
    } else {
      // Add as child to the manager
      const parent = employeeMap.get(emp.managerId);
      if (parent) {
        parent.children.push(node);
      } else {
        // Manager not found - treat as root (data integrity issue)
        console.warn(`Manager ${emp.managerId} not found for ${emp.name}`);
        roots.push(node);
      }
    }
  });

  return roots;
}

/**
 * Filter employees by team and build tree for just that team.
 * Maintains hierarchy within the team.
 */
export function buildTeamTree(
  employees: Employee[],
  team: string
): EmployeeTreeNode[] {
  // Filter to just this team's employees
  const teamEmployees = employees.filter((emp) => emp.team === team);
  const teamIds = new Set(teamEmployees.map((e) => e.id));

  // For team view, we need to find the "roots" within the team
  // A root in team context is someone whose manager is not in the team
  const modifiedEmployees = teamEmployees.map((emp) => ({
    ...emp,
    managerId: emp.managerId && teamIds.has(emp.managerId) 
      ? emp.managerId 
      : null,
  }));

  return buildEmployeeTree(modifiedEmployees);
}

/**
 * Search employees by name, designation, or team
 */
export function searchEmployees(
  employees: Employee[],
  query: string
): Employee[] {
  if (!query.trim()) return employees;
  
  const lowerQuery = query.toLowerCase();
  
  return employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(lowerQuery) ||
      emp.designation.toLowerCase().includes(lowerQuery) ||
      emp.team.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get the path from root to a specific employee
 * Useful for highlighting/expanding ancestors
 */
export function getAncestorPath(
  employees: Employee[],
  employeeId: string
): string[] {
  const employeeMap = new Map(employees.map((e) => [e.id, e]));
  const path: string[] = [];
  
  let currentId: string | null = employeeId;
  
  while (currentId) {
    path.unshift(currentId);
    const employee = employeeMap.get(currentId);
    currentId = employee?.managerId ?? null;
  }
  
  return path;
}

/**
 * Get all subordinates (direct and indirect) of an employee
 */
export function getSubordinates(
  employees: Employee[],
  employeeId: string
): Employee[] {
  const subordinates: Employee[] = [];
  const directReports = employees.filter((e) => e.managerId === employeeId);
  
  directReports.forEach((report) => {
    subordinates.push(report);
    subordinates.push(...getSubordinates(employees, report.id));
  });
  
  return subordinates;
}

/**
 * Check if moving an employee under a new manager would create a cycle
 */
export function wouldCreateCycle(
  employees: Employee[],
  employeeId: string,
  newManagerId: string
): boolean {
  if (employeeId === newManagerId) return true;
  
  const subordinateIds = new Set(
    getSubordinates(employees, employeeId).map((e) => e.id)
  );
  
  return subordinateIds.has(newManagerId);
}

/**
 * Count total employees under a manager (including nested)
 */
export function countSubordinates(node: EmployeeTreeNode): number {
  let count = 0;
  
  node.children.forEach((child: any) => {
    count += 1 + countSubordinates(child);
  });
  
  return count;
}