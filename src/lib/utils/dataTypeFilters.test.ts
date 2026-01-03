import { describe, it, expect } from 'vitest';
import { getOperatorsForType, evaluateCondition } from './filters';
import type { FilterCondition } from '../types';

describe('getOperatorsForType', () => {
	describe('text type', () => {
		it('returns text operators', () => {
			const operators = getOperatorsForType('text');
			const values = operators.map((op) => op.value);

			expect(values).toContain('equals');
			expect(values).toContain('not_equals');
			expect(values).toContain('contains');
			expect(values).toContain('not_contains');
			expect(values).toContain('starts_with');
			expect(values).toContain('ends_with');
			expect(values).toContain('is_empty');
			expect(values).toContain('is_not_empty');
		});

		it('does not include numeric operators', () => {
			const operators = getOperatorsForType('text');
			const values = operators.map((op) => op.value);

			expect(values).not.toContain('greater_than');
			expect(values).not.toContain('less_than');
			expect(values).not.toContain('greater_or_equal');
			expect(values).not.toContain('less_or_equal');
		});

		it('does not include date operators', () => {
			const operators = getOperatorsForType('text');
			const values = operators.map((op) => op.value);

			expect(values).not.toContain('is_before');
			expect(values).not.toContain('is_after');
		});
	});

	describe('number type', () => {
		it('returns numeric operators', () => {
			const operators = getOperatorsForType('number');
			const values = operators.map((op) => op.value);

			expect(values).toContain('equals');
			expect(values).toContain('not_equals');
			expect(values).toContain('greater_than');
			expect(values).toContain('less_than');
			expect(values).toContain('greater_or_equal');
			expect(values).toContain('less_or_equal');
			expect(values).toContain('is_empty');
			expect(values).toContain('is_not_empty');
		});

		it('does not include text-specific operators', () => {
			const operators = getOperatorsForType('number');
			const values = operators.map((op) => op.value);

			expect(values).not.toContain('contains');
			expect(values).not.toContain('not_contains');
			expect(values).not.toContain('starts_with');
			expect(values).not.toContain('ends_with');
		});
	});

	describe('date type', () => {
		it('returns date operators', () => {
			const operators = getOperatorsForType('date');
			const values = operators.map((op) => op.value);

			expect(values).toContain('equals');
			expect(values).toContain('not_equals');
			expect(values).toContain('is_before');
			expect(values).toContain('is_after');
			expect(values).toContain('is_empty');
			expect(values).toContain('is_not_empty');
		});

		it('has exactly 6 operators', () => {
			const operators = getOperatorsForType('date');
			expect(operators).toHaveLength(6);
		});
	});

	describe('boolean type', () => {
		it('returns boolean operators', () => {
			const operators = getOperatorsForType('boolean');
			const values = operators.map((op) => op.value);

			expect(values).toContain('equals');
			expect(values).toContain('is_empty');
			expect(values).toContain('is_not_empty');
		});

		it('has exactly 3 operators', () => {
			const operators = getOperatorsForType('boolean');
			expect(operators).toHaveLength(3);
		});

		it('does not include not_equals', () => {
			const operators = getOperatorsForType('boolean');
			const values = operators.map((op) => op.value);

			expect(values).not.toContain('not_equals');
		});
	});

	describe('select type', () => {
		it('returns select operators', () => {
			const operators = getOperatorsForType('select');
			const values = operators.map((op) => op.value);

			expect(values).toContain('equals');
			expect(values).toContain('not_equals');
			expect(values).toContain('is_empty');
			expect(values).toContain('is_not_empty');
		});

		it('has exactly 4 operators', () => {
			const operators = getOperatorsForType('select');
			expect(operators).toHaveLength(4);
		});
	});

	describe('default behavior', () => {
		it('returns text operators when no type provided', () => {
			const operators = getOperatorsForType();
			const textOperators = getOperatorsForType('text');

			expect(operators).toEqual(textOperators);
		});

		it('returns text operators for unknown type', () => {
			const operators = getOperatorsForType('unknown' as any);
			expect(operators.map((op) => op.value)).toContain('contains');
		});
	});

	describe('operator labels', () => {
		it('provides human-readable labels', () => {
			const operators = getOperatorsForType('text');
			const equals = operators.find((op) => op.value === 'equals');
			const notEquals = operators.find((op) => op.value === 'not_equals');

			expect(equals?.label).toBe('equals');
			expect(notEquals?.label).toBe('does not equal');
		});

		it('uses symbols for numeric comparisons', () => {
			const operators = getOperatorsForType('number');
			const greaterThan = operators.find((op) => op.value === 'greater_than');
			const lessThan = operators.find((op) => op.value === 'less_than');

			expect(greaterThan?.label).toBe('>');
			expect(lessThan?.label).toBe('<');
		});
	});
});

describe('evaluateCondition - date operators', () => {
	describe('is_before', () => {
		it('returns true when row date is before filter date', () => {
			const condition: FilterCondition = {
				id: '1',
				field: 'date',
				operator: 'is_before',
				value: '2024-06-15'
			};
			expect(evaluateCondition(condition, '2024-06-01')).toBe(true);
		});

		it('returns false when row date is after filter date', () => {
			const condition: FilterCondition = {
				id: '1',
				field: 'date',
				operator: 'is_before',
				value: '2024-06-15'
			};
			expect(evaluateCondition(condition, '2024-06-20')).toBe(false);
		});

		it('returns false when dates are equal', () => {
			const condition: FilterCondition = {
				id: '1',
				field: 'date',
				operator: 'is_before',
				value: '2024-06-15'
			};
			expect(evaluateCondition(condition, '2024-06-15')).toBe(false);
		});

		it('returns false for invalid row date', () => {
			const condition: FilterCondition = {
				id: '1',
				field: 'date',
				operator: 'is_before',
				value: '2024-06-15'
			};
			expect(evaluateCondition(condition, 'not-a-date')).toBe(false);
		});

		it('returns false for invalid filter date', () => {
			const condition: FilterCondition = {
				id: '1',
				field: 'date',
				operator: 'is_before',
				value: 'not-a-date'
			};
			expect(evaluateCondition(condition, '2024-06-01')).toBe(false);
		});
	});

	describe('is_after', () => {
		it('returns true when row date is after filter date', () => {
			const condition: FilterCondition = {
				id: '1',
				field: 'date',
				operator: 'is_after',
				value: '2024-06-15'
			};
			expect(evaluateCondition(condition, '2024-06-20')).toBe(true);
		});

		it('returns false when row date is before filter date', () => {
			const condition: FilterCondition = {
				id: '1',
				field: 'date',
				operator: 'is_after',
				value: '2024-06-15'
			};
			expect(evaluateCondition(condition, '2024-06-01')).toBe(false);
		});

		it('returns false when dates are equal', () => {
			const condition: FilterCondition = {
				id: '1',
				field: 'date',
				operator: 'is_after',
				value: '2024-06-15'
			};
			expect(evaluateCondition(condition, '2024-06-15')).toBe(false);
		});

		it('handles Date objects', () => {
			const condition: FilterCondition = {
				id: '1',
				field: 'date',
				operator: 'is_after',
				value: new Date('2024-06-15')
			};
			expect(evaluateCondition(condition, new Date('2024-06-20'))).toBe(true);
		});
	});
});
