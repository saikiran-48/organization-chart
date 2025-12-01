import { createServer, Response } from 'miragejs';
import type { Employee } from '../types/employeeTypes';
import { generateEmployees } from './data';

export function makeServer() {
  return createServer({
    seeds(server) {
      const employees = generateEmployees();
      employees.forEach((emp) => {
        server.db.loadData({ employees: [emp] });
      });
    },

    routes() {
      this.namespace = 'api';
      this.timing = 300;

      this.get('/employees', (schema) => {
        const employees = schema.db.employees;
        return { employees };
      });

      this.get('/employees/:id', (schema, request) => {
        const id = request.params.id;
        const employee = schema.db.employees.find(id);

        if (!employee) {
          return new Response(404, {}, { error: 'Employee not found' });
        }

        return { employee };
      });

      this.post('/employees', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const newId = String(Math.max(...schema.db.employees.map((e: Employee) => parseInt(e.id))) + 1);

        const employee = {
          id: newId,
          ...attrs,
        };

        schema.db.employees.insert(employee);
        return { employee };
      });

      this.patch('/employees/:id', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        const employee = schema.db.employees.find(id);

        if (!employee) {
          return new Response(404, {}, { error: 'Employee not found' });
        }

        if (attrs.managerId) {
          const wouldCreateCycle = checkForCycle(
            schema.db.employees,
            id,
            attrs.managerId
          );

          if (wouldCreateCycle) {
            return new Response(
              400,
              {},
              { error: 'Cannot assign someone to report to their own subordinate!' }
            );
          }
        }

        schema.db.employees.update(id, attrs);
        return { employee: schema.db.employees.find(id) };
      });

      this.delete('/employees/:id', (schema, request) => {
        const id = request.params.id;
        schema.db.employees.remove(id);
        return new Response(200, {}, { success: true });
      });

      this.get('/teams', (schema) => {
        const employees = schema.db.employees;
        const teams = [...new Set(employees.map((e: Employee) => e.team))];
        return { teams };
      });
    },
  });
}

function checkForCycle(
  employees: Employee[],
  employeeId: string,
  newManagerId: string
): boolean {
  const getSubordinates = (id: string): string[] => {
    const directReports = employees
      .filter((e: any) => e.managerId === id)
      .map((e: any) => e.id);

    const allSubordinates = [...directReports];
    directReports.forEach((reportId) => {
      allSubordinates.push(...getSubordinates(reportId));
    });

    return allSubordinates;
  };

  const subordinates = getSubordinates(employeeId);
  return subordinates.includes(newManagerId);
}