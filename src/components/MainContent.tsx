import { useWorkspaceStore } from '@/store/workspace-store';
import { Breadcrumbs } from './page/Breadcrumbs';
import { PageView } from './page/PageView';

export function MainContent() {
  const activePageId = useWorkspaceStore((s) => s.activePageId);
  const sidebarCollapsed = useWorkspaceStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);

  if (!activePageId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-notion-text-secondary">
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="absolute top-3 left-3 p-1.5 rounded hover:bg-notion-hover"
            title="Show sidebar (Ctrl+\\)"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="text-4xl mb-4">📝</div>
        <p className="text-lg">Select or create a page to get started</p>
        <p className="text-sm mt-2 opacity-60">Ctrl+N to create a new page</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center h-11 px-3 border-b border-notion-border flex-shrink-0">
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded hover:bg-notion-hover mr-2"
            title="Show sidebar (Ctrl+\\)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <Breadcrumbs />
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto">
        <PageView pageId={activePageId} />
      </div>
    </div>
  );
}
