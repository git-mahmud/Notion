import { useBlockEditing } from '../useBlockEditing';

interface QuoteBlockProps {
  blockId: string;
}

export function QuoteBlock({ blockId }: QuoteBlockProps) {
  const { ref, handleInput, handleKeyDown, handleFocus, handlePaste } = useBlockEditing(blockId);

  return (
    <div className="border-l-[3px] border-notion-text pl-4 py-1">
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-block-id={blockId}
        data-placeholder="Quote"
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onPaste={handlePaste}
        className="outline-none text-base text-notion-text leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
      />
    </div>
  );
}
