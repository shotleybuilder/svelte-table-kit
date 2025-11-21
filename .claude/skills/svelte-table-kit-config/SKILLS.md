---
name: svelte-table-kit-config
description: Configures @shotleybuilder/svelte-table-kit with advanced filtering (12 operators, AND/OR logic), multi-level grouping (up to 3 levels), sorting, pagination, column controls (resizing, reordering, visibility), row height & column spacing adjustments, and text truncation. Use when implementing Airtable-like tables in Svelte, when users request table features, or when building data-heavy UIs with complex filtering and grouping requirements.
---

# Svelte Table Kit Configuration

Configure production-ready tables with Airtable-like features using TanStack Table v8.

## Table of Contents

- [Installation](#installation)
- [Basic Setup](#basic-setup)
- [Sorting](#sorting)
- [Advanced Filtering](#advanced-filtering)
- [Multi-Level Grouping](#multi-level-grouping)
- [Column Controls](#column-controls)
- [State Persistence](#state-persistence)
- [Feature Flags](#feature-flags)
- [Troubleshooting](#troubleshooting)

## Installation

```bash
npm install @shotleybuilder/svelte-table-kit
```

Peer dependency:
```bash
npm install @tanstack/svelte-table
```

## Basic Setup

```svelte
<script lang="ts">
  import { TableKit } from '@shotleybuilder/svelte-table-kit';
  import type { ColumnDef } from '@tanstack/svelte-table';

  type User = { id: number; name: string; email: string; role: string };

  const data: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' }
  ];

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' }
  ];
</script>

<TableKit {data} {columns} />
```

## Sorting

### Column Header Sorting (Default)

Click column headers to sort:

```svelte
<TableKit {data} {columns} features={{ sorting: true }} />
```

Headers show ↑ (asc), ↓ (desc), or ↕ (unsorted) indicators.

### Airtable-Style Sort Control

Use dedicated sort dropdown (like Airtable):

```svelte
<TableKit
  {data}
  {columns}
  features={{
    sorting: true,
    sortingMode: 'control'  // Use sort dropdown instead of column headers
  }}
/>
```

SortBar renders with:
- Column selector dropdown
- Direction selector: "↑ A → Z" (ascending) or "↓ Z → A" (descending)
- Multiple sort levels (applied top to bottom)
- Remove and "Clear all" buttons

**When to use:**
- `sortingMode: 'header'` (default) - Traditional table sorting, click headers
- `sortingMode: 'control'` - Airtable-style UI, better for complex multi-column sorts

### Disable Sorting on Specific Columns

```typescript
const columns: ColumnDef<T>[] = [
  { accessorKey: 'id', header: 'ID', enableSorting: false },
  { accessorKey: 'name', header: 'Name' }  // Sortable by default
];
```

## Advanced Filtering

### Enable Filtering

```svelte
<TableKit
  {data}
  {columns}
  features={{ filtering: true }}
/>
```

FilterBar automatically renders with:
- 12 operators: equals, not_equals, contains, not_contains, starts_with, ends_with, is_empty, is_not_empty, greater_than, less_than, greater_or_equal, less_or_equal
- AND/OR logic toggle
- Collapsible UI with active filter count badge

### Programmatic Filtering

```svelte
<script lang="ts">
  import { createTextFilter, createNumericFilter } from '@shotleybuilder/svelte-table-kit';

  // Create filter conditions
  const filters = [
    createTextFilter('name', 'Alice'),
    createNumericFilter('id', 'greater_than', 100)
  ];
</script>
```

### Custom Filter Operators

Available operators in `FilterCondition`:

```typescript
type FilterOperator =
  | 'equals' | 'not_equals'
  | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'is_empty' | 'is_not_empty'
  | 'greater_than' | 'less_than'
  | 'greater_or_equal' | 'less_or_equal';
```

## Multi-Level Grouping

### Enable Grouping

```svelte
<TableKit
  {data}
  {columns}
  features={{ grouping: true }}
/>
```

GroupBar automatically renders with:
- Add up to 3 group levels
- Expand/collapse controls
- Visual indentation based on nesting
- Item count per group

### Configure Groupable Columns

```typescript
const columns: ColumnDef<T>[] = [
  {
    accessorKey: 'category',
    header: 'Category',
    enableGrouping: true  // Allow grouping by this column
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    enableGrouping: false,  // Prevent grouping
    aggregationFn: 'sum',   // Show sum in group rows
    aggregatedCell: ({ getValue }) => `$${getValue()?.toLocaleString()}`
  }
];
```

### Group Row Rendering

Group rows automatically show:
- Expand/collapse chevron (▶/▼)
- Bold group value
- Item count: "(5)"
- Indentation: 2rem per level

## Column Controls

### Visibility

```svelte
<TableKit
  {data}
  {columns}
  features={{ columnVisibility: true }}
/>
```

Column picker dropdown with:
- Show/Hide toggles
- Show All / Hide All buttons

### Resizing

```svelte
<TableKit
  {data}
  {columns}
  features={{ columnResizing: true }}
/>
```

Drag column borders to resize (62px-1000px range). Text automatically truncates with ellipsis when columns are narrow.

### Reordering

```svelte
<TableKit
  {data}
  {columns}
  features={{ columnReordering: true }}
/>
```

Drag column headers to reorder using native HTML5 drag & drop.

### Sorting

```svelte
<TableKit
  {data}
  {columns}
  features={{ sorting: true }}
/>
```

Click headers to sort. Visual indicators: ↑ ↓ ↕

### Pagination

```svelte
<TableKit
  {data}
  {columns}
  features={{ pagination: true }}
/>
```

Pagination controls with page size options.

### Row Height & Column Spacing

```svelte
<TableKit
  {data}
  {columns}
  rowHeight="medium"
  columnSpacing="normal"
/>
```

**Row Height Options:**
- `'short'` - Compact rows (0.375rem vertical padding)
- `'medium'` - Default (0.75rem vertical padding)
- `'tall'` - Spacious rows (1.0rem vertical padding)
- `'extra_tall'` - Maximum spacing (1.5rem vertical padding)

**Column Spacing Options:**
- `'narrow'` - Tight spacing (0.5rem horizontal padding)
- `'normal'` - Default (1.0rem horizontal padding)
- `'wide'` - Generous spacing (2.0rem horizontal padding)

Built-in toolbar controls allow users to adjust these settings with dropdown menus.

## State Persistence

### Enable localStorage Persistence

```svelte
<TableKit
  {data}
  {columns}
  storageKey="my-table"
  persistState={true}
/>
```

Persists:
- Column visibility
- Column sizing
- Column order
- Filters
- Sorting
- Grouping
- Pagination

### Disable Persistence

```svelte
<TableKit
  {data}
  {columns}
  persistState={false}
/>
```

## Feature Flags

Enable only needed features:

```svelte
<TableKit
  {data}
  {columns}
  features={{
    columnVisibility: true,
    columnResizing: true,
    columnReordering: true,
    filtering: true,
    sorting: true,
    pagination: true,
    grouping: true
  }}
/>
```

Disable specific features:

```svelte
<TableKit
  {data}
  {columns}
  features={{
    filtering: false,     // Hide FilterBar
    grouping: false,      // Hide GroupBar
    pagination: false     // Hide pagination controls
  }}
/>
```

## Callbacks

### Row Click

```svelte
<TableKit
  {data}
  {columns}
  onRowClick={(row) => console.log('Clicked:', row)}
/>
```

### State Change

```svelte
<TableKit
  {data}
  {columns}
  onStateChange={(state) => {
    console.log('Filters:', state.columnFilters);
    console.log('Grouping:', state.grouping);
    console.log('Sorting:', state.sorting);
  }}
/>
```

## Styling

TableKit uses scoped CSS. Override styles:

```svelte
<TableKit
  {data}
  {columns}
  classNames={{
    container: 'custom-container',
    table: 'custom-table',
    thead: 'custom-thead',
    tbody: 'custom-tbody'
  }}
/>
```

Or target classes globally:

```css
:global(.table-kit-container) {
  /* Custom styles */
}

:global(.group-row) {
  background: #f0f9ff;
}
```

## AI Configuration Example

Generate table config from natural language:

```typescript
// AI function to generate TableConfig from user intent
async function configureTableFromPrompt(prompt: string) {
  const response = await aiAgent.ask({
    prompt: `Generate TableConfig for: ${prompt}`,
    schema: {
      filters: [{ field: string, operator: FilterOperator, value: any }],
      grouping: string[],  // Column IDs in order
      sorting: [{ columnId: string, direction: 'asc' | 'desc' }],
      columnOrder: string[]
    }
  });

  return response.config;
}

// Example: "Show only users from 2024, grouped by role, sorted by name"
const config = await configureTableFromPrompt("Show only users from 2024, grouped by role, sorted by name");

// Apply to table
applyConfig(config);
```

## Troubleshooting

**FilterBar not showing:**
- Verify `features.filtering !== false`
- Check columns have `accessorKey` or `id`

**Grouping not working:**
- Verify `features.grouping !== false`
- Set `enableGrouping: true` on columns (or leave undefined, defaults to true)
- Ensure column has `accessorKey` or `id`

**SortBar not showing:**
- Verify `features.sorting !== false` and `features.sortingMode === 'control'`
- Check columns have `accessorKey` or `id`
- Ensure columns have `enableSorting !== false`

**Column headers still sortable with sortingMode: 'control':**
- Check `sortingMode` is set to `'control'` not `'header'`
- Verify feature flag is in `features` object

**State not persisting:**
- Check `persistState={true}` is set
- Verify `storageKey` is unique per table
- Check browser localStorage is enabled

**Group rows not rendering:**
- Ensure `getGroupedRowModel()` is enabled (automatic when grouping feature enabled)
- Check console for errors
- Verify data is not empty

**Slow performance with large datasets:**
- TanStack Table is optimized for client-side rendering
- For 100k+ rows, consider server-side pagination/filtering
- Use `manualGrouping`, `manualFiltering`, `manualSorting` for server-side operations

**TypeScript errors:**
- Install `@tanstack/svelte-table` peer dependency
- Ensure types are imported: `import type { ColumnDef } from '@tanstack/svelte-table'`

## Advanced Patterns

### Conditional Column Grouping

```typescript
const columns: ColumnDef<T>[] = [
  {
    accessorKey: 'status',
    enableGrouping: data.length > 100  // Only allow grouping for large datasets
  }
];
```

### Custom Cell Rendering in Groups

```svelte
<TableKit {data} {columns}>
  <svelte:fragment slot="cell" let:cell let:column>
    {#if column === 'amount'}
      <span class="currency">${cell.getValue()}</span>
    {:else}
      {cell.getValue()}
    {/if}
  </svelte:fragment>
</TableKit>
```

### Programmatic Group Control

```svelte
<script lang="ts">
  import { writable } from 'svelte/store';

  // Control grouping externally
  const grouping = writable<string[]>(['category', 'status']);

  function addGroupLevel(columnId: string) {
    grouping.update(g => [...g, columnId]);
  }
</script>

<!-- Bind to table -->
<TableKit {data} {columns} bind:grouping={$grouping} />
```

## References

- **Full API Documentation:** [README.md](../../../README.md)
- **Development Roadmap:** [ROADMAP.md](../../../ROADMAP.md)
- **TanStack Table Docs:** https://tanstack.com/table/v8
- **Source Code:** https://github.com/shotleybuilder/svelte-table-kit
