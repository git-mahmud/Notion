import { useEditorStore } from '@/store/editor-store';
import { BlockWrapper } from '../BlockWrapper';

interface ColumnsBlockProps {
  blockId: string;
}

export function ColumnsBlock({ blockId }: ColumnsBlockProps) {
  const block = useEditorStore((s) => s.blocks[blockId]);
  const addBlock = useEditorStore((s) => s.addBlock);

  const columnCount = block?.content.columnCount || 2;
  const children = block?.childrenIds || [];

  // Ensure we have enough column children
  while (children.length < columnCount) {
    // We'll create placeholder columns if needed
  }

  return (
    <div className="columns-container py-2" data-block-id={blockId}>
      {children.length > 0 ? (
        children.map((childId) => (
          <div key={childId} className="column min-h-[40px] border border-dashed border-transparent hover:border-gray-200 dark:hover:border-gray-700 rounded p-1">
            <BlockWrapper blockId={childId} depth={0} />
          </div>
        ))
      ) : (
        Array.from({ length: columnCount }).map((_, i) => (
          <div
            key={i}
            className="column min-h-[60px] border border-dashed border-gray-200 dark:border-gray-700 rounded p-3 flex items-center justify-center"
          >
            <button
              onClick={() => addBlock('text', null, blockId)}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              + Add content
            </button>
          </div>
        ))
      )}
    </div>
  );
}
