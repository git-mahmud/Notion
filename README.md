# Notion Clone

A personal, private, offline-first Notion clone. No AI, no telemetry, no external tracking.

## Features

- **Block Editor** — Modular recursive block system (text, headings, lists, todos, quotes, code, images, dividers)
- **Slash Commands** — Type `/` to insert any block type
- **Drag & Drop** — Reorder blocks freely
- **Nested Blocks** — Indent/outdent with Tab/Shift+Tab
- **Infinite Page Tree** — Pages within pages, with breadcrumb navigation
- **Database Views** — Table, Board (Kanban), and List views
- **Properties System** — Text, Number, Select, Multi-select, Date, URL, Checkbox, Relation, Rollup, Formula
- **Formula Engine** — Lightweight expression parser for calculated fields
- **Offline-First** — IndexedDB (Dexie.js) as primary storage, works without internet
- **Multi-Tab Sync** — BroadcastChannel API keeps tabs in sync
- **Version History** — Snapshots for undo/restore
- **Keyboard-First** — Full keyboard navigation and shortcuts
- **Synced Blocks** — Update content in one place, reflect everywhere

## Tech Stack

- React 18 + TypeScript
- Vite (build)
- Tailwind CSS (styling)
- Zustand (state management)
- Dexie.js (IndexedDB)
- @dnd-kit (drag and drop)

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New page | Ctrl+N |
| Search | Ctrl+P |
| Toggle sidebar | Ctrl+\\ |
| New block | Enter |
| Delete block | Backspace (when empty) |
| Indent | Tab |
| Outdent | Shift+Tab |
| Slash command | / (on empty block) |
| Bold | Ctrl+B |
| Italic | Ctrl+I |
| Underline | Ctrl+U |
| Undo | Ctrl+Z |
| Redo | Ctrl+Shift+Z |

## Markdown Shortcuts

Type and press Space:
- `#` → Heading 1
- `##` → Heading 2
- `###` → Heading 3
- `-` or `*` → Bullet list
- `1.` → Numbered list
- `[]` → To-do
- `>` → Quote
- `---` → Divider

## Engineering Principles

- **No AI** — Zero LLM integrations or smart features
- **Zero Telemetry** — No analytics, no tracking, no external calls
- **Local-First** — Your data stays on your machine
- **Keyboard-Driven** — Every action accessible without a mouse
- **Minimal Dependencies** — Only what's needed, nothing more

## License

Private use only.
