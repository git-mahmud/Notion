import { useState } from 'react';
import { useDatabaseStore } from '@/store/database-store';
import type { FilterRule } from '@/types';

export function FilterBar() {
  const properties = useDatabaseStore((s) => s.properties);
  const views = useDatabaseStore((s) => s.views);
  const activeViewId = useDatabaseStore((s) => s.activeViewId);
  const updateView = useDatabaseStore((s) => s.updateView);
  const [showFilterAdd, setShowFilterAdd] = useState(false);

  const activeView = activeViewId ? views[activeViewId] : null;
  const filters = activeView?.config.filterBy ?? [];
  const sorts = activeView?.config.sortBy ?? [];

  const addFilter = (propertyId: string) => {
    if (!activeViewId || !activeView) return;
    const newFilter: FilterRule = {
      propertyId,
      operator: 'is_not_empty',
      value: null,
    };
    updateView(activeViewId, {
      config: { ...activeView.config, filterBy: [...filters, newFilter] },
    });
    setShowFilterAdd(false);
  };

  const removeFilter = (index: number) => {
    if (!activeViewId || !activeView) return;
    const newFilters = filters.filter((_, i) => i !== index);
    updateView(activeViewId, {
      config: { ...activeView.config, filterBy: newFilters },
    });
  };

  const addSort = (propertyId: string) => {
    if (!activeViewId || !activeView) return;
    updateView(activeViewId, {
      config: {
        ...activeView.config,
        sortBy: [...sorts, { propertyId, direction: 'asc' as const }],
      },
    });
  };

  return (
    <div className="flex items-center gap-2 py-2 text-sm">
      {/* Active filters */}
      {filters.map((filter, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
        >
          {properties[filter.propertyId]?.name} {filter.operator}
          <button onClick={() => removeFilter(idx)} className="ml-1 hover:text-red-600">×</button>
        </span>
      ))}

      {/* Filter button */}
      <div className="relative">
        <button
          onClick={() => setShowFilterAdd(!showFilterAdd)}
          className="px-2 py-1 text-notion-text-secondary hover:bg-notion-hover rounded transition-colors"
        >
          Filter
        </button>
        {showFilterAdd && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-notion-border rounded shadow-lg z-50 py-1 min-w-[150px]">
            {Object.values(properties).map((prop) => (
              <button
                key={prop.id}
                onClick={() => addFilter(prop.id)}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover"
              >
                {prop.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sort button */}
      <div className="relative group">
        <button className="px-2 py-1 text-notion-text-secondary hover:bg-notion-hover rounded transition-colors">
          Sort
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white border border-notion-border rounded shadow-lg z-50 py-1 hidden group-hover:block min-w-[150px]">
          {Object.values(properties).map((prop) => (
            <button
              key={prop.id}
              onClick={() => addSort(prop.id)}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover"
            >
              {prop.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
