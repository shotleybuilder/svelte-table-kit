# svelte-table-kit Development Roadmap

This document outlines the development pipeline for svelte-table-kit, organized by implementation feasibility based on TanStack Table v8 API support.

---

## ✅ Completed Features

### v0.1.0 - Core Features
- [x] **Column visibility** - Show/hide columns with picker dropdown
- [x] **Column resizing** - Drag to resize column widths
- [x] **Column reordering** - Native HTML5 drag & drop
- [x] **Sorting** - Click headers to sort (asc/desc/none)
- [x] **Pagination** - Navigate pages with controls
- [x] **Multi-level grouping** - Up to 3 nested group levels (like Airtable)
- [x] **Expand/collapse groups** - Toggle group visibility
- [x] **Advanced filtering** - 12 operators with AND/OR logic
- [x] **Collapsible UI** - Space-efficient filter and group controls
- [x] **State persistence** - Save preferences to localStorage
- [x] **Feature flags** - Granular control over enabled features

### v0.2.0 - Layout Controls
- [x] **Row height control** - 4 sizes: short, medium, tall, extra tall
- [x] **Column spacing control** - 3 sizes: narrow, normal, wide
- [x] **Column alignment** - Left, center, right text alignment

### v0.3.0 - Sort Control
- [x] **Airtable-style sort control** - Dedicated SortBar component
- [x] **Sort mode toggle** - Choose between header or control mode
- [x] **Multi-level sorting** - Add multiple sort levels with direction control
- [x] **Sort persistence** - Sorting state saved to localStorage

### v0.4.0 - Column Context Menu
- [x] **Column context menu** - Quick access to sort, filter, group, and hide actions from column headers

### v0.5.0 - Reactive Config
- [x] **Reactive config prop** - Update table state dynamically without remounting

### v0.6.0 - Toolbar Customization
- [x] **Toolbar slot** - Add custom controls to the toolbar with `toolbar-left` slot

### v0.7.0 - Filter Enhancements
- [x] **Filter column order modes** - Cycle between Default, Table Order, and A-Z in filter field picker
- [x] **Order mode persistence** - Filter column order preference saved per-table

### v0.8.0 - Fuzzy Search
- [x] **Fuzzy search in filter picker** - Type to quickly find columns with intelligent matching
- [x] **Match highlighting** - Matched characters highlighted in dropdown results
- [x] **Keyboard navigation** - Arrow keys, Enter, Escape for efficient selection
- [x] **Scoring algorithm** - Prioritizes consecutive matches, word boundaries, and start-of-string matches

### v0.9.0 - Quick Filter from Cell
- [x] **Cell context menu** - Right-click any cell to open context menu
- [x] **Filter by value** - Create equals filter from cell value
- [x] **Exclude value** - Create not_equals filter from cell value
- [x] **Numeric comparisons** - Greater than / Less than options for numeric cells
- [x] **Auto-expand FilterBar** - FilterBar opens automatically when filter created

---

## 🚀 Next Release (v0.4.0) - Native TanStack Features

These features are **fully supported** by TanStack Table v8 API and can be implemented using built-in functionality.

### Row Selection
**Priority: HIGH** | **TanStack Support: ✅ Native**

Multi-select rows with checkboxes:
- [ ] Add row selection state management
- [ ] Render checkbox column (left-most)
- [ ] Select all / deselect all functionality
- [ ] Selected row count badge
- [ ] `getSelectedRowModel()` integration
- [ ] Callback: `onRowSelect(rows)`

**API Methods Available:**
- `toggleAllRowsSelected()`, `getIsAllRowsSelected()`
- `row.getIsSelected()`, `row.toggleSelected()`
- `table.getSelectedRowModel()`

### Column Pinning
**Priority: HIGH** | **TanStack Support: ✅ Native**

Freeze columns to left or right:
- [ ] Add pinning state management
- [ ] Pin/unpin UI controls (pin icon in header)
- [ ] Render pinned columns separately (left/center/right)
- [ ] CSS for fixed positioning
- [ ] Sync horizontal scroll

**API Methods Available:**
- `column.pin('left' | 'right' | false)`
- `column.getIsPinned()`, `column.getCanPin()`
- `table.getLeftLeafColumns()`, `table.getRightLeafColumns()`

### Aggregations in Footer
**Priority: MEDIUM** | **TanStack Support: ⚠️ Partial**

Sum, average, count in table footer:
- [ ] Footer row rendering
- [ ] Configure aggregations per column
- [ ] Support 9 built-in functions (sum, mean, count, etc.)
- [ ] Custom aggregation functions
- [ ] Display aggregated values

**Built-in Functions:**
`sum`, `min`, `max`, `extent`, `mean`, `median`, `unique`, `uniqueCount`, `count`

**Note:** Currently tied to grouping feature. May need to extend for footer-only aggregations.

---

## 🎨 Future Release (v0.3.0) - Custom Implementations

These features require **custom implementation** as they're not built into TanStack Table v8. Implementation complexity varies.

### Cell Editing
**Priority: HIGH** | **TanStack Support: ❌ Custom**

Inline edit capabilities:
- [ ] Edit mode state management (which cell is editing)
- [ ] Create `EditableCell` component
- [ ] Input types: text, number, select, date
- [ ] Enter to save, Escape to cancel
- [ ] Double-click to edit
- [ ] Validation support
- [ ] `onCellUpdate(rowId, columnId, value)` callback

**Implementation Approach:**
- Svelte store for `editingCell: { rowId, columnId } | null`
- Custom cell renderer with conditional input/display
- Parent component handles value updates

### Keyboard Navigation
**Priority: MEDIUM** | **TanStack Support: ❌ Custom**

Navigate table with keyboard:
- [ ] Arrow keys to move between cells
- [ ] Enter to activate cell (select/edit)
- [ ] Tab to move to next editable cell
- [ ] Shift+Tab for reverse
- [ ] Escape to deselect
- [ ] Focus management with refs
- [ ] Visual focus indicator

**Implementation Approach:**
- Global keydown handler on table container
- Track focused cell in Svelte store
- Use `tabIndex` and focus() for accessibility

### Bulk Actions
**Priority: MEDIUM** | **TanStack Support: ❌ Custom**

Operations on selected rows:
- [ ] Bulk action dropdown/toolbar
- [ ] Common actions: delete, export, update
- [ ] Custom action buttons
- [ ] Confirmation dialogs
- [ ] Progress indicators for async operations
- [ ] Integration with row selection

**Dependencies:** Requires Row Selection feature

### View Presets
**Priority: MEDIUM** | **TanStack Support: ❌ Custom**

Save/load table configurations:
- [ ] Preset management UI (dropdown)
- [ ] Save current config as preset
- [ ] Load preset configuration
- [ ] Preset includes: filters, grouping, sorting, column order/visibility
- [ ] Persist presets to localStorage or backend
- [ ] Default/custom presets
- [ ] Share presets (export JSON)

**Implementation Approach:**
- Capture full `TableState` as preset
- Store in `presets` array
- Apply by setting all state at once

### Export Functionality
**Priority: MEDIUM** | **TanStack Support: ❌ Custom**

Export table data:
- [ ] CSV export
- [ ] JSON export
- [ ] Excel export (using library like SheetJS)
- [ ] Export current view (filtered/grouped)
- [ ] Export all data
- [ ] Custom column mapping
- [ ] Filename configuration

**Implementation Approach:**
- Use `table.getRowModel()` for current view
- Transform to desired format
- Trigger browser download

### Context Menus
**Priority: LOW** | **TanStack Support: ❌ Custom**

Right-click on rows/cells:
- [ ] Context menu component
- [ ] Position calculation
- [ ] Actions: copy, edit, delete, etc.
- [ ] Row-level vs cell-level menus
- [ ] Custom menu items
- [ ] Keyboard shortcut hints

**Implementation Approach:**
- Svelte component with portal/overlay
- Event listener for `contextmenu`
- Position at click coordinates

### Undo/Redo
**Priority: LOW** | **TanStack Support: ❌ Custom**

State history management:
- [ ] History stack implementation
- [ ] Undo/redo buttons
- [ ] Keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z)
- [ ] History limit configuration
- [ ] Visual indicator of undo/redo availability
- [ ] Support for: filters, grouping, sorting, cell edits

**Implementation Approach:**
- Maintain `TableState[]` history array
- Track history index
- Use `onStateChange` to capture snapshots
- Apply previous state on undo

---

## 🤖 Future Release (v0.4.0) - AI Configuration Layer

AI agent to configure table from natural language.

### AI Table Configuration
**Priority: EXPLORATORY**

Generate table config from prompts:
- [ ] AI function definitions for table config
- [ ] Parse natural language to `TableConfig`
- [ ] Example: "Show only cases from 2024, grouped by type, sorted by date"
- [ ] Validation of generated config
- [ ] Preview before applying
- [ ] Iterative refinement

**Technical Approach:**
- Use Claude/OpenAI function calling
- Provide JSON schema for `TableConfig`
- Generate filters, grouping, sorting from intent
- Apply config to TableKit instance

---

## 📋 Feature Support Matrix

| Feature | TanStack Support | Complexity | Priority | Target Version |
|---------|------------------|------------|----------|----------------|
| Row Selection | ✅ Native | Low | High | v0.2.0 |
| Column Pinning | ✅ Native | Medium | High | v0.2.0 |
| Aggregations | ⚠️ Partial | Medium | Medium | v0.2.0 |
| Cell Editing | ❌ Custom | High | High | v0.3.0 |
| Keyboard Nav | ❌ Custom | Medium | Medium | v0.3.0 |
| Bulk Actions | ❌ Custom | Low | Medium | v0.3.0 |
| View Presets | ❌ Custom | Medium | Medium | v0.3.0 |
| Export | ❌ Custom | Medium | Medium | v0.3.0 |
| Context Menus | ❌ Custom | Medium | Low | v0.3.0 |
| Undo/Redo | ❌ Custom | High | Low | v0.3.0 |
| AI Config | ❌ Custom | High | Exploratory | v0.4.0 |

---

## 🎯 Development Principles

1. **Leverage TanStack Table** - Use native features whenever possible
2. **Type Safety** - Full TypeScript support for all APIs
3. **Accessibility** - WCAG 2.1 AA compliance
4. **Performance** - Efficient rendering for large datasets
5. **Customization** - Expose slots and callbacks for flexibility
6. **Documentation** - Clear examples for every feature
7. **Testing** - Unit tests for utilities, integration tests for features

---

## 📝 Notes on Excluded Features

### Why Some Features Are Not Planned

**Real-time Collaboration**: Out of scope. Requires backend infrastructure and conflict resolution that's beyond a UI component library.

**Database Integration**: TableKit is a pure frontend component. Data fetching/syncing should be handled by parent application.

**Advanced Charting**: Consider separate charting libraries. TableKit focuses on tabular data.

---

## 🤝 Contributing

Want to help implement a feature from the roadmap?

1. Check if it's assigned in [GitHub Issues](https://github.com/shotleybuilder/svelte-table-kit/issues)
2. Comment on the issue or create a new one
3. Fork the repo and create a feature branch
4. Implement following the Development Principles above
5. Add tests and update documentation
6. Submit a pull request

---

## 📅 Release Schedule

- **v0.2.0** - Q1 2025 - Native TanStack features (selection, pinning, aggregations)
- **v0.3.0** - Q2 2025 - Custom features (editing, keyboard nav, bulk actions)
- **v0.4.0** - Q3 2025 - AI configuration layer

*Dates are tentative and subject to change based on community contributions and priorities.*

---

## 📖 Version History

### v0.9.0 (Current)
- ✅ Cell context menu (right-click to filter)
- ✅ Filter by value / Exclude value actions
- ✅ Numeric comparison options (greater/less than)
- ✅ Auto-expand FilterBar on filter creation

### v0.8.0
- ✅ Fuzzy search in filter field picker
- ✅ Match highlighting in dropdown results
- ✅ Keyboard navigation (arrow keys, Enter, Escape)
- ✅ Intelligent scoring algorithm

### v0.7.0
- ✅ Filter column order modes (Default, Table Order, A-Z)
- ✅ Order mode persistence per-table

### v0.6.0
- ✅ Toolbar slot for custom controls

### v0.5.0
- ✅ Reactive config prop for dynamic table updates

### v0.4.0
- ✅ Column context menu (sort, filter, group, hide)

### v0.3.0
- ✅ Airtable-style sort control
- ✅ Multi-level sorting

### v0.2.0
- ✅ Row height and column spacing controls

### v0.1.0
- ✅ Core table features (visibility, resizing, reordering, sorting, pagination)
- ✅ Advanced filtering (12 operators, AND/OR logic)
- ✅ Multi-level grouping (up to 3 levels)
- ✅ Collapsible UI controls (FilterBar, GroupBar)
- ✅ State persistence to localStorage
