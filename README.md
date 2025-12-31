# 🎯 Svelte Table Kit

**A comprehensive, AI-configurable data table component for Svelte and SvelteKit, built on TanStack Table v8.**

[![npm version](https://img.shields.io/npm/v/@shotleybuilder/svelte-table-kit.svg)](https://www.npmjs.com/package/@shotleybuilder/svelte-table-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Svelte Table Kit brings Airtable-like functionality to your Svelte applications with a headless, fully customizable table component. Perfect for dashboards, data grids, and complex data visualization needs.

---

## ✨ Features

**Core Table Features:**
- 🎯 Column visibility picker with show/hide controls
- 📏 Column resizing with drag handles (62px-1000px range)
- 🔄 Column reordering via native HTML5 drag & drop
- 📐 **Row height control** - 4 sizes: short, medium, tall, extra tall
- ↔️ **Column spacing control** - 3 sizes: narrow, normal, wide
- 🔍 **Advanced filtering** - 12 operators with AND/OR logic
- 📊 **Multi-level grouping** - Up to 3 nested levels (like Airtable)
- ⬆️ **Flexible sorting** - Column header or Airtable-style sort control
- 📄 Pagination with customizable page sizes
- 💾 LocalStorage persistence for all user preferences
- ✂️ Text truncation with ellipsis for long content
- 📋 **Column context menu** - Quick access to sort, filter, group, and hide actions

**Advanced Filtering:**
- 12 filter operators: equals, contains, starts with, greater than, etc.
- AND/OR logic between conditions
- Collapsible FilterBar UI (space-efficient)
- Active filter count badge
- Real-time filtering as you type
- **Column order modes** - Cycle between Default, Table Order, and A-Z sorting in field picker (v0.7.0+)
- **Fuzzy search** - Type to quickly find columns in large tables with highlighted matches (v0.8.0+)

**Sorting Options:**
- **Column header mode** (default) - Click headers to sort with ↑↓↕ indicators
- **Airtable-style control** - Dedicated sort dropdown with multi-level sorting
- Choose column and direction (A → Z or Z → A)
- Multiple sort levels applied top to bottom
- Collapsible SortBar UI

**Grouping & Hierarchy:**
- Group by up to 3 columns simultaneously
- Expand/collapse groups with chevron buttons
- Visual indentation based on nesting level
- Item count per group
- Collapsible GroupBar UI

**Column Context Menu:**
- Hover over column headers to reveal menu trigger (chevron icon)
- **Sort A → Z / Sort Z → A** - Quick sort with active state indication
- **Filter by this field** - Creates pre-filled filter condition
- **Group by this field** - Adds column to grouping configuration
- **Hide field** - Remove column from view
- Actions conditionally shown based on feature flags
- Seamlessly integrates with existing controls

**Developer Experience:**
- 🎨 Headless design - style it your way
- 📦 Built on TanStack Table v8 (battle-tested, powerful)
- 🔒 Full TypeScript support
- 🎛️ Feature flags for granular control
- 🔌 **Toolbar slot** - Add custom controls to the toolbar (v0.6.0+)
- 🚀 Zero external dependencies (except TanStack Table)
- ♿ Accessible and keyboard-friendly

**AI-Ready:**
- 🤖 JSON-schema driven configuration
- 🧠 AI agents can generate table configs from natural language
- ⚡ **Reactive config prop** - Update table state dynamically without remounting (v0.5.0+)
- 📋 Preset configurations for common use cases
- 🔧 Programmatic table setup and state management

📅 **[View Development Roadmap](./ROADMAP.md)** - See what's coming next!

---

## 📦 Installation

```bash
npm install @shotleybuilder/svelte-table-kit
```

Or using pnpm:

```bash
pnpm add @shotleybuilder/svelte-table-kit
```

---

## 🚀 Quick Start

```svelte
<script>
  import { TableKit } from '@shotleybuilder/svelte-table-kit';

  const data = [
    { id: 1, name: 'Alice', role: 'Developer', age: 28 },
    { id: 2, name: 'Bob', role: 'Designer', age: 32 },
    { id: 3, name: 'Charlie', role: 'Manager', age: 45 }
  ];

  const columns = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'role', header: 'Role' },
    { accessorKey: 'age', header: 'Age' }
  ];
</script>

<TableKit {data} {columns} storageKey="my-table" />
```

---

## 📚 Documentation

### Basic Usage

The simplest way to use TableKit:

```svelte
<TableKit {data} {columns} />
```

### With Configuration

Customize initial table state programmatically:

```svelte
<script>
  import { TableKit } from '@shotleybuilder/svelte-table-kit';
</script>

<TableKit
  {data}
  {columns}
  config={{
    id: 'my-view-v1',
    version: '1.0',
    defaultColumnOrder: ['name', 'role', 'age', 'id'],
    defaultColumnSizing: { name: 200, role: 150 },
    defaultVisibleColumns: ['name', 'role', 'age'],
    defaultFilters: [
      { id: 'f1', field: 'role', operator: 'equals', value: 'Developer' }
    ],
    defaultSorting: [
      { columnId: 'name', direction: 'asc' }
    ],
    filterLogic: 'and'
  }}
  features={{
    columnVisibility: true,
    filtering: true,
    sorting: true,
    pagination: true
  }}
/>
```

### Reactive Configuration (v0.5.0+)

**The `config` prop is fully reactive** - update it dynamically to change table state without remounting:

```svelte
<script>
  import { TableKit } from '@shotleybuilder/svelte-table-kit';

  let tableConfig = $state({
    id: 'query-1',
    version: '1.0',
    defaultFilters: [
      { id: 'f1', field: 'status', operator: 'equals', value: 'active' }
    ]
  });

  // Update config - table reacts automatically
  function showPendingItems() {
    tableConfig = {
      id: 'query-2',  // New ID triggers update
      version: '1.0',
      defaultFilters: [
        { id: 'f1', field: 'status', operator: 'equals', value: 'pending' }
      ]
    };
  }
</script>

<button on:click={showPendingItems}>Show Pending</button>
<TableKit {data} {columns} config={tableConfig} persistState={false} />
```

**Perfect for AI-driven tables:**

```svelte
<script>
  let aiConfig = $state(undefined);

  async function askAI(question) {
    const response = await fetch('/api/nl-query', {
      method: 'POST',
      body: JSON.stringify({ question })
    });
    aiConfig = await response.json();  // Table updates automatically
  }
</script>

<input
  placeholder="Ask a question about the data..."
  on:submit={(e) => askAI(e.target.value)}
/>
<TableKit {data} {columns} config={aiConfig} persistState={false} />
```

**Key Points:**
- Config changes detected by comparing `config.id`
- Set `persistState={false}` to prevent localStorage conflicts
- When config is active, localStorage is automatically ignored
- No `{#key}` blocks needed - updates are smooth and instant

### Feature Flags

Control which features are enabled:

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
    sortingMode: 'control',  // 'header' (default) or 'control' (Airtable-style)
    pagination: true,
    rowSelection: false,
    grouping: false
  }}
/>
```

**Sorting Modes:**
- `sortingMode: 'header'` - Click column headers to sort (default behavior)
- `sortingMode: 'control'` - Use Airtable-style sort dropdown with multi-level support

### Event Handlers

Listen to table events:

```svelte
<TableKit
  {data}
  {columns}
  onRowClick={(row) => console.log('Clicked:', row)}
  onRowSelect={(rows) => console.log('Selected:', rows)}
  onStateChange={(state) => console.log('State:', state)}
/>
```

### Custom Toolbar Controls (v0.6.0+)

Add custom controls to the left side of the toolbar using the `toolbar-left` slot:

```svelte
<script>
  import { TableKit } from '@shotleybuilder/svelte-table-kit';
  import ViewSelector from './ViewSelector.svelte';
</script>

<TableKit {data} {columns}>
  <!-- Add custom controls to the toolbar -->
  <svelte:fragment slot="toolbar-left">
    <ViewSelector on:viewSelected={handleViewSelected} />
    <button on:click={saveView} class="btn-primary">
      Save View
    </button>
  </svelte:fragment>
</TableKit>
```

**Use Cases:**
- View management controls (save/load table configurations)
- Custom filter presets
- Quick action buttons
- Export/import controls
- Any custom toolbar buttons that should appear alongside table controls

The `toolbar-left` slot is positioned on the left side of the toolbar, while the built-in table controls (Filter, Sort, Group, Columns) automatically align to the right. All controls appear on the same row, creating a unified control bar.

---

## 🎨 Styling

TableKit is headless by default. You can:

1. **Use default styles** (coming soon)
2. **Customize with classNames**:

```svelte
<TableKit
  {data}
  {columns}
  classNames={{
    container: 'my-container',
    table: 'my-table',
    th: 'my-header'
  }}
/>
```

3. **Theme support**:

```svelte
<TableKit {data} {columns} theme="dark" />
```

---

## 🧬 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | `[]` | Table data array |
| `columns` | `ColumnDef<T>[]` | `[]` | Column definitions |
| `config` | `TableConfig` | `undefined` | Reactive table configuration (requires `id` and `version`) |
| `features` | `TableFeatures` | All enabled | Feature flags |
| `storageKey` | `string` | `undefined` | LocalStorage key for persistence |
| `persistState` | `boolean` | `true` | Enable state persistence (auto-disabled when config is active) |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'light'` | Theme mode |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Column text alignment |
| `rowHeight` | `'short' \| 'medium' \| 'tall' \| 'extra_tall'` | `'medium'` | Row height preset |
| `columnSpacing` | `'narrow' \| 'normal' \| 'wide'` | `'normal'` | Column horizontal spacing |
| `onRowClick` | `(row: T) => void` | `undefined` | Row click handler |
| `onRowSelect` | `(rows: T[]) => void` | `undefined` | Row selection handler |
| `onStateChange` | `(state: TableState) => void` | `undefined` | State change handler |

### TableConfig Type

```typescript
interface TableConfig {
  id: string;                              // Required: Unique identifier for change detection
  version: string;                         // Required: Config version
  defaultColumnOrder?: string[];           // Column IDs in display order
  defaultColumnSizing?: Record<string, number>;  // Column widths in pixels
  defaultVisibleColumns?: string[];        // Visible column IDs (others hidden)
  defaultFilters?: FilterCondition[];      // Initial filter conditions
  defaultSorting?: SortConfig[];           // Initial sort configuration
  filterLogic?: 'and' | 'or';              // Filter combination logic
  pagination?: {
    pageSize: number;
    pageSizeOptions?: number[];
  };
}
```

---

## 🎯 Use Cases

- Enterprise dashboards and data visualization
- Admin panels and back-office tools
- Analytics interfaces with complex filtering
- Data exploration and reporting tools
- Any application needing Airtable/Baserow-like table UX

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) (coming soon).

---

## 📄 License

MIT © [Sertantai](https://github.com/shotleybuilder)

---

## 🔗 Links

- [GitHub Repository](https://github.com/shotleybuilder/svelte-table-kit)
- [npm Package](https://www.npmjs.com/package/@shotleybuilder/svelte-table-kit)
- [Issue Tracker](https://github.com/shotleybuilder/svelte-table-kit/issues)

---

## 🙏 Acknowledgments

Built with:
- [TanStack Table](https://tanstack.com/table) - Headless table library
- [Svelte](https://svelte.dev) - Cybernetically enhanced web apps
- [SvelteKit](https://kit.svelte.dev) - The fastest way to build Svelte apps
