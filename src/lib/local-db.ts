import Dexie, { type Table } from 'dexie';
import type { Block, Page, SyncedBlock, Snapshot, Workspace, PropertyDefinition, PageProperty, DatabaseView, Comment, DatabaseTemplate } from '@/types';

export class NotionLocalDB extends Dexie {
  workspaces!: Table<Workspace>;
  pages!: Table<Page>;
  blocks!: Table<Block>;
  syncedBlocks!: Table<SyncedBlock>;
  snapshots!: Table<Snapshot>;
  propertyDefinitions!: Table<PropertyDefinition>;
  pageProperties!: Table<PageProperty>;
  databaseViews!: Table<DatabaseView>;
  comments!: Table<Comment>;
  templates!: Table<DatabaseTemplate>;

  constructor() {
    super('notion-clone');
    this.version(1).stores({
      workspaces: 'id',
      pages: 'id, parentId, workspaceId, isArchived, isFavorite, sortOrder, updatedAt, lastViewedAt',
      blocks: 'id, pageId, parentId, syncId, sortOrder, type',
      syncedBlocks: 'id, sourceBlockId',
      snapshots: 'id, pageId, createdAt',
      propertyDefinitions: 'id, databaseId, sortOrder',
      pageProperties: 'id, pageId, propertyId, [pageId+propertyId]',
      databaseViews: 'id, databaseId, sortOrder',
      comments: 'id, pageId, blockId, resolved',
      templates: 'id, databaseId',
    });
  }
}

export const db = new NotionLocalDB();

// ─── Initialize default workspace ───────────────────────────

export async function initializeDatabase(): Promise<string> {
  const workspaces = await db.workspaces.toArray();
  if (workspaces.length === 0) {
    const workspace: Workspace = {
      id: 'default-workspace',
      name: 'My Workspace',
      icon: '🏠',
      createdAt: Date.now(),
    };
    await db.workspaces.add(workspace);
    return workspace.id;
  }
  return workspaces[0].id;
}
