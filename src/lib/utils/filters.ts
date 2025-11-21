// Filter creation and evaluation utilities

import type { FilterCondition, FilterOperator, FilterLogic } from '../types';

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

		default:
			return true;
	}
}

/**
 * Filter data array by multiple conditions with AND or OR logic
 */
export function applyFilters<T extends Record<string, any>>(
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
