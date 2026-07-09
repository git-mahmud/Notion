import { useWorkspaceStore } from '@/store/workspace-store';
import { PageTreeItem } from './PageTreeItem';

export function PageTree() {
  const rootPageIds = useWorkspaceStore((s) => s.rootPageIds);

  if (rootPageIds.length === 0) {
    return (
      <div className="px-3 py-4 text-sm text-notion-text-secondary text-center">
        No pages yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {rootPageIds.map((pageId) => (
        <PageTreeItem key={pageId} pageId={pageId} depth={0} />
      ))}
    </div>
  );
}
