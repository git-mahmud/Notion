import { useBlockEditing } from '../useBlockEditing';

interface BulletBlockProps {
  blockId: string;
}

export function BulletBlock({ blockId }: BulletBlockProps) {
  const { ref, handleInput, handleKeyDown, handleFocus, handlePaste } = useBlockEditing(blockId);

  return (
    <div className="flex items-start gap-2 py-1">
      <span className="mt-2 w-1.5 h-1.5 rounded-full bg-notion-text flex-shrink-0" />
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
