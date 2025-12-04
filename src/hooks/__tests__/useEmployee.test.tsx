import { renderHook, act, waitFor } from '@testing-library/react';
import { useEmployees } from "../useEmployees";
import { vi, describe, beforeEach, it, expect } from 'vitest';

// Helper to mock global fetch per test case
function mockFetchOnce(responseInit: Partial<Omit<Response, 'json'>> & { json?: any }) {
	const ok = responseInit.ok ?? true;
	const status = responseInit.status ?? (ok ? 200 : 500);
	const jsonData = responseInit.json ?? {};
	(globalThis as any).fetch = vi.fn().mockResolvedValue({
		ok,
		status,
		json: vi.fn().mockResolvedValue(jsonData),
	});
}

describe('useEmployees hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('initially fetches employees successfully', async () => {
		mockFetchOnce({ json: { employees: [{ id: '1', name: 'Alice', managerId: null, title: 'Dev', team: 'Eng', avatarUrl: '' }] } });

		const { result } = renderHook(() => useEmployees());

		// loading starts true and becomes false after fetch completes
		expect(result.current.loading).toBe(true);

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBeNull();
		expect(result.current.employees).toHaveLength(1);
		expect(result.current.employees[0].name).toBe('Alice');
	});

	it('handles fetch error on initial load', async () => {
		(globalThis as any).fetch = vi.fn().mockRejectedValue(new Error('Network down'));

		const { result } = renderHook(() => useEmployees());

		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('Network down');
		expect(result.current.employees).toHaveLength(0);
	});

	it('updateEmployeeManager updates local state on success', async () => {
		// First call: initial fetch
		mockFetchOnce({ json: { employees: [{ id: '1', name: 'Alice', managerId: null, title: 'Dev', team: 'Eng', avatarUrl: '' }] } });
		const { result } = renderHook(() => useEmployees());
		await waitFor(() => expect(result.current.loading).toBe(false));

		// Second call: PATCH success
		mockFetchOnce({ ok: true, status: 200, json: { employee: { id: '1', managerId: '42' } } });

		await act(async () => {
			const updated = await result.current.updateEmployeeManager('1', '42');
			expect(updated).toEqual({ id: '1', managerId: '42' });
		});

		expect(result.current.employees[0].managerId).toBe('42');
		expect(result.current.error).toBeNull();
	});

	it('updateEmployeeManager surfaces API error and keeps throwing', async () => {
		mockFetchOnce({ json: { employees: [{ id: '1', name: 'Alice', managerId: null, title: 'Dev', team: 'Eng', avatarUrl: '' }] } });
		const { result } = renderHook(() => useEmployees());
		await waitFor(() => expect(result.current.loading).toBe(false));

		// PATCH returns not ok with error payload
		(globalThis as any).fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 400,
			json: vi.fn().mockResolvedValue({ error: 'Invalid manager' }),
		});

		await expect(result.current.updateEmployeeManager('1', 'bad')).rejects.toThrow('Invalid manager');
		await waitFor(() => expect(result.current.error).toBe('Invalid manager'));
		expect(result.current.employees[0].managerId).toBeNull();
	});

	it('createEmployee appends employee on success', async () => {
		mockFetchOnce({ json: { employees: [] } });
		const { result } = renderHook(() => useEmployees());
		await waitFor(() => expect(result.current.loading).toBe(false));

		mockFetchOnce({ ok: true, status: 201, json: { employee: { id: '2', name: 'Bob', managerId: null, title: 'PM', team: 'Prod', avatarUrl: '' } } });

		await act(async () => {
			const created = await result.current.createEmployee({ name: 'Bob', managerId: null, team: 'Prod', designation: '' });
			expect(created.id).toBe('2');
		});

		expect(result.current.employees).toHaveLength(1);
		expect(result.current.employees[0].name).toBe('Bob');
	});

	it('createEmployee sets error on failure and throws', async () => {
		mockFetchOnce({ json: { employees: [] } });
		const { result } = renderHook(() => useEmployees());
		await waitFor(() => expect(result.current.loading).toBe(false));

		(globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: vi.fn() });

		await expect(
			result.current.createEmployee({ name: 'Eve', managerId: null,  team: 'Eng', designation: '' })
		).rejects.toThrow('Failed to create employee');
		await waitFor(() => expect(result.current.error).toBe('Failed to create employee'));
		expect(result.current.employees).toHaveLength(0);
	});

	it('deleteEmployee removes employee on success', async () => {
		mockFetchOnce({ json: { employees: [{ id: '3', name: 'Zed', managerId: null, title: 'Dev', team: 'Eng', avatarUrl: '' }] } });
		const { result } = renderHook(() => useEmployees());
		await waitFor(() => expect(result.current.loading).toBe(false));

		(globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: true, status: 204, json: vi.fn() });

		await act(async () => {
			await result.current.deleteEmployee('3');
		});

		expect(result.current.employees).toHaveLength(0);
		expect(result.current.error).toBeNull();
	});

	it('deleteEmployee sets error on failure and throws', async () => {
		mockFetchOnce({ json: { employees: [{ id: '4', name: 'Neo', managerId: null, title: 'Dev', team: 'Eng', avatarUrl: '' }] } });
		const { result } = renderHook(() => useEmployees());
		await waitFor(() => expect(result.current.loading).toBe(false));

		(globalThis as any).fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: vi.fn() });

		await expect(result.current.deleteEmployee('4')).rejects.toThrow('Failed to delete employee');
		await waitFor(() => expect(result.current.error).toBe('Failed to delete employee'));
		expect(result.current.employees).toHaveLength(1);
	});

	it('exposes setters for searchQuery and selectedTeam', async () => {
		mockFetchOnce({ json: { employees: [] } });
		const { result } = renderHook(() => useEmployees());
		await waitFor(() => expect(result.current.loading).toBe(false));

		act(() => {
			result.current.setSearchQuery('alice');
			result.current.setSelectedTeam('Eng');
		});

		expect(result.current.searchQuery).toBe('alice');
		expect(result.current.selectedTeam).toBe('Eng');
	});
});

