import { useState } from 'react';
import { useEditorStore } from '@/store/editor-store';

interface EquationBlockProps {
  blockId: string;
}

export function EquationBlock({ blockId }: EquationBlockProps) {
  const block = useEditorStore((s) => s.blocks[blockId]);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const [isEditing, setIsEditing] = useState(false);

  const latex = block?.content.latex || '';

  if (isEditing || !latex) {
    return (
      <div className="py-2" data-block-id={blockId}>
        <div className="border border-[#e3e3e0] dark:border-[#3f3f3f] rounded p-3">
          <div className="text-xs text-gray-500 mb-1">LaTeX equation</div>
          <input
            autoFocus
            type="text"
            value={latex}
            onChange={(e) => updateBlockContent(blockId, { latex: e.target.value })}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing(false); }}
            placeholder="E = mc^2"
            className="w-full text-base font-mono outline-none bg-transparent"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="py-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded"
      onClick={() => setIsEditing(true)}
      data-block-id={blockId}
    >
      <span className="text-lg font-serif italic">{latex}</span>
    </div>
  );
}
