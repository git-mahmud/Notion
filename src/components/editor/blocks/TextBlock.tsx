import { useBlockEditing } from '../useBlockEditing';

interface TextBlockProps {
  blockId: string;
}

export function TextBlock({ blockId }: TextBlockProps) {
  const { ref, handleInput, handleKeyDown, handleFocus, handlePaste } = useBlockEditing(blockId);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-block-id={blockId}
      data-placeholder="Type '/' for commands..."
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onPaste={handlePaste}
      className="py-1 px-1 outline-none text-base text-notion-text leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
    />
  );
}
