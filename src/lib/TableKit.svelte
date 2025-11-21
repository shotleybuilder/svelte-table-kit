<script lang="ts">
	/**
	 * TableKit - Main component for svelte-table-kit
	 *
	 * A comprehensive, AI-configurable data table component built on TanStack Table v8
	 * Extracted from sertantai-enforcement RecentActivityTable component
	 */

	import { writable } from 'svelte/store';
	import {
		createSvelteTable,
		getCoreRowModel,
		getPaginationRowModel,
		getSortedRowModel,
		getFilteredRowModel,
		getGroupedRowModel,
		getExpandedRowModel,
		flexRender,
		type ColumnDef,
		type SortingState,
		type VisibilityState,
		type ColumnSizingState,
		type ColumnFiltersState,
		type ColumnOrderState,
		type GroupingState,
		type ExpandedState
	} from '@tanstack/svelte-table';
	import {
		loadColumnVisibility,
		saveColumnVisibility,
		loadColumnSizing,
		saveColumnSizing,
		loadColumnFilters,
		saveColumnFilters,
		loadColumnOrder,
		saveColumnOrder,
		isBrowser
	} from './stores/persistence';
	import type { TableKitProps, FilterCondition, FilterLogic } from './types';
	import { applyFilters } from './utils/filters';
	import FilterBar from './components/FilterBar.svelte';
	import GroupBar from './components/GroupBar.svelte';

	type T = $$Generic;

	// Required props
	export let data: TableKitProps<T>['data'] = [];
	export let columns: TableKitProps<T>['columns'] = [];

	// Optional props with defaults
	export let storageKey: TableKitProps<T>['storageKey'] = 'table-kit';
	export let persistState: TableKitProps<T>['persistState'] = true;
	export let align: TableKitProps<T>['align'] = 'left';
	export let rowHeight: TableKitProps<T>['rowHeight'] = 'medium';
	export let columnSpacing: TableKitProps<T>['columnSpacing'] = 'normal';
	export let features: TableKitProps<T>['features'] = {
		columnVisibility: true,
		columnResizing: true,
		columnReordering: true,
		filtering: true,
		sorting: true,
		pagination: true
	};

	// Callbacks
	export let onRowClick: TableKitProps<T>['onRowClick'] = undefined;
	export let onRowSelect: TableKitProps<T>['onRowSelect'] = undefined;
	export let onStateChange: TableKitProps<T>['onStateChange'] = undefined;

	// State stores
	let sorting = writable<SortingState>([]);
	let columnVisibility = writable<VisibilityState>(
		persistState && storageKey ? loadColumnVisibility(storageKey) : {}
	);
	let columnSizing = writable<ColumnSizingState>(
		persistState && storageKey ? loadColumnSizing(storageKey) : {}
	);
	let columnFilters = writable<ColumnFiltersState>(
		persistState && storageKey ? loadColumnFilters(storageKey) : []
	);
	let columnOrder = writable<ColumnOrderState>(
		persistState && storageKey ? loadColumnOrder(storageKey) : []
	);

	// Custom filter conditions store (our FilterBar component)
	let filterConditions = writable<FilterCondition[]>([]);
	let filterLogic = writable<FilterLogic>('and');

	// Grouping state stores
	let grouping = writable<GroupingState>([]);
	let expanded = writable<ExpandedState>(true); // Default to expanded

	// Compute horizontal padding (column spacing)
	$: horizontalPadding = columnSpacing === 'narrow' ? 0.5 : columnSpacing === 'wide' ? 2.0 : 1.0;

	// Compute vertical padding (row height)
	$: verticalPadding =
		rowHeight === 'short' ? 0.375 :
		rowHeight === 'tall' ? 1.0 :
		rowHeight === 'extra_tall' ? 1.5 :
		0.75; // medium (default)

	// Apply client-side filtering before passing to TanStack Table
	$: filteredData = applyFilters(data, $filterConditions, $filterLogic);

	// Save state to localStorage when it changes
	$: if (persistState && storageKey && isBrowser) {
		saveColumnVisibility(storageKey, $columnVisibility);
		saveColumnSizing(storageKey, $columnSizing);
		saveColumnFilters(storageKey, $columnFilters);
		saveColumnOrder(storageKey, $columnOrder);
	}

	// Column picker visibility
	let showColumnPicker = false;

	// Row height and column spacing dropdowns
	let showRowHeightMenu = false;
	let showColumnSpacingMenu = false;

	// Drag and drop state
	let draggedColumnId: string | null = null;

	// Create table options
	const options = writable({
		data: filteredData,
		columns,
		columnResizeMode: 'onChange' as const,
		enableColumnResizing: features.columnResizing !== false,
		enableGrouping: features.grouping !== false,
		defaultColumn: {
			size: 180,
			minSize: 62,
			maxSize: 1000
		},
		state: {
			sorting: $sorting,
			columnVisibility: $columnVisibility,
			columnSizing: $columnSizing,
			columnFilters: $columnFilters,
			columnOrder: $columnOrder,
			grouping: $grouping,
			expanded: $expanded
		},
		onSortingChange: (updater: any) => {
			if (updater instanceof Function) {
				sorting.update(updater);
			} else {
				sorting.set(updater);
			}
		},
		onColumnVisibilityChange: (updater: any) => {
			if (updater instanceof Function) {
				columnVisibility.update(updater);
			} else {
				columnVisibility.set(updater);
			}
		},
		onColumnSizingChange: (updater: any) => {
			if (updater instanceof Function) {
				columnSizing.update(updater);
			} else {
				columnSizing.set(updater);
			}
		},
		onColumnFiltersChange: (updater: any) => {
			if (updater instanceof Function) {
				columnFilters.update(updater);
			} else {
				columnFilters.set(updater);
			}
		},
		onColumnOrderChange: (updater: any) => {
			if (updater instanceof Function) {
				columnOrder.update(updater);
			} else {
				columnOrder.set(updater);
			}
		},
		onGroupingChange: (updater: any) => {
			if (updater instanceof Function) {
				grouping.update(updater);
			} else {
				grouping.set(updater);
			}
		},
		onExpandedChange: (updater: any) => {
			if (updater instanceof Function) {
				expanded.update(updater);
			} else {
				expanded.set(updater);
			}
		},
		getCoreRowModel: getCoreRowModel(),
		...(features.sorting !== false && { getSortedRowModel: getSortedRowModel() }),
		...(features.filtering !== false && { getFilteredRowModel: getFilteredRowModel() }),
		...(features.grouping !== false && { getGroupedRowModel: getGroupedRowModel() }),
		...(features.grouping !== false && { getExpandedRowModel: getExpandedRowModel() }),
		...(features.pagination !== false && { getPaginationRowModel: getPaginationRowModel() })
	});

	// Update options when data or state changes
	$: options.update((old) => ({
		...old,
		data: filteredData,
		state: {
			sorting: $sorting,
			columnVisibility: $columnVisibility,
			columnSizing: $columnSizing,
			columnFilters: $columnFilters,
			columnOrder: $columnOrder,
			grouping: $grouping,
			expanded: $expanded
		}
	}));

	// Create the table instance
	const table = createSvelteTable(options);

	// Helper functions
	function toggleAllColumns(show: boolean) {
		$table.getAllLeafColumns().forEach((column) => {
			column.toggleVisibility(show);
		});
	}

	function handleDragStart(columnId: string) {
		if (features.columnReordering === false) return;
		draggedColumnId = columnId;
	}

	function handleDragOver(event: DragEvent) {
		if (features.columnReordering === false) return;
		event.preventDefault(); // Allow drop
	}

	function handleDrop(targetColumnId: string) {
		if (features.columnReordering === false) return;
		if (!draggedColumnId || draggedColumnId === targetColumnId) {
			draggedColumnId = null;
			return;
		}

		const oldIndex = $columnOrder.indexOf(draggedColumnId);
		const newIndex = $columnOrder.indexOf(targetColumnId);

		if (oldIndex !== -1 && newIndex !== -1) {
			const newColumnOrder = [...$columnOrder];
			const [movedColumn] = newColumnOrder.splice(oldIndex, 1);
			newColumnOrder.splice(newIndex, 0, movedColumn);
			columnOrder.set(newColumnOrder);
		}

		draggedColumnId = null;
	}

	// Initialize column order if empty
	$: if ($columnOrder.length === 0 && columns.length > 0) {
		columnOrder.set(columns.map((col) => col.accessorKey || col.id) as string[]);
	}

	// Check if any filters are active
	$: hasActiveFilters = $filterConditions.length > 0;

	// Emit state changes to parent
	$: if (onStateChange) {
		onStateChange({
			columnVisibility: $columnVisibility,
			columnOrder: $columnOrder,
			columnSizing: $columnSizing,
			columnFilters: $columnFilters,
			sorting: $sorting,
			pagination: $table.getState().pagination
		});
	}
</script>

<div class="table-kit-container align-{align}">
	<!-- Filters and Controls -->
	{#if features.filtering !== false || features.grouping !== false || features.columnVisibility !== false}
		<div class="table-kit-toolbar">
			<!-- Filter Controls -->
			{#if features.filtering !== false}
				<div class="table-kit-filters">
					<FilterBar
						{columns}
						conditions={$filterConditions}
						onConditionsChange={(newConditions) => filterConditions.set(newConditions)}
						logic={$filterLogic}
						onLogicChange={(newLogic) => filterLogic.set(newLogic)}
					/>
				</div>
			{/if}

			<!-- Group Controls -->
			{#if features.grouping !== false}
				<div class="table-kit-groups">
					<GroupBar
						{columns}
						grouping={$grouping}
						onGroupingChange={(newGrouping) => grouping.set(newGrouping)}
					/>
				</div>
			{/if}

			<!-- View Controls: Row Height and Column Spacing -->
			<div class="table-kit-view-controls">
				<!-- Row Height Button -->
				<div class="relative">
					<button
						on:click={() => (showRowHeightMenu = !showRowHeightMenu)}
						class="view-control-btn"
						title="Row Height"
					>
						<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
							/>
						</svg>
					</button>

					{#if showRowHeightMenu}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div class="backdrop" on:click={() => (showRowHeightMenu = false)} />
						<div class="dropdown-menu">
							<div class="dropdown-header">
								<span>Row Height</span>
							</div>
							<button
								class="dropdown-item"
								class:active={rowHeight === 'short'}
								on:click={() => {
									rowHeight = 'short';
									showRowHeightMenu = false;
								}}
							>
								<span class="item-icon">
									<svg class="icon-sm" viewBox="0 0 16 16" fill="currentColor">
										<rect x="2" y="7" width="12" height="2" />
									</svg>
								</span>
								Short
							</button>
							<button
								class="dropdown-item"
								class:active={rowHeight === 'medium'}
								on:click={() => {
									rowHeight = 'medium';
									showRowHeightMenu = false;
								}}
							>
								<span class="item-icon">
									<svg class="icon-sm" viewBox="0 0 16 16" fill="currentColor">
										<rect x="2" y="6" width="12" height="4" />
									</svg>
								</span>
								Medium
							</button>
							<button
								class="dropdown-item"
								class:active={rowHeight === 'tall'}
								on:click={() => {
									rowHeight = 'tall';
									showRowHeightMenu = false;
								}}
							>
								<span class="item-icon">
									<svg class="icon-sm" viewBox="0 0 16 16" fill="currentColor">
										<rect x="2" y="4" width="12" height="8" />
									</svg>
								</span>
								Tall
							</button>
							<button
								class="dropdown-item"
								class:active={rowHeight === 'extra_tall'}
								on:click={() => {
									rowHeight = 'extra_tall';
									showRowHeightMenu = false;
								}}
							>
								<span class="item-icon">
									<svg class="icon-sm" viewBox="0 0 16 16" fill="currentColor">
										<rect x="2" y="2" width="12" height="12" />
									</svg>
								</span>
								Extra Tall
							</button>
						</div>
					{/if}
				</div>

				<!-- Column Spacing Button -->
				<div class="relative">
					<button
						on:click={() => (showColumnSpacingMenu = !showColumnSpacingMenu)}
						class="view-control-btn"
						title="Column Spacing"
					>
						<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
							/>
						</svg>
					</button>

					{#if showColumnSpacingMenu}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div class="backdrop" on:click={() => (showColumnSpacingMenu = false)} />
						<div class="dropdown-menu">
							<div class="dropdown-header">
								<span>Column Spacing</span>
							</div>
							<button
								class="dropdown-item"
								class:active={columnSpacing === 'narrow'}
								on:click={() => {
									columnSpacing = 'narrow';
									showColumnSpacingMenu = false;
								}}
							>
								<span class="item-icon">
									<svg class="icon-sm" viewBox="0 0 16 16" fill="currentColor">
										<rect x="6" y="2" width="4" height="12" />
									</svg>
								</span>
								Narrow
							</button>
							<button
								class="dropdown-item"
								class:active={columnSpacing === 'normal'}
								on:click={() => {
									columnSpacing = 'normal';
									showColumnSpacingMenu = false;
								}}
							>
								<span class="item-icon">
									<svg class="icon-sm" viewBox="0 0 16 16" fill="currentColor">
										<rect x="4" y="2" width="8" height="12" />
									</svg>
								</span>
								Normal
							</button>
							<button
								class="dropdown-item"
								class:active={columnSpacing === 'wide'}
								on:click={() => {
									columnSpacing = 'wide';
									showColumnSpacingMenu = false;
								}}
							>
								<span class="item-icon">
									<svg class="icon-sm" viewBox="0 0 16 16" fill="currentColor">
										<rect x="2" y="2" width="12" height="12" />
									</svg>
								</span>
								Wide
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- Column Picker -->
			{#if features.columnVisibility !== false}
				<div class="table-kit-column-picker">
					<div class="relative">
						<button
							on:click={() => (showColumnPicker = !showColumnPicker)}
							class="column-picker-btn"
						>
							<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
								/>
							</svg>
							Columns
						</button>

						{#if showColumnPicker}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<div class="backdrop" on:click={() => (showColumnPicker = false)} />
							<div class="column-picker-dropdown">
								<div class="dropdown-header">
									<span>Toggle Columns</span>
									<div class="header-actions">
										<button on:click={() => toggleAllColumns(true)} class="text-btn">
											Show All
										</button>
										<span class="separator">|</span>
										<button on:click={() => toggleAllColumns(false)} class="text-btn">
											Hide All
										</button>
									</div>
								</div>
								<div class="column-list">
									{#each $table.getAllLeafColumns() as column}
										<label class="column-item">
											<input
												type="checkbox"
												checked={column.getIsVisible()}
												on:change={() => column.toggleVisibility()}
											/>
											<span>{column.columnDef.header}</span>
										</label>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Table -->
	{#if data.length === 0}
		<div class="table-kit-empty">
			<slot name="empty">
				<p>No data available.</p>
			</slot>
		</div>
	{:else}
		<div class="table-kit-scroll">
			<table class="table-kit-table">
				<thead>
					{#each $table.getHeaderGroups() as headerGroup}
						<tr>
							{#each headerGroup.headers as header}
								<th
									on:dragover={handleDragOver}
									on:drop|preventDefault={() => handleDrop(header.column.id)}
									class:dragging={draggedColumnId === header.column.id}
									style="width: {header.getSize()}px;"
								>
									{#if !header.isPlaceholder}
										<div
											class="th-content"
											style="padding: {verticalPadding}rem {horizontalPadding}rem; cursor: {features.columnReordering !==
											false
												? 'grab'
												: 'default'};"
											draggable={features.columnReordering !== false}
											on:dragstart={() => handleDragStart(header.column.id)}
										>
											<button
												class="sort-btn"
												class:sortable={header.column.getCanSort()}
												on:click={header.column.getToggleSortingHandler()}
											>
												<span class="header-text">
													<svelte:component
														this={flexRender(header.column.columnDef.header, header.getContext())}
													/>
												</span>
												{#if features.sorting !== false && header.column.getCanSort()}
													<span class="sort-icon">
														{{
															asc: '↑',
															desc: '↓'
														}[header.column.getIsSorted()] ?? '↕'}
													</span>
												{/if}
											</button>
										</div>
										<!-- Resize Handle -->
										{#if features.columnResizing !== false && header.column.getCanResize()}
											<!-- svelte-ignore a11y-no-static-element-interactions -->
											<div
												on:mousedown={(e) => {
													e.stopPropagation();
													header.getResizeHandler()(e);
												}}
												on:touchstart={(e) => {
													e.stopPropagation();
													header.getResizeHandler()(e);
												}}
												class="resize-handle"
												class:resizing={header.column.getIsResizing()}
											/>
										{/if}
									{/if}
								</th>
							{/each}
						</tr>
					{/each}
				</thead>
				<tbody>
					{#each $table.getRowModel().rows as row}
						<tr
							class:clickable={onRowClick !== undefined && !row.getIsGrouped()}
							class:group-row={row.getIsGrouped()}
							on:click={() => onRowClick && !row.getIsGrouped() && onRowClick(row.original)}
							style="--cell-padding-vertical: {verticalPadding}rem; --cell-padding-horizontal: {horizontalPadding}rem;"
						>
							{#each row.getVisibleCells() as cell}
								<td style="text-align: {align}; width: {cell.column.getSize()}px;">
									{#if cell.getIsGrouped()}
										<!-- Grouping column - show expand/collapse button -->
										<div class="group-cell">
											<button
												class="expand-btn"
												on:click|stopPropagation={() => row.toggleExpanded()}
											>
												{#if row.getIsExpanded()}
													<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 9l-7 7-7-7"
														/>
													</svg>
												{:else}
													<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M9 5l7 7-7 7"
														/>
													</svg>
												{/if}
											</button>
											<strong>
												<svelte:component
													this={flexRender(cell.column.columnDef.cell, cell.getContext())}
												/>
											</strong>
											<span class="group-count">({row.subRows.length})</span>
										</div>
									{:else if cell.getIsAggregated()}
										<!-- Aggregated cell - show computed value -->
										<slot name="cell" {cell} column={cell.column.id}>
											<svelte:component
												this={flexRender(
													cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell,
													cell.getContext()
												)}
											/>
										</slot>
									{:else if cell.getIsPlaceholder()}
										<!-- Placeholder cell - empty -->
									{:else}
										<!-- Normal cell -->
										<div class="cell-content">
											<slot name="cell" {cell} column={cell.column.id}>
												<svelte:component
													this={flexRender(cell.column.columnDef.cell, cell.getContext())}
												/>
											</slot>
										</div>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if features.pagination !== false}
			<div class="table-kit-pagination">
				<div class="pagination-info">
					<p>
						Showing
						<span class="font-medium">
							{$table.getState().pagination.pageIndex * $table.getState().pagination.pageSize + 1}
						</span>
						to
						<span class="font-medium">
							{Math.min(
								($table.getState().pagination.pageIndex + 1) * $table.getState().pagination.pageSize,
								$table.getFilteredRowModel().rows.length
							)}
						</span>
						of
						<span class="font-medium">{$table.getFilteredRowModel().rows.length}</span>
						results
					</p>
				</div>
				<div class="pagination-controls">
					<button
						on:click={() => $table.previousPage()}
						disabled={!$table.getCanPreviousPage()}
						class="pagination-btn"
					>
						<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<span class="page-indicator">
						Page {$table.getState().pagination.pageIndex + 1} of {$table.getPageCount()}
					</span>
					<button
						on:click={() => $table.nextPage()}
						disabled={!$table.getCanNextPage()}
						class="pagination-btn"
					>
						<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* Container */
	.table-kit-container {
		width: 100%;
		overflow-x: auto;
	}

	/* Toolbar */
	.table-kit-toolbar {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.table-kit-filters {
		flex: 1;
	}

	.clear-filters-btn {
		font-size: 0.75rem;
		color: #4f46e5;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		margin-bottom: 0.25rem;
	}

	.clear-filters-btn:hover {
		color: #4338ca;
	}

	/* Column Picker */
	.table-kit-column-picker {
		flex-shrink: 0;
	}

	.relative {
		position: relative;
	}

	.table-kit-view-controls {
		display: flex;
		gap: 0.5rem;
	}

	.view-control-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		color: #374151;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		cursor: pointer;
		transition: background 0.15s;
	}

	.view-control-btn:hover {
		background: #f9fafb;
	}

	.column-picker-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.375rem;
		cursor: pointer;
	}

	.column-picker-btn:hover {
		background: #f9fafb;
	}

	.icon {
		width: 1rem;
		height: 1rem;
	}

	.icon-sm {
		width: 0.875rem;
		height: 0.875rem;
	}

	.dropdown-menu {
		position: absolute;
		top: calc(100% + 0.25rem);
		right: 0;
		min-width: 10rem;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		z-index: 20;
		overflow: hidden;
	}

	.dropdown-header {
		padding: 0.5rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #6b7280;
		border-bottom: 1px solid #e5e7eb;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.625rem 0.75rem;
		font-size: 0.875rem;
		color: #374151;
		background: white;
		border: none;
		text-align: left;
		cursor: pointer;
		transition: background 0.15s;
	}

	.dropdown-item:hover {
		background: #f9fafb;
	}

	.dropdown-item.active {
		background: #eff6ff;
		color: #2563eb;
		font-weight: 500;
	}

	.item-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.25rem;
		height: 1.25rem;
		color: #9ca3af;
	}

	.dropdown-item.active .item-icon {
		color: #2563eb;
	}

	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 10;
	}

	.column-picker-dropdown {
		position: absolute;
		right: 0;
		z-index: 20;
		margin-top: 0.5rem;
		width: 14rem;
		border-radius: 0.375rem;
		background: white;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.dropdown-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 1rem;
		border-bottom: 1px solid #e5e7eb;
	}

	.dropdown-header span {
		font-size: 0.875rem;
		font-weight: 500;
		color: #111827;
	}

	.header-actions {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.text-btn {
		font-size: 0.75rem;
		color: #4f46e5;
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
	}

	.text-btn:hover {
		color: #4338ca;
	}

	.separator {
		color: #d1d5db;
	}

	.column-list {
		min-height: 3rem;
		max-height: 16rem;
		overflow-y: auto;
	}

	.column-item {
		display: flex;
		align-items: center;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		color: #374151;
		cursor: pointer;
	}

	.column-item:hover {
		background: #f9fafb;
	}

	.column-item input {
		margin-right: 0.75rem;
	}

	/* Table */
	.table-kit-empty {
		padding: 2rem 1rem;
		text-align: center;
		color: #6b7280;
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
	}

	.table-kit-scroll {
		overflow-x: auto;
		background: white;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border-radius: 0.5rem;
	}

	.table-kit-table {
		width: auto;
		border-collapse: collapse;
		table-layout: fixed;
	}

	thead {
		background: #f9fafb;
	}

	th {
		position: relative;
		padding: 0;
		text-align: left;
		font-size: 0.75rem;
		font-weight: 500;
		color: #6b7280;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		transition: opacity 0.2s;
	}

	.table-kit-container.align-left th {
		text-align: left !important;
	}

	.table-kit-container.align-center th {
		text-align: center !important;
	}

	.table-kit-container.align-right th {
		text-align: right !important;
	}

	th.dragging {
		opacity: 0.5;
	}

	.th-content {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		justify-content: flex-start;
		overflow: hidden;
		min-width: 0;
	}

	.table-kit-container.align-left .th-content {
		justify-content: flex-start !important;
	}

	.table-kit-container.align-center .th-content {
		justify-content: center !important;
	}

	.table-kit-container.align-right .th-content {
		justify-content: flex-end !important;
	}

	.sort-btn {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		background: none;
		border: none;
		padding: 0;
		font-size: inherit;
		font-weight: inherit;
		color: inherit;
		text-transform: inherit;
		letter-spacing: inherit;
		overflow: hidden;
		min-width: 0;
		flex: 1;
	}

	.header-text {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
		max-width: 100%;
	}

	.sort-btn.sortable {
		cursor: pointer;
	}

	.sort-btn.sortable:hover {
		color: #374151;
	}

	.sort-icon {
		color: #9ca3af;
	}

	.resize-handle {
		position: absolute;
		top: 0;
		right: -0.375rem;
		height: 100%;
		width: 0.75rem;
		cursor: col-resize;
		user-select: none;
		touch-action: none;
		background: transparent;
		z-index: 10;
		transition: background 0.15s;
	}

	.resize-handle:hover {
		background: rgba(79, 70, 229, 0.1);
	}

	.resize-handle:hover::after,
	.resize-handle.resizing::after {
		content: '';
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		height: 100%;
		width: 0.125rem;
		background: #4f46e5;
	}

	tbody tr {
		border-bottom: 1px solid #e5e7eb;
	}

	tbody tr:hover {
		background: #f9fafb;
	}

	tbody tr.clickable {
		cursor: pointer;
	}

	td {
		font-size: 0.875rem;
		color: #111827;
		text-align: left;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 0;
	}

	.table-kit-container.align-left td {
		text-align: left !important;
	}

	.table-kit-container.align-center td {
		text-align: center !important;
	}

	.table-kit-container.align-right td {
		text-align: right !important;
	}

	.cell-content {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		padding: var(--cell-padding-vertical, 1rem) var(--cell-padding-horizontal, 1rem);
	}

	/* Group Rows */
	tbody tr.group-row {
		background: #f9fafb;
		font-weight: 500;
	}

	tbody tr.group-row:hover {
		background: #f3f4f6;
	}

	.group-cell {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.expand-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		background: none;
		border: none;
		cursor: pointer;
		color: #6b7280;
		border-radius: 0.25rem;
		transition: all 0.2s;
	}

	.expand-btn:hover {
		background: #e5e7eb;
		color: #374151;
	}

	.group-count {
		font-size: 0.75rem;
		font-weight: 400;
		color: #6b7280;
	}

	/* Pagination */
	.table-kit-pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: white;
		border-top: 1px solid #e5e7eb;
		border-bottom-left-radius: 0.5rem;
		border-bottom-right-radius: 0.5rem;
	}

	.pagination-info p {
		font-size: 0.875rem;
		color: #374151;
		margin: 0;
	}

	.pagination-info .font-medium {
		font-weight: 500;
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		border-radius: 0.375rem;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.pagination-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #6b7280;
		background: white;
		border: 1px solid #d1d5db;
		cursor: pointer;
	}

	.pagination-btn:first-child {
		border-top-left-radius: 0.375rem;
		border-bottom-left-radius: 0.375rem;
	}

	.pagination-btn:last-child {
		border-top-right-radius: 0.375rem;
		border-bottom-right-radius: 0.375rem;
	}

	.pagination-btn:hover:not(:disabled) {
		background: #f9fafb;
	}

	.pagination-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.page-indicator {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
		background: white;
		border-top: 1px solid #d1d5db;
		border-bottom: 1px solid #d1d5db;
	}
</style>
