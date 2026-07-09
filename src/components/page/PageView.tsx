import { useEffect } from 'react';
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

  // Auto-save
  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => { savePage(); }, 800);
    return () => clearTimeout(timer);
  }, [isDirty, savePage]);

  // Undo/Redo
  useEffect(() => {
    const unregUndo = registerShortcut({ key: 'z', ctrl: true, handler: () => undo(), description: 'Undo' });
    const unregRedo = registerShortcut({ key: 'z', ctrl: true, shift: true, handler: () => redo(), description: 'Redo' });
    return () => { unregUndo(); unregRedo(); };
  }, [undo, redo]);

  if (!page) return null;

  const maxWidth = page.isFullWidth ? 'max-w-full px-24' : 'max-w-[900px] px-16';

  return (
    <div className={`mx-auto py-4 ${maxWidth} ${page.isSmallText ? 'text-sm' : 'text-base'}`}>
      <PageHeader pageId={pageId} />
      
      {page.isLocked ? (
        <div className="opacity-80 pointer-events-none">
          <BlockEditor pageId={pageId} />
        </div>
      ) : (
        <BlockEditor pageId={pageId} />
      )}
    </div>
  );
}
