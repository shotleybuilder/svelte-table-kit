// Main exports for @sertantai/svelte-table-kit

// Main component
export { default as TableKit } from './TableKit.svelte';

// Sub-components
export { default as FilterBar } from './components/FilterBar.svelte';
export { default as FilterConditionEditor } from './components/FilterCondition.svelte';
export { default as GroupBar } from './components/GroupBar.svelte';
export { default as CellContextMenu } from './components/CellContextMenu.svelte';

// TypeScript types
export type {
	TableKitProps,
	TableConfig,
	ViewPreset,
	FilterCondition,
	FilterOperator,
	FilterLogic,
	ColumnOrderMode,
	ColumnDataType,
	ColumnMeta,
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
	createNumericFilter,
	evaluateCondition,
	applyFilters,
	getOperatorsForType
} from './utils/filters';
export type { OperatorOption } from './utils/filters';

// Formatters
export { formatDate, formatCurrency, formatNumber, formatPercent } from './utils/formatters';

// Fuzzy search utilities
export { fuzzyMatch, fuzzySearch, highlightMatches } from './utils/fuzzy';
export type { FuzzyMatch } from './utils/fuzzy';
