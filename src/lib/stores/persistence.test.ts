import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ColumnOrderMode } from '../types';
import type { ExpandedState } from '@tanstack/svelte-table';

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

describe('Grouping Persistence', () => {
	const storageKey = 'test-table';
	let store: Record<string, string> = {};

	beforeEach(() => {
		store = {};

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

	describe('loadGrouping', () => {
		it('should return empty array as default when no value is stored', async () => {
			const { loadGrouping } = await import('./persistence');
			const state = loadGrouping(storageKey);
			expect(state).toEqual([]);
		});

		it('should return stored grouping when available', async () => {
			store[`${storageKey}_grouping`] = JSON.stringify(['status', 'category']);

			const { loadGrouping } = await import('./persistence');
			const state = loadGrouping(storageKey);
			expect(state).toEqual(['status', 'category']);
		});

		it('should return single column grouping', async () => {
			store[`${storageKey}_grouping`] = JSON.stringify(['department']);

			const { loadGrouping } = await import('./persistence');
			const state = loadGrouping(storageKey);
			expect(state).toEqual(['department']);
		});

		it('should return empty array when stored value is invalid JSON', async () => {
			store[`${storageKey}_grouping`] = 'invalid-json{';

			const { loadGrouping } = await import('./persistence');
			const state = loadGrouping(storageKey);
			expect(state).toEqual([]);
		});
	});

	describe('saveGrouping', () => {
		it('should save grouping to localStorage', async () => {
			const { saveGrouping } = await import('./persistence');
			saveGrouping(storageKey, ['status', 'category']);

			expect(store[`${storageKey}_grouping`]).toBe(JSON.stringify(['status', 'category']));
		});

		it('should save empty grouping', async () => {
			const { saveGrouping } = await import('./persistence');
			saveGrouping(storageKey, []);

			expect(store[`${storageKey}_grouping`]).toBe(JSON.stringify([]));
		});

		it('should overwrite existing grouping', async () => {
			store[`${storageKey}_grouping`] = JSON.stringify(['old_column']);

			const { saveGrouping } = await import('./persistence');
			saveGrouping(storageKey, ['new_column']);

			expect(store[`${storageKey}_grouping`]).toBe(JSON.stringify(['new_column']));
		});
	});

	describe('round-trip persistence', () => {
		it('should save and load the same grouping value', async () => {
			const { saveGrouping, loadGrouping } = await import('./persistence');

			const testCases: string[][] = [[], ['col1'], ['col1', 'col2'], ['a', 'b', 'c']];

			for (const grouping of testCases) {
				saveGrouping(storageKey, grouping);
				const loaded = loadGrouping(storageKey);
				expect(loaded).toEqual(grouping);
			}
		});
	});
});

describe('Expanded State Persistence', () => {
	const storageKey = 'test-table';
	let store: Record<string, string> = {};

	beforeEach(() => {
		store = {};

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

	describe('loadExpanded', () => {
		it('should return true as default when no value is stored', async () => {
			const { loadExpanded } = await import('./persistence');
			const state = loadExpanded(storageKey);
			expect(state).toBe(true);
		});

		it('should return stored boolean expanded state', async () => {
			store[`${storageKey}_expanded`] = JSON.stringify(false);

			const { loadExpanded } = await import('./persistence');
			const state = loadExpanded(storageKey);
			expect(state).toBe(false);
		});

		it('should return stored record expanded state', async () => {
			const expandedRecord: ExpandedState = { 'group-0': true, 'group-1': false };
			store[`${storageKey}_expanded`] = JSON.stringify(expandedRecord);

			const { loadExpanded } = await import('./persistence');
			const state = loadExpanded(storageKey);
			expect(state).toEqual(expandedRecord);
		});

		it('should return true when stored value is invalid JSON', async () => {
			store[`${storageKey}_expanded`] = 'invalid-json{';

			const { loadExpanded } = await import('./persistence');
			const state = loadExpanded(storageKey);
			expect(state).toBe(true);
		});
	});

	describe('saveExpanded', () => {
		it('should save boolean expanded state', async () => {
			const { saveExpanded } = await import('./persistence');
			saveExpanded(storageKey, true);

			expect(store[`${storageKey}_expanded`]).toBe(JSON.stringify(true));
		});

		it('should save empty record expanded state (all collapsed)', async () => {
			const { saveExpanded } = await import('./persistence');
			saveExpanded(storageKey, {});

			expect(store[`${storageKey}_expanded`]).toBe(JSON.stringify({}));
		});

		it('should save record expanded state', async () => {
			const { saveExpanded } = await import('./persistence');
			const expandedRecord: ExpandedState = { 'group-0': true, 'group-1': false };
			saveExpanded(storageKey, expandedRecord);

			expect(store[`${storageKey}_expanded`]).toBe(JSON.stringify(expandedRecord));
		});

		it('should overwrite existing expanded state', async () => {
			store[`${storageKey}_expanded`] = JSON.stringify(true);

			const { saveExpanded } = await import('./persistence');
			saveExpanded(storageKey, {});

			expect(store[`${storageKey}_expanded`]).toBe(JSON.stringify({}));
		});
	});

	describe('round-trip persistence', () => {
		it('should save and load the same expanded value', async () => {
			const { saveExpanded, loadExpanded } = await import('./persistence');

			const testCases: ExpandedState[] = [
				true,
				{},
				{ 'group-0': true },
				{ 'group-0': true, 'group-1': false, 'group-2': true }
			];

			for (const expanded of testCases) {
				saveExpanded(storageKey, expanded);
				const loaded = loadExpanded(storageKey);
				expect(loaded).toEqual(expanded);
			}
		});
	});
});

describe('clearTableState includes grouping and expanded', () => {
	const storageKey = 'test-table';
	let store: Record<string, string> = {};

	beforeEach(() => {
		store = {};

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

	it('should remove grouping and expanded state', async () => {
		store[`${storageKey}_grouping`] = JSON.stringify(['status']);
		store[`${storageKey}_expanded`] = JSON.stringify(true);
		store[`${storageKey}_column_visibility`] = JSON.stringify({ col1: true });

		const { clearTableState } = await import('./persistence');
		clearTableState(storageKey);

		expect(store[`${storageKey}_grouping`]).toBeUndefined();
		expect(store[`${storageKey}_expanded`]).toBeUndefined();
		expect(store[`${storageKey}_column_visibility`]).toBeUndefined();
	});
});
