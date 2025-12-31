import { describe, it, expect } from 'vitest';
import type { ColumnDef } from '@tanstack/svelte-table';
import type { ColumnOrderMode } from '../types';

// Helper functions extracted from FilterCondition.svelte for testing
// These mirror the logic in the component

function getColumnId(col: ColumnDef<any>): string {
	return ((col as any).accessorKey || col.id || '') as string;
}

function getColumnLabel(col: ColumnDef<any>): string {
	return String(col.header || getColumnId(col));
}

function orderColumns(
	columns: ColumnDef<any>[],
	orderMode: ColumnOrderMode,
	columnOrder: string[]
): ColumnDef<any>[] {
	switch (orderMode) {
		case 'alphabetical':
			return [...columns].sort((a, b) => {
				const labelA = getColumnLabel(a).toLowerCase();
				const labelB = getColumnLabel(b).toLowerCase();
				return labelA.localeCompare(labelB);
			});

		case 'ui':
			return [...columns].sort((a, b) => {
				const idA = getColumnId(a);
				const idB = getColumnId(b);
				const indexA = columnOrder.indexOf(idA);
				const indexB = columnOrder.indexOf(idB);
				const posA = indexA === -1 ? 999 : indexA;
				const posB = indexB === -1 ? 999 : indexB;
				return posA - posB;
			});

		case 'definition':
		default:
			return columns;
	}
}

describe('Column Ordering Logic', () => {
	// Sample columns for testing
	const columns: ColumnDef<any>[] = [
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'email', header: 'Email Address' },
		{ accessorKey: 'age', header: 'Age' },
		{ accessorKey: 'status', header: 'Status' },
		{ accessorKey: 'created', header: 'Created Date' }
	];

	describe('getColumnId', () => {
		it('should return accessorKey when available', () => {
			const col = { accessorKey: 'test', header: 'Test' };
			expect(getColumnId(col)).toBe('test');
		});

		it('should fall back to id when accessorKey is not available', () => {
			const col = { id: 'testId', header: 'Test' };
			expect(getColumnId(col)).toBe('testId');
		});

		it('should return empty string when neither accessorKey nor id is available', () => {
			const col = { header: 'Test' };
			expect(getColumnId(col)).toBe('');
		});
	});

	describe('getColumnLabel', () => {
		it('should return header when available', () => {
			const col = { accessorKey: 'test', header: 'Test Label' };
			expect(getColumnLabel(col)).toBe('Test Label');
		});

		it('should fall back to column id when header is not available', () => {
			const col = { accessorKey: 'testKey' };
			expect(getColumnLabel(col)).toBe('testKey');
		});
	});

	describe('orderColumns - definition mode', () => {
		it('should return columns in original order', () => {
			const ordered = orderColumns(columns, 'definition', []);

			expect(ordered.map((c) => getColumnId(c))).toEqual([
				'name',
				'email',
				'age',
				'status',
				'created'
			]);
		});

		it('should not modify the original array', () => {
			const original = [...columns];
			orderColumns(columns, 'definition', []);

			expect(columns).toEqual(original);
		});
	});

	describe('orderColumns - alphabetical mode', () => {
		it('should sort columns alphabetically by header', () => {
			const ordered = orderColumns(columns, 'alphabetical', []);

			expect(ordered.map((c) => getColumnId(c))).toEqual([
				'age', // Age
				'created', // Created Date
				'email', // Email Address
				'name', // Name
				'status' // Status
			]);
		});

		it('should be case-insensitive', () => {
			const mixedCaseColumns: ColumnDef<any>[] = [
				{ accessorKey: 'zebra', header: 'zebra' },
				{ accessorKey: 'Apple', header: 'Apple' },
				{ accessorKey: 'banana', header: 'Banana' }
			];

			const ordered = orderColumns(mixedCaseColumns, 'alphabetical', []);

			expect(ordered.map((c) => getColumnId(c))).toEqual(['Apple', 'banana', 'zebra']);
		});

		it('should not modify the original array', () => {
			const original = [...columns];
			orderColumns(columns, 'alphabetical', []);

			expect(columns).toEqual(original);
		});
	});

	describe('orderColumns - ui mode', () => {
		it('should sort columns by columnOrder array', () => {
			const columnOrder = ['status', 'name', 'age', 'email', 'created'];
			const ordered = orderColumns(columns, 'ui', columnOrder);

			expect(ordered.map((c) => getColumnId(c))).toEqual([
				'status',
				'name',
				'age',
				'email',
				'created'
			]);
		});

		it('should place columns not in columnOrder at the end', () => {
			const columnOrder = ['status', 'name']; // Only 2 columns specified
			const ordered = orderColumns(columns, 'ui', columnOrder);

			// First two should be in specified order
			expect(getColumnId(ordered[0])).toBe('status');
			expect(getColumnId(ordered[1])).toBe('name');

			// Remaining columns should come after (in their relative original order among themselves)
			const remainingIds = ordered.slice(2).map((c) => getColumnId(c));
			expect(remainingIds).toContain('email');
			expect(remainingIds).toContain('age');
			expect(remainingIds).toContain('created');
		});

		it('should handle empty columnOrder array', () => {
			const ordered = orderColumns(columns, 'ui', []);

			// All columns go to position 999, so relative order depends on sort stability
			// They should all be present
			expect(ordered.length).toBe(columns.length);
		});

		it('should handle columnOrder with non-existent column ids', () => {
			const columnOrder = ['nonexistent', 'status', 'name'];
			const ordered = orderColumns(columns, 'ui', columnOrder);

			// status and name should come first (at indices 1 and 2 in columnOrder)
			expect(getColumnId(ordered[0])).toBe('status');
			expect(getColumnId(ordered[1])).toBe('name');
		});

		it('should not modify the original array', () => {
			const original = [...columns];
			const columnOrder = ['status', 'name', 'age'];
			orderColumns(columns, 'ui', columnOrder);

			expect(columns).toEqual(original);
		});
	});

	describe('order mode cycling', () => {
		const modes: ColumnOrderMode[] = ['definition', 'ui', 'alphabetical'];

		it('should cycle through modes in order', () => {
			let currentIndex = 0;

			// Simulate cycling
			for (let i = 0; i < 6; i++) {
				const currentMode = modes[currentIndex];
				currentIndex = (currentIndex + 1) % modes.length;
				const nextMode = modes[currentIndex];

				if (currentMode === 'definition') {
					expect(nextMode).toBe('ui');
				} else if (currentMode === 'ui') {
					expect(nextMode).toBe('alphabetical');
				} else if (currentMode === 'alphabetical') {
					expect(nextMode).toBe('definition');
				}
			}
		});
	});
});

describe('Column Ordering with Hidden Columns', () => {
	// Simulating a scenario where some columns are hidden in the UI
	const allColumns: ColumnDef<any>[] = [
		{ accessorKey: 'id', header: 'ID' },
		{ accessorKey: 'name', header: 'Name' },
		{ accessorKey: 'email', header: 'Email' },
		{ accessorKey: 'hidden1', header: 'Hidden Field 1' },
		{ accessorKey: 'status', header: 'Status' },
		{ accessorKey: 'hidden2', header: 'Hidden Field 2' }
	];

	it('should include all columns in filter picker regardless of visibility', () => {
		// The filter picker receives ALL columns, not just visible ones
		// This test documents expected behavior
		const ordered = orderColumns(allColumns, 'alphabetical', []);

		expect(ordered.length).toBe(6);
		expect(ordered.map((c) => getColumnId(c))).toContain('hidden1');
		expect(ordered.map((c) => getColumnId(c))).toContain('hidden2');
	});

	it('should order hidden columns correctly in ui mode', () => {
		// columnOrder from UI might not include hidden columns
		const columnOrder = ['name', 'email', 'status', 'id'];
		const ordered = orderColumns(allColumns, 'ui', columnOrder);

		// Visible columns come first in UI order
		expect(getColumnId(ordered[0])).toBe('name');
		expect(getColumnId(ordered[1])).toBe('email');
		expect(getColumnId(ordered[2])).toBe('status');
		expect(getColumnId(ordered[3])).toBe('id');

		// Hidden columns (not in columnOrder) go to end
		const lastTwoIds = ordered.slice(4).map((c) => getColumnId(c));
		expect(lastTwoIds).toContain('hidden1');
		expect(lastTwoIds).toContain('hidden2');
	});
});
