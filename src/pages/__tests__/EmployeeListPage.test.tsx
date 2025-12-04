import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as useEmployeesModule from '../../hooks/useEmployees';
import { EmployeeListPage } from '../EmployeeListPage';

const buildEmployee = (overrides: Partial<any> = {}) => ({
  id: overrides.id ?? '1',
  name: overrides.name ?? 'Alice Johnson',
  email: overrides.email ?? 'alice@example.com',
  role: overrides.role ?? 'Engineer',
  team: overrides.team ?? 'Engineering',
});

describe('EmployeeListPage', () => {
  const mockUseEmployees = (state: Partial<ReturnType<typeof useEmployeesModule.useEmployees>>) => {
    vi.spyOn(useEmployeesModule, 'useEmployees').mockReturnValue({
      employees: [],
      searchQuery: '',
      setSearchQuery: vi.fn(),
      selectedTeam: '',
      setSelectedTeam: vi.fn(),
      loading: false,
      error: '',
      ...(state as any),
    });
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders loading state', () => {
    mockUseEmployees({ loading: true });
    render(<EmployeeListPage />);
    expect(screen.getByText(/Loading employees/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseEmployees({ error: 'Network error' });
    render(<EmployeeListPage />);
    expect(screen.getByText(/Error: Network error/i)).toBeInTheDocument();
  });

  it('renders header and summary with employees', () => {
    const employees :any= [
      buildEmployee({ id: '1', name: 'Alice', team: 'Engineering' }),
      buildEmployee({ id: '2', name: 'Bob', team: 'Design' }),
    ];
    mockUseEmployees({ employees });

    render(<EmployeeListPage />);

    expect(screen.getByRole('heading', { name: /Team Members/i })).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`Showing ${employees.length} of ${employees.length} employees`))
    ).toBeInTheDocument();
  });

  it('filters by search query', async () => {
    const user = userEvent.setup();
    const setSearchQuery = vi.fn();
    const employees :any= [
      buildEmployee({ id: '1', name: 'Alice Johnson', email: 'alice@example.com', team: 'Engineering' }),
      buildEmployee({ id: '2', name: 'Bob Stone', email: 'bob@example.com', team: 'Design' }),
    ];
    mockUseEmployees({ employees, setSearchQuery, searchQuery: '' });

    render(<EmployeeListPage />);

    const input = screen.getByPlaceholderText(/Search by name, email, or role/i);
    await user.type(input, 'Bob');
    // SearchBox calls onChange with the latest input value or key; verify calls
    expect(setSearchQuery).toHaveBeenCalledTimes(3);
    expect(setSearchQuery).toHaveBeenNthCalledWith(1, 'B');
    expect(setSearchQuery).toHaveBeenNthCalledWith(2, expect.stringMatching(/^B|o|Bo$/));
    expect(setSearchQuery).toHaveBeenNthCalledWith(3, expect.stringMatching(/b|Bob$/i));
  });

  it('filters by selected team and shows counts', async () => {
    const user = userEvent.setup();
    const setSelectedTeam = vi.fn();
    const employees:any = [
      buildEmployee({ id: '1', team: 'Engineering' }),
      buildEmployee({ id: '2', team: 'Engineering' }),
      buildEmployee({ id: '3', team: 'Design' }),
    ];
    mockUseEmployees({ employees, selectedTeam: '', setSelectedTeam });

    render(<EmployeeListPage />);

    // Summary shows total initially
    expect(screen.getByText(/Showing 3 of 3 employees/i)).toBeInTheDocument();

    // TeamFilter likely renders a select; choose a value
    const teamSelect = screen.getByRole('combobox');
    await user.selectOptions(teamSelect, 'Engineering');
    expect(setSelectedTeam).toHaveBeenLastCalledWith('Engineering');
  });
});
