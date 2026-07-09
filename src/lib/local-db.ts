import Dexie, { type Table } from 'dexie';
import type { Block, Page, SyncedBlock, Snapshot, Workspace, PropertyDefinition, PageProperty, DatabaseView } from '@/types';

export class NotionLocalDB extends Dexie {
  workspaces!: Table<Workspace>;
  pages!: Table<Page>;
  blocks!: Table<Block>;
  syncedBlocks!: Table<SyncedBlock>;
  snapshots!: Table<Snapshot>;
  propertyDefinitions!: Table<PropertyDefinition>;
  pageProperties!: Table<PageProperty>;
  databaseViews!: Table<DatabaseView>;

  constructor() {
    super('notion-clone');
    this.version(1).stores({
      workspaces: 'id',
      pages: 'id, parentId, workspaceId, isArchived, sortOrder',
      blocks: 'id, pageId, parentId, syncId, sortOrder',
      syncedBlocks: 'id, sourceBlockId',
      snapshots: 'id, pageId, createdAt',
      propertyDefinitions: 'id, databaseId, sortOrder',
      pageProperties: 'id, pageId, propertyId, [pageId+propertyId]',
      databaseViews: 'id, databaseId, sortOrder',
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
      createdAt: Date.now(),
    };
    await db.workspaces.add(workspace);
    return workspace.id;
  }
  return workspaces[0].id;
}
