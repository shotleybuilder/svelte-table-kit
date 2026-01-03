<script lang="ts">
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { FilterCondition, FilterOperator, ColumnOrderMode, ColumnDataType, ColumnMeta } from '../types';
	import { loadFilterColumnOrderMode, saveFilterColumnOrderMode } from '../stores/persistence';
	import { fuzzyMatch, highlightMatches } from '../utils/fuzzy';
	import { getOperatorsForType } from '../utils/filters';
	import { onMount, tick } from 'svelte';

	export let condition: FilterCondition;
	export let columns: ColumnDef<any>[];
	export let columnOrder: string[] = [];
	export let storageKey: string = 'table-kit';
	export let columnValues: string[] = [];
	export let numericRange: { min: number; max: number } | null = null;
	export let onUpdate: (condition: FilterCondition) => void;
	export let onRemove: () => void;

	// Column order mode state
	let orderMode: ColumnOrderMode = 'definition';

	// Fuzzy search state for field picker
	let searchTerm = '';
	let showDropdown = false;
	let highlightedIndex = 0;
	let searchInputRef: HTMLInputElement;
	let dropdownRef: HTMLDivElement;

	// Value suggestions state
	let showValueSuggestions = false;
	let valueSuggestionIndex = 0;
	let valueInputRef: HTMLInputElement;
	let valueSuggestionsRef: HTMLDivElement;

	// Load persisted order mode on mount
	onMount(() => {
		orderMode = loadFilterColumnOrderMode(storageKey);

		// Close dropdowns when clicking outside
		function handleClickOutside(event: MouseEvent) {
			if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
				showDropdown = false;
			}
			if (valueSuggestionsRef && !valueSuggestionsRef.contains(event.target as Node)) {
				showValueSuggestions = false;
			}
		}

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	// Filter value suggestions based on current input
	$: filteredValueSuggestions = (() => {
		if (!columnValues || columnValues.length === 0) return [];

		const currentValue = condition.value || '';
		if (!currentValue.trim()) {
			// Show all values (limited) when input is empty
			return columnValues.slice(0, 50).map((val) => ({
				value: val,
				matchedIndices: [] as number[],
				score: 0
			}));
		}

		// Fuzzy filter suggestions
		const results: { value: string; matchedIndices: number[]; score: number }[] = [];
		for (const val of columnValues) {
			const match = fuzzyMatch(currentValue, val);
			if (match) {
				results.push({
					value: val,
					matchedIndices: match.matchedIndices,
					score: match.score
				});
			}
		}

		return results.sort((a, b) => b.score - a.score).slice(0, 50);
	})();

	// Reset suggestion index when filtered results change
	$: if (filteredValueSuggestions) {
		valueSuggestionIndex = 0;
	}

	// Check if we should show suggestions (has values and not disabled)
	$: canShowSuggestions = columnValues.length > 0 && !valueDisabled;

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

	// Get the current selected column
	$: selectedColumn = condition.field
		? columns.find((c) => getColumnId(c) === condition.field)
		: null;

	// Get the current selected column's label for display
	$: selectedColumnLabel = (() => {
		if (!condition.field) return '';
		return selectedColumn ? getColumnLabel(selectedColumn) : condition.field;
	})();

	// Get data type from column meta
	$: columnDataType = (() => {
		if (!selectedColumn) return 'text' as ColumnDataType;
		const meta = (selectedColumn as any).meta as ColumnMeta | undefined;
		return (meta?.dataType || 'text') as ColumnDataType;
	})();

	// Get select options from column meta (for 'select' type)
	$: selectOptions = (() => {
		if (!selectedColumn) return [];
		const meta = (selectedColumn as any).meta as ColumnMeta | undefined;
		return meta?.selectOptions || [];
	})();

	// Get operator options based on column data type (reactive)
	$: operatorOptions = getOperatorsForType(columnDataType);

	// Reset operator to 'equals' if current operator is not valid for new data type
	$: {
		if (condition.field && operatorOptions.length > 0) {
			const currentOperatorValid = operatorOptions.some((op) => op.value === condition.operator);
			if (!currentOperatorValid) {
				onUpdate({ ...condition, operator: 'equals' });
			}
		}
	}

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
		// Show suggestions when typing
		if (canShowSuggestions && value.length >= 0) {
			showValueSuggestions = true;
		}
	}

	function handleValueFocus() {
		if (canShowSuggestions) {
			showValueSuggestions = true;
			valueSuggestionIndex = 0;
		}
	}

	function selectValueSuggestion(value: string) {
		onUpdate({ ...condition, value });
		showValueSuggestions = false;
	}

	function handleValueKeydown(event: KeyboardEvent) {
		if (!showValueSuggestions || filteredValueSuggestions.length === 0) return;

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault();
				valueSuggestionIndex = Math.min(
					valueSuggestionIndex + 1,
					filteredValueSuggestions.length - 1
				);
				scrollToHighlightedSuggestion();
				break;
			case 'ArrowUp':
				event.preventDefault();
				valueSuggestionIndex = Math.max(valueSuggestionIndex - 1, 0);
				scrollToHighlightedSuggestion();
				break;
			case 'Enter':
				event.preventDefault();
				if (filteredValueSuggestions[valueSuggestionIndex]) {
					selectValueSuggestion(filteredValueSuggestions[valueSuggestionIndex].value);
				}
				break;
			case 'Escape':
				event.preventDefault();
				showValueSuggestions = false;
				break;
			case 'Tab':
				showValueSuggestions = false;
				break;
		}
	}

	async function scrollToHighlightedSuggestion() {
		await tick();
		const highlighted = valueSuggestionsRef?.querySelector('.suggestion-option.highlighted');
		if (highlighted) {
			highlighted.scrollIntoView({ block: 'nearest' });
		}
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

	<div class="value-input-wrapper" bind:this={valueSuggestionsRef}>
		{#if columnDataType === 'boolean'}
			<!-- Boolean: dropdown with true/false -->
			<select
				class="value-input"
				value={condition.value || ''}
				on:change={handleValueChange}
				disabled={valueDisabled}
			>
				<option value="">Select...</option>
				<option value="true">True</option>
				<option value="false">False</option>
			</select>
		{:else if columnDataType === 'select' && selectOptions.length > 0}
			<!-- Select: dropdown with options from meta -->
			<select
				class="value-input"
				value={condition.value || ''}
				on:change={handleValueChange}
				disabled={valueDisabled}
			>
				<option value="">Select...</option>
				{#each selectOptions as opt}
					<option value={opt.value}>{opt.label}</option>
				{/each}
			</select>
		{:else if columnDataType === 'date'}
			<!-- Date: date input -->
			<input
				bind:this={valueInputRef}
				type="date"
				class="value-input"
				value={condition.value || ''}
				on:input={handleValueChange}
				disabled={valueDisabled}
			/>
		{:else if columnDataType === 'number'}
			<!-- Number: number input with range hint -->
			<input
				bind:this={valueInputRef}
				type="number"
				class="value-input"
				value={condition.value || ''}
				on:input={handleValueChange}
				disabled={valueDisabled}
				placeholder={valueDisabled ? 'N/A' : numericRange ? `${numericRange.min} - ${numericRange.max}` : 'Enter number...'}
			/>
			{#if numericRange && !valueDisabled}
				<div class="numeric-range-hint">
					Range: {numericRange.min} - {numericRange.max}
				</div>
			{/if}
		{:else}
			<!-- Text: text input with autocomplete suggestions -->
			<input
				bind:this={valueInputRef}
				type="text"
				class="value-input"
				value={condition.value || ''}
				on:input={handleValueChange}
				on:focus={handleValueFocus}
				on:keydown={handleValueKeydown}
				disabled={valueDisabled}
				placeholder={valueDisabled ? 'N/A' : 'Enter value...'}
				autocomplete="off"
			/>

			{#if showValueSuggestions && filteredValueSuggestions.length > 0}
				<div class="value-suggestions">
					{#each filteredValueSuggestions as { value, matchedIndices }, i}
						<button
							class="suggestion-option"
							class:highlighted={i === valueSuggestionIndex}
							on:click={() => selectValueSuggestion(value)}
							on:mouseenter={() => (valueSuggestionIndex = i)}
							type="button"
						>
							{#if matchedIndices.length > 0}
								{#each highlightMatches(value, matchedIndices) as segment}
									{#if segment.isMatch}
										<mark class="match-highlight">{segment.text}</mark>
									{:else}
										{segment.text}
									{/if}
								{/each}
							{:else}
								{value}
							{/if}
						</button>
					{/each}
					{#if columnValues.length > 50}
						<div class="suggestions-overflow">
							and {columnValues.length - 50} more...
						</div>
					{/if}
				</div>
			{/if}
		{/if}
	</div>

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

	.value-input-wrapper {
		position: relative;
		flex: 1;
		min-width: 120px;
	}

	.value-input-wrapper .value-input {
		width: 100%;
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

	.value-suggestions {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		max-height: 200px;
		overflow-y: auto;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		z-index: 50;
	}

	.suggestion-option {
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

	.suggestion-option:hover,
	.suggestion-option.highlighted {
		background: #f3f4f6;
	}

	.suggestions-overflow {
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		color: #6b7280;
		text-align: center;
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.numeric-range-hint {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		padding: 0.375rem 0.75rem;
		font-size: 0.75rem;
		color: #6b7280;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 0.375rem;
		text-align: center;
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
