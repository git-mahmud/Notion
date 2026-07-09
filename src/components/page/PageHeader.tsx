import { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';
import { EMOJI_LIST, COVER_IMAGES } from '@/lib/constants';

interface PageHeaderProps {
  pageId: string;
}

export function PageHeader({ pageId }: PageHeaderProps) {
  const page = useWorkspaceStore((s) => s.pages[pageId]);
  const renamePage = useWorkspaceStore((s) => s.renamePage);
  const setPageIcon = useWorkspaceStore((s) => s.setPageIcon);
  const setCoverImage = useWorkspaceStore((s) => s.setCoverImage);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showIconHint, setShowIconHint] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (titleRef.current && page) {
      if (titleRef.current.textContent !== page.title) {
        titleRef.current.textContent = page.title === 'Untitled' ? '' : page.title;
      }
    }
  }, [pageId]);

  if (!page) return null;

  const handleTitleInput = () => {
    const text = titleRef.current?.textContent || '';
    renamePage(pageId, text || 'Untitled');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const firstBlock = document.querySelector('[data-block-id]') as HTMLElement;
      firstBlock?.focus();
    }
  };

  return (
    <div className="mb-6">
      {/* Cover Image */}
      {page.coverImage && (
        <div className="relative -mx-16 -mt-8 mb-6 group">
          <img
            src={page.coverImage}
            alt="Cover"
            className="w-full h-[200px] object-cover"
          />
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={() => setShowCoverPicker(true)}
              className="px-2 py-1 text-xs bg-white/90 dark:bg-black/70 rounded shadow text-gray-700 dark:text-gray-200"
            >
              Change cover
            </button>
            <button
              onClick={() => setCoverImage(pageId, undefined)}
              className="px-2 py-1 text-xs bg-white/90 dark:bg-black/70 rounded shadow text-gray-700 dark:text-gray-200"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Icon + Add buttons */}
      <div
        className="relative group/header"
        onMouseEnter={() => setShowIconHint(true)}
        onMouseLeave={() => setShowIconHint(false)}
      >
        {/* Floating buttons */}
        {showIconHint && !page.icon && !page.coverImage && (
          <div className="flex gap-1 mb-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
            <button
              onClick={() => { setPageIcon(pageId, '📄'); }}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              🙂 Add icon
            </button>
            <button
              onClick={() => setShowCoverPicker(true)}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              🖼️ Add cover
            </button>
          </div>
        )}

        {/* Icon */}
        {page.icon && (
          <div className="relative mb-2">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-6xl hover:bg-black/5 dark:hover:bg-white/5 rounded-lg p-1 transition-colors"
            >
              {page.icon}
            </button>

            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-[#2f2f2f] border border-[#e3e3e0] dark:border-[#3f3f3f] rounded-lg shadow-xl p-3 z-50 w-80">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-500">Choose icon</span>
                  <button
                    onClick={() => { setPageIcon(pageId, ''); setShowEmojiPicker(false); }}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => { setPageIcon(pageId, emoji); setShowEmojiPicker(false); }}
                      className="text-xl p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
        className={`font-bold outline-none break-words empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 dark:empty:before:text-gray-600 ${
          page.isSmallText ? 'text-2xl' : 'text-[40px] leading-[1.2]'
        }`}
      />

      {/* Cover picker */}
      {showCoverPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20" onClick={() => setShowCoverPicker(false)}>
          <div className="bg-white dark:bg-[#2f2f2f] rounded-lg shadow-xl p-4 w-[500px] max-h-[400px] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold mb-3">Choose cover</h3>
            <div className="grid grid-cols-3 gap-2">
              {COVER_IMAGES.map((url) => (
                <button
                  key={url}
                  onClick={() => { setCoverImage(pageId, url); setShowCoverPicker(false); }}
                  className="rounded overflow-hidden border border-gray-200 dark:border-gray-700 hover:ring-2 hover:ring-blue-500"
                >
                  <img src={url} alt="" className="w-full h-16 object-cover" />
                </button>
              ))}
            </div>
            <div className="mt-3">
              <input
                type="url"
                placeholder="Or paste an image URL..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const url = (e.target as HTMLInputElement).value;
                    if (url) { setCoverImage(pageId, url); setShowCoverPicker(false); }
                  }
                }}
                className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded px-3 py-2 outline-none bg-transparent"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
