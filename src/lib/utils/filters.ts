// Filter creation utilities

/**
 * Create a text filter configuration
 */
export function createTextFilter(columnId: string, value: string) {
	return {
		columnId,
		operator: 'contains' as const,
		value
	};
}

/**
 * Create a select/dropdown filter configuration
 */
export function createSelectFilter(columnId: string, value: string) {
	return {
		columnId,
		operator: 'equals' as const,
		value
	};
}

/**
 * Create a date range filter configuration
 */
export function createDateRangeFilter(columnId: string, start: string, end: string) {
	return {
		columnId,
		operator: 'between' as const,
		value: [start, end]
	};
}

/**
 * Create a numeric range filter configuration
 */
export function createNumericRangeFilter(columnId: string, min: number, max: number) {
	return {
		columnId,
		operator: 'between' as const,
		value: [min, max]
	};
}
