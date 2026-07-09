import { create } from 'zustand';
import { db } from '@/lib/local-db';
import { generateId } from '@/lib/id';
import { evaluateFormula } from '@/lib/formula-engine';
import type {
  PropertyDefinition,
  PageProperty,
  DatabaseView,
  PropertyType,
  PropertyValue,
  SelectOption,
  FilterRule,
} from '@/types';

interface DatabaseState {
  // State per active database
  activeDatabaseId: string | null;
  properties: Record<string, PropertyDefinition>;
  views: Record<string, DatabaseView>;
  pageProperties: Record<string, Record<string, PageProperty>>; // pageId -> propertyId -> value
  activeViewId: string | null;

  // Actions
  loadDatabase: (databaseId: string) => Promise<void>;

  // Property CRUD
  addProperty: (name: string, type: PropertyType) => Promise<string>;
  updateProperty: (id: string, updates: Partial<PropertyDefinition>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  addSelectOption: (propertyId: string, option: SelectOption) => Promise<void>;

  // View CRUD
  addView: (name: string, type: DatabaseView['type']) => Promise<string>;
  updateView: (id: string, updates: Partial<DatabaseView>) => Promise<void>;
  deleteView: (id: string) => Promise<void>;
  setActiveView: (id: string) => void;

  // Page property values
  setPageProperty: (pageId: string, propertyId: string, value: PropertyValue) => Promise<void>;
  getPageProperty: (pageId: string, propertyId: string) => PropertyValue;

  // Computed
  evaluateFormulaProperty: (pageId: string, propertyId: string) => PropertyValue;
  evaluateRollup: (pageId: string, propertyId: string) => PropertyValue;
  getFilteredPages: (viewId: string, allPageIds: string[]) => string[];
  getSortedPages: (viewId: string, pageIds: string[]) => string[];
  getGroupedPages: (viewId: string, pageIds: string[]) => Record<string, string[]>;
}

export const useDatabaseStore = create<DatabaseState>((set, get) => ({
  activeDatabaseId: null,
  properties: {},
  views: {},
  pageProperties: {},
  activeViewId: null,

  loadDatabase: async (databaseId: string) => {
    const props = await db.propertyDefinitions
      .where('databaseId')
      .equals(databaseId)
      .toArray();

    const views = await db.databaseViews
      .where('databaseId')
      .equals(databaseId)
      .toArray();

    const propsMap: Record<string, PropertyDefinition> = {};
    props.forEach((p) => { propsMap[p.id] = p; });

    const viewsMap: Record<string, DatabaseView> = {};
    views.forEach((v) => { viewsMap[v.id] = v; });

    // Load all page properties for pages in this database
    const pages = await db.pages.where('parentId').equals(databaseId).toArray();
    const pagePropsMap: Record<string, Record<string, PageProperty>> = {};

    for (const page of pages) {
      const pProps = await db.pageProperties.where('pageId').equals(page.id).toArray();
      pagePropsMap[page.id] = {};
      pProps.forEach((pp) => { pagePropsMap[page.id][pp.propertyId] = pp; });
    }

    // Create default table view if none exists
    if (views.length === 0) {
      const viewId = generateId();
      const defaultView: DatabaseView = {
        id: viewId,
        name: 'Table',
        type: 'table',
        databaseId,
        sortOrder: 0,
        config: {},
      };
      await db.databaseViews.add(defaultView);
      viewsMap[viewId] = defaultView;
    }

    const firstViewId = Object.keys(viewsMap)[0] ?? null;

    set({
      activeDatabaseId: databaseId,
      properties: propsMap,
      views: viewsMap,
      pageProperties: pagePropsMap,
      activeViewId: firstViewId,
    });
  },

  addProperty: async (name: string, type: PropertyType) => {
    const { activeDatabaseId, properties } = get();
    if (!activeDatabaseId) return '';

    const id = generateId();
    const prop: PropertyDefinition = {
      id,
      name,
      type,
      databaseId: activeDatabaseId,
      sortOrder: Object.keys(properties).length,
      config: {},
    };

    await db.propertyDefinitions.add(prop);
    set({ properties: { ...properties, [id]: prop } });
    return id;
  },

  updateProperty: async (id: string, updates: Partial<PropertyDefinition>) => {
    const { properties } = get();
    if (!properties[id]) return;

    const updated = { ...properties[id], ...updates };
    await db.propertyDefinitions.put(updated);
    set({ properties: { ...properties, [id]: updated } });
  },

  deleteProperty: async (id: string) => {
    const { properties } = get();
    await db.propertyDefinitions.delete(id);
    await db.pageProperties.where('propertyId').equals(id).delete();

    const updated = { ...properties };
    delete updated[id];
    set({ properties: updated });
  },

  addSelectOption: async (propertyId: string, option: SelectOption) => {
    const { properties } = get();
    const prop = properties[propertyId];
    if (!prop) return;

    const options = [...(prop.config.options || []), option];
    const updated = { ...prop, config: { ...prop.config, options } };
    await db.propertyDefinitions.put(updated);
    set({ properties: { ...properties, [propertyId]: updated } });
  },

  addView: async (name: string, type: DatabaseView['type']) => {
    const { activeDatabaseId, views } = get();
    if (!activeDatabaseId) return '';

    const id = generateId();
    const view: DatabaseView = {
      id,
      name,
      type,
      databaseId: activeDatabaseId,
      sortOrder: Object.keys(views).length,
      config: {},
    };

    await db.databaseViews.add(view);
    set({ views: { ...views, [id]: view }, activeViewId: id });
    return id;
  },

  updateView: async (id: string, updates: Partial<DatabaseView>) => {
    const { views } = get();
    if (!views[id]) return;

    const updated = { ...views[id], ...updates };
    await db.databaseViews.put(updated);
    set({ views: { ...views, [id]: updated } });
  },

  deleteView: async (id: string) => {
    const { views, activeViewId } = get();
    await db.databaseViews.delete(id);

    const updated = { ...views };
    delete updated[id];
    const newActiveId = activeViewId === id ? (Object.keys(updated)[0] ?? null) : activeViewId;
    set({ views: updated, activeViewId: newActiveId });
  },

  setActiveView: (id: string) => {
    set({ activeViewId: id });
  },

  setPageProperty: async (pageId: string, propertyId: string, value: PropertyValue) => {
    const { pageProperties } = get();
    const existing = pageProperties[pageId]?.[propertyId];

    const pp: PageProperty = {
      id: existing?.id ?? generateId(),
      pageId,
      propertyId,
      value,
    };

    await db.pageProperties.put(pp);

    const updatedPageProps = {
      ...pageProperties,
      [pageId]: { ...(pageProperties[pageId] ?? {}), [propertyId]: pp },
    };
    set({ pageProperties: updatedPageProps });
  },

  getPageProperty: (pageId: string, propertyId: string) => {
    const { pageProperties } = get();
    return pageProperties[pageId]?.[propertyId]?.value ?? null;
  },

  evaluateFormulaProperty: (pageId: string, propertyId: string) => {
    const { properties, pageProperties } = get();
    const prop = properties[propertyId];
    if (!prop || prop.type !== 'formula' || !prop.config.formula) return null;

    // Build context from page properties
    const context: Record<string, string | number | boolean | null> = {};
    for (const [pid, def] of Object.entries(properties)) {
      const val = pageProperties[pageId]?.[pid]?.value;
      if (val !== undefined) {
        context[def.name] = val as string | number | boolean | null;
      }
    }

    return evaluateFormula(prop.config.formula, context);
  },

  evaluateRollup: (pageId: string, propertyId: string) => {
    const { properties, pageProperties } = get();
    const prop = properties[propertyId];
    if (!prop || prop.type !== 'rollup' || !prop.config.rollupConfig) return null;

    const { relationPropertyId, targetPropertyId, aggregation } = prop.config.rollupConfig;
    const relatedPageIds = pageProperties[pageId]?.[relationPropertyId]?.value;
    if (!Array.isArray(relatedPageIds)) return null;

    const values: number[] = [];
    for (const rpid of relatedPageIds) {
      const val = pageProperties[rpid]?.[targetPropertyId]?.value;
      if (typeof val === 'number') values.push(val);
    }

    switch (aggregation) {
      case 'count': return values.length;
      case 'sum': return values.reduce((a, b) => a + b, 0);
      case 'average': return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      case 'min': return values.length > 0 ? Math.min(...values) : null;
      case 'max': return values.length > 0 ? Math.max(...values) : null;
      case 'show_original': return values;
      default: return null;
    }
  },

  getFilteredPages: (viewId: string, allPageIds: string[]) => {
    const { views, properties, pageProperties } = get();
    const view = views[viewId];
    if (!view?.config.filterBy || view.config.filterBy.length === 0) return allPageIds;

    return allPageIds.filter((pageId) => {
      return view.config.filterBy!.every((filter: FilterRule) => {
        const val = pageProperties[pageId]?.[filter.propertyId]?.value;
        const prop = properties[filter.propertyId];
        if (!prop) return true;

        switch (filter.operator) {
          case 'equals': return val === filter.value;
          case 'not_equals': return val !== filter.value;
          case 'contains': return String(val ?? '').includes(String(filter.value));
          case 'not_contains': return !String(val ?? '').includes(String(filter.value));
          case 'is_empty': return val == null || val === '';
          case 'is_not_empty': return val != null && val !== '';
          case 'gt': return Number(val) > Number(filter.value);
          case 'lt': return Number(val) < Number(filter.value);
          default: return true;
        }
      });
    });
  },

  getSortedPages: (viewId: string, pageIds: string[]) => {
    const { views, pageProperties } = get();
    const view = views[viewId];
    if (!view?.config.sortBy || view.config.sortBy.length === 0) return pageIds;

    return [...pageIds].sort((a, b) => {
      for (const sort of view.config.sortBy!) {
        const aVal = pageProperties[a]?.[sort.propertyId]?.value;
        const bVal = pageProperties[b]?.[sort.propertyId]?.value;

        let cmp = 0;
        if (aVal == null && bVal == null) cmp = 0;
        else if (aVal == null) cmp = -1;
        else if (bVal == null) cmp = 1;
        else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
        else cmp = String(aVal).localeCompare(String(bVal));

        if (cmp !== 0) return sort.direction === 'desc' ? -cmp : cmp;
      }
      return 0;
    });
  },

  getGroupedPages: (viewId: string, pageIds: string[]) => {
    const { views, pageProperties } = get();
    const view = views[viewId];
    if (!view?.config.groupBy) return { '': pageIds };

    const groups: Record<string, string[]> = {};
    for (const pageId of pageIds) {
      const val = pageProperties[pageId]?.[view.config.groupBy]?.value;
      const key = val != null ? String(val) : 'No Value';
      if (!groups[key]) groups[key] = [];
      groups[key].push(pageId);
    }
    return groups;
  },
}));
