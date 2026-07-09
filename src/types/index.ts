// ─── Block Types ─────────────────────────────────────────────

export type BlockType =
  | 'text'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bullet'
  | 'numbered'
  | 'todo'
  | 'quote'
  | 'image'
  | 'code'
  | 'divider'
  | 'synced_ref';

export interface Mark {
  type: 'bold' | 'italic' | 'underline' | 'code' | 'strikethrough' | 'link';
  attrs?: Record<string, string>;
}

export interface BlockContent {
  text?: string;
  checked?: boolean;
  language?: string;
  url?: string;
  caption?: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: BlockContent;
  parentId: string | null;
  pageId: string;
  childrenIds: string[];
  sortOrder: number;
  syncId?: string;
  createdAt: number;
  updatedAt: number;
}

// ─── Page Types ──────────────────────────────────────────────

export interface Page {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  parentId: string | null;
  childrenIds: string[];
  workspaceId: string;
  isDatabase: boolean;
  isArchived: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

// ─── Database Types ──────────────────────────────────────────

export type PropertyType =
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'date'
  | 'url'
  | 'relation'
  | 'rollup'
  | 'formula'
  | 'checkbox';

export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export interface PropertyDefinition {
  id: string;
  name: string;
  type: PropertyType;
  databaseId: string;
  sortOrder: number;
  config: {
    options?: SelectOption[];
    relatedDatabaseId?: string;
    rollupConfig?: {
      relationPropertyId: string;
      targetPropertyId: string;
      aggregation: 'count' | 'sum' | 'average' | 'min' | 'max' | 'show_original';
    };
    formula?: string;
  };
}

export interface PageProperty {
  id: string;
  pageId: string;
  propertyId: string;
  value: PropertyValue;
}

export type PropertyValue =
  | string
  | number
  | boolean
  | string[]
  | { start: string; end?: string }
  | null;

export type DatabaseViewType = 'table' | 'board' | 'list';

export interface DatabaseView {
  id: string;
  name: string;
  type: DatabaseViewType;
  databaseId: string;
  sortOrder: number;
  config: {
    sortBy?: { propertyId: string; direction: 'asc' | 'desc' }[];
    filterBy?: FilterRule[];
    groupBy?: string;
    visibleProperties?: string[];
    columnWidths?: Record<string, number>;
  };
}

export interface FilterRule {
  propertyId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'is_empty' | 'is_not_empty' | 'gt' | 'lt';
  value: PropertyValue;
}

// ─── Synced Block ────────────────────────────────────────────

export interface SyncedBlock {
  id: string;
  sourceBlockId: string;
  content: BlockContent;
  type: BlockType;
  updatedAt: number;
}

// ─── Snapshot (Version History) ──────────────────────────────

export interface Snapshot {
  id: string;
  pageId: string;
  blocks: Block[];
  title: string;
  label?: string;
  createdAt: number;
}

// ─── Workspace ───────────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
}

// ─── Slash Command ───────────────────────────────────────────

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: string;
  blockType: BlockType;
  keywords: string[];
}
