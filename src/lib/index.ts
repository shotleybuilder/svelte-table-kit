// Main exports for @sertantai/svelte-table-kit

// Main component
export { default as TableKit } from './TableKit.svelte';

// TypeScript types
export type {
	TableKitProps,
	TableConfig,
	ViewPreset,
	ColumnFilter,
	SortConfig,
	ClassNameMap,
	TableFeatures,
	TableState
} from './types';

// Presets
export { presets } from './presets';

// Utilities for AI configuration
export { generateTableConfig, validateTableConfig, mergeConfigs } from './utils/config';

// Filter utilities
export {
	createTextFilter,
	createSelectFilter,
	createDateRangeFilter,
	createNumericRangeFilter
} from './utils/filters';

// Formatters
export { formatDate, formatCurrency, formatNumber, formatPercent } from './utils/formatters';
