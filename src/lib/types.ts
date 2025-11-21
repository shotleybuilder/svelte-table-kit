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
	defaultFilters?: ColumnFilter[];

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

export interface ColumnFilter {
	columnId: string;
	operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';
	value: string | number | boolean | [number, number] | string[];
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
	columnFilters: ColumnFilter[];
	sorting: SortConfig[];
	pagination: {
		pageIndex: number;
		pageSize: number;
	};
}
