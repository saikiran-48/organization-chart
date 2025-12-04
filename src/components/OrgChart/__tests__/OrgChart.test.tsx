import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OrgChart } from '../OrgChart';

// Mock dnd-kit to make drag interactions testable and deterministic
vi.mock('@dnd-kit/core', () => {
	return {
		// Minimal types/exports used in component
		PointerSensor: {},
		KeyboardSensor: {},
		closestCenter: vi.fn(),
		useSensor: vi.fn(),
		useSensors: vi.fn(() => []),
		// Custom DndContext that exposes buttons to trigger handlers
		DndContext: ({ onDragStart, onDragEnd, children }: any) => (
			<div data-testid="mock-dnd-context">
				<button
					data-testid="trigger-drag-start"
					onClick={() =>
						onDragStart?.({
							active: {
								id: 'emp-1',
								data: { current: { employee: { id: 'emp-1', name: 'Alice', team: 'Engineering' } } },
							},
						})
					}
				/>
				<button
					data-testid="trigger-drag-end-success"
					onClick={() => onDragEnd?.({ active: { id: 'emp-1' }, over: { id: 'drop-emp-2' } })}
				/>
				<button
					data-testid="trigger-drag-end-cycle"
					onClick={() => onDragEnd?.({ active: { id: 'emp-1' }, over: { id: 'drop-emp-2' } })}
				/>
				{children}
			</div>
		),
		DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
	};
});

// Mock tree utilities for predictable rendering and cycle checks
const buildEmployeeTreeMock = vi.fn();
const buildTeamTreeMock = vi.fn();
const wouldCreateCycleMock = vi.fn();

vi.mock('../../../utils/treeUtils', () => ({
	buildEmployeeTree: (...args: any[]) => buildEmployeeTreeMock(...args),
	buildTeamTree: (...args: any[]) => buildTeamTreeMock(...args),
	wouldCreateCycle: (...args: any[]) => wouldCreateCycleMock(...args),
}));

// Mock EmployeeNode to render node name reliably without complex internals
vi.mock('../../EmployeeNodes/EmployeeNodes', () => ({
	EmployeeNode: ({ node }: any) => (
		<div data-testid={`employee-node-${node.id}`}>{node.name}</div>
	),
}));

// Mock Avatar and TeamBadge used in DragOverlay
vi.mock('../../shared/Avatar/Avatar', () => ({
	Avatar: ({ name }: any) => <span data-testid="avatar">{name}</span>,
}));
vi.mock('../../shared/TeamBadge/TeamBadge', () => ({
	TeamBadge: ({ team }: any) => <span data-testid="team-badge">{team}</span>,
}));

// Common employees used across tests
const employees:any = [
	{ id: 'emp-1', name: 'Alice', team: 'Engineering', managerId: null },
	{ id: 'emp-2', name: 'Bob', team: 'Engineering', managerId: 'emp-1' },
	{ id: 'emp-3', name: 'Carol', team: 'Design', managerId: null },
];

// A simple tree structure matching OrgChart expectations
function makeTree() {
	return [
		{
			id: 'emp-1',
			name: 'Alice',
			team: 'Engineering',
			children: [
				{ id: 'emp-2', name: 'Bob', team: 'Engineering', children: [] },
			],
		},
		{
			id: 'emp-3',
			name: 'Carol',
			team: 'Design',
			children: [],
		},
	];
}

beforeEach(() => {
	buildEmployeeTreeMock.mockReset();
	buildTeamTreeMock.mockReset();
	wouldCreateCycleMock.mockReset();
});

afterEach(() => {
	// Ensure timers are real at end of each test
	vi.useRealTimers();
});

describe('OrgChart', () => {
	it('renders empty state when no employees', () => {
		buildEmployeeTreeMock.mockReturnValue([]);
		const onManagerChange = vi.fn();

		render(
			<OrgChart
				employees={[]}
				selectedTeam={null}
				highlightedEmployeeId={null}
				onManagerChange={onManagerChange}
			/>
		);

		expect(screen.getByText('No employees to display')).toBeInTheDocument();
		expect(
			screen.getByText('Add employees to see the organization chart')
		).toBeInTheDocument();
	}, 10000);

	it('renders empty state with team-specific message', () => {
		buildTeamTreeMock.mockReturnValue([]);
		const onManagerChange = vi.fn();

		render(
			<OrgChart
				employees={employees}
				selectedTeam={'Engineering'}
				highlightedEmployeeId={null}
				onManagerChange={onManagerChange}
			/>
		);

		expect(screen.getByText('No employees to display')).toBeInTheDocument();
		expect(
			screen.getByText('No employees found in Engineering team')
		).toBeInTheDocument();
	}, 10000);

	it('renders header with count and team label, and tree nodes', () => {
		buildEmployeeTreeMock.mockReturnValue(makeTree());
		const onManagerChange = vi.fn();

		render(
			<OrgChart
				employees={employees}
				selectedTeam={null}
				highlightedEmployeeId={'emp-1'}
				onManagerChange={onManagerChange}
			/>
		);

		expect(screen.getByText('Organization Structure')).toBeInTheDocument();
		expect(screen.getByText(/3 Employees/)).toBeInTheDocument();
		expect(screen.getByText('Drag to reassign')).toBeInTheDocument();

		// Nodes rendered via EmployeeNode (at least roots should appear)
		expect(screen.getByText('Alice')).toBeInTheDocument();
		expect(screen.getByText('Carol')).toBeInTheDocument();
	}, 10000);

	it('uses team tree when selectedTeam is provided', () => {
		buildTeamTreeMock.mockReturnValue([
			{ id: 'emp-1', name: 'Alice', team: 'Engineering', children: [] },
		]);
		const onManagerChange = vi.fn();

		render(
			<OrgChart
				employees={employees}
				selectedTeam={'Engineering'}
				highlightedEmployeeId={null}
				onManagerChange={onManagerChange}
			/>
		);

		// Header shows team label
		expect(screen.getByText(/3 Employees in Engineering/)).toBeInTheDocument();
		// Only the team tree root rendered
		expect(screen.getByText('Alice')).toBeInTheDocument();
	}, 10000);

	it('on drag end: calls onManagerChange for valid reassignment', async () => {
		buildEmployeeTreeMock.mockReturnValue(makeTree());
		wouldCreateCycleMock.mockReturnValue(false);
		const onManagerChange = vi.fn().mockResolvedValue(undefined);
		const user = userEvent.setup();

		render(
			<OrgChart
				employees={employees}
				selectedTeam={null}
				highlightedEmployeeId={null}
				onManagerChange={onManagerChange}
			/>
		);

		await user.click(screen.getByTestId('trigger-drag-end-success'));

		expect(onManagerChange).toHaveBeenCalledWith('emp-1', 'emp-2');
	}, 10000);

});

