import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ColumnOrderMode } from '../types';

// We need to mock the module before importing
// The persistence module checks isBrowser at import time

describe('Filter Column Order Mode Persistence', () => {
	const storageKey = 'test-table';
	let store: Record<string, string> = {};

	// Mock localStorage before each test
	beforeEach(() => {
		store = {};

		// Mock localStorage on globalThis/window
		const localStorageMock = {
			getItem: vi.fn((key: string) => store[key] || null),
			setItem: vi.fn((key: string, value: string) => {
				store[key] = value;
			}),
			removeItem: vi.fn((key: string) => {
				delete store[key];
			}),
			clear: vi.fn(() => {
				store = {};
			}),
			length: 0,
			key: vi.fn()
		};

		vi.stubGlobal('localStorage', localStorageMock);
		vi.stubGlobal('window', { localStorage: localStorageMock });
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.resetModules();
	});

	describe('loadFilterColumnOrderMode', () => {
		it('should return "definition" as default when no value is stored', async () => {
			const { loadFilterColumnOrderMode } = await import('./persistence');
			const mode = loadFilterColumnOrderMode(storageKey);
			expect(mode).toBe('definition');
		});

		it('should return stored mode when available', async () => {
			store[`${storageKey}_filter_column_order_mode`] = JSON.stringify('alphabetical');

			const { loadFilterColumnOrderMode } = await import('./persistence');
			const mode = loadFilterColumnOrderMode(storageKey);
			expect(mode).toBe('alphabetical');
		});

		it('should return stored "ui" mode', async () => {
			store[`${storageKey}_filter_column_order_mode`] = JSON.stringify('ui');

			const { loadFilterColumnOrderMode } = await import('./persistence');
			const mode = loadFilterColumnOrderMode(storageKey);
			expect(mode).toBe('ui');
		});

		it('should return "definition" when stored value is invalid JSON', async () => {
			store[`${storageKey}_filter_column_order_mode`] = 'invalid-json{';

			const { loadFilterColumnOrderMode } = await import('./persistence');
			const mode = loadFilterColumnOrderMode(storageKey);
			expect(mode).toBe('definition');
		});
	});

	describe('saveFilterColumnOrderMode', () => {
		it('should save mode to localStorage', async () => {
			const { saveFilterColumnOrderMode } = await import('./persistence');
			saveFilterColumnOrderMode(storageKey, 'ui');

			expect(store[`${storageKey}_filter_column_order_mode`]).toBe(JSON.stringify('ui'));
		});

		it('should save "alphabetical" mode correctly', async () => {
			const { saveFilterColumnOrderMode } = await import('./persistence');
			saveFilterColumnOrderMode(storageKey, 'alphabetical');

			expect(store[`${storageKey}_filter_column_order_mode`]).toBe(JSON.stringify('alphabetical'));
		});

		it('should save "definition" mode correctly', async () => {
			const { saveFilterColumnOrderMode } = await import('./persistence');
			saveFilterColumnOrderMode(storageKey, 'definition');

			expect(store[`${storageKey}_filter_column_order_mode`]).toBe(JSON.stringify('definition'));
		});

		it('should overwrite existing mode', async () => {
			store[`${storageKey}_filter_column_order_mode`] = JSON.stringify('definition');

			const { saveFilterColumnOrderMode } = await import('./persistence');
			saveFilterColumnOrderMode(storageKey, 'alphabetical');

			expect(store[`${storageKey}_filter_column_order_mode`]).toBe(JSON.stringify('alphabetical'));
		});
	});

	describe('clearTableState', () => {
		it('should remove filter column order mode along with other state', async () => {
			// Set some state first
			store[`${storageKey}_filter_column_order_mode`] = JSON.stringify('alphabetical');
			store[`${storageKey}_column_visibility`] = JSON.stringify({ col1: true });

			const { clearTableState } = await import('./persistence');
			clearTableState(storageKey);

			expect(store[`${storageKey}_filter_column_order_mode`]).toBeUndefined();
		});
	});

	describe('round-trip persistence', () => {
		it('should save and load the same value', async () => {
			const { saveFilterColumnOrderMode, loadFilterColumnOrderMode } = await import(
				'./persistence'
			);

			const modes: ColumnOrderMode[] = ['definition', 'ui', 'alphabetical'];

			for (const mode of modes) {
				saveFilterColumnOrderMode(storageKey, mode);
				const loaded = loadFilterColumnOrderMode(storageKey);
				expect(loaded).toBe(mode);
			}
		});
	});
});
