// TypeScript types for svelte-table-kit

import type { ColumnDef } from '@tanstack/svelte-table';

export interface TableKitProps<T = any> {
	// Required
	data: T[];
	columns: ColumnDef<T>[];

	// Optional configuration
	config?: TableConfig;

	// Feature flags
	features?: TableFeatures;

	// Persistence
	storageKey?: string;
	persistState?: boolean;

	// Styling
	theme?: 'light' | 'dark' | 'auto';
	classNames?: Partial<ClassNameMap>;
	align?: 'left' | 'center' | 'right';
	rowHeight?: 'short' | 'medium' | 'tall' | 'extra_tall';
	columnSpacing?: 'narrow' | 'normal' | 'wide';

	// Callbacks
	onRowClick?: (row: T) => void;
	onRowSelect?: (rows: T[]) => void;
	onStateChange?: (state: TableState) => void;
}

export interface TableFeatures {
	columnVisibility?: boolean;
	columnResizing?: boolean;
	columnReordering?: boolean;
	filtering?: boolean;
	sorting?: boolean;
	sortingMode?: 'header' | 'control'; // Choose between column header sorting or dedicated sort control
	pagination?: boolean;
	rowSelection?: boolean;
	grouping?: boolean;
	columnPinning?: boolean;
}

export interface TableConfig {
	id: string;
	version: string;

	// Column configuration
	defaultVisibleColumns?: string[];
	defaultColumnOrder?: string[];
	defaultColumnSizing?: Record<string, number>;
	pinnedColumns?: {
		left?: string[];
		right?: string[];
	};

	// Filter configuration
	defaultFilters?: FilterCondition[];

	// Sort configuration
	defaultSorting?: SortConfig[];

	// Pagination
	pagination?: {
		pageSize: number;
		pageSizeOptions?: number[];
	};

	// View presets
	presets?: ViewPreset[];
}

export interface ViewPreset {
	id: string;
	name: string;
	description?: string;
	config: Partial<TableConfig>;
}

export type FilterOperator =
	// String operators
	| 'equals'
	| 'not_equals'
	| 'contains'
	| 'not_contains'
	| 'starts_with'
	| 'ends_with'
	| 'is_empty'
	| 'is_not_empty'
	// Numeric operators
	| 'greater_than'
	| 'less_than'
	| 'greater_or_equal'
	| 'less_or_equal'
	// Date operators (future)
	| 'is_before'
	| 'is_after';

export type FilterLogic = 'and' | 'or';

export interface FilterCondition {
	id: string;
	field: string;
	operator: FilterOperator;
	value: any;
}

export interface SortConfig {
	columnId: string;
	direction: 'asc' | 'desc';
}

export interface ClassNameMap {
	container: string;
	table: string;
	thead: string;
	tbody: string;
	tfoot: string;
	tr: string;
	th: string;
	td: string;
	pagination: string;
	filterBar: string;
	columnPicker: string;
}

export interface TableState {
	columnVisibility: Record<string, boolean>;
	columnOrder: string[];
	columnSizing: Record<string, number>;
	columnFilters: FilterCondition[];
	sorting: SortConfig[];
	pagination: {
		pageIndex: number;
		pageSize: number;
	};
}
