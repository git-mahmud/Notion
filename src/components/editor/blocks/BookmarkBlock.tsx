import { useState } from 'react';
import { useEditorStore } from '@/store/editor-store';

interface BookmarkBlockProps {
  blockId: string;
}

export function BookmarkBlock({ blockId }: BookmarkBlockProps) {
  const block = useEditorStore((s) => s.blocks[blockId]);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const [inputUrl, setInputUrl] = useState('');

  const url = block?.content.url;
  const title = block?.content.title;
  const description = block?.content.description;

  if (!url) {
    return (
      <div className="py-2" data-block-id={blockId}>
        <div className="border border-[#e3e3e0] dark:border-[#3f3f3f] rounded p-4">
          <div className="flex gap-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputUrl) {
                  updateBlockContent(blockId, {
                    url: inputUrl,
                    title: new URL(inputUrl).hostname,
                    description: inputUrl,
                  });
                }
              }}
              placeholder="Paste a link..."
              className="flex-1 text-sm outline-none bg-transparent border border-[#e3e3e0] dark:border-[#3f3f3f] rounded px-3 py-1.5"
            />
            <button
              onClick={() => {
                if (inputUrl) {
                  updateBlockContent(blockId, {
                    url: inputUrl,
                    title: new URL(inputUrl).hostname,
                    description: inputUrl,
                  });
                }
              }}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Embed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2" data-block-id={blockId}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="bookmark-card block no-underline text-inherit"
      >
        <div className="flex-1 p-3 min-w-0">
          <div className="text-sm font-medium truncate">{title || url}</div>
          {description && <div className="text-xs text-gray-500 mt-1 truncate">{description}</div>}
          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <span>🔗</span>
            <span className="truncate">{url}</span>
          </div>
        </div>
      </a>
    </div>
  );
}
