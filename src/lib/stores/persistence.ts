// LocalStorage persistence utilities

import type {
	VisibilityState,
	ColumnSizingState,
	ColumnFiltersState,
	ColumnOrderState,
	SortingState,
	PaginationState
} from '@tanstack/svelte-table';
import type { ColumnOrderMode } from '../types';

/**
 * Check if we're in a browser environment
 * Uses cross-bundler compatible check instead of SvelteKit-specific imports
 */
export const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * Generic localStorage loader with error handling
 */
function loadFromStorage<T>(key: string, defaultValue: T): T {
	if (!isBrowser) return defaultValue;

	try {
		const saved = localStorage.getItem(key);
		return saved ? JSON.parse(saved) : defaultValue;
	} catch (error) {
		console.warn(`Failed to load ${key} from localStorage:`, error);
		return defaultValue;
	}
}

/**
 * Generic localStorage saver with error handling
 */
function saveToStorage<T>(key: string, value: T): void {
	if (!isBrowser) return;

	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(`Failed to save ${key} to localStorage:`, error);
	}
}

/**
 * Load column visibility state from localStorage
 */
export function loadColumnVisibility(storageKey: string): VisibilityState {
	return loadFromStorage(`${storageKey}_column_visibility`, {});
}

/**
 * Save column visibility state to localStorage
 */
export function saveColumnVisibility(storageKey: string, state: VisibilityState): void {
	saveToStorage(`${storageKey}_column_visibility`, state);
}

/**
 * Load column sizing state from localStorage
 */
export function loadColumnSizing(storageKey: string): ColumnSizingState {
	return loadFromStorage(`${storageKey}_column_sizing`, {});
}

/**
 * Save column sizing state to localStorage
 */
export function saveColumnSizing(storageKey: string, state: ColumnSizingState): void {
	saveToStorage(`${storageKey}_column_sizing`, state);
}

/**
 * Load column filters state from localStorage
 */
export function loadColumnFilters(storageKey: string): ColumnFiltersState {
	return loadFromStorage(`${storageKey}_column_filters`, []);
}

/**
 * Save column filters state to localStorage
 */
export function saveColumnFilters(storageKey: string, state: ColumnFiltersState): void {
	saveToStorage(`${storageKey}_column_filters`, state);
}

/**
 * Load column order state from localStorage
 */
export function loadColumnOrder(storageKey: string): ColumnOrderState {
	return loadFromStorage(`${storageKey}_column_order`, []);
}

/**
 * Save column order state to localStorage
 */
export function saveColumnOrder(storageKey: string, state: ColumnOrderState): void {
	saveToStorage(`${storageKey}_column_order`, state);
}

/**
 * Load sorting state from localStorage
 */
export function loadSorting(storageKey: string): SortingState {
	return loadFromStorage(`${storageKey}_sorting`, []);
}

/**
 * Save sorting state to localStorage
 */
export function saveSorting(storageKey: string, state: SortingState): void {
	saveToStorage(`${storageKey}_sorting`, state);
}

/**
 * Load pagination state from localStorage
 */
export function loadPagination(storageKey: string, defaultPageSize = 10): PaginationState {
	return loadFromStorage(`${storageKey}_pagination`, {
		pageIndex: 0,
		pageSize: defaultPageSize
	});
}

/**
 * Save pagination state to localStorage
 */
export function savePagination(storageKey: string, state: PaginationState): void {
	saveToStorage(`${storageKey}_pagination`, state);
}

/**
 * Load filter column order mode from localStorage
 */
export function loadFilterColumnOrderMode(storageKey: string): ColumnOrderMode {
	return loadFromStorage(`${storageKey}_filter_column_order_mode`, 'definition');
}

/**
 * Save filter column order mode to localStorage
 */
export function saveFilterColumnOrderMode(storageKey: string, mode: ColumnOrderMode): void {
	saveToStorage(`${storageKey}_filter_column_order_mode`, mode);
}

/**
 * Clear all table state from localStorage
 */
export function clearTableState(storageKey: string): void {
	if (!isBrowser) return;

	try {
		localStorage.removeItem(`${storageKey}_column_visibility`);
		localStorage.removeItem(`${storageKey}_column_sizing`);
		localStorage.removeItem(`${storageKey}_column_filters`);
		localStorage.removeItem(`${storageKey}_column_order`);
		localStorage.removeItem(`${storageKey}_sorting`);
		localStorage.removeItem(`${storageKey}_pagination`);
		localStorage.removeItem(`${storageKey}_filter_column_order_mode`);
	} catch (error) {
		console.error('Failed to clear table state:', error);
	}
}
