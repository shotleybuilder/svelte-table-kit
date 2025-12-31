# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**svelte-table-kit** (`@shotleybuilder/svelte-table-kit`) is a comprehensive, AI-configurable data table component library for Svelte and SvelteKit, built on TanStack Table v8. It provides Airtable-like functionality with advanced filtering, multi-level grouping, column controls, and state persistence.

**Current Version:** v0.10.0

## Development Commands

### Package Management
```bash
npm install                    # Install dependencies
```

### Development
```bash
npm run dev                    # Start dev server (Vite)
npm run build                  # Build and package the library
npm run package                # Package library (runs svelte-package + publint)
```

### Type Checking
```bash
npm run check                  # Run svelte-check once
npm run check:watch           # Run svelte-check in watch mode
```

### Testing
```bash
npm test                       # Run tests in watch mode (Vitest)
npm run test:ui               # Run tests with Vitest UI
npm run test:run              # Run tests once (CI mode)
```

### Linting & Formatting
```bash
npm run lint                   # Check code with Prettier + ESLint
npm run format                 # Format code with Prettier
```

## Architecture

### Core Components

**TableKit.svelte** - Main table component
- Located: `src/lib/TableKit.svelte`
- Props interface: `TableKitProps<T>` in `src/lib/types.ts`
- Built on TanStack Table v8 with Svelte stores for state management
- Uses generic type `T` for row data typing
- Integrates FilterBar, GroupBar, and column controls

**FilterBar.svelte** - Advanced filtering UI
- Located: `src/lib/components/FilterBar.svelte`
- Supports 12 filter operators (equals, contains, starts_with, greater_than, etc.)
- AND/OR logic between conditions
- Collapsible UI with active filter count badge

**GroupBar.svelte** - Multi-level grouping controls
- Located: `src/lib/components/GroupBar.svelte`
- Up to 3 nested group levels (like Airtable)
- Expand/collapse functionality
- Visual indentation based on nesting level

**FilterCondition.svelte** - Individual filter condition editor
- Located: `src/lib/components/FilterCondition.svelte`
- Custom searchable dropdown for field selection with fuzzy search
- Column order mode cycling (Default → Table → A-Z) with persistence
- Keyboard navigation (arrow keys, Enter, Escape)
- Match highlighting in search results
- Value suggestions autocomplete with fuzzy filtering (v0.10.0+)
- Numeric range hints for numeric columns (v0.10.0+)

**CellContextMenu.svelte** - Right-click context menu for cells
- Located: `src/lib/components/CellContextMenu.svelte`
- Filter by value / Exclude value actions
- Numeric columns get greater than / less than options
- Auto-positions to stay within viewport
- Dispatches events handled by TableKit

### State Management

State is managed via Svelte writable stores for:
- `sorting` - SortingState from TanStack Table
- `columnVisibility` - VisibilityState for show/hide columns
- `columnSizing` - ColumnSizingState for resize widths
- `columnFilters` - ColumnFiltersState for TanStack filters
- `columnOrder` - ColumnOrderState for reordering
- `grouping` - GroupingState for group-by columns
- `expanded` - ExpandedState for expand/collapse groups
- `filterConditions` - Custom FilterCondition[] for FilterBar
- `filterLogic` - 'and' | 'or' for filter logic

**Persistence:** All state can persist to localStorage via utilities in `src/lib/stores/persistence.ts`
- Storage key format: `{storageKey}_{state_name}` (e.g., `my-table_column_visibility`)
- Enabled by default with `persistState={true}` and `storageKey` prop
- Browser environment check: `isBrowser` constant ensures SSR compatibility

### Type System

**Key Types** (defined in `src/lib/types.ts`):
- `TableKitProps<T>` - Main component props interface
- `TableConfig` - AI-configurable table configuration object
- `TableFeatures` - Feature flags for enabling/disabling functionality
- `FilterCondition` - Individual filter with field, operator, value
- `FilterOperator` - Union type for 12+ filter operators
- `FilterLogic` - 'and' | 'or' for combining conditions
- `ColumnOrderMode` - 'definition' | 'ui' | 'alphabetical' for filter picker column ordering
- `TableState` - Complete table state snapshot for persistence
- `ViewPreset` - Saved table configurations
- `ClassNameMap` - Custom CSS class names for styling

### Utility Modules

**src/lib/utils/filters.ts**
- `evaluateCondition(condition, rowValue)` - Test if value matches filter
- `applyFilters(data, conditions, logic)` - Apply multiple filters with AND/OR
- `createTextFilter()`, `createNumericFilter()`, `createSelectFilter()` - Filter factories

**src/lib/utils/config.ts**
- `generateTableConfig()` - Create configs from presets
- `validateTableConfig()` - Validate config objects
- `mergeConfigs()` - Combine multiple configs

**src/lib/utils/formatters.ts**
- `formatDate()`, `formatCurrency()`, `formatNumber()`, `formatPercent()` - Value formatters

**src/lib/utils/fuzzy.ts**
- `fuzzyMatch(pattern, target)` - Fuzzy match with scoring and matched indices
- `fuzzySearch(pattern, items, limit?)` - Search array of strings, returns sorted matches
- `highlightMatches(text, matchedIndices)` - Split text into segments for highlighting

**src/lib/stores/persistence.ts**
- `loadColumnVisibility()`, `saveColumnVisibility()` - Persist visibility
- `loadColumnSizing()`, `saveColumnSizing()` - Persist sizing
- `loadColumnFilters()`, `saveColumnFilters()` - Persist filters
- `loadColumnOrder()`, `saveColumnOrder()` - Persist order
- `loadSorting()`, `saveSorting()` - Persist sorting
- `loadPagination()`, `savePagination()` - Persist pagination
- `loadFilterColumnOrderMode()`, `saveFilterColumnOrderMode()` - Persist filter picker column order mode
- `clearTableState()` - Reset all persisted state

### Exports

Main export: `src/lib/index.ts` - Re-exports all public APIs:
- Components: TableKit, FilterBar, GroupBar, FilterCondition
- Types: All TypeScript interfaces
- Presets: `presets` object with predefined configs
- Utils: Config generators, filter utilities, formatters

Package entry point: `dist/index.js` (built via `svelte-package`)
Styles entry point: `dist/styles/table-kit.css`

## Feature Flags

Features can be toggled via the `features` prop:
```typescript
features={{
  columnVisibility: boolean,   // Show/hide columns
  columnResizing: boolean,     // Drag to resize
  columnReordering: boolean,   // Drag & drop reorder
  filtering: boolean,          // FilterBar UI
  sorting: boolean,            // Click headers to sort
  pagination: boolean,         // Pagination controls
  rowSelection: boolean,       // Checkboxes (planned v0.2.0)
  grouping: boolean,           // GroupBar UI
  columnPinning: boolean       // Freeze columns (planned v0.2.0)
}}
```

All default to `true` unless explicitly set to `false`.

## Styling System

**Row Height** (`rowHeight` prop):
- `'short'` - 0.375rem vertical padding
- `'medium'` - 0.75rem vertical padding (default)
- `'tall'` - 1.0rem vertical padding
- `'extra_tall'` - 1.5rem vertical padding

**Column Spacing** (`columnSpacing` prop):
- `'narrow'` - 0.5rem horizontal padding
- `'normal'` - 1.0rem horizontal padding (default)
- `'wide'` - 2.0rem horizontal padding

**Text Alignment** (`align` prop):
- `'left'` (default), `'center'`, `'right'`

**Custom Classes** (`classNames` prop):
- Accepts partial `ClassNameMap` object
- Keys: container, table, thead, tbody, tfoot, tr, th, td, pagination, filterBar, columnPicker

## AI Configuration

The library is designed for AI-driven configuration:
- JSON-schema driven `TableConfig` type
- AI agents can generate configs from natural language
- Example skill: `.claude/skills/svelte-table-kit-config/SKILLS.md`
- Presets available in `src/lib/presets/index.ts`

## TanStack Table Integration

Built on **TanStack Table v8** (peer dependency):
- Uses `createSvelteTable()` from `@tanstack/svelte-table`
- Row models: getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, getGroupedRowModel, getExpandedRowModel
- Column definitions: Standard TanStack `ColumnDef<T>[]` format
- Full TypeScript support with generic types

**Important:** Always import TanStack types:
```typescript
import type { ColumnDef } from '@tanstack/svelte-table';
```

## Development Roadmap

See `ROADMAP.md` for detailed feature planning. Key upcoming features:
- **v0.2.0** (current): Row selection, column pinning, aggregations
- **v0.3.0**: Cell editing, keyboard navigation, bulk actions, export
- **v0.4.0**: AI configuration layer

## Testing Strategy

- Test framework: Vitest (configured in `vite.config.ts`)
- Test pattern: `src/**/*.{test,spec}.{js,ts}`
- Existing tests:
  - `src/lib/stores/persistence.test.ts` - LocalStorage persistence functions
  - `src/lib/utils/columnOrdering.test.ts` - Column ordering logic
  - `src/lib/utils/fuzzy.test.ts` - Fuzzy search algorithm
  - `src/lib/utils/valueSuggestions.test.ts` - Value suggestions and numeric range logic
- When writing tests, use Vitest's Svelte testing utilities

## Build System

- **Package builder:** `@sveltejs/package` (svelte-package)
- **Bundler:** Vite 5
- **Output:** `dist/` directory
- **Type generation:** Automatic via svelte-package
- **Validation:** publint checks package exports

## SvelteKit Integration

This is a library package, not an app:
- Uses SvelteKit for dev server only (`npm run dev`)
- Demo page: `src/routes/+page.svelte`
- Library code: `src/lib/`
- Build output: `dist/` (not `.svelte-kit/`)

## SSR Compatibility

All browser-specific code checks `isBrowser` before accessing:
- `window`
- `localStorage`
- DOM APIs

This ensures SSR compatibility in SvelteKit apps.

## Common Patterns

### Adding a New Feature

1. Update `TableFeatures` interface in `src/lib/types.ts`
2. Add feature logic to `TableKit.svelte`
3. Create sub-component in `src/lib/components/` if needed
4. Export new types/components from `src/lib/index.ts`
5. Update skill documentation in `.claude/skills/svelte-table-kit-config/SKILLS.md`
6. Update README.md with usage examples
7. Add to ROADMAP.md if not already listed

### Adding a New Filter Operator

1. Add to `FilterOperator` type in `src/lib/types.ts`
2. Implement logic in `evaluateCondition()` in `src/lib/utils/filters.ts`
3. Update FilterCondition.svelte operator dropdown
4. Update skill documentation with new operator

### Adding State Persistence

1. Create load/save functions in `src/lib/stores/persistence.ts`
2. Initialize store with `loadXxx(storageKey)` in TableKit.svelte
3. Subscribe to store changes and call `saveXxx()` when `persistState` is true
4. Update `clearTableState()` to include new state
