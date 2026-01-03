// Filter creation and evaluation utilities

import type { FilterCondition, FilterOperator, FilterLogic, ColumnDataType } from '../types';

/**
 * Operator option for UI display
 */
export interface OperatorOption {
	value: FilterOperator;
	label: string;
}

/**
 * All available operators with labels
 */
const ALL_OPERATORS: OperatorOption[] = [
	{ value: 'equals', label: 'equals' },
	{ value: 'not_equals', label: 'does not equal' },
	{ value: 'contains', label: 'contains' },
	{ value: 'not_contains', label: 'does not contain' },
	{ value: 'starts_with', label: 'starts with' },
	{ value: 'ends_with', label: 'ends with' },
	{ value: 'is_empty', label: 'is empty' },
	{ value: 'is_not_empty', label: 'is not empty' },
	{ value: 'greater_than', label: '>' },
	{ value: 'less_than', label: '<' },
	{ value: 'greater_or_equal', label: '>=' },
	{ value: 'less_or_equal', label: '<=' },
	{ value: 'is_before', label: 'is before' },
	{ value: 'is_after', label: 'is after' }
];

/**
 * Get operators available for a specific data type
 */
export function getOperatorsForType(dataType: ColumnDataType = 'text'): OperatorOption[] {
	switch (dataType) {
		case 'text':
			return ALL_OPERATORS.filter((op) =>
				[
					'equals',
					'not_equals',
					'contains',
					'not_contains',
					'starts_with',
					'ends_with',
					'is_empty',
					'is_not_empty'
				].includes(op.value)
			);

		case 'number':
			return ALL_OPERATORS.filter((op) =>
				[
					'equals',
					'not_equals',
					'greater_than',
					'less_than',
					'greater_or_equal',
					'less_or_equal',
					'is_empty',
					'is_not_empty'
				].includes(op.value)
			);

		case 'date':
			return ALL_OPERATORS.filter((op) =>
				['equals', 'not_equals', 'is_before', 'is_after', 'is_empty', 'is_not_empty'].includes(
					op.value
				)
			);

		case 'boolean':
			return ALL_OPERATORS.filter((op) =>
				['equals', 'is_empty', 'is_not_empty'].includes(op.value)
			);

		case 'select':
			return ALL_OPERATORS.filter((op) =>
				['equals', 'not_equals', 'is_empty', 'is_not_empty'].includes(op.value)
			);

		default:
			return ALL_OPERATORS.filter((op) =>
				[
					'equals',
					'not_equals',
					'contains',
					'not_contains',
					'starts_with',
					'ends_with',
					'is_empty',
					'is_not_empty'
				].includes(op.value)
			);
	}
}

/**
 * Evaluate a single filter condition against a row value
 */
export function evaluateCondition(condition: FilterCondition, rowValue: any): boolean {
	const { operator, value } = condition;

	// Convert to strings for comparison (handles null/undefined)
	const rowStr = String(rowValue || '').toLowerCase();
	const filterStr = String(value || '').toLowerCase();

	switch (operator) {
		case 'equals':
			return rowStr === filterStr;

		case 'not_equals':
			return rowStr !== filterStr;

		case 'contains':
			return rowStr.includes(filterStr);

		case 'not_contains':
			return !rowStr.includes(filterStr);

		case 'starts_with':
			return rowStr.startsWith(filterStr);

		case 'ends_with':
			return rowStr.endsWith(filterStr);

		case 'is_empty':
			return !rowValue || rowStr === '';

		case 'is_not_empty':
			return !!rowValue && rowStr !== '';

		case 'greater_than':
			return Number(rowValue) > Number(value);

		case 'less_than':
			return Number(rowValue) < Number(value);

		case 'greater_or_equal':
			return Number(rowValue) >= Number(value);

		case 'less_or_equal':
			return Number(rowValue) <= Number(value);

		case 'is_before': {
			const rowDate = new Date(rowValue);
			const filterDate = new Date(value);
			return !isNaN(rowDate.getTime()) && !isNaN(filterDate.getTime()) && rowDate < filterDate;
		}

		case 'is_after': {
			const rowDate = new Date(rowValue);
			const filterDate = new Date(value);
			return !isNaN(rowDate.getTime()) && !isNaN(filterDate.getTime()) && rowDate > filterDate;
		}

		default:
			return true;
	}
}

/**
 * Filter data array by multiple conditions with AND or OR logic
 */
export function applyFilters<T extends Record<string, unknown>>(
	data: T[],
	conditions: FilterCondition[],
	logic: FilterLogic = 'and'
): T[] {
	if (conditions.length === 0) return data;

	// Filter out invalid conditions (empty field or value)
	const validConditions = conditions.filter(
		(c) =>
			c.field &&
			(c.operator === 'is_empty' ||
				c.operator === 'is_not_empty' ||
				(c.value !== null && c.value !== undefined && c.value !== ''))
	);

	if (validConditions.length === 0) return data;

	return data.filter((row) => {
		if (logic === 'and') {
			// All conditions must pass (AND logic)
			return validConditions.every((condition) => {
				const rowValue = row[condition.field];
				return evaluateCondition(condition, rowValue);
			});
		} else {
			// At least one condition must pass (OR logic)
			return validConditions.some((condition) => {
				const rowValue = row[condition.field];
				return evaluateCondition(condition, rowValue);
			});
		}
	});
}

/**
 * Create a text filter configuration
 */
export function createTextFilter(columnId: string, value: string): FilterCondition {
	return {
		id: `filter-${Date.now()}`,
		field: columnId,
		operator: 'contains',
		value
	};
}

/**
 * Create a select/dropdown filter configuration
 */
export function createSelectFilter(columnId: string, value: string): FilterCondition {
	return {
		id: `filter-${Date.now()}`,
		field: columnId,
		operator: 'equals',
		value
	};
}

/**
 * Create a numeric filter configuration
 */
export function createNumericFilter(
	columnId: string,
	operator: 'greater_than' | 'less_than' | 'greater_or_equal' | 'less_or_equal',
	value: number
): FilterCondition {
	return {
		id: `filter-${Date.now()}`,
		field: columnId,
		operator,
		value
	};
}
