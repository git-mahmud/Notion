import { create } from 'zustand';
import { db } from '@/lib/local-db';
import { generateId } from '@/lib/id';
import { broadcastChange } from '@/lib/tab-sync';
import type { Page } from '@/types';

export interface PageTreeNode {
  id: string;
  title: string;
  icon?: string;
  parentId: string | null;
  childrenIds: string[];
  isExpanded: boolean;
  isDatabase: boolean;
  sortOrder: number;
  isArchived: boolean;
}

interface WorkspaceState {
  pages: Record<string, PageTreeNode>;
  rootPageIds: string[];
  activePageId: string | null;
  breadcrumbs: string[];
  workspaceId: string;
  workspaceName: string;
  sidebarWidth: number;
  sidebarCollapsed: boolean;

  // Actions
  initialize: () => Promise<void>;
  createPage: (parentId?: string | null) => Promise<string>;
  deletePage: (id: string) => Promise<void>;
  archivePage: (id: string) => Promise<void>;
  restorePage: (id: string) => Promise<void>;
  movePage: (pageId: string, newParentId: string | null, index: number) => Promise<void>;
  renamePage: (id: string, title: string) => Promise<void>;
  setPageIcon: (id: string, icon: string) => Promise<void>;
  toggleExpand: (id: string) => void;
  navigateTo: (pageId: string) => void;
  computeBreadcrumbs: (pageId: string) => string[];
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  convertToDatabase: (pageId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  pages: {},
  rootPageIds: [],
  activePageId: null,
  breadcrumbs: [],
  workspaceId: 'default-workspace',
  workspaceName: 'My Workspace',
  sidebarWidth: 240,
  sidebarCollapsed: false,

  initialize: async () => {
    const allPages = await db.pages.where('isArchived').equals(0).toArray();
    const pagesMap: Record<string, PageTreeNode> = {};
    const rootIds: string[] = [];

    for (const page of allPages) {
      pagesMap[page.id] = {
        id: page.id,
        title: page.title,
        icon: page.icon,
        parentId: page.parentId,
        childrenIds: page.childrenIds || [],
        isExpanded: false,
        isDatabase: page.isDatabase,
        sortOrder: page.sortOrder,
        isArchived: page.isArchived,
      };
      if (!page.parentId) {
        rootIds.push(page.id);
      }
    }

    rootIds.sort((a, b) => (pagesMap[a]?.sortOrder ?? 0) - (pagesMap[b]?.sortOrder ?? 0));

    set({ pages: pagesMap, rootPageIds: rootIds });
  },

  createPage: async (parentId = null) => {
    const { pages, rootPageIds, workspaceId } = get();
    const id = generateId();
    const sortOrder = parentId
      ? (pages[parentId]?.childrenIds.length ?? 0)
      : rootPageIds.length;

    const page: Page = {
      id,
      title: 'Untitled',
      parentId,
      childrenIds: [],
      workspaceId,
      isDatabase: false,
      isArchived: false,
      sortOrder,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.pages.add(page);

    const newNode: PageTreeNode = {
      id,
      title: 'Untitled',
      parentId,
      childrenIds: [],
      isExpanded: false,
      isDatabase: false,
      sortOrder,
      isArchived: false,
    };

    const updatedPages = { ...pages, [id]: newNode };

    if (parentId && updatedPages[parentId]) {
      updatedPages[parentId] = {
        ...updatedPages[parentId],
        childrenIds: [...updatedPages[parentId].childrenIds, id],
      };
      await db.pages.update(parentId, {
        childrenIds: updatedPages[parentId].childrenIds,
      });
    }

    const newRootIds = parentId ? rootPageIds : [...rootPageIds, id];

    set({ pages: updatedPages, rootPageIds: newRootIds, activePageId: id });
    broadcastChange({ type: 'page_create', payload: { pageId: id } });

    return id;
  },

  deletePage: async (id: string) => {
    const { pages, rootPageIds, activePageId } = get();
    const page = pages[id];
    if (!page) return;

    // Recursively delete children
    const toDelete = [id];
    const collectChildren = (pid: string) => {
      const p = pages[pid];
      if (p) {
        for (const cid of p.childrenIds) {
          toDelete.push(cid);
          collectChildren(cid);
        }
      }
    };
    collectChildren(id);

    await db.pages.bulkDelete(toDelete);
    await db.blocks.where('pageId').anyOf(toDelete).delete();

    const updatedPages = { ...pages };
    for (const did of toDelete) {
      delete updatedPages[did];
    }

    if (page.parentId && updatedPages[page.parentId]) {
      updatedPages[page.parentId] = {
        ...updatedPages[page.parentId],
        childrenIds: updatedPages[page.parentId].childrenIds.filter((c) => c !== id),
      };
      await db.pages.update(page.parentId, {
        childrenIds: updatedPages[page.parentId].childrenIds,
      });
    }

    const newRootIds = rootPageIds.filter((rid) => rid !== id);
    const newActiveId = activePageId === id ? (newRootIds[0] ?? null) : activePageId;

    set({ pages: updatedPages, rootPageIds: newRootIds, activePageId: newActiveId });
    broadcastChange({ type: 'page_delete', payload: { pageId: id } });
  },

  archivePage: async (id: string) => {
    const { pages, rootPageIds, activePageId } = get();
    const page = pages[id];
    if (!page) return;

    await db.pages.update(id, { isArchived: true });

    const updatedPages = { ...pages };
    delete updatedPages[id];

    if (page.parentId && updatedPages[page.parentId]) {
      updatedPages[page.parentId] = {
        ...updatedPages[page.parentId],
        childrenIds: updatedPages[page.parentId].childrenIds.filter((c) => c !== id),
      };
    }

    const newRootIds = rootPageIds.filter((rid) => rid !== id);
    const newActiveId = activePageId === id ? (newRootIds[0] ?? null) : activePageId;

    set({ pages: updatedPages, rootPageIds: newRootIds, activePageId: newActiveId });
  },

  restorePage: async (id: string) => {
    await db.pages.update(id, { isArchived: false });
    await get().initialize();
  },

  movePage: async (pageId: string, newParentId: string | null, index: number) => {
    const { pages, rootPageIds } = get();
    const page = pages[pageId];
    if (!page) return;

    const updatedPages = { ...pages };

    // Remove from old parent
    if (page.parentId && updatedPages[page.parentId]) {
      updatedPages[page.parentId] = {
        ...updatedPages[page.parentId],
        childrenIds: updatedPages[page.parentId].childrenIds.filter((c) => c !== pageId),
      };
    }

    let newRootIds = page.parentId ? rootPageIds : rootPageIds.filter((r) => r !== pageId);

    // Add to new parent
    if (newParentId && updatedPages[newParentId]) {
      const children = [...updatedPages[newParentId].childrenIds];
      children.splice(index, 0, pageId);
      updatedPages[newParentId] = { ...updatedPages[newParentId], childrenIds: children };
    } else {
      const roots = [...newRootIds];
      roots.splice(index, 0, pageId);
      newRootIds = roots;
    }

    updatedPages[pageId] = { ...updatedPages[pageId], parentId: newParentId };

    await db.pages.update(pageId, { parentId: newParentId, sortOrder: index });

    set({ pages: updatedPages, rootPageIds: newRootIds });
  },

  renamePage: async (id: string, title: string) => {
    const { pages } = get();
    if (!pages[id]) return;

    await db.pages.update(id, { title, updatedAt: Date.now() });
    set({
      pages: { ...pages, [id]: { ...pages[id], title } },
    });
    broadcastChange({ type: 'page_update', payload: { pageId: id } });
  },

  setPageIcon: async (id: string, icon: string) => {
    const { pages } = get();
    if (!pages[id]) return;

    await db.pages.update(id, { icon });
    set({
      pages: { ...pages, [id]: { ...pages[id], icon } },
    });
  },

  toggleExpand: (id: string) => {
    const { pages } = get();
    if (!pages[id]) return;
    set({
      pages: { ...pages, [id]: { ...pages[id], isExpanded: !pages[id].isExpanded } },
    });
  },

  navigateTo: (pageId: string) => {
    const breadcrumbs = get().computeBreadcrumbs(pageId);
    set({ activePageId: pageId, breadcrumbs });
  },

  computeBreadcrumbs: (pageId: string) => {
    const { pages } = get();
    const crumbs: string[] = [];
    let current: string | null = pageId;
    while (current) {
      crumbs.unshift(current);
      current = pages[current]?.parentId ?? null;
    }
    return crumbs;
  },

  setSidebarWidth: (width: number) => {
    set({ sidebarWidth: Math.max(180, Math.min(480, width)) });
  },

  toggleSidebar: () => {
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
  },

  convertToDatabase: async (pageId: string) => {
    const { pages } = get();
    if (!pages[pageId]) return;

    await db.pages.update(pageId, { isDatabase: true });
    set({
      pages: { ...pages, [pageId]: { ...pages[pageId], isDatabase: true } },
    });
  },
}));
