import { useDatabaseStore } from '@/store/database-store';
import { useWorkspaceStore } from '@/store/workspace-store';

interface BoardViewProps {
  pageIds: string[];
}

export function BoardView({ pageIds }: BoardViewProps) {
  const activeViewId = useDatabaseStore((s) => s.activeViewId);
  const getGroupedPages = useDatabaseStore((s) => s.getGroupedPages);
  const getFilteredPages = useDatabaseStore((s) => s.getFilteredPages);
  const pages = useWorkspaceStore((s) => s.pages);
  const navigateTo = useWorkspaceStore((s) => s.navigateTo);
  const createPage = useWorkspaceStore((s) => s.createPage);
  const activeDatabaseId = useDatabaseStore((s) => s.activeDatabaseId);
  const properties = useDatabaseStore((s) => s.properties);
  const views = useDatabaseStore((s) => s.views);

  let displayIds = pageIds;
  if (activeViewId) {
    displayIds = getFilteredPages(activeViewId, displayIds);
  }

  const activeView = activeViewId ? views[activeViewId] : null;
  const groupBy = activeView?.config.groupBy;

  // If no groupBy is set, show a message
  if (!groupBy) {
    const selectProps = Object.values(properties).filter((p) => p.type === 'select');
    return (
      <div className="text-center py-8 text-notion-text-secondary text-sm">
        <p>Set a "Group by" property to use Board view.</p>
        {selectProps.length > 0 && (
          <p className="mt-2">Available: {selectProps.map((p) => p.name).join(', ')}</p>
        )}
      </div>
    );
  }

  const groups = getGroupedPages(activeViewId!, displayIds);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {Object.entries(groups).map(([groupName, groupPageIds]) => (
        <div
          key={groupName}
          className="flex-shrink-0 w-64 bg-notion-sidebar rounded-lg p-2"
        >
          {/* Column header */}
          <div className="flex items-center justify-between px-2 py-1.5 mb-2">
            <span className="text-sm font-medium text-notion-text">{groupName}</span>
            <span className="text-xs text-notion-text-secondary">{groupPageIds.length}</span>
          </div>

          {/* Cards */}
          <div className="space-y-2">
            {groupPageIds.map((pageId) => {
              const page = pages[pageId];
              if (!page) return null;
              return (
                <button
                  key={pageId}
                  onClick={() => navigateTo(pageId)}
                  className="w-full text-left bg-white border border-notion-border rounded p-3 hover:bg-notion-hover transition-colors shadow-sm"
                >
                  <div className="text-sm font-medium text-notion-text">
                    {page.icon && <span className="mr-1">{page.icon}</span>}
                    {page.title || 'Untitled'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Add card */}
          <button
            onClick={() => activeDatabaseId && createPage(activeDatabaseId)}
            className="w-full mt-2 px-2 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-hover rounded text-left"
          >
            + New
          </button>
        </div>
      ))}
    </div>
  );
}
