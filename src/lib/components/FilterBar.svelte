<script lang="ts">
	import type { ColumnDef } from '@tanstack/svelte-table';
	import type { FilterCondition } from '../types';
	import FilterConditionComponent from './FilterCondition.svelte';

	export let columns: ColumnDef<any>[];
	export let conditions: FilterCondition[] = [];
	export let onConditionsChange: (conditions: FilterCondition[]) => void;

	function generateId(): string {
		return `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	function addCondition() {
		const newCondition: FilterCondition = {
			id: generateId(),
			field: '',
			operator: 'equals',
			value: ''
		};
		onConditionsChange([...conditions, newCondition]);
	}

	function updateCondition(index: number, updated: FilterCondition) {
		const newConditions = [...conditions];
		newConditions[index] = updated;
		onConditionsChange(newConditions);
	}

	function removeCondition(index: number) {
		const newConditions = conditions.filter((_, i) => i !== index);
		onConditionsChange(newConditions);
	}

	function clearAllConditions() {
		onConditionsChange([]);
	}

	$: hasConditions = conditions.length > 0;
</script>

<div class="filter-bar">
	<div class="filter-header">
		<span class="filter-label">Where</span>
		{#if hasConditions}
			<button class="clear-all-btn" on:click={clearAllConditions}> Clear all </button>
		{/if}
	</div>

	{#if hasConditions}
		<div class="filter-conditions">
			{#each conditions as condition, index (condition.id)}
				<div class="condition-wrapper">
					{#if index > 0}
						<div class="logic-separator">and</div>
					{/if}
					<FilterConditionComponent
						{condition}
						{columns}
						onUpdate={(updated) => updateCondition(index, updated)}
						onRemove={() => removeCondition(index)}
					/>
				</div>
			{/each}
		</div>
	{/if}

	<button class="add-condition-btn" on:click={addCondition}>
		<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 6v6m0 0v6m0-6h6m-6 0H6"
			/>
		</svg>
		Add condition
	</button>
</div>

<style>
	.filter-bar {
		padding: 1rem;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
		margin-bottom: 1rem;
	}

	.filter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
	}

	.filter-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.clear-all-btn {
		font-size: 0.75rem;
		color: #6b7280;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.clear-all-btn:hover {
		color: #dc2626;
		background: #fee2e2;
	}

	.filter-conditions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.condition-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.logic-separator {
		font-size: 0.75rem;
		font-weight: 600;
		color: #6b7280;
		text-transform: uppercase;
		padding-left: 0.5rem;
	}

	.add-condition-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #4f46e5;
		background: white;
		border: 1px dashed #4f46e5;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: all 0.2s;
	}

	.add-condition-btn:hover {
		background: #eef2ff;
		border-style: solid;
	}

	.icon {
		width: 1rem;
		height: 1rem;
	}
</style>
