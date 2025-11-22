<script lang="ts">
	import type { Column } from '@tanstack/svelte-table';
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';

	export let column: Column<any>;
	export let isOpen = false;
	export let canSort = true;
	export let canFilter = true;
	export let canGroup = true;

	const dispatch = createEventDispatcher();

	let menuElement: HTMLElement;

	// Get current sort state
	$: currentSort = column.getIsSorted();
	$: canSortColumn = canSort && column.getCanSort();
	$: canFilterColumn = canFilter;
	$: canGroupColumn = canGroup;

	function handleSortAsc() {
		dispatch('sort', { direction: 'asc' });
		dispatch('close');
	}

	function handleSortDesc() {
		dispatch('sort', { direction: 'desc' });
		dispatch('close');
	}

	function handleFilter() {
		dispatch('filter');
		dispatch('close');
	}

	function handleGroup() {
		dispatch('group');
		dispatch('close');
	}

	function handleHideColumn() {
		dispatch('hide');
		dispatch('close');
	}

	// Close on outside click
	function handleClickOutside(event: MouseEvent) {
		if (menuElement && !menuElement.contains(event.target as Node)) {
			dispatch('close');
		}
	}

	// Close on Escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			dispatch('close');
		}
	}

	// Manage event listeners based on isOpen state (browser only)
	$: {
		if (browser) {
			if (isOpen) {
				// Add a small delay to prevent immediate closing from the same click that opened the menu
				setTimeout(() => {
					document.addEventListener('mousedown', handleClickOutside);
					document.addEventListener('keydown', handleKeydown);
				}, 0);
			} else {
				document.removeEventListener('mousedown', handleClickOutside);
				document.removeEventListener('keydown', handleKeydown);
			}
		}
	}

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if isOpen}
	<div class="column-menu" bind:this={menuElement}>
		<!-- Sort Actions -->
		{#if canSortColumn}
			<button
				class="menu-item"
				class:active={currentSort === 'asc'}
				on:click={handleSortAsc}
			>
				<svg
					class="menu-icon"
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M8 12V4M8 4L5 7M8 4L11 7"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span>Sort A → Z</span>
				{#if currentSort === 'asc'}
					<span class="check-icon">✓</span>
				{/if}
			</button>

			<button
				class="menu-item"
				class:active={currentSort === 'desc'}
				on:click={handleSortDesc}
			>
				<svg
					class="menu-icon"
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M8 4V12M8 12L11 9M8 12L5 9"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span>Sort Z → A</span>
				{#if currentSort === 'desc'}
					<span class="check-icon">✓</span>
				{/if}
			</button>

			<div class="menu-divider"></div>
		{/if}

		<!-- Filter by this field -->
		{#if canFilterColumn}
			<button class="menu-item" on:click={handleFilter}>
				<svg
					class="menu-icon"
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2 3h12M4 6h8M6 9h4M7 12h2"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span>Filter by this field</span>
			</button>

			<div class="menu-divider"></div>
		{/if}

		<!-- Group by this field -->
		{#if canGroupColumn}
			<button class="menu-item" on:click={handleGroup}>
				<svg
					class="menu-icon"
					width="16"
					height="16"
					viewBox="0 0 16 16"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2 4h12M4 8h8M6 12h4"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				<span>Group by this field</span>
			</button>

			<div class="menu-divider"></div>
		{/if}

		<!-- Hide Field -->
		<button class="menu-item" on:click={handleHideColumn}>
			<svg
				class="menu-icon"
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M2 8C2 8 4.5 3 8 3C11.5 3 14 8 14 8C14 8 11.5 13 8 13C4.5 13 2 8 2 8Z"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
				<circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5" />
				<line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" stroke-width="1.5" />
			</svg>
			<span>Hide field</span>
		</button>
	</div>
{/if}

<style>
	.column-menu {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 0.25rem;
		min-width: 12rem;
		background: white;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 0.375rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		padding: 0.25rem;
		z-index: 50;
	}

	.menu-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: none;
		background: transparent;
		text-align: left;
		font-size: 0.875rem;
		cursor: pointer;
		border-radius: 0.25rem;
		transition: background-color 0.15s;
		color: #374151;
		position: relative;
	}

	.menu-item:hover {
		background-color: #f3f4f6;
	}

	.menu-item.active {
		background-color: #eff6ff;
		color: #1e40af;
	}

	.menu-item.active:hover {
		background-color: #dbeafe;
	}

	.menu-icon {
		flex-shrink: 0;
		color: #6b7280;
	}

	.menu-item:hover .menu-icon {
		color: #374151;
	}

	.menu-item.active .menu-icon {
		color: #3b82f6;
	}

	.check-icon {
		margin-left: auto;
		color: #3b82f6;
		font-weight: bold;
		font-size: 1rem;
	}

	.menu-divider {
		height: 1px;
		background-color: #e5e7eb;
		margin: 0.25rem 0;
	}
</style>
