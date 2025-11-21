<script lang="ts">
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { SortingState } from '@tanstack/svelte-table';

	export let columnId: string;
	export let desc: boolean;
	export let columns: ColumnDef<any>[];
	export let sorting: SortingState;
	export let onUpdate: (columnId: string, desc: boolean) => void;
	export let onRemove: () => void;

	// Direction options matching Airtable's style
	const directionOptions = [
		{ value: 'asc', label: 'A → Z', icon: '↑' },
		{ value: 'desc', label: 'Z → A', icon: '↓' }
	];

	function handleColumnChange(event: Event) {
		const newColumnId = (event.target as HTMLSelectElement).value;
		onUpdate(newColumnId, desc);
	}

	function handleDirectionChange(event: Event) {
		const direction = (event.target as HTMLSelectElement).value;
		onUpdate(columnId, direction === 'desc');
	}

	// Helper to get column ID
	function getColumnId(col: ColumnDef<any>): string | undefined {
		return (col as any).accessorKey || col.id;
	}

	// Get available columns (sortable and not already in sorting list, except current one)
	$: availableColumns = columns.filter((col) => {
		const colId = getColumnId(col);
		if (!colId || col.enableSorting === false) return false;
		// Include current column or columns not in sorting list
		return colId === columnId || !sorting.some((s) => s.id === colId);
	});

	// Create column options for template
	$: columnOptions = availableColumns.map((col) => ({
		id: getColumnId(col) || '',
		label: col.header || getColumnId(col) || ''
	}));

	$: currentDirection = desc ? 'desc' : 'asc';
</script>

<div class="sort-condition">
	<select class="field-select" value={columnId} on:change={handleColumnChange}>
		<option value="">Select field...</option>
		{#each columnOptions as option}
			<option value={option.id}>
				{option.label}
			</option>
		{/each}
	</select>

	<select
		class="direction-select"
		value={currentDirection}
		on:change={handleDirectionChange}
		disabled={!columnId}
	>
		{#each directionOptions as option}
			<option value={option.value}>
				{option.icon} {option.label}
			</option>
		{/each}
	</select>

	<button class="remove-btn" on:click={onRemove} title="Remove sort">
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
	.sort-condition {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		background: #f9fafb;
		border-radius: 0.375rem;
	}

	.field-select,
	.direction-select {
		padding: 0.375rem 0.75rem;
		font-size: 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		background: white;
	}

	.field-select {
		flex: 1;
		min-width: 150px;
	}

	.direction-select {
		flex: 0.7;
		min-width: 120px;
	}

	.direction-select:disabled {
		background: #f3f4f6;
		color: #9ca3af;
		cursor: not-allowed;
	}

	.field-select:focus,
	.direction-select:focus {
		outline: none;
		border-color: #f59e0b;
		box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
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
