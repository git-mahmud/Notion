import { create } from 'zustand';
import { db } from '@/lib/local-db';
import { generateId } from '@/lib/id';
import { broadcastChange } from '@/lib/tab-sync';
import type { Page, Theme } from '@/types';
import { getStoredTheme, setStoredTheme } from '@/lib/theme';

export interface PageTreeNode {
  id: string;
  title: string;
  icon?: string;
  iconType?: 'emoji' | 'url';
  coverImage?: string;
  parentId: string | null;
  childrenIds: string[];
  isExpanded: boolean;
  isDatabase: boolean;
  isFavorite: boolean;
  isLocked: boolean;
  isFullWidth: boolean;
  isSmallText: boolean;
  sortOrder: number;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
  lastViewedAt?: number;
}

interface WorkspaceState {
  pages: Record<string, PageTreeNode>;
  rootPageIds: string[];
  activePageId: string | null;
  breadcrumbs: string[];
  workspaceId: string;
  workspaceName: string;
  workspaceIcon: string;
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  theme: Theme;
  recentPages: string[];
  trashedPages: PageTreeNode[];

  // Actions
  initialize: () => Promise<void>;
  createPage: (parentId?: string | null, title?: string) => Promise<string>;
  deletePage: (id: string) => Promise<void>;
  archivePage: (id: string) => Promise<void>;
  restorePage: (id: string) => Promise<void>;
  permanentDelete: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  movePage: (pageId: string, newParentId: string | null, index: number) => Promise<void>;
  renamePage: (id: string, title: string) => Promise<void>;
  setPageIcon: (id: string, icon: string, iconType?: 'emoji' | 'url') => Promise<void>;
  setCoverImage: (id: string, url: string | undefined) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  toggleLock: (id: string) => Promise<void>;
  toggleFullWidth: (id: string) => Promise<void>;
  toggleSmallText: (id: string) => Promise<void>;
  duplicatePage: (id: string) => Promise<string>;
  toggleExpand: (id: string) => void;
  navigateTo: (pageId: string) => void;
  computeBreadcrumbs: (pageId: string) => string[];
  setSidebarWidth: (width: number) => void;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  convertToDatabase: (pageId: string) => Promise<void>;
  loadTrash: () => Promise<void>;
  goBack: () => void;
  goForward: () => void;
}

// Navigation history
let navHistory: string[] = [];
let navIndex = -1;

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  pages: {},
  rootPageIds: [],
  activePageId: null,
  breadcrumbs: [],
  workspaceId: 'default-workspace',
  workspaceName: 'My Workspace',
  workspaceIcon: '🏠',
  sidebarWidth: 260,
  sidebarCollapsed: false,
  theme: getStoredTheme(),
  recentPages: [],
  trashedPages: [],

  initialize: async () => {
    const allPages = (await db.pages.toArray()).filter((p) => !p.isArchived);
    const pagesMap: Record<string, PageTreeNode> = {};
    const rootIds: string[] = [];

    for (const page of allPages) {
      pagesMap[page.id] = {
        id: page.id,
        title: page.title,
        icon: page.icon,
        iconType: page.iconType,
        coverImage: page.coverImage,
        parentId: page.parentId,
        childrenIds: page.childrenIds || [],
        isExpanded: false,
        isDatabase: page.isDatabase,
        isFavorite: page.isFavorite || false,
        isLocked: page.isLocked || false,
        isFullWidth: page.isFullWidth || false,
        isSmallText: page.isSmallText || false,
        sortOrder: page.sortOrder,
        isArchived: page.isArchived,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        lastViewedAt: page.lastViewedAt,
      };
      if (!page.parentId) {
        rootIds.push(page.id);
      }
    }

    rootIds.sort((a, b) => (pagesMap[a]?.sortOrder ?? 0) - (pagesMap[b]?.sortOrder ?? 0));

    // Load recent pages
    const recent = allPages
      .filter((p) => p.lastViewedAt)
      .sort((a, b) => (b.lastViewedAt || 0) - (a.lastViewedAt || 0))
      .slice(0, 10)
      .map((p) => p.id);

    set({ pages: pagesMap, rootPageIds: rootIds, recentPages: recent });
  },

  createPage: async (parentId = null, title = 'Untitled') => {
    const { pages, rootPageIds, workspaceId } = get();
    const id = generateId();
    const sortOrder = parentId
      ? (pages[parentId]?.childrenIds.length ?? 0)
      : rootPageIds.length;

    const page: Page = {
      id,
      title,
      parentId,
      childrenIds: [],
      workspaceId,
      isDatabase: false,
      isArchived: false,
      isFavorite: false,
      isLocked: false,
      isFullWidth: false,
      isSmallText: false,
      sortOrder,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.pages.add(page);

    const newNode: PageTreeNode = {
      ...page,
      isExpanded: false,
    };

    const updatedPages = { ...pages, [id]: newNode };

    if (parentId && updatedPages[parentId]) {
      updatedPages[parentId] = {
        ...updatedPages[parentId],
        childrenIds: [...updatedPages[parentId].childrenIds, id],
        isExpanded: true,
      };
      await db.pages.update(parentId, { childrenIds: updatedPages[parentId].childrenIds });
    }

    const newRootIds = parentId ? rootPageIds : [...rootPageIds, id];
    set({ pages: updatedPages, rootPageIds: newRootIds });
    get().navigateTo(id);
    broadcastChange({ type: 'page_create', payload: { pageId: id } });
    return id;
  },

  deletePage: async (id: string) => {
    await get().archivePage(id);
  },

  archivePage: async (id: string) => {
    const { pages, rootPageIds, activePageId } = get();
    const page = pages[id];
    if (!page) return;

    await db.pages.update(id, { isArchived: true, updatedAt: Date.now() });

    const updatedPages = { ...pages };
    delete updatedPages[id];

    if (page.parentId && updatedPages[page.parentId]) {
      updatedPages[page.parentId] = {
        ...updatedPages[page.parentId],
        childrenIds: updatedPages[page.parentId].childrenIds.filter((c) => c !== id),
      };
      await db.pages.update(page.parentId, { childrenIds: updatedPages[page.parentId].childrenIds });
    }

    const newRootIds = rootPageIds.filter((rid) => rid !== id);
    const newActiveId = activePageId === id ? (newRootIds[0] ?? null) : activePageId;

    set({ pages: updatedPages, rootPageIds: newRootIds, activePageId: newActiveId });
    broadcastChange({ type: 'page_delete', payload: { pageId: id } });
  },

  restorePage: async (id: string) => {
    await db.pages.update(id, { isArchived: false, updatedAt: Date.now() });
    await get().initialize();
    await get().loadTrash();
  },

  permanentDelete: async (id: string) => {
    await db.pages.delete(id);
    await db.blocks.where('pageId').equals(id).delete();
    await get().loadTrash();
  },

  emptyTrash: async () => {
    const trashed = await db.pages.filter((p) => p.isArchived).toArray();
    const ids = trashed.map((p) => p.id);
    await db.pages.bulkDelete(ids);
    for (const id of ids) {
      await db.blocks.where('pageId').equals(id).delete();
    }
    set({ trashedPages: [] });
  },

  movePage: async (pageId: string, newParentId: string | null, index: number) => {
    const { pages, rootPageIds } = get();
    const page = pages[pageId];
    if (!page) return;

    const updatedPages = { ...pages };

    if (page.parentId && updatedPages[page.parentId]) {
      updatedPages[page.parentId] = {
        ...updatedPages[page.parentId],
        childrenIds: updatedPages[page.parentId].childrenIds.filter((c) => c !== pageId),
      };
    }

    let newRootIds = page.parentId ? [...rootPageIds] : rootPageIds.filter((r) => r !== pageId);

    if (newParentId && updatedPages[newParentId]) {
      const children = [...updatedPages[newParentId].childrenIds];
      children.splice(index, 0, pageId);
      updatedPages[newParentId] = { ...updatedPages[newParentId], childrenIds: children };
    } else {
      newRootIds.splice(index, 0, pageId);
    }

    updatedPages[pageId] = { ...updatedPages[pageId], parentId: newParentId };
    await db.pages.update(pageId, { parentId: newParentId, sortOrder: index, updatedAt: Date.now() });

    set({ pages: updatedPages, rootPageIds: newRootIds });
  },

  renamePage: async (id: string, title: string) => {
    const { pages } = get();
    if (!pages[id]) return;
    await db.pages.update(id, { title, updatedAt: Date.now() });
    set({ pages: { ...pages, [id]: { ...pages[id], title } } });
    broadcastChange({ type: 'page_update', payload: { pageId: id } });
  },

  setPageIcon: async (id: string, icon: string, iconType: 'emoji' | 'url' = 'emoji') => {
    const { pages } = get();
    if (!pages[id]) return;
    await db.pages.update(id, { icon, iconType });
    set({ pages: { ...pages, [id]: { ...pages[id], icon, iconType } } });
  },

  setCoverImage: async (id: string, url: string | undefined) => {
    const { pages } = get();
    if (!pages[id]) return;
    await db.pages.update(id, { coverImage: url });
    set({ pages: { ...pages, [id]: { ...pages[id], coverImage: url } } });
  },

  toggleFavorite: async (id: string) => {
    const { pages } = get();
    if (!pages[id]) return;
    const newVal = !pages[id].isFavorite;
    await db.pages.update(id, { isFavorite: newVal });
    set({ pages: { ...pages, [id]: { ...pages[id], isFavorite: newVal } } });
  },

  toggleLock: async (id: string) => {
    const { pages } = get();
    if (!pages[id]) return;
    const newVal = !pages[id].isLocked;
    await db.pages.update(id, { isLocked: newVal });
    set({ pages: { ...pages, [id]: { ...pages[id], isLocked: newVal } } });
  },

  toggleFullWidth: async (id: string) => {
    const { pages } = get();
    if (!pages[id]) return;
    const newVal = !pages[id].isFullWidth;
    await db.pages.update(id, { isFullWidth: newVal });
    set({ pages: { ...pages, [id]: { ...pages[id], isFullWidth: newVal } } });
  },

  toggleSmallText: async (id: string) => {
    const { pages } = get();
    if (!pages[id]) return;
    const newVal = !pages[id].isSmallText;
    await db.pages.update(id, { isSmallText: newVal });
    set({ pages: { ...pages, [id]: { ...pages[id], isSmallText: newVal } } });
  },

  duplicatePage: async (id: string) => {
    const { pages, rootPageIds, workspaceId } = get();
    const original = pages[id];
    if (!original) return '';

    const newId = generateId();
    const page: Page = {
      id: newId,
      title: `${original.title} (copy)`,
      icon: original.icon,
      iconType: original.iconType,
      coverImage: original.coverImage,
      parentId: original.parentId,
      childrenIds: [],
      workspaceId,
      isDatabase: original.isDatabase,
      isArchived: false,
      isFavorite: false,
      isLocked: false,
      isFullWidth: original.isFullWidth,
      isSmallText: original.isSmallText,
      sortOrder: original.sortOrder + 0.5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.pages.add(page);

    // Copy blocks
    const originalBlocks = await db.blocks.where('pageId').equals(id).toArray();
    const idMap: Record<string, string> = {};
    const newBlocks = originalBlocks.map((b) => {
      const nbid = generateId();
      idMap[b.id] = nbid;
      return { ...b, id: nbid, pageId: newId };
    });
    // Fix parent references
    for (const nb of newBlocks) {
      if (nb.parentId && idMap[nb.parentId]) nb.parentId = idMap[nb.parentId];
      nb.childrenIds = nb.childrenIds.map((c) => idMap[c] || c);
    }
    if (newBlocks.length > 0) await db.blocks.bulkAdd(newBlocks);

    const updatedPages = { ...pages, [newId]: { ...page, isExpanded: false } };
    const newRootIds = original.parentId ? rootPageIds : [...rootPageIds, newId];

    set({ pages: updatedPages, rootPageIds: newRootIds });
    return newId;
  },

  toggleExpand: (id: string) => {
    const { pages } = get();
    if (!pages[id]) return;
    set({ pages: { ...pages, [id]: { ...pages[id], isExpanded: !pages[id].isExpanded } } });
  },

  navigateTo: (pageId: string) => {
    const breadcrumbs = get().computeBreadcrumbs(pageId);

    // Update navigation history
    navHistory = navHistory.slice(0, navIndex + 1);
    navHistory.push(pageId);
    navIndex = navHistory.length - 1;

    // Update last viewed
    db.pages.update(pageId, { lastViewedAt: Date.now() });

    // Update recent pages
    const { recentPages } = get();
    const updated = [pageId, ...recentPages.filter((id) => id !== pageId)].slice(0, 10);

    set({ activePageId: pageId, breadcrumbs, recentPages: updated });
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
    set({ sidebarWidth: Math.max(200, Math.min(480, width)) });
  },

  toggleSidebar: () => {
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }));
  },

  setTheme: (theme: Theme) => {
    setStoredTheme(theme);
    set({ theme });
  },

  convertToDatabase: async (pageId: string) => {
    const { pages } = get();
    if (!pages[pageId]) return;
    await db.pages.update(pageId, { isDatabase: true });
    set({ pages: { ...pages, [pageId]: { ...pages[pageId], isDatabase: true } } });
  },

  loadTrash: async () => {
    const trashed = (await db.pages.toArray()).filter((p) => p.isArchived);
    const nodes: PageTreeNode[] = trashed.map((p) => ({
      ...p,
      childrenIds: p.childrenIds || [],
      isExpanded: false,
      isFavorite: p.isFavorite || false,
      isLocked: p.isLocked || false,
      isFullWidth: p.isFullWidth || false,
      isSmallText: p.isSmallText || false,
    }));
    set({ trashedPages: nodes });
  },

  goBack: () => {
    if (navIndex > 0) {
      navIndex--;
      const pageId = navHistory[navIndex];
      const breadcrumbs = get().computeBreadcrumbs(pageId);
      set({ activePageId: pageId, breadcrumbs });
    }
  },

  goForward: () => {
    if (navIndex < navHistory.length - 1) {
      navIndex++;
      const pageId = navHistory[navIndex];
      const breadcrumbs = get().computeBreadcrumbs(pageId);
      set({ activePageId: pageId, breadcrumbs });
    }
  },
}));
