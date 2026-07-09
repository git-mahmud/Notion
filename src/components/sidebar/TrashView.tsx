import { useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';

interface TrashViewProps {
  onClose: () => void;
}

export function TrashView({ onClose }: TrashViewProps) {
  const trashedPages = useWorkspaceStore((s) => s.trashedPages);
  const loadTrash = useWorkspaceStore((s) => s.loadTrash);
  const restorePage = useWorkspaceStore((s) => s.restorePage);
  const permanentDelete = useWorkspaceStore((s) => s.permanentDelete);
  const emptyTrash = useWorkspaceStore((s) => s.emptyTrash);

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-white dark:bg-[#252525] rounded-lg shadow-xl border border-[#e3e3e0] dark:border-[#3f3f3f] w-[400px] max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-[#e3e3e0] dark:border-[#3f3f3f] flex items-center justify-between">
          <h3 className="text-sm font-semibold">Trash</h3>
          <div className="flex gap-2">
            {trashedPages.length > 0 && (
              <button
                onClick={emptyTrash}
                className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Empty trash
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {trashedPages.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">Trash is empty</div>
          ) : (
            trashedPages.map((page) => (
              <div key={page.id} className="flex items-center justify-between px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm">{page.icon || '📄'}</span>
                  <span className="text-sm truncate">{page.title}</span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => restorePage(page.id)}
                    className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => permanentDelete(page.id)}
                    className="text-xs px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
