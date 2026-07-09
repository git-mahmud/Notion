import { useBlockEditing } from '../useBlockEditing';

interface HeadingBlockProps {
  blockId: string;
  level: 1 | 2 | 3;
}

const headingStyles = {
  1: 'text-3xl font-bold mt-6 mb-1',
  2: 'text-2xl font-semibold mt-5 mb-1',
  3: 'text-xl font-semibold mt-4 mb-1',
};

const placeholders = {
  1: 'Heading 1',
  2: 'Heading 2',
  3: 'Heading 3',
};

export function HeadingBlock({ blockId, level }: HeadingBlockProps) {
  const { ref, handleInput, handleKeyDown, handleFocus, handlePaste } = useBlockEditing(blockId);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      data-block-id={blockId}
      data-placeholder={placeholders[level]}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onPaste={handlePaste}
      className={`py-1 px-1 outline-none text-notion-text leading-tight empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none ${headingStyles[level]}`}
    />
  );
}
