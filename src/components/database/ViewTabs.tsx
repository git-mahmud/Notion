import { useDatabaseStore } from '@/store/database-store';

export function ViewTabs() {
  const views = useDatabaseStore((s) => s.views);
  const activeViewId = useDatabaseStore((s) => s.activeViewId);
  const setActiveView = useDatabaseStore((s) => s.setActiveView);
  const addView = useDatabaseStore((s) => s.addView);

  const viewList = Object.values(views).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="flex items-center gap-1 border-b border-notion-border pb-2">
      {viewList.map((view) => (
        <button
          key={view.id}
          onClick={() => setActiveView(view.id)}
          className={`px-3 py-1 text-sm rounded transition-colors ${
            view.id === activeViewId
              ? 'bg-notion-hover font-medium text-notion-text'
              : 'text-notion-text-secondary hover:bg-notion-hover'
          }`}
        >
          {view.type === 'table' && '📊'}
          {view.type === 'board' && '📋'}
          {view.type === 'list' && '📃'}
          {' '}{view.name}
        </button>
      ))}

      {/* Add view */}
      <div className="relative group">
        <button className="px-2 py-1 text-sm text-notion-text-secondary hover:bg-notion-hover rounded">
          +
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white border border-notion-border rounded shadow-lg z-50 py-1 hidden group-hover:block min-w-[120px]">
          <button
            onClick={() => addView('Table', 'table')}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover"
          >
            📊 Table
          </button>
          <button
            onClick={() => addView('Board', 'board')}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover"
          >
            📋 Board
          </button>
          <button
            onClick={() => addView('List', 'list')}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover"
          >
            📃 List
          </button>
        </div>
      </div>
    </div>
  );
}
