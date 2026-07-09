import { useBlockEditing } from '../useBlockEditing';
import { useEditorStore } from '@/store/editor-store';

interface NumberedBlockProps {
  blockId: string;
}

export function NumberedBlock({ blockId }: NumberedBlockProps) {
  const { ref, handleInput, handleKeyDown, handleFocus, handlePaste } = useBlockEditing(blockId);
  const block = useEditorStore((s) => s.blocks[blockId]);
  const blocks = useEditorStore((s) => s.blocks);
  const rootBlockIds = useEditorStore((s) => s.rootBlockIds);

  // Calculate number based on position among siblings
  const siblings = block?.parentId
    ? (blocks[block.parentId]?.childrenIds ?? [])
    : rootBlockIds;

  let number = 1;
  for (const sibId of siblings) {
    if (sibId === blockId) break;
    if (blocks[sibId]?.type === 'numbered') number++;
  }

  return (
    <div className="flex items-start gap-2 py-1">
      <span className="text-base text-notion-text flex-shrink-0 min-w-[1.5em] text-right">
        {number}.
      </span>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-block-id={blockId}
        data-placeholder="List item"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onPaste={handlePaste}
        className="flex-1 outline-none text-base text-notion-text leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
      />
    </div>
  );
}
