<script lang="ts">
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { FilterCondition, FilterOperator, ColumnOrderMode } from '../types';
	import { loadFilterColumnOrderMode, saveFilterColumnOrderMode } from '../stores/persistence';
	import { fuzzyMatch, highlightMatches } from '../utils/fuzzy';
	import { onMount, tick } from 'svelte';

	export let condition: FilterCondition;
	export let columns: ColumnDef<any>[];
	export let columnOrder: string[] = [];
	export let storageKey: string = 'table-kit';
	export let onUpdate: (condition: FilterCondition) => void;
	export let onRemove: () => void;

	// Column order mode state
	let orderMode: ColumnOrderMode = 'definition';

	// Fuzzy search state
	let searchTerm = '';
	let showDropdown = false;
	let highlightedIndex = 0;
	let searchInputRef: HTMLInputElement;
	let dropdownRef: HTMLDivElement;

	// Load persisted order mode on mount
	onMount(() => {
		orderMode = loadFilterColumnOrderMode(storageKey);

		// Close dropdown when clicking outside
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
				showDropdown = false;
			}
		}

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	// Cycle through order modes
	function cycleOrderMode() {
		const modes: ColumnOrderMode[] = ['definition', 'ui', 'alphabetical'];
		const currentIndex = modes.indexOf(orderMode);
		orderMode = modes[(currentIndex + 1) % modes.length];
		saveFilterColumnOrderMode(storageKey, orderMode);
	}

	// Get display label for current order mode
	function getOrderModeLabel(mode: ColumnOrderMode): string {
		switch (mode) {
			case 'definition':
				return 'Default';
			case 'ui':
				return 'Table';
			case 'alphabetical':
				return 'A-Z';
			default:
				return 'Default';
		}
	}

	// Helper to get column ID
	function getColumnId(col: ColumnDef<any>): string {
		return ((col as any).accessorKey || col.id || '') as string;
	}

	// Helper to get column label
	function getColumnLabel(col: ColumnDef<any>): string {
		return String(col.header || getColumnId(col));
	}

	// Compute ordered columns based on current mode
	$: orderedColumns = (() => {
		switch (orderMode) {
			case 'alphabetical':
				return [...columns].sort((a, b) => {
					const labelA = getColumnLabel(a).toLowerCase();
					const labelB = getColumnLabel(b).toLowerCase();
					return labelA.localeCompare(labelB);
				});

			case 'ui':
				// Sort by columnOrder state, columns not in order go to end
				return [...columns].sort((a, b) => {
					const idA = getColumnId(a);
					const idB = getColumnId(b);
					const indexA = columnOrder.indexOf(idA);
					const indexB = columnOrder.indexOf(idB);
					const posA = indexA === -1 ? 999 : indexA;
					const posB = indexB === -1 ? 999 : indexB;
					return posA - posB;
				});

			case 'definition':
			default:
				return columns;
		}
	})();

	// Filter and score columns based on search term
	$: filteredColumns = (() => {
		if (!searchTerm.trim()) {
			return orderedColumns.map((col) => ({
				column: col,
				matchedIndices: [] as number[],
				score: 0
			}));
		}

		const results: { column: ColumnDef<any>; matchedIndices: number[]; score: number }[] = [];

		for (const col of orderedColumns) {
			const label = getColumnLabel(col);
			const match = fuzzyMatch(searchTerm, label);
			if (match) {
				results.push({
					column: col,
					matchedIndices: match.matchedIndices,
					score: match.score
				});
			}
		}

		// Sort by score (highest first)
		return results.sort((a, b) => b.score - a.score);
	})();

	// Reset highlighted index when filtered results change
	$: if (filteredColumns) {
		highlightedIndex = 0;
	}

	// Get the current selected column's label for display
	$: selectedColumnLabel = (() => {
		if (!condition.field) return '';
		const col = columns.find((c) => getColumnId(c) === condition.field);
		return col ? getColumnLabel(col) : condition.field;
	})();

	// Get operator options based on field type (simplified for now)
	const operatorOptions: { value: FilterOperator; label: string }[] = [
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
		{ value: 'less_or_equal', label: '<=' }
	];

	function selectColumn(col: ColumnDef<any>) {
		const field = getColumnId(col);
		onUpdate({ ...condition, field });
		showDropdown = false;
		searchTerm = '';
	}

	function handleSearchKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				highlightedIndex = Math.min(highlightedIndex + 1, filteredColumns.length - 1);
				scrollToHighlighted();
				break;
			case 'ArrowUp':
				event.preventDefault();
				highlightedIndex = Math.max(highlightedIndex - 1, 0);
				scrollToHighlighted();
				break;
			case 'Enter':
				event.preventDefault();
				if (filteredColumns[highlightedIndex]) {
					selectColumn(filteredColumns[highlightedIndex].column);
				}
				break;
			case 'Escape':
				event.preventDefault();
				showDropdown = false;
				searchTerm = '';
				break;
			case 'Tab':
				showDropdown = false;
				break;
		}
	}

	async function scrollToHighlighted() {
		await tick();
		const highlighted = dropdownRef?.querySelector('.field-option.highlighted');
		if (highlighted) {
			highlighted.scrollIntoView({ block: 'nearest' });
		}
	}

	function openDropdown() {
		showDropdown = true;
		searchTerm = '';
		highlightedIndex = 0;
		// Focus search input after dropdown opens
		tick().then(() => {
			searchInputRef?.focus();
		});
	}

	function handleOperatorChange(event: Event) {
		const operator = (event.target as HTMLSelectElement).value as FilterOperator;
		onUpdate({ ...condition, operator });
	}

	function handleValueChange(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		onUpdate({ ...condition, value });
	}

	// Check if value input should be disabled (e.g., for "is_empty")
	$: valueDisabled = condition.operator === 'is_empty' || condition.operator === 'is_not_empty';
</script>

<div class="filter-condition">
	<div class="field-picker-wrapper" bind:this={dropdownRef}>
		<button
			class="field-picker-trigger"
			class:has-value={condition.field}
			on:click={openDropdown}
			type="button"
		>
			<span class="field-picker-text">
				{selectedColumnLabel || 'Select field...'}
			</span>
			<svg class="chevron-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if showDropdown}
			<div class="field-dropdown">
				<div class="field-search-wrapper">
					<input
						bind:this={searchInputRef}
						type="text"
						class="field-search"
						placeholder="Search fields..."
						bind:value={searchTerm}
						on:keydown={handleSearchKeydown}
					/>
					<button
						class="order-mode-btn"
						on:click|stopPropagation={cycleOrderMode}
						title="Change column order: {getOrderModeLabel(orderMode)}"
						type="button"
					>
						{getOrderModeLabel(orderMode)}
					</button>
				</div>

				<div class="field-options">
					{#each filteredColumns as { column, matchedIndices }, i}
						{@const columnId = getColumnId(column)}
						{@const columnLabel = getColumnLabel(column)}
						{#if columnId}
							<button
								class="field-option"
								class:highlighted={i === highlightedIndex}
								class:selected={columnId === condition.field}
								on:click={() => selectColumn(column)}
								on:mouseenter={() => (highlightedIndex = i)}
								type="button"
							>
								{#if matchedIndices.length > 0}
									{#each highlightMatches(columnLabel, matchedIndices) as segment}
										{#if segment.isMatch}
											<mark class="match-highlight">{segment.text}</mark>
										{:else}
											{segment.text}
										{/if}
									{/each}
								{:else}
									{columnLabel}
								{/if}
							</button>
						{/if}
					{:else}
						<div class="no-results">No matching fields</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<select class="operator-select" value={condition.operator} on:change={handleOperatorChange}>
		{#each operatorOptions as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>

	<input
		type="text"
		class="value-input"
		value={condition.value || ''}
		on:input={handleValueChange}
		disabled={valueDisabled}
		placeholder={valueDisabled ? 'N/A' : 'Enter value...'}
	/>

	<button class="remove-btn" on:click={onRemove} title="Remove condition" type="button">
		<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M6 18L18 6M6 6l12 12"
			/>
		</svg>
	</button>
</div>

<style>
	.filter-condition {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		padding: 0.5rem;
		background: #f9fafb;
		border-radius: 0.375rem;
	}

	.field-picker-wrapper {
		position: relative;
		flex: 1;
		min-width: 150px;
	}

	.field-picker-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		text-align: left;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background: white;
		cursor: pointer;
		transition: border-color 0.15s;
	}

	.field-picker-trigger:hover {
		border-color: #9ca3af;
	}

	.field-picker-trigger:focus {
		outline: none;
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.field-picker-trigger:not(.has-value) .field-picker-text {
		color: #9ca3af;
	}

	.field-picker-text {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.chevron-icon {
		width: 1rem;
		height: 1rem;
		color: #6b7280;
		flex-shrink: 0;
	}

	.field-dropdown {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		width: 100%;
		min-width: 200px;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		z-index: 50;
		overflow: hidden;
	}

	.field-search-wrapper {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.5rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.field-search {
		flex: 1;
		padding: 0.375rem 0.5rem;
		font-size: 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.25rem;
		outline: none;
	}

	.field-search:focus {
		border-color: #3b82f6;
		box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
	}

	.order-mode-btn {
		flex-shrink: 0;
		padding: 0.25rem 0.5rem;
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.025em;
		color: #6b7280;
		background: #e5e7eb;
		border: none;
		border-radius: 0.25rem;
		cursor: pointer;
		transition: all 0.15s;
	}

	.order-mode-btn:hover {
		background: #d1d5db;
		color: #374151;
	}

	.field-options {
		max-height: 200px;
		overflow-y: auto;
	}

	.field-option {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		text-align: left;
		background: none;
		border: none;
		cursor: pointer;
		transition: background-color 0.1s;
	}

	.field-option:hover,
	.field-option.highlighted {
		background: #f3f4f6;
	}

	.field-option.selected {
		background: #eff6ff;
		color: #1d4ed8;
	}

	.field-option.highlighted.selected {
		background: #dbeafe;
	}

	.match-highlight {
		background: #fef08a;
		color: inherit;
		padding: 0;
		border-radius: 1px;
	}

	.no-results {
		padding: 0.75rem;
		text-align: center;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.operator-select,
	.value-input {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background: white;
	}

	.operator-select {
		flex: 0.8;
		min-width: 100px;
	}

	.value-input {
		flex: 1;
		min-width: 120px;
	}

	.value-input:disabled {
		background: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}

	.remove-btn {
		flex-shrink: 0;
		padding: 0.375rem;
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.remove-btn:hover {
		background: #fee2e2;
		color: #dc2626;
	}

	.icon {
		width: 1rem;
		height: 1rem;
	}
</style>
