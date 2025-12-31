<script lang="ts">
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { FilterCondition, FilterOperator, ColumnOrderMode } from '../types';
	import { loadFilterColumnOrderMode, saveFilterColumnOrderMode } from '../stores/persistence';
	import { onMount } from 'svelte';

	export let condition: FilterCondition;
	export let columns: ColumnDef<any>[];
	export let columnOrder: string[] = [];
	export let storageKey: string = 'table-kit';
	export let onUpdate: (condition: FilterCondition) => void;
	export let onRemove: () => void;

	// Column order mode state
	let orderMode: ColumnOrderMode = 'definition';

	// Load persisted order mode on mount
	onMount(() => {
		orderMode = loadFilterColumnOrderMode(storageKey);
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

	function handleFieldChange(event: Event) {
		const field = (event.target as HTMLSelectElement).value;
		onUpdate({ ...condition, field });
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
	<div class="field-select-wrapper">
		<select class="field-select" value={condition.field} on:change={handleFieldChange}>
			<option value="">Select field...</option>
			{#each orderedColumns as column}
				{@const columnId = getColumnId(column)}
				{#if columnId}
					<option value={columnId}>
						{getColumnLabel(column)}
					</option>
				{/if}
			{/each}
		</select>
		<button
			class="order-mode-btn"
			on:click={cycleOrderMode}
			title="Change column order: {getOrderModeLabel(orderMode)}"
		>
			{getOrderModeLabel(orderMode)}
		</button>
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

	<button class="remove-btn" on:click={onRemove} title="Remove condition">
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

	.field-select-wrapper {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		flex: 1;
		min-width: 120px;
	}

	.field-select,
	.operator-select,
	.value-input {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background: white;
	}

	.field-select {
		flex: 1;
		min-width: 0;
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
