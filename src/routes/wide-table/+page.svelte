<script lang="ts">
	import { TableKit } from '$lib';

	// Data with many columns to test overflow behavior
	const data = [
		{
			id: 1,
			firstName: 'Alice',
			lastName: 'Johnson',
			email: 'alice@example.com',
			phone: '555-0101',
			department: 'Engineering',
			title: 'Senior Developer',
			location: 'New York',
			startDate: '2020-01-15',
			salary: '$120,000',
			manager: 'Bob Smith',
			status: 'Active',
			employeeId: 'EMP001',
			division: 'Technology',
			teamSize: '8',
			projects: '12'
		},
		{
			id: 2,
			firstName: 'Bob',
			lastName: 'Smith',
			email: 'bob@example.com',
			phone: '555-0102',
			department: 'Engineering',
			title: 'Engineering Manager',
			location: 'San Francisco',
			startDate: '2018-03-20',
			salary: '$150,000',
			manager: 'Carol Davis',
			status: 'Active',
			employeeId: 'EMP002',
			division: 'Technology',
			teamSize: '25',
			projects: '8'
		},
		{
			id: 3,
			firstName: 'Carol',
			lastName: 'Davis',
			email: 'carol@example.com',
			phone: '555-0103',
			department: 'Product',
			title: 'VP of Engineering',
			location: 'Austin',
			startDate: '2015-07-01',
			salary: '$200,000',
			manager: 'David Chen',
			status: 'Active',
			employeeId: 'EMP003',
			division: 'Technology',
			teamSize: '100',
			projects: '25'
		},
		{
			id: 4,
			firstName: 'David',
			lastName: 'Chen',
			email: 'david@example.com',
			phone: '555-0104',
			department: 'Executive',
			title: 'CTO',
			location: 'New York',
			startDate: '2012-01-10',
			salary: '$300,000',
			manager: 'CEO',
			status: 'Active',
			employeeId: 'EMP004',
			division: 'Executive',
			teamSize: '250',
			projects: '50'
		},
		{
			id: 5,
			firstName: 'Emma',
			lastName: 'Wilson',
			email: 'emma@example.com',
			phone: '555-0105',
			department: 'Design',
			title: 'Senior Designer',
			location: 'Los Angeles',
			startDate: '2019-05-15',
			salary: '$110,000',
			manager: 'Frank Lee',
			status: 'Active',
			employeeId: 'EMP005',
			division: 'Product',
			teamSize: '5',
			projects: '15'
		},
		{
			id: 6,
			firstName: 'Frank',
			lastName: 'Lee',
			email: 'frank@example.com',
			phone: '555-0106',
			department: 'Design',
			title: 'Design Director',
			location: 'Seattle',
			startDate: '2017-09-01',
			salary: '$140,000',
			manager: 'Carol Davis',
			status: 'Active',
			employeeId: 'EMP006',
			division: 'Product',
			teamSize: '15',
			projects: '20'
		},
		{
			id: 7,
			firstName: 'Grace',
			lastName: 'Martinez',
			email: 'grace@example.com',
			phone: '555-0107',
			department: 'Marketing',
			title: 'Marketing Manager',
			location: 'Chicago',
			startDate: '2020-11-01',
			salary: '$105,000',
			manager: 'Henry Taylor',
			status: 'Active',
			employeeId: 'EMP007',
			division: 'Marketing',
			teamSize: '10',
			projects: '18'
		},
		{
			id: 8,
			firstName: 'Henry',
			lastName: 'Taylor',
			email: 'henry@example.com',
			phone: '555-0108',
			department: 'Marketing',
			title: 'VP of Marketing',
			location: 'Boston',
			startDate: '2016-04-15',
			salary: '$180,000',
			manager: 'David Chen',
			status: 'Active',
			employeeId: 'EMP008',
			division: 'Marketing',
			teamSize: '40',
			projects: '30'
		}
	];

	// 16 columns - should definitely overflow most containers
	const columns = [
		{ accessorKey: 'id', header: 'ID', size: 80 },
		{ accessorKey: 'firstName', header: 'First Name', size: 150 },
		{ accessorKey: 'lastName', header: 'Last Name', size: 150 },
		{ accessorKey: 'email', header: 'Email Address', size: 200 },
		{ accessorKey: 'phone', header: 'Phone Number', size: 140 },
		{ accessorKey: 'department', header: 'Department', size: 150 },
		{ accessorKey: 'title', header: 'Job Title', size: 180 },
		{ accessorKey: 'location', header: 'Office Location', size: 150 },
		{ accessorKey: 'startDate', header: 'Start Date', size: 130 },
		{ accessorKey: 'salary', header: 'Annual Salary', size: 130 },
		{ accessorKey: 'manager', header: 'Reports To', size: 150 },
		{ accessorKey: 'status', header: 'Employment Status', size: 150 },
		{ accessorKey: 'employeeId', header: 'Employee ID', size: 130 },
		{ accessorKey: 'division', header: 'Division', size: 130 },
		{ accessorKey: 'teamSize', header: 'Team Size', size: 120 },
		{ accessorKey: 'projects', header: 'Active Projects', size: 140 }
	];

	// Row height control
	let rowHeight: 'short' | 'medium' | 'tall' | 'extra_tall' = 'medium';

	// Column spacing control
	let columnSpacing: 'narrow' | 'normal' | 'wide' = 'normal';
</script>

<svelte:head>
	<title>Wide Table Test - Svelte Table Kit</title>
</svelte:head>

<div class="container">
	<header>
		<h1>🧪 Wide Table Test</h1>
		<p class="subtitle">Testing column width behavior with overflow (16 columns)</p>
		<a href="/" class="back-link">← Back to main demo</a>
	</header>

	<main>
		<section>
			<h2>Test Scenario</h2>
			<div class="info-box">
				<p><strong>Purpose:</strong> Test column resizing behavior when table width exceeds container width</p>
				<p><strong>Columns:</strong> 16 columns with default widths totaling ~2,300px</p>
				<p><strong>Expected behavior:</strong> Horizontal scroll should appear, columns should resize smoothly</p>
				<p><strong>Potential issues to check:</strong></p>
				<ul>
					<li>Column resize handles still functional when scrolled?</li>
					<li>Minimum column widths respected (62px)?</li>
					<li>Maximum column widths respected (1000px)?</li>
					<li>Does resizing work at edges of visible area?</li>
					<li>Column order preserved when resizing?</li>
				</ul>
			</div>

			<div class="table-wrapper">
				<TableKit
					{data}
					{columns}
					{rowHeight}
					{columnSpacing}
					storageKey="wide-table-test"
					align="left"
					features={{
						columnVisibility: true,
						columnResizing: true,
						columnReordering: true,
						sorting: true,
						sortingMode: 'control',
						pagination: true,
						filtering: true,
						grouping: true
					}}
				/>
			</div>
		</section>

		<section>
			<h2>💡 Testing Tips</h2>
			<ul class="tips">
				<li>Try scrolling horizontally to see all columns</li>
				<li>Attempt to resize columns at the left edge, middle, and right edge</li>
				<li>Try hiding/showing columns using the column picker</li>
				<li>Test reordering columns when scrolled</li>
				<li>Use browser DevTools to check actual column widths</li>
				<li>Try different viewport widths (resize browser window)</li>
			</ul>
		</section>
	</main>
</div>

<style>
	.container {
		max-width: 100%;
		margin: 0 auto;
		padding: 2rem;
	}

	header {
		margin-bottom: 2rem;
	}

	h1 {
		font-size: 2rem;
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	.subtitle {
		font-size: 1.1rem;
		color: #666;
		margin: 0 0 1rem 0;
	}

	.back-link {
		display: inline-block;
		color: #4f46e5;
		text-decoration: none;
		font-weight: 500;
		padding: 0.5rem 0;
	}

	.back-link:hover {
		text-decoration: underline;
	}

	h2 {
		font-size: 1.5rem;
		margin: 2rem 0 1rem 0;
		color: #444;
	}

	section {
		margin: 2rem 0;
	}

	.info-box {
		background: #f0f9ff;
		border: 1px solid #0ea5e9;
		border-radius: 0.5rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.info-box p {
		margin: 0.5rem 0;
	}

	.info-box ul {
		margin: 0.5rem 0 0 1.5rem;
	}

	.info-box li {
		margin: 0.25rem 0;
	}

	.table-wrapper {
		/* No max-width constraint - let it overflow naturally */
		width: 100%;
		overflow-x: auto;
		border: 2px dashed #e5e7eb;
		border-radius: 0.5rem;
		padding: 1rem;
		background: #fafafa;
	}

	.tips {
		list-style: none;
		padding: 0;
	}

	.tips li {
		padding: 0.5rem 0;
		padding-left: 1.5rem;
		position: relative;
	}

	.tips li::before {
		content: '→';
		position: absolute;
		left: 0;
		color: #4f46e5;
		font-weight: bold;
	}
</style>
