/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrgChartPage } from '../OrgChartPage';

// Mock useEmployees hook (module path relative to this test file)
vi.mock('../../hooks/useEmployees', () => {
    return {
        useEmployees: vi.fn(),
    };
});

// Capture props passed to OrgChart by mocking the component
let lastOrgChartProps: any = null;
vi.mock('../../components/OrgChart/OrgChart', () => {
    return {
        OrgChart: (props: any) => {
            lastOrgChartProps = props;
            return <div data-testid="orgchart-mock" />;
        },
    };
});

// Get the mocked hook for easier control per test
import { useEmployees } from '../../hooks/useEmployees';

describe('OrgChartPage', () => {
    beforeEach(() => {
        lastOrgChartProps = null;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state', () => {
        //@ts-ignore
        (useEmployees as unknown as vi.Mock).mockReturnValue({
            employees: [],
            updateEmployeeManager: vi.fn(),
            loading: true,
            error: null,
        });

        render(<OrgChartPage />);
        expect(
            screen.getByText('Loading organization chart...')
        ).toBeInTheDocument();
    });

    it('renders error state', () => {
        //@ts-ignore
        (useEmployees as unknown as vi.Mock).mockReturnValue({
            employees: [],
            updateEmployeeManager: vi.fn(),
            loading: false,
            error: 'Something went wrong',
        });

        render(<OrgChartPage />);
        expect(screen.getByText(/Error: Something went wrong/)).toBeInTheDocument();
    });

    it('renders page header and passes props to OrgChart', () => {
        const employees = [
            { id: '1', name: 'Alice', title: 'CEO', team: 'Management', managerId: null },
            { id: '2', name: 'Bob', title: 'Engineer', team: 'Engineering', managerId: '1' },
        ];
        const updateEmployeeManager = vi.fn();
        //@ts-ignore
        (useEmployees as unknown as vi.Mock).mockReturnValue({
            employees,
            updateEmployeeManager,
            loading: false,
            error: null,
        });

        render(<OrgChartPage />);

        // Header content
        expect(screen.getByRole('heading', { name: 'Organization Chart' })).toBeInTheDocument();
        expect(
            screen.getByText("View and manage your organization's structure")
        ).toBeInTheDocument();

        // OrgChart was rendered (mocked)
        expect(screen.getByTestId('orgchart-mock')).toBeInTheDocument();

        // Props passed into OrgChart
        expect(lastOrgChartProps).toBeTruthy();
        expect(lastOrgChartProps.employees).toEqual(employees);
        expect(lastOrgChartProps.onManagerChange).toBe(updateEmployeeManager);
        expect(lastOrgChartProps.selectedTeam).toBeNull();
    });
});

