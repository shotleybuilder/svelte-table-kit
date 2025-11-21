# svelte-table-kit
A comprehensive, AI-configurable data table component for Svelte and SvelteKit, built on TanStack Table v8.

Svelte Table Kit brings Airtable-like functionality to your Svelte applications with a headless, fully customizable table component. Perfect for dashboards, data grids, and complex data visualization needs.

##  ✨ Features

  Core Table Features:
  - 🎯 Column visibility picker with show/hide controls
  - 📏 Column resizing with drag handles
  - 🔄 Column reordering via native HTML5 drag & drop
  - 🔍 Advanced filtering (text, select, multi-column)
  - ⬆️ Multi-column sorting with visual indicators
  - 📄 Pagination with customizable page sizes
  - 💾 LocalStorage persistence for all user preferences

  Developer Experience:
  - 🎨 Headless design - style it your way
  - 📦 Built on TanStack Table v8 (battle-tested, powerful)
  - 🔒 Full TypeScript support
  - 🎛️ Feature flags for granular control
  - 🚀 Zero external dependencies (except TanStack Table)
  - ♿ Accessible and keyboard-friendly

  AI-Ready:
  - 🤖 JSON-schema driven configuration
  - 🧠 AI agents can generate table configs from natural language
  - 📋 Preset configurations for common use cases
  - 🔧 Programmatic table setup and state management

##  🎯 Use Cases

  - Enterprise dashboards and data visualization
  - Admin panels and back-office tools
  - Analytics interfaces with complex filtering
  - Data exploration and reporting tools
  - Any application needing Airtable/Baserow-like table UX

##  🚀 Quick Start

  npm install @sertantai/svelte-table-kit

  <script>
    import { TableKit } from '@sertantai/svelte-table-kit'
    const data = [...]
    const columns = [...]
  </script>

  <TableKit {data} {columns} storageKey="my-table" />

##  🧬 Built For

  - SvelteKit projects
  - Svelte 4+ applications
  - Teams building data-heavy applications
  - Developers who need Airtable-like UX without the coupling

