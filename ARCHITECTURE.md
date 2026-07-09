# Notion Clone — Technical Architecture Blueprint

## Overview

A personal, private, offline-first Notion clone built with **React + TypeScript** on the frontend and **SQLite (via better-sqlite3)** on a lightweight Node.js backend. No AI, no telemetry, no external dependencies beyond what's needed for core functionality.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| State Management | Zustand (lightweight, no boilerplate) |
| Drag & Drop | @dnd-kit/core |
| Rich Text | ProseMirror (low-level control) or custom contenteditable |
| Local Storage | IndexedDB (via Dexie.js) |
| Backend (optional sync) | Node.js, Express, better-sqlite3 |
| Real-time (placeholder) | BroadcastChannel API (multi-tab), WebSocket-ready |
| Build | Vite, pnpm |

---

## 1. Database Schema (SQLite / Prisma)

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ─── Workspace ───────────────────────────────────────────────

model Workspace {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  pages     Page[]
}

// ─── Pages (Hierarchical) ────────────────────────────────────

model Page {
  id          String   @id @default(uuid())
  title       String   @default("Untitled")
  icon        String?
  coverImage  String?
  parentId    String?
  parent      Page?    @relation("PageTree", fields: [parentId], references: [id])
  children    Page[]   @relation("PageTree")
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  blocks      Block[]
  properties  PageProperty[]
  isDatabase  Boolean  @default(false)
  databaseConfig DatabaseConfig?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  sortOrder   Float    @default(0)
  isArchived  Boolean  @default(false)
  snapshots   Snapshot[]
}

// ─── Blocks (Recursive Tree) ─────────────────────────────────

model Block {
  id        String   @id @default(uuid())
  type      String   // "text" | "heading1" | "heading2" | "heading3" | "bullet" | "numbered" | "todo" | "quote" | "image" | "code" | "divider" | "synced_ref"
  content   Json     // { text: string, marks: [], checked?: boolean, language?: string, url?: string }
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  parentId  String?  // For nested blocks (indentation)
  parent    Block?   @relation("BlockTree", fields: [parentId], references: [id])
  children  Block[]  @relation("BlockTree")
  sortOrder Float    @default(0)
  syncId    String?  // Links to SyncedBlock for synced content
  syncedBlock SyncedBlock? @relation(fields: [syncId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─── Synced Blocks (Global) ──────────────────────────────────

model SyncedBlock {
  id        String   @id @default(uuid())
  content   Json     // Canonical content for the synced block
  instances Block[]  // All block instances referencing this
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─── Database System ─────────────────────────────────────────

model DatabaseConfig {
  id          String   @id @default(uuid())
  pageId      String   @unique
  page        Page     @relation(fields: [pageId], references: [id])
  views       DatabaseView[]
  properties  PropertyDefinition[]
}

model DatabaseView {
  id             String   @id @default(uuid())
  name           String
  type           String   // "table" | "board" | "list"
  databaseId     String
  database       DatabaseConfig @relation(fields: [databaseId], references: [id])
  config         Json     // { sortBy, filterBy, groupBy, visibleProperties, columnWidths }
  sortOrder      Float    @default(0)
}

model PropertyDefinition {
  id          String   @id @default(uuid())
  name        String
  type        String   // "text" | "number" | "select" | "multi_select" | "date" | "url" | "relation" | "rollup" | "formula"
  config      Json     // { options: [], relatedDatabaseId?, rollupConfig?, formula? }
  databaseId  String
  database    DatabaseConfig @relation(fields: [databaseId], references: [id])
  sortOrder   Float    @default(0)
  values      PageProperty[]
}

model PageProperty {
  id           String   @id @default(uuid())
  pageId       String
  page         Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  propertyId   String
  property     PropertyDefinition @relation(fields: [propertyId], references: [id])
  value        Json     // Flexible: string | number | string[] | { start, end } | url
  @@unique([pageId, propertyId])
}

// ─── Version History ─────────────────────────────────────────

model Snapshot {
  id        String   @id @default(uuid())
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id])
  data      Json     // Full serialized block tree at this point
  createdAt DateTime @default(now())
  label     String?  // Optional user label like "Before refactor"
}
```

---

## 2. State Management — Block Editor (Zustand)

```typescript
// src/store/editor-store.ts

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// ─── Types ───────────────────────────────────────────────────

export type BlockType =
  | 'text' | 'heading1' | 'heading2' | 'heading3'
  | 'bullet' | 'numbered' | 'todo' | 'quote'
  | 'image' | 'code' | 'divider' | 'synced_ref';

export interface BlockContent {
  text?: string;
  marks?: Mark[];       // bold, italic, underline, code, link
  checked?: boolean;    // for todo blocks
  language?: string;    // for code blocks
  url?: string;         // for image blocks
  syncId?: string;      // for synced block references
}

export interface Mark {
  type: 'bold' | 'italic' | 'underline' | 'code' | 'link';
  from: number;
  to: number;
  attrs?: Record<string, string>;
}

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  parentId: string | null;
  childrenIds: string[];
  sortOrder: number;
  syncId?: string;
}

export interface EditorState {
  // ─── State ─────────────────────────────────────────────
  blocks: Record<string, Block>;      // Normalized flat map
  rootBlockIds: string[];             // Top-level block ordering
  activeBlockId: string | null;
  selectionRange: { start: number; end: number } | null;
  slashMenuOpen: boolean;
  slashMenuPosition: { x: number; y: number } | null;
  undoStack: EditorSnapshot[];
  redoStack: EditorSnapshot[];

  // ─── Actions ───────────────────────────────────────────
  // Block CRUD
  addBlock: (type: BlockType, afterBlockId?: string, parentId?: string) => string;
  updateBlock: (id: string, partial: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;

  // Block movement
  moveBlock: (blockId: string, targetParentId: string | null, targetIndex: number) => void;
  indentBlock: (id: string) => void;
  outdentBlock: (id: string) => void;

  // Drag and drop
  reorderBlocks: (activeId: string, overId: string) => void;

  // Selection & focus
  setActiveBlock: (id: string | null) => void;
  focusBlock: (id: string, cursorPosition?: number) => void;

  // Slash command
  openSlashMenu: (position: { x: number; y: number }) => void;
  closeSlashMenu: () => void;
  executeSlashCommand: (command: string) => void;

  // History
  pushSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Synced blocks
  createSyncedBlock: (blockId: string) => string;
  updateSyncedBlock: (syncId: string, content: BlockContent) => void;

  // Serialization
  loadPage: (pageId: string) => Promise<void>;
  savePage: () => Promise<void>;
}

type EditorSnapshot = {
  blocks: Record<string, Block>;
  rootBlockIds: string[];
  timestamp: number;
};
```

### Workspace Store (Sidebar / Page Tree)

```typescript
// src/store/workspace-store.ts

import { create } from 'zustand';

export interface PageTreeNode {
  id: string;
  title: string;
  icon?: string;
  parentId: string | null;
  childrenIds: string[];
  isExpanded: boolean;
  isDatabase: boolean;
  sortOrder: number;
}

export interface WorkspaceState {
  pages: Record<string, PageTreeNode>;
  rootPageIds: string[];
  activePageId: string | null;
  breadcrumbs: string[];             // Array of page IDs from root to active

  // Actions
  createPage: (parentId?: string) => string;
  deletePage: (id: string) => void;
  movePage: (pageId: string, newParentId: string | null, index: number) => void;
  renamePage: (id: string, title: string) => void;
  toggleExpand: (id: string) => void;
  navigateTo: (pageId: string) => void;
  computeBreadcrumbs: (pageId: string) => string[];
}
```

---

## 3. UI Component Tree

```
<App>
├── <Sidebar>
│   ├── <WorkspaceHeader />           — Workspace name, settings
│   ├── <SearchBar />                 — Quick page search (Cmd+K)
│   ├── <PageTree>                    — Recursive tree
│   │   └── <PageTreeItem>            — Single row (icon, title, expand, drag)
│   │       └── <PageTreeItem />      — Nested children (recursive)
│   ├── <NewPageButton />
│   └── <TrashSection />              — Archived pages
│
├── <MainContent>
│   ├── <Breadcrumbs />               — Path: Workspace > Parent > Current
│   ├── <PageHeader>
│   │   ├── <PageIcon />              — Emoji picker
│   │   ├── <PageTitle />             — Editable h1
│   │   └── <CoverImage />            — Optional banner
│   │
│   ├── <BlockEditor>                 — Core editor area
│   │   ├── <BlockRenderer>           — Maps block.type → component
│   │   │   ├── <TextBlock />
│   │   │   ├── <HeadingBlock />      — h1, h2, h3
│   │   │   ├── <BulletBlock />
│   │   │   ├── <NumberedBlock />
│   │   │   ├── <TodoBlock />
│   │   │   ├── <QuoteBlock />
│   │   │   ├── <ImageBlock />
│   │   │   ├── <CodeBlock />
│   │   │   ├── <DividerBlock />
│   │   │   └── <SyncedBlockRef />
│   │   ├── <BlockHandle />           — Drag handle + menu trigger
│   │   ├── <SlashCommandMenu />      — '/' triggered dropdown
│   │   └── <InlineToolbar />         — Bold/italic/link on selection
│   │
│   └── <DatabaseView>                — When page isDatabase = true
│       ├── <ViewTabs />              — Table | Board | List
│       ├── <FilterBar />
│       ├── <SortBar />
│       ├── <TableView />
│       │   ├── <TableHeader />       — Property columns
│       │   └── <TableRow />          — Page as row
│       ├── <BoardView />
│       │   ├── <BoardColumn />       — Grouped by Select property
│       │   └── <BoardCard />
│       └── <ListView />
│           └── <ListItem />
│
└── <Modals>
    ├── <PropertyEditor />            — Edit property definitions
    ├── <RelationPicker />            — Link pages across DBs
    ├── <VersionHistory />            — Snapshot browser
    └── <EmojiPicker />
```

---

## 4. Formula Engine (Lightweight Expression Parser)

```typescript
// src/lib/formula-engine.ts

type FormulaValue = string | number | boolean | Date | null;
type FormulaContext = Record<string, FormulaValue>;

interface FormulaNode {
  type: 'literal' | 'property' | 'function' | 'binary' | 'unary';
  value?: FormulaValue;
  name?: string;
  operator?: string;
  args?: FormulaNode[];
  left?: FormulaNode;
  right?: FormulaNode;
}

// Supported functions:
// Numeric: add, subtract, multiply, divide, sum, abs, round, ceil, floor
// String: concat, length, contains, replace, upper, lower, slice
// Date: now, dateAdd, dateSub, formatDate, dateBetween
// Logic: if, and, or, not, equal, empty

// Example formula: if(prop("Status") == "Done", dateBetween(prop("Completed"), prop("Created"), "days"), 0)
```

---

## 5. Offline-First Architecture (IndexedDB via Dexie)

```typescript
// src/lib/local-db.ts

import Dexie, { Table } from 'dexie';

export class NotionLocalDB extends Dexie {
  pages!: Table<LocalPage>;
  blocks!: Table<LocalBlock>;
  syncedBlocks!: Table<LocalSyncedBlock>;
  snapshots!: Table<LocalSnapshot>;
  syncQueue!: Table<SyncQueueItem>;    // Pending changes to push

  constructor() {
    super('notion-clone');
    this.version(1).stores({
      pages: 'id, parentId, workspaceId, updatedAt, isArchived',
      blocks: 'id, pageId, parentId, syncId, sortOrder',
      syncedBlocks: 'id, updatedAt',
      snapshots: 'id, pageId, createdAt',
      syncQueue: '++id, entity, entityId, operation, timestamp',
    });
  }
}

// Sync strategy:
// 1. All writes go to IndexedDB first (immediate)
// 2. Changes are queued in syncQueue
// 3. When online, flush syncQueue to backend in order
// 4. Conflict resolution: last-write-wins with timestamp
// 5. Multi-tab sync via BroadcastChannel API
```

---

## 6. Multi-Tab Sync (BroadcastChannel)

```typescript
// src/lib/tab-sync.ts

const channel = new BroadcastChannel('notion-clone-sync');

// Emit changes to other tabs
export function broadcastChange(change: {
  type: 'block_update' | 'page_update' | 'block_delete';
  payload: unknown;
}) {
  channel.postMessage(change);
}

// Listen for changes from other tabs
channel.onmessage = (event) => {
  const { type, payload } = event.data;
  // Apply to local Zustand store without re-broadcasting
};
```

---

## 7. Key Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| New block below | Enter |
| Delete empty block | Backspace |
| Indent block | Tab |
| Outdent block | Shift+Tab |
| Slash command | / |
| Bold | Cmd+B |
| Italic | Cmd+I |
| Link | Cmd+K |
| Undo | Cmd+Z |
| Redo | Cmd+Shift+Z |
| Search | Cmd+P |
| New page | Cmd+N |

---

## 8. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
1. Project scaffolding: Vite + React + TypeScript + Tailwind + pnpm
2. Set up Zustand stores (editor + workspace)
3. Implement IndexedDB layer with Dexie
4. Build Sidebar with page tree (recursive, drag-and-drop)
5. Basic page creation, deletion, navigation

### Phase 2: Block Editor Core (Week 3-4)
6. Implement block renderer with all block types
7. contenteditable integration with cursor management
8. Slash command menu with block type insertion
9. Inline formatting toolbar (bold, italic, code, link)
10. Block drag-and-drop reordering (@dnd-kit)
11. Nested blocks (indent/outdent with Tab/Shift+Tab)

### Phase 3: Rich Features (Week 5-6)
12. Synced blocks (global state, multi-instance updates)
13. Version history (snapshot creation, diff viewer, restore)
14. Breadcrumb navigation
15. Cover images and page icons (emoji picker)
16. Code block with syntax highlighting (highlight.js)

### Phase 4: Database System (Week 7-9)
17. Database page type with property definitions
18. Table view (sortable columns, inline editing)
19. Board/Kanban view (grouped by select property)
20. List view
21. Filter and sort system
22. Relation properties (cross-database linking)
23. Rollup properties (aggregation from relations)
24. Formula engine (tokenizer → parser → evaluator)

### Phase 5: Polish & Performance (Week 10-11)
25. Offline queue with background sync
26. BroadcastChannel multi-tab sync
27. Virtualized rendering for large pages (react-window)
28. Search functionality (full-text over IndexedDB)
29. Keyboard shortcut system (hotkey manager)
30. Trash/archive with restore

### Phase 6: Backend (Optional) (Week 12)
31. Express API with SQLite (better-sqlite3)
32. REST endpoints: pages, blocks, databases, snapshots
33. Sync protocol: push queue, pull latest, conflict resolution
34. WebSocket placeholder for real-time (future)

---

## 9. Directory Structure

```
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
├── components/
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── PageTree.tsx
│   │   ├── PageTreeItem.tsx
│   │   └── SearchBar.tsx
│   ├── editor/
│   │   ├── BlockEditor.tsx
│   │   ├── BlockRenderer.tsx
│   │   ├── blocks/
│   │   │   ├── TextBlock.tsx
│   │   │   ├── HeadingBlock.tsx
│   │   │   ├── TodoBlock.tsx
│   │   │   ├── BulletBlock.tsx
│   │   │   ├── NumberedBlock.tsx
│   │   │   ├── QuoteBlock.tsx
│   │   │   ├── ImageBlock.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── DividerBlock.tsx
│   │   │   └── SyncedBlockRef.tsx
│   │   ├── SlashCommandMenu.tsx
│   │   ├── InlineToolbar.tsx
│   │   └── BlockHandle.tsx
│   ├── database/
│   │   ├── DatabaseView.tsx
│   │   ├── TableView.tsx
│   │   ├── BoardView.tsx
│   │   ├── ListView.tsx
│   │   ├── FilterBar.tsx
│   │   └── PropertyEditor.tsx
│   ├── page/
│   │   ├── PageHeader.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── CoverImage.tsx
│   └── shared/
│       ├── EmojiPicker.tsx
│       ├── Modal.tsx
│       └── Tooltip.tsx
├── store/
│   ├── editor-store.ts
│   ├── workspace-store.ts
│   └── database-store.ts
├── lib/
│   ├── local-db.ts               — Dexie IndexedDB setup
│   ├── tab-sync.ts               — BroadcastChannel
│   ├── formula-engine.ts         — Expression parser
│   ├── sync-queue.ts             — Offline sync queue
│   ├── keyboard.ts               — Shortcut manager
│   └── id.ts                     — UUID generation (nanoid)
├── hooks/
│   ├── useBlock.ts
│   ├── usePageTree.ts
│   ├── useDragAndDrop.ts
│   ├── useSlashCommand.ts
│   └── useKeyboardShortcuts.ts
├── types/
│   └── index.ts                  — Shared TypeScript types
├── styles/
│   └── globals.css               — Tailwind base + custom
└── index.tsx
```

---

## 10. Design Principles

1. **Blocks are atoms** — Every piece of content is a block. Blocks are never mixed.
2. **Normalized state** — Flat maps with ID references. Never nested objects in state.
3. **Local-first** — IndexedDB is the source of truth. Backend is a sync target.
4. **No magic** — No AI, no telemetry, no external calls. Deterministic behavior.
5. **Keyboard-first** — Every action reachable without a mouse.
6. **Recursive by nature** — Pages contain pages. Blocks contain blocks. One pattern scales infinitely.
