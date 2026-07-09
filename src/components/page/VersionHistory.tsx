import { useState, useEffect } from 'react';
import { db } from '@/lib/local-db';
import { useEditorStore } from '@/store/editor-store';
import type { Snapshot } from '@/types';

interface VersionHistoryProps {
  pageId: string;
  onClose: () => void;
}

export function VersionHistory({ pageId, onClose }: VersionHistoryProps) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const loadPage = useEditorStore((s) => s.loadPage);

  useEffect(() => {
    db.snapshots
      .where('pageId')
      .equals(pageId)
      .reverse()
      .sortBy('createdAt')
      .then(setSnapshots);
  }, [pageId]);

  const handleRestore = async (snapshot: Snapshot) => {
    // Delete current blocks and replace with snapshot
    await db.blocks.where('pageId').equals(pageId).delete();
    if (snapshot.blocks.length > 0) {
      await db.blocks.bulkAdd(snapshot.blocks);
    }
    await loadPage(pageId);
    onClose();
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl border border-notion-border w-96 max-h-[70vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b border-notion-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-notion-text">Version History</h3>
          <button onClick={onClose} className="text-notion-text-secondary hover:text-notion-text">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {snapshots.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-notion-text-secondary">
              No snapshots yet. Snapshots are created automatically before major changes.
            </div>
          ) : (
            <div className="divide-y divide-notion-border">
              {snapshots.map((snapshot) => (
                <div key={snapshot.id} className="px-4 py-3 hover:bg-notion-hover transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-notion-text">
                        {snapshot.label || formatDate(snapshot.createdAt)}
                      </div>
                      <div className="text-xs text-notion-text-secondary mt-0.5">
                        {snapshot.blocks.length} blocks
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestore(snapshot)}
                      className="px-2 py-1 text-xs bg-notion-accent text-white rounded hover:bg-notion-accent-hover transition-colors"
                    >
                      Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
