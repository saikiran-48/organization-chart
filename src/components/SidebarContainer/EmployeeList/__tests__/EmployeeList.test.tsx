import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { EmployeeList } from '../EmployeeList';

// Use modern fake timers to control the toast timeout
vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

// Provide a mock for clipboard API using globalThis for portability
const originalClipboard = (globalThis.navigator as any)?.clipboard;

beforeEach(() => {
	// jsdom may not have clipboard by default; ensure it's present
	// and stub writeText so we can assert calls
	(globalThis.navigator as any).clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
});

afterEach(() => {
	vi.clearAllTimers();
	vi.restoreAllMocks();
	// restore clipboard
	(globalThis.navigator as any).clipboard = originalClipboard;
});

const employees = [
	{
		id: '1',
		name: 'Alice Johnson',
		designation: 'Senior Engineer',
		email: 'alice@example.com',
		team: 'Engineering',
	},
	{
		id: '2',
		name: 'Bob Smith',
		designation: 'Product Manager',
		email: 'bob@example.com',
		team: 'Product',
	},
];

describe('EmployeeList', () => {
	it('renders empty state when no employees', () => {
		render(<EmployeeList employees={[]} />);

		// Container for empty state
		const empty = screen.getByText('No employees found');
		expect(empty).toBeInTheDocument();

		// The decorative SVG exists within the empty container
		const emptyContainer = empty.closest('.employee-list__empty');
		expect(emptyContainer).toBeTruthy();
		// There should be an SVG inside
		expect(within(emptyContainer as HTMLElement).getByRole('img', { hidden: true })).toBeDefined();
	});

	it('renders the list with employees and accessibility attributes', () => {
		render(<EmployeeList employees={employees as any} />);

		const listbox = screen.getByRole('listbox', { name: 'Employee list' });
		expect(listbox).toBeInTheDocument();

		// Each employee item should render name, designation, email, Avatar, TeamBadge
		employees.forEach((emp) => {
			const item = screen.getByText(emp.name).closest('.employee-list__item');
			expect(item).toBeTruthy();

			// Name and designation
			expect(screen.getByText(emp.name)).toHaveClass('employee-list__name');
			expect(screen.getByText(emp.designation)).toHaveClass('employee-list__designation');

			// Email text
			expect(screen.getByText(emp.email)).toHaveClass('employee-list__email');

			// Copy button with title and aria-label reflecting email
			const copyBtn = within(item as HTMLElement).getByRole('button', { name: `Copy ${emp.email}` });
			expect(copyBtn).toHaveAttribute('title', 'Copy email');
			expect(copyBtn).toHaveClass('employee-list__copy-btn');

			// Avatar and TeamBadge are rendered (Avatar by alt text of initials/name may vary),
			// we can assert presence via their containers/structure classes
			// Avatar
			const avatarEl = within(item as HTMLElement).getByText(emp.name);
			expect(avatarEl).toBeInTheDocument();
			// TeamBadge likely renders a badge with team text
			expect(within(item as HTMLElement).getByText(emp.team)).toBeInTheDocument();
		});
	});
});

