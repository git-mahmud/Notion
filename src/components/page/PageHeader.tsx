import { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';

interface PageHeaderProps {
  pageId: string;
}

const EMOJI_LIST = [
  '📄', '📝', '📋', '📁', '🗃️', '💡', '⭐', '🎯', '🚀', '💻',
  '📊', '📈', '🎨', '🔧', '⚡', '🌟', '📌', '🔖', '💼', '🎓',
  '🏠', '🌍', '❤️', '🔥', '✅', '📚', '🎬', '🎵', '🎮', '🏆',
  '🍕', '☕', '🌱', '🦋', '🌈', '🎉', '💎', '🔑', '🎁', '📷',
];

export function PageHeader({ pageId }: PageHeaderProps) {
  const page = useWorkspaceStore((s) => s.pages[pageId]);
  const renamePage = useWorkspaceStore((s) => s.renamePage);
  const setPageIcon = useWorkspaceStore((s) => s.setPageIcon);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current && page) {
      titleRef.current.textContent = page.title || '';
    }
  }, [pageId]); // Only update when page changes, not on every keystroke

  if (!page) return null;

  const handleTitleInput = () => {
    const text = titleRef.current?.textContent || '';
    renamePage(pageId, text || 'Untitled');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus first block
      const firstBlock = document.querySelector('[data-block-id]') as HTMLElement;
      firstBlock?.focus();
    }
  };

  return (
    <div className="mb-4">
      {/* Icon */}
      <div className="relative mb-2">
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-5xl hover:bg-notion-hover rounded p-1 transition-colors"
          title="Change icon"
        >
          {page.icon || '📄'}
        </button>

        {showEmojiPicker && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-notion-border rounded-lg shadow-lg p-3 z-50 grid grid-cols-8 gap-1 w-72">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                onClick={() => { setPageIcon(pageId, emoji); setShowEmojiPicker(false); }}
                className="text-2xl p-1 rounded hover:bg-notion-hover transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <div
        ref={titleRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleTitleInput}
        onKeyDown={handleTitleKeyDown}
        data-placeholder="Untitled"
        className="text-page-title text-notion-text outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 break-words"
      />
    </div>
  );
}
