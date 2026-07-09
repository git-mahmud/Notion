import { useEditorStore } from '@/store/editor-store';

export function TableOfContentsBlock() {
  const blocks = useEditorStore((s) => s.blocks);
  const rootBlockIds = useEditorStore((s) => s.rootBlockIds);

  // Collect all heading blocks
  const headings: { id: string; text: string; level: number }[] = [];
  const traverse = (ids: string[]) => {
    for (const id of ids) {
      const block = blocks[id];
      if (!block) continue;
      if (block.type === 'heading1' || block.type === 'heading2' || block.type === 'heading3') {
        const level = block.type === 'heading1' ? 1 : block.type === 'heading2' ? 2 : 3;
        headings.push({ id, text: block.content.text || 'Untitled', level });
      }
      if (block.childrenIds.length > 0) traverse(block.childrenIds);
    }
  };
  traverse(rootBlockIds);

  if (headings.length === 0) {
    return (
      <div className="py-3 text-sm text-gray-400 italic">
        No headings found. Add headings to generate a table of contents.
      </div>
    );
  }

  return (
    <div className="py-3 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
      <div className="text-xs font-medium text-gray-500 uppercase mb-2">Table of Contents</div>
      {headings.map((h) => (
        <button
          key={h.id}
          onClick={() => {
            const el = document.querySelector(`[data-block-id="${h.id}"]`);
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }}
          className="block text-sm text-blue-600 dark:text-blue-400 hover:underline py-0.5"
          style={{ paddingLeft: (h.level - 1) * 16 }}
        >
          {h.text}
        </button>
      ))}
    </div>
  );
}
