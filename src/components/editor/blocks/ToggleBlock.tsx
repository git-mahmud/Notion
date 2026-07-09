import { useBlockEditing } from '../useBlockEditing';
import { useEditorStore } from '@/store/editor-store';
import { BlockWrapper } from '../BlockWrapper';

interface ToggleBlockProps {
  blockId: string;
}

export function ToggleBlock({ blockId }: ToggleBlockProps) {
  const { ref, handleInput, handleKeyDown, handleFocus, handlePaste } = useBlockEditing(blockId);
  const block = useEditorStore((s) => s.blocks[blockId]);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);

  const expanded = block?.content.expanded ?? false;

  return (
    <div className="py-0.5">
      <div className="flex items-start gap-1">
        <button
          onClick={() => updateBlockContent(blockId, { expanded: !expanded })}
          className="mt-1 w-5 h-5 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 flex-shrink-0"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          data-block-id={blockId}
          data-placeholder="Toggle heading"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onPaste={handlePaste}
          className="flex-1 outline-none text-base leading-relaxed py-0.5 empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
        />
      </div>
      {expanded && block?.childrenIds && block.childrenIds.length > 0 && (
        <div className="ml-6 mt-1">
          {block.childrenIds.map((childId) => (
            <BlockWrapper key={childId} blockId={childId} depth={0} />
          ))}
        </div>
      )}
      {expanded && (!block?.childrenIds || block.childrenIds.length === 0) && (
        <div className="ml-6 py-1 text-sm text-gray-400 italic">
          Empty toggle. Click to add content.
        </div>
      )}
    </div>
  );
}
