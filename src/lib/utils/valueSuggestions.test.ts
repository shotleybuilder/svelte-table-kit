import { describe, it, expect } from 'vitest';

// Test helper functions that mirror FilterBar's logic
// These are extracted for testability

/**
 * Check if a column is numeric by sampling values
 */
function isNumericColumn(data: Record<string, any>[], columnId: string): boolean {
	if (!columnId || !data || data.length === 0) return false;

	let numericCount = 0;
	let sampleCount = 0;
	const sampleSize = Math.min(10, data.length);

	for (const row of data) {
		if (sampleCount >= sampleSize) break;
		const val = row[columnId];
		if (val !== null && val !== undefined && val !== '') {
			sampleCount++;
			if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))) {
				numericCount++;
			}
		}
	}

	return sampleCount > 0 && numericCount / sampleCount >= 0.8;
}

/**
 * Get min/max range for numeric columns
 */
function getNumericRange(
	data: Record<string, any>[],
	columnId: string
): { min: number; max: number } | null {
	if (!columnId || !data || data.length === 0) return null;

	if (!isNumericColumn(data, columnId)) {
		return null;
	}

	let min = Infinity;
	let max = -Infinity;

	for (const row of data) {
		const val = row[columnId];
		if (val !== null && val !== undefined && val !== '') {
			const num = typeof val === 'number' ? val : Number(val);
			if (!isNaN(num)) {
				min = Math.min(min, num);
				max = Math.max(max, num);
			}
		}
	}

	return min !== Infinity ? { min, max } : null;
}

/**
 * Extract unique values for a column
 */
function getColumnValues(data: Record<string, any>[], columnId: string): string[] {
	if (!columnId || !data || data.length === 0) return [];

	const values = new Set<string>();
	for (const row of data) {
		const val = row[columnId];
		if (val !== null && val !== undefined && val !== '') {
			values.add(String(val));
		}
	}

	return Array.from(values).sort((a, b) => a.localeCompare(b));
}

describe('isNumericColumn', () => {
	it('returns true for column with all numbers', () => {
		const data = [{ amount: 100 }, { amount: 200 }, { amount: 300 }];
		expect(isNumericColumn(data, 'amount')).toBe(true);
	});

	it('returns true for column with numeric strings', () => {
		const data = [{ amount: '100' }, { amount: '200' }, { amount: '300' }];
		expect(isNumericColumn(data, 'amount')).toBe(true);
	});

	it('returns true for mixed number and numeric string', () => {
		const data = [{ amount: 100 }, { amount: '200' }, { amount: 300 }];
		expect(isNumericColumn(data, 'amount')).toBe(true);
	});

	it('returns false for column with text values', () => {
		const data = [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }];
		expect(isNumericColumn(data, 'name')).toBe(false);
	});

	it('returns false for column with mixed text and numbers (less than 80% numeric)', () => {
		const data = [
			{ value: 'Alice' },
			{ value: 'Bob' },
			{ value: 100 },
			{ value: 'Charlie' },
			{ value: 'Dave' }
		];
		expect(isNumericColumn(data, 'value')).toBe(false);
	});

	it('returns true when 80%+ values are numeric', () => {
		const data = [
			{ value: 100 },
			{ value: 200 },
			{ value: 300 },
			{ value: 400 },
			{ value: 'N/A' }
		];
		expect(isNumericColumn(data, 'value')).toBe(true);
	});

	it('returns false for empty data', () => {
		expect(isNumericColumn([], 'amount')).toBe(false);
	});

	it('returns false for empty column id', () => {
		const data = [{ amount: 100 }];
		expect(isNumericColumn(data, '')).toBe(false);
	});

	it('handles null and undefined values', () => {
		const data = [{ amount: null }, { amount: undefined }, { amount: 100 }, { amount: 200 }];
		expect(isNumericColumn(data, 'amount')).toBe(true);
	});

	it('samples only first 10 rows for large datasets', () => {
		const data = Array.from({ length: 100 }, (_, i) => ({
			amount: i < 10 ? 100 : 'text' // First 10 are numbers, rest are text
		}));
		expect(isNumericColumn(data, 'amount')).toBe(true);
	});
});

describe('getNumericRange', () => {
	it('returns min and max for numeric column', () => {
		const data = [{ amount: 100 }, { amount: 50 }, { amount: 200 }];
		expect(getNumericRange(data, 'amount')).toEqual({ min: 50, max: 200 });
	});

	it('returns null for non-numeric column', () => {
		const data = [{ name: 'Alice' }, { name: 'Bob' }];
		expect(getNumericRange(data, 'name')).toBeNull();
	});

	it('handles numeric strings', () => {
		const data = [{ amount: '100' }, { amount: '50' }, { amount: '200' }];
		expect(getNumericRange(data, 'amount')).toEqual({ min: 50, max: 200 });
	});

	it('handles negative numbers', () => {
		const data = [{ amount: -50 }, { amount: 0 }, { amount: 100 }];
		expect(getNumericRange(data, 'amount')).toEqual({ min: -50, max: 100 });
	});

	it('handles single value', () => {
		const data = [{ amount: 100 }];
		expect(getNumericRange(data, 'amount')).toEqual({ min: 100, max: 100 });
	});

	it('returns null for empty data', () => {
		expect(getNumericRange([], 'amount')).toBeNull();
	});

	it('returns null for empty column id', () => {
		const data = [{ amount: 100 }];
		expect(getNumericRange(data, '')).toBeNull();
	});

	it('ignores null and undefined values when calculating range', () => {
		const data = [{ amount: null }, { amount: 100 }, { amount: undefined }, { amount: 200 }];
		expect(getNumericRange(data, 'amount')).toEqual({ min: 100, max: 200 });
	});

	it('handles decimal numbers', () => {
		const data = [{ amount: 1.5 }, { amount: 2.7 }, { amount: 0.3 }];
		expect(getNumericRange(data, 'amount')).toEqual({ min: 0.3, max: 2.7 });
	});
});

describe('getColumnValues', () => {
	it('extracts unique values from column', () => {
		const data = [{ status: 'Active' }, { status: 'Pending' }, { status: 'Active' }];
		expect(getColumnValues(data, 'status')).toEqual(['Active', 'Pending']);
	});

	it('returns sorted values', () => {
		const data = [{ name: 'Zara' }, { name: 'Alice' }, { name: 'Bob' }];
		expect(getColumnValues(data, 'name')).toEqual(['Alice', 'Bob', 'Zara']);
	});

	it('converts numbers to strings', () => {
		const data = [{ amount: 100 }, { amount: 200 }, { amount: 100 }];
		expect(getColumnValues(data, 'amount')).toEqual(['100', '200']);
	});

	it('returns empty array for empty data', () => {
		expect(getColumnValues([], 'status')).toEqual([]);
	});

	it('returns empty array for empty column id', () => {
		const data = [{ status: 'Active' }];
		expect(getColumnValues(data, '')).toEqual([]);
	});

	it('ignores null and undefined values', () => {
		const data = [
			{ status: 'Active' },
			{ status: null },
			{ status: undefined },
			{ status: 'Pending' }
		];
		expect(getColumnValues(data, 'status')).toEqual(['Active', 'Pending']);
	});

	it('ignores empty string values', () => {
		const data = [{ status: 'Active' }, { status: '' }, { status: 'Pending' }];
		expect(getColumnValues(data, 'status')).toEqual(['Active', 'Pending']);
	});

	it('handles mixed types', () => {
		const data = [{ value: 'text' }, { value: 123 }, { value: true }];
		expect(getColumnValues(data, 'value')).toEqual(['123', 'text', 'true']);
	});

	it('handles many unique values', () => {
		const data = Array.from({ length: 100 }, (_, i) => ({ id: `item-${i}` }));
		const values = getColumnValues(data, 'id');
		expect(values).toHaveLength(100);
		expect(values[0]).toBe('item-0');
	});
});

describe('integration: value suggestions workflow', () => {
	const sampleData = [
		{ id: 1, name: 'Alice', status: 'Active', amount: 100 },
		{ id: 2, name: 'Bob', status: 'Pending', amount: 200 },
		{ id: 3, name: 'Charlie', status: 'Active', amount: 150 },
		{ id: 4, name: 'Diana', status: 'Inactive', amount: 75 },
		{ id: 5, name: 'Eve', status: 'Active', amount: 300 }
	];

	it('correctly identifies numeric vs text columns', () => {
		expect(isNumericColumn(sampleData, 'id')).toBe(true);
		expect(isNumericColumn(sampleData, 'amount')).toBe(true);
		expect(isNumericColumn(sampleData, 'name')).toBe(false);
		expect(isNumericColumn(sampleData, 'status')).toBe(false);
	});

	it('provides range for numeric columns', () => {
		expect(getNumericRange(sampleData, 'amount')).toEqual({ min: 75, max: 300 });
		expect(getNumericRange(sampleData, 'id')).toEqual({ min: 1, max: 5 });
	});

	it('provides unique values for text columns', () => {
		expect(getColumnValues(sampleData, 'status')).toEqual(['Active', 'Inactive', 'Pending']);
		expect(getColumnValues(sampleData, 'name')).toEqual([
			'Alice',
			'Bob',
			'Charlie',
			'Diana',
			'Eve'
		]);
	});

	it('provides unique values for numeric columns too', () => {
		expect(getColumnValues(sampleData, 'amount')).toEqual(['100', '150', '200', '300', '75']);
	});
});
