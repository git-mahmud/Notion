import { useWorkspaceStore } from '@/store/workspace-store';

export function Breadcrumbs() {
  const breadcrumbs = useWorkspaceStore((s) => s.breadcrumbs);
  const pages = useWorkspaceStore((s) => s.pages);
  const navigateTo = useWorkspaceStore((s) => s.navigateTo);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center text-sm text-notion-text-secondary overflow-hidden">
      {breadcrumbs.map((pageId, idx) => {
        const page = pages[pageId];
        if (!page) return null;

        const isLast = idx === breadcrumbs.length - 1;

        return (
          <span key={pageId} className="flex items-center min-w-0">
            {idx > 0 && (
              <span className="mx-1 text-gray-400 flex-shrink-0">/</span>
            )}
            <button
              onClick={() => navigateTo(pageId)}
              className={`truncate max-w-[150px] hover:text-notion-text transition-colors ${
                isLast ? 'text-notion-text font-medium' : ''
              }`}
            >
              {page.icon && <span className="mr-1">{page.icon}</span>}
              {page.title || 'Untitled'}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
