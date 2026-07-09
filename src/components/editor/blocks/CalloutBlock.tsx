import { useState } from 'react';
import { useBlockEditing } from '../useBlockEditing';
import { useEditorStore } from '@/store/editor-store';
import { BG_COLORS, EMOJI_LIST } from '@/lib/constants';

interface CalloutBlockProps {
  blockId: string;
}

export function CalloutBlock({ blockId }: CalloutBlockProps) {
  const { ref, handleInput, handleKeyDown, handleFocus, handlePaste } = useBlockEditing(blockId);
  const block = useEditorStore((s) => s.blocks[blockId]);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const emoji = block?.content.emoji || '💡';
  const bgColor = block?.content.bgColor || 'gray_bg';
  const bgClass = BG_COLORS.find((c) => c.value === bgColor)?.class || 'bg-gray-100 dark:bg-gray-800';

  return (
    <div className={`callout-block ${bgClass} rounded my-1 relative`}>
      {/* Emoji picker */}
      <button
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className="text-xl mt-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded p-0.5 flex-shrink-0"
      >
        {emoji}
      </button>

      {showEmojiPicker && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#2f2f2f] border border-[#e3e3e0] dark:border-[#3f3f3f] rounded-lg shadow-lg p-2 z-50 grid grid-cols-8 gap-1 w-64">
          {EMOJI_LIST.slice(0, 40).map((e) => (
            <button
              key={e}
              onClick={() => { updateBlockContent(blockId, { emoji: e }); setShowEmojiPicker(false); }}
              className="text-lg p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-block-id={blockId}
        data-placeholder="Type something..."
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onPaste={handlePaste}
        className="flex-1 outline-none text-base leading-relaxed empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
      />
    </div>
  );
}
