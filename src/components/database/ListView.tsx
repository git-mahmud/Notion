import { useDatabaseStore } from '@/store/database-store';
import { useWorkspaceStore } from '@/store/workspace-store';

interface ListViewProps {
  pageIds: string[];
}

export function ListView({ pageIds }: ListViewProps) {
  const activeViewId = useDatabaseStore((s) => s.activeViewId);
  const getFilteredPages = useDatabaseStore((s) => s.getFilteredPages);
  const getSortedPages = useDatabaseStore((s) => s.getSortedPages);
  const pages = useWorkspaceStore((s) => s.pages);
  const navigateTo = useWorkspaceStore((s) => s.navigateTo);
  const createPage = useWorkspaceStore((s) => s.createPage);
  const activeDatabaseId = useDatabaseStore((s) => s.activeDatabaseId);

  let displayIds = pageIds;
  if (activeViewId) {
    displayIds = getFilteredPages(activeViewId, displayIds);
    displayIds = getSortedPages(activeViewId, displayIds);
  }

  return (
    <div className="space-y-0.5">
      {displayIds.map((pageId) => {
        const page = pages[pageId];
        if (!page) return null;
        return (
          <button
            key={pageId}
            onClick={() => navigateTo(pageId)}
            className="w-full text-left px-3 py-2 hover:bg-notion-hover rounded flex items-center gap-2 transition-colors"
          >
            <span className="text-sm">{page.icon || '📄'}</span>
            <span className="text-sm text-notion-text font-medium">{page.title || 'Untitled'}</span>
          </button>
        );
      })}

      <button
        onClick={() => activeDatabaseId && createPage(activeDatabaseId)}
        className="w-full text-left px-3 py-2 text-sm text-notion-text-secondary hover:bg-notion-hover rounded transition-colors"
      >
        + New page
      </button>
    </div>
  );
}
