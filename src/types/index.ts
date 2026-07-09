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
  | 'callout'
  | 'toggle'
  | 'image'
  | 'video'
  | 'audio'
  | 'file'
  | 'code'
  | 'equation'
  | 'divider'
  | 'table'
  | 'bookmark'
  | 'embed'
  | 'columns'
  | 'column'
  | 'synced_ref'
  | 'table_of_contents'
  | 'breadcrumb'
  | 'pdf'
  | 'template_button';

export type TextColor =
  | 'default' | 'gray' | 'brown' | 'orange' | 'yellow'
  | 'green' | 'blue' | 'purple' | 'pink' | 'red';

export type BgColor =
  | 'default' | 'gray_bg' | 'brown_bg' | 'orange_bg' | 'yellow_bg'
  | 'green_bg' | 'blue_bg' | 'purple_bg' | 'pink_bg' | 'red_bg';

export interface Mark {
  type: 'bold' | 'italic' | 'underline' | 'code' | 'strikethrough' | 'link' | 'highlight' | 'color';
  attrs?: Record<string, string>;
}

export interface BlockContent {
  text?: string;
  checked?: boolean;
  language?: string;
  url?: string;
  caption?: string;
  expanded?: boolean;       // toggle blocks
  emoji?: string;           // callout icon
  color?: TextColor;
  bgColor?: BgColor;
  level?: number;           // heading level
  // Table
  rows?: string[][];
  // Embed/bookmark
  title?: string;
  description?: string;
  favicon?: string;
  // Equation
  latex?: string;
  // Columns
  columnCount?: number;
  columnWidths?: number[];
  // Template
  templateName?: string;
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
  iconType?: 'emoji' | 'url';
  coverImage?: string;
  parentId: string | null;
  childrenIds: string[];
  workspaceId: string;
  isDatabase: boolean;
  isArchived: boolean;
  isFavorite: boolean;
  isLocked: boolean;
  isFullWidth: boolean;
  isSmallText: boolean;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  lastViewedAt?: number;
}

// ─── Database Types ──────────────────────────────────────────

export type PropertyType =
  | 'title'
  | 'text'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'status'
  | 'date'
  | 'person'
  | 'files'
  | 'url'
  | 'email'
  | 'phone'
  | 'relation'
  | 'rollup'
  | 'formula'
  | 'checkbox'
  | 'created_time'
  | 'created_by'
  | 'last_edited_time'
  | 'last_edited_by';

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
  width?: number;
  isVisible: boolean;
  config: {
    options?: SelectOption[];
    relatedDatabaseId?: string;
    rollupConfig?: {
      relationPropertyId: string;
      targetPropertyId: string;
      aggregation: 'count' | 'count_values' | 'count_unique' | 'sum' | 'average' | 'median' | 'min' | 'max' | 'range' | 'percent_empty' | 'percent_not_empty' | 'show_original';
    };
    formula?: string;
    numberFormat?: 'number' | 'currency' | 'percent';
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

export type DatabaseViewType = 'table' | 'board' | 'calendar' | 'gallery' | 'timeline' | 'list';

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
    cardSize?: 'small' | 'medium' | 'large';
    coverProperty?: string;
    calendarProperty?: string;
    timelineStart?: string;
    timelineEnd?: string;
  };
}

export interface FilterRule {
  id: string;
  propertyId: string;
  operator: FilterOperator;
  value: PropertyValue;
  conjunction?: 'and' | 'or';
}

export type FilterOperator =
  | 'equals' | 'not_equals' | 'contains' | 'not_contains'
  | 'starts_with' | 'ends_with'
  | 'is_empty' | 'is_not_empty'
  | 'gt' | 'lt' | 'gte' | 'lte'
  | 'before' | 'after';

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

// ─── Comment ─────────────────────────────────────────────────

export interface Comment {
  id: string;
  blockId?: string;
  pageId: string;
  text: string;
  resolved: boolean;
  createdAt: number;
  updatedAt: number;
}

// ─── Workspace ───────────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
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
  category: string;
}

// ─── Theme ───────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

// ─── Template ────────────────────────────────────────────────

export interface DatabaseTemplate {
  id: string;
  databaseId: string;
  name: string;
  icon?: string;
  blocks: Block[];
  properties: Record<string, PropertyValue>;
}
