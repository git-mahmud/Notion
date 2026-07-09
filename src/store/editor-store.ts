import { create } from 'zustand';
import { db } from '@/lib/local-db';
import { generateId } from '@/lib/id';
import { broadcastChange } from '@/lib/tab-sync';
import type { Block, BlockType, BlockContent, Snapshot } from '@/types';

interface EditorSnapshot {
  blocks: Record<string, Block>;
  rootBlockIds: string[];
  timestamp: number;
}

interface EditorState {
  // State
  pageId: string | null;
  blocks: Record<string, Block>;
  rootBlockIds: string[];
  activeBlockId: string | null;
  slashMenuOpen: boolean;
  slashMenuBlockId: string | null;
  slashMenuPosition: { x: number; y: number } | null;
  undoStack: EditorSnapshot[];
  redoStack: EditorSnapshot[];
  isDirty: boolean;

  // Page actions
  loadPage: (pageId: string) => Promise<void>;
  savePage: () => Promise<void>;
  createSnapshot: (label?: string) => Promise<void>;

  // Block CRUD
  addBlock: (type: BlockType, afterBlockId?: string | null, parentId?: string | null) => string;
  updateBlockContent: (id: string, content: Partial<BlockContent>) => void;
  updateBlockType: (id: string, type: BlockType) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (id: string) => string;

  // Block movement
  moveBlock: (blockId: string, targetParentId: string | null, targetIndex: number) => void;
  indentBlock: (id: string) => void;
  outdentBlock: (id: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;

  // Focus
  setActiveBlock: (id: string | null) => void;

  // Slash command
  openSlashMenu: (blockId: string, position: { x: number; y: number }) => void;
  closeSlashMenu: () => void;

  // History
  pushSnapshot: () => void;
  undo: () => void;
  redo: () => void;

  // Synced blocks
  createSyncedBlock: (blockId: string) => Promise<string>;
  updateSyncedBlock: (syncId: string, content: BlockContent) => Promise<void>;

  // Helpers
  getBlocksInOrder: () => Block[];
  getSiblings: (blockId: string) => string[];
  getParentList: (blockId: string) => string[];
}

export const useEditorStore = create<EditorState>((set, get) => ({
  pageId: null,
  blocks: {},
  rootBlockIds: [],
  activeBlockId: null,
  slashMenuOpen: false,
  slashMenuBlockId: null,
  slashMenuPosition: null,
  undoStack: [],
  redoStack: [],
  isDirty: false,

  loadPage: async (pageId: string) => {
    const allBlocks = await db.blocks.where('pageId').equals(pageId).toArray();
    const blocksMap: Record<string, Block> = {};
    const rootIds: string[] = [];

    for (const block of allBlocks) {
      blocksMap[block.id] = block;
      if (!block.parentId) {
        rootIds.push(block.id);
      }
    }

    rootIds.sort((a, b) => (blocksMap[a]?.sortOrder ?? 0) - (blocksMap[b]?.sortOrder ?? 0));

    // If page is empty, add a default empty text block
    if (rootIds.length === 0) {
      const id = generateId();
      const block: Block = {
        id,
        type: 'text',
        content: { text: '' },
        parentId: null,
        pageId,
        childrenIds: [],
        sortOrder: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      blocksMap[id] = block;
      rootIds.push(id);
      await db.blocks.add(block);
    }

    set({
      pageId,
      blocks: blocksMap,
      rootBlockIds: rootIds,
      activeBlockId: rootIds[0] ?? null,
      undoStack: [],
      redoStack: [],
      isDirty: false,
    });
  },

  savePage: async () => {
    const { blocks, pageId } = get();
    if (!pageId) return;

    const blockArray = Object.values(blocks);
    await db.blocks.where('pageId').equals(pageId).delete();
    if (blockArray.length > 0) {
      await db.blocks.bulkAdd(blockArray);
    }

    set({ isDirty: false });
  },

  createSnapshot: async (label?: string) => {
    const { pageId, blocks } = get();
    if (!pageId) return;

    const page = await db.pages.get(pageId);
    const snapshot: Snapshot = {
      id: generateId(),
      pageId,
      blocks: Object.values(blocks),
      title: page?.title ?? 'Untitled',
      label,
      createdAt: Date.now(),
    };

    await db.snapshots.add(snapshot);
  },

  addBlock: (type: BlockType, afterBlockId: string | null = null, parentId: string | null = null) => {
    const { blocks, rootBlockIds, pageId } = get();
    if (!pageId) return '';

    get().pushSnapshot();

    const id = generateId();
    const newBlock: Block = {
      id,
      type,
      content: { text: '' },
      parentId,
      pageId,
      childrenIds: [],
      sortOrder: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedBlocks = { ...blocks, [id]: newBlock };
    let newRootIds = [...rootBlockIds];

    if (parentId && updatedBlocks[parentId]) {
      const parent = updatedBlocks[parentId];
      const children = [...parent.childrenIds];
      const insertIdx = afterBlockId ? children.indexOf(afterBlockId) + 1 : children.length;
      children.splice(insertIdx, 0, id);
      updatedBlocks[parentId] = { ...parent, childrenIds: children };
    } else {
      const insertIdx = afterBlockId ? newRootIds.indexOf(afterBlockId) + 1 : newRootIds.length;
      newRootIds.splice(insertIdx, 0, id);
    }

    // Update sort orders
    const siblings = parentId ? (updatedBlocks[parentId]?.childrenIds ?? []) : newRootIds;
    siblings.forEach((sid, i) => {
      if (updatedBlocks[sid]) {
        updatedBlocks[sid] = { ...updatedBlocks[sid], sortOrder: i };
      }
    });

    set({ blocks: updatedBlocks, rootBlockIds: newRootIds, activeBlockId: id, isDirty: true });
    db.blocks.put(newBlock);

    return id;
  },

  updateBlockContent: (id: string, content: Partial<BlockContent>) => {
    const { blocks } = get();
    const block = blocks[id];
    if (!block) return;

    const updated = {
      ...block,
      content: { ...block.content, ...content },
      updatedAt: Date.now(),
    };

    set({ blocks: { ...blocks, [id]: updated }, isDirty: true });
    db.blocks.put(updated);
    broadcastChange({ type: 'block_update', payload: { pageId: block.pageId, blockId: id } });
  },

  updateBlockType: (id: string, type: BlockType) => {
    const { blocks } = get();
    const block = blocks[id];
    if (!block) return;

    get().pushSnapshot();

    const updated = { ...block, type, updatedAt: Date.now() };
    set({ blocks: { ...blocks, [id]: updated }, isDirty: true });
    db.blocks.put(updated);
  },

  deleteBlock: (id: string) => {
    const { blocks, rootBlockIds } = get();
    const block = blocks[id];
    if (!block) return;

    get().pushSnapshot();

    // Collect all descendants
    const toDelete = new Set<string>();
    const collectDescendants = (bid: string) => {
      toDelete.add(bid);
      const b = blocks[bid];
      if (b) b.childrenIds.forEach(collectDescendants);
    };
    collectDescendants(id);

    const updatedBlocks = { ...blocks };
    toDelete.forEach((did) => delete updatedBlocks[did]);

    // Remove from parent
    if (block.parentId && updatedBlocks[block.parentId]) {
      updatedBlocks[block.parentId] = {
        ...updatedBlocks[block.parentId],
        childrenIds: updatedBlocks[block.parentId].childrenIds.filter((c) => c !== id),
      };
    }

    const newRootIds = block.parentId ? rootBlockIds : rootBlockIds.filter((r) => r !== id);

    // Determine new active block
    const siblings = block.parentId
      ? (updatedBlocks[block.parentId]?.childrenIds ?? [])
      : newRootIds;
    const oldIdx = block.parentId
      ? blocks[block.parentId]?.childrenIds.indexOf(id) ?? 0
      : rootBlockIds.indexOf(id);
    const newActiveId = siblings[Math.max(0, oldIdx - 1)] ?? siblings[0] ?? null;

    set({ blocks: updatedBlocks, rootBlockIds: newRootIds, activeBlockId: newActiveId, isDirty: true });
    db.blocks.bulkDelete([...toDelete]);
  },

  duplicateBlock: (id: string) => {
    const { blocks, rootBlockIds, pageId } = get();
    const block = blocks[id];
    if (!block || !pageId) return '';

    get().pushSnapshot();

    const newId = generateId();
    const duplicate: Block = {
      ...block,
      id: newId,
      sortOrder: block.sortOrder + 0.5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedBlocks = { ...blocks, [newId]: duplicate };

    if (block.parentId && updatedBlocks[block.parentId]) {
      const parent = updatedBlocks[block.parentId];
      const idx = parent.childrenIds.indexOf(id);
      const children = [...parent.childrenIds];
      children.splice(idx + 1, 0, newId);
      updatedBlocks[block.parentId] = { ...parent, childrenIds: children };
    } else {
      const idx = rootBlockIds.indexOf(id);
      const newRoots = [...rootBlockIds];
      newRoots.splice(idx + 1, 0, newId);
      set({ rootBlockIds: newRoots });
    }

    set({ blocks: updatedBlocks, activeBlockId: newId, isDirty: true });
    db.blocks.put(duplicate);

    return newId;
  },

  moveBlock: (blockId: string, targetParentId: string | null, targetIndex: number) => {
    const { blocks, rootBlockIds } = get();
    const block = blocks[blockId];
    if (!block) return;

    get().pushSnapshot();

    const updatedBlocks = { ...blocks };

    // Remove from old location
    if (block.parentId && updatedBlocks[block.parentId]) {
      updatedBlocks[block.parentId] = {
        ...updatedBlocks[block.parentId],
        childrenIds: updatedBlocks[block.parentId].childrenIds.filter((c) => c !== blockId),
      };
    }

    let newRootIds = block.parentId ? [...rootBlockIds] : rootBlockIds.filter((r) => r !== blockId);

    // Add to new location
    if (targetParentId && updatedBlocks[targetParentId]) {
      const children = [...updatedBlocks[targetParentId].childrenIds];
      children.splice(targetIndex, 0, blockId);
      updatedBlocks[targetParentId] = { ...updatedBlocks[targetParentId], childrenIds: children };
    } else {
      newRootIds.splice(targetIndex, 0, blockId);
    }

    updatedBlocks[blockId] = { ...updatedBlocks[blockId], parentId: targetParentId, sortOrder: targetIndex };

    set({ blocks: updatedBlocks, rootBlockIds: newRootIds, isDirty: true });
  },

  indentBlock: (id: string) => {
    const { blocks, rootBlockIds } = get();
    const block = blocks[id];
    if (!block) return;

    // Find previous sibling
    const siblings = block.parentId
      ? blocks[block.parentId]?.childrenIds ?? []
      : rootBlockIds;
    const idx = siblings.indexOf(id);
    if (idx <= 0) return; // Can't indent first item

    const prevSiblingId = siblings[idx - 1];
    get().moveBlock(id, prevSiblingId, blocks[prevSiblingId]?.childrenIds.length ?? 0);
  },

  outdentBlock: (id: string) => {
    const { blocks } = get();
    const block = blocks[id];
    if (!block || !block.parentId) return;

    const parent = blocks[block.parentId];
    if (!parent) return;

    // Move to parent's level, after parent
    const grandparentChildren = parent.parentId
      ? blocks[parent.parentId]?.childrenIds ?? []
      : get().rootBlockIds;
    const parentIdx = grandparentChildren.indexOf(parent.id);

    get().moveBlock(id, parent.parentId, parentIdx + 1);
  },

  reorderBlocks: (activeId: string, overId: string) => {
    const { blocks, rootBlockIds } = get();
    const activeBlock = blocks[activeId];
    const overBlock = blocks[overId];
    if (!activeBlock || !overBlock) return;

    get().pushSnapshot();

    const updatedBlocks = { ...blocks };

    // Remove active from current position
    if (activeBlock.parentId && updatedBlocks[activeBlock.parentId]) {
      updatedBlocks[activeBlock.parentId] = {
        ...updatedBlocks[activeBlock.parentId],
        childrenIds: updatedBlocks[activeBlock.parentId].childrenIds.filter((c) => c !== activeId),
      };
    }

    let newRootIds = activeBlock.parentId
      ? [...rootBlockIds]
      : rootBlockIds.filter((r) => r !== activeId);

    // Insert at over position
    if (overBlock.parentId && updatedBlocks[overBlock.parentId]) {
      const children = [...updatedBlocks[overBlock.parentId].childrenIds];
      const overIdx = children.indexOf(overId);
      children.splice(overIdx, 0, activeId);
      updatedBlocks[overBlock.parentId] = { ...updatedBlocks[overBlock.parentId], childrenIds: children };
      updatedBlocks[activeId] = { ...updatedBlocks[activeId], parentId: overBlock.parentId };
    } else {
      const overIdx = newRootIds.indexOf(overId);
      newRootIds.splice(overIdx, 0, activeId);
      updatedBlocks[activeId] = { ...updatedBlocks[activeId], parentId: null };
    }

    set({ blocks: updatedBlocks, rootBlockIds: newRootIds, isDirty: true });
  },

  setActiveBlock: (id: string | null) => {
    set({ activeBlockId: id });
  },

  openSlashMenu: (blockId: string, position: { x: number; y: number }) => {
    set({ slashMenuOpen: true, slashMenuBlockId: blockId, slashMenuPosition: position });
  },

  closeSlashMenu: () => {
    set({ slashMenuOpen: false, slashMenuBlockId: null, slashMenuPosition: null });
  },

  pushSnapshot: () => {
    const { blocks, rootBlockIds, undoStack } = get();
    const snapshot: EditorSnapshot = {
      blocks: { ...blocks },
      rootBlockIds: [...rootBlockIds],
      timestamp: Date.now(),
    };
    set({ undoStack: [...undoStack.slice(-50), snapshot], redoStack: [] });
  },

  undo: () => {
    const { undoStack, blocks, rootBlockIds } = get();
    if (undoStack.length === 0) return;

    const current: EditorSnapshot = { blocks, rootBlockIds, timestamp: Date.now() };
    const prev = undoStack[undoStack.length - 1];

    set({
      blocks: prev.blocks,
      rootBlockIds: prev.rootBlockIds,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, current],
      isDirty: true,
    });
  },

  redo: () => {
    const { redoStack, blocks, rootBlockIds } = get();
    if (redoStack.length === 0) return;

    const current: EditorSnapshot = { blocks, rootBlockIds, timestamp: Date.now() };
    const next = redoStack[redoStack.length - 1];

    set({
      blocks: next.blocks,
      rootBlockIds: next.rootBlockIds,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, current],
      isDirty: true,
    });
  },

  createSyncedBlock: async (blockId: string) => {
    const { blocks } = get();
    const block = blocks[blockId];
    if (!block) return '';

    const syncId = generateId();
    await db.syncedBlocks.add({
      id: syncId,
      sourceBlockId: blockId,
      content: block.content,
      type: block.type,
      updatedAt: Date.now(),
    });

    const updated = { ...block, syncId };
    set({ blocks: { ...blocks, [blockId]: updated } });
    await db.blocks.put(updated);

    return syncId;
  },

  updateSyncedBlock: async (syncId: string, content: BlockContent) => {
    const { blocks } = get();

    await db.syncedBlocks.update(syncId, { content, updatedAt: Date.now() });

    // Update all blocks that reference this syncId
    const updatedBlocks = { ...blocks };
    for (const [bid, block] of Object.entries(updatedBlocks)) {
      if (block.syncId === syncId) {
        updatedBlocks[bid] = { ...block, content, updatedAt: Date.now() };
      }
    }

    set({ blocks: updatedBlocks, isDirty: true });
    broadcastChange({ type: 'synced_block_update', payload: { syncId } });
  },

  getBlocksInOrder: () => {
    const { blocks, rootBlockIds } = get();
    const result: Block[] = [];
    const traverse = (ids: string[]) => {
      for (const id of ids) {
        const block = blocks[id];
        if (block) {
          result.push(block);
          if (block.childrenIds.length > 0) {
            traverse(block.childrenIds);
          }
        }
      }
    };
    traverse(rootBlockIds);
    return result;
  },

  getSiblings: (blockId: string) => {
    const { blocks, rootBlockIds } = get();
    const block = blocks[blockId];
    if (!block) return [];
    return block.parentId ? (blocks[block.parentId]?.childrenIds ?? []) : rootBlockIds;
  },

  getParentList: (blockId: string) => {
    const { blocks } = get();
    const parents: string[] = [];
    let current = blocks[blockId];
    while (current?.parentId) {
      parents.unshift(current.parentId);
      current = blocks[current.parentId];
    }
    return parents;
  },
}));
