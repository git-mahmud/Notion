import { useBlockEditing } from '../useBlockEditing';
import { useEditorStore } from '@/store/editor-store';

interface TodoBlockProps {
  blockId: string;
}

export function TodoBlock({ blockId }: TodoBlockProps) {
  const { ref, handleInput, handleKeyDown, handleFocus, handlePaste } = useBlockEditing(blockId);
  const block = useEditorStore((s) => s.blocks[blockId]);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);

  const checked = block?.content.checked || false;

  return (
    <div className="flex items-start gap-2 py-1">
      <button
        onClick={() => updateBlockContent(blockId, { checked: !checked })}
        className={`mt-0.5 w-4 h-4 flex-shrink-0 border rounded transition-colors ${
          checked
            ? 'bg-notion-accent border-notion-accent'
            : 'border-gray-400 hover:border-notion-accent'
        }`}
      >
        {checked && (
          <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-block-id={blockId}
        data-placeholder="To-do"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onPaste={handlePaste}
        className={`flex-1 outline-none text-base leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none ${
          checked ? 'line-through text-notion-text-secondary' : 'text-notion-text'
        }`}
      />
    </div>
  );
}
