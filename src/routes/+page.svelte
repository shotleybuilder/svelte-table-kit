<script lang="ts">
	import { TableKit } from '$lib';

	// Example data - more realistic enforcement-style data
	const data = [
		{
			id: 1,
			type: 'Case',
			date: '2024-03-15',
			organization: 'ABC Manufacturing Ltd',
			description: 'Health & Safety violation',
			fine_amount: '£25,000',
			status: 'Closed'
		},
		{
			id: 2,
			type: 'Notice',
			date: '2024-03-10',
			organization: 'XYZ Construction',
			description: 'Improvement notice issued',
			fine_amount: '-',
			status: 'Active'
		},
		{
			id: 3,
			type: 'Case',
			date: '2024-02-28',
			organization: 'Global Logistics Inc',
			description: 'Environmental breach',
			fine_amount: '£50,000',
			status: 'Closed'
		},
		{
			id: 4,
			type: 'Notice',
			date: '2024-02-20',
			organization: 'Tech Solutions Ltd',
			description: 'Prohibition notice',
			fine_amount: '-',
			status: 'Active'
		},
		{
			id: 5,
			type: 'Case',
			date: '2024-01-15',
			organization: 'Food Services Group',
			description: 'Food safety violation',
			fine_amount: '£10,000',
			status: 'Closed'
		}
	];

	// Example columns with types
	const columns = [
		{
			accessorKey: 'type',
			header: 'Type',
			size: 100
		},
		{
			accessorKey: 'date',
			header: 'Date',
			size: 120
		},
		{
			accessorKey: 'organization',
			header: 'Organization',
			size: 200
		},
		{
			accessorKey: 'description',
			header: 'Description',
			size: 250
		},
		{
			accessorKey: 'fine_amount',
			header: 'Fine',
			size: 120
		},
		{
			accessorKey: 'status',
			header: 'Status',
			size: 100
		}
	];

	// Handle row click
	function handleRowClick(row: any) {
		console.log('Row clicked:', row);
		alert(`Clicked: ${row.organization}`);
	}

	// Row height control
	let rowHeight: 'short' | 'medium' | 'tall' | 'extra_tall' = 'medium';

	// Column spacing control
	let columnSpacing: 'narrow' | 'normal' | 'wide' = 'normal';
</script>

<svelte:head>
	<title>Svelte Table Kit - Example</title>
</svelte:head>

<div class="container">
	<header>
		<h1>🎯 Svelte Table Kit</h1>
		<p>AI-configurable data tables for Svelte & SvelteKit</p>
		<p class="subtitle">
			Extracted from sertantai-enforcement • Built on TanStack Table v8
		</p>
		<nav class="test-links">
			<a href="/wide-table">🧪 Wide Table Test (16 columns)</a>
		</nav>
	</header>

	<main>
		<section>
			<h2>✨ Full-Featured Example</h2>
			<p class="description">
				Try column resizing (drag borders), reordering (drag headers), Airtable-style sorting (Sort button),
				filtering (Filter button), row height and column spacing controls (toolbar buttons), and column visibility (Columns button).
				Note: Columns are displayed in a custom order (Organization, Type, Status, Date, Description, Fine) via config.defaultColumnOrder.
			</p>

			<TableKit
				{data}
				{columns}
				{rowHeight}
				{columnSpacing}
				storageKey="example-table-v4"
				onRowClick={handleRowClick}
				align="left"
				config={{
					defaultColumnOrder: ['organization', 'type', 'status', 'date', 'description', 'fine_amount']
				}}
				features={{
					columnVisibility: true,
					columnResizing: true,
					columnReordering: true,
					sorting: true,
					sortingMode: 'control', // Use Airtable-style sort control
					pagination: true,
					filtering: true
				}}
			/>
		</section>

		<section>
			<h2>📋 Features</h2>
			<ul class="features">
				<li>✅ Column visibility picker</li>
				<li>✅ Column resizing (drag borders)</li>
				<li>✅ Column reordering (native HTML5 drag & drop)</li>
				<li>✅ Sorting (click headers)</li>
				<li>✅ Pagination</li>
				<li>✅ LocalStorage persistence</li>
				<li>✅ TypeScript support</li>
				<li>✅ Feature flags for granular control</li>
			</ul>
		</section>

		<section>
			<h2>🚀 Getting Started</h2>
			<pre><code>npm install @sertantai/svelte-table-kit</code></pre>
			<pre><code>&lt;script&gt;
  import &#123; TableKit &#125; from '@sertantai/svelte-table-kit';
&lt;/script&gt;

&lt;TableKit &#123;data&#125; &#123;columns&#125; storageKey="my-table" /&gt;</code></pre>
		</section>
	</main>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	header p {
		font-size: 1.2rem;
		color: #666;
		margin: 0;
	}

	.test-links {
		margin-top: 1rem;
	}

	.test-links a {
		display: inline-block;
		padding: 0.5rem 1rem;
		background: #f0f9ff;
		color: #0369a1;
		text-decoration: none;
		border-radius: 0.375rem;
		border: 1px solid #0ea5e9;
		font-weight: 500;
		transition: all 0.2s;
	}

	.test-links a:hover {
		background: #0ea5e9;
		color: white;
	}

	h2 {
		font-size: 1.5rem;
		margin: 2rem 0 1rem 0;
		color: #444;
	}

	section {
		margin: 2rem 0;
	}
</style>
