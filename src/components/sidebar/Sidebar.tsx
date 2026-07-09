import { useWorkspaceStore } from '@/store/workspace-store';
import { PageTree } from './PageTree';
import { SearchBar } from './SearchBar';

export function Sidebar() {
  const workspaceName = useWorkspaceStore((s) => s.workspaceName);
  const createPage = useWorkspaceStore((s) => s.createPage);

  return (
    <div className="h-full flex flex-col bg-notion-sidebar border-r border-notion-border">
      {/* Workspace Header */}
      <div className="px-3 py-3 flex items-center gap-2 border-b border-notion-border">
        <span className="text-lg">📝</span>
        <span className="text-sm font-semibold text-notion-text truncate">{workspaceName}</span>
      </div>

      {/* Search */}
      <div className="px-2 pt-2">
        <SearchBar />
      </div>

      {/* Page Tree */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-1 py-2">
        <PageTree />
      </div>

      {/* New Page Button */}
      <div className="px-2 py-2 border-t border-notion-border">
        <button
          onClick={() => createPage()}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-hover rounded transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          <span>New page</span>
        </button>
      </div>
    </div>
  );
}
