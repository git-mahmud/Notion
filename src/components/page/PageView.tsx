import { useEffect, useCallback } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import { PageHeader } from './PageHeader';
import { BlockEditor } from '../editor/BlockEditor';
import { registerShortcut } from '@/lib/keyboard';

interface PageViewProps {
  pageId: string;
}

export function PageView({ pageId }: PageViewProps) {
  const loadPage = useEditorStore((s) => s.loadPage);
  const savePage = useEditorStore((s) => s.savePage);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const isDirty = useEditorStore((s) => s.isDirty);
  const page = useWorkspaceStore((s) => s.pages[pageId]);

  useEffect(() => {
    loadPage(pageId);
  }, [pageId, loadPage]);

  // Auto-save on dirty
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => { savePage(); }, 1000);
    return () => clearTimeout(timer);
  }, [isDirty, savePage]);

  // Undo/Redo shortcuts
  useEffect(() => {
    const unregUndo = registerShortcut({
      key: 'z',
      ctrl: true,
      handler: () => undo(),
      description: 'Undo',
    });
    const unregRedo = registerShortcut({
      key: 'z',
      ctrl: true,
      shift: true,
      handler: () => redo(),
      description: 'Redo',
    });
    return () => { unregUndo(); unregRedo(); };
  }, [undo, redo]);

  const handleSaveSnapshot = useCallback(async () => {
    const { createSnapshot } = useEditorStore.getState();
    await createSnapshot();
  }, []);

  if (!page) return null;

  return (
    <div className="max-w-[900px] mx-auto px-16 py-8">
      <PageHeader pageId={pageId} />
      <BlockEditor pageId={pageId} />

      {/* Save indicator */}
      <div className="fixed bottom-4 right-4 text-xs text-notion-text-secondary opacity-60">
        {isDirty ? 'Saving...' : 'Saved'}
      </div>
    </div>
  );
}
