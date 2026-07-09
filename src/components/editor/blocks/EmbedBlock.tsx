import { useState } from 'react';
import { useEditorStore } from '@/store/editor-store';

interface EmbedBlockProps {
  blockId: string;
}

export function EmbedBlock({ blockId }: EmbedBlockProps) {
  const block = useEditorStore((s) => s.blocks[blockId]);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const [inputUrl, setInputUrl] = useState('');

  const url = block?.content.url;

  // Convert YouTube URLs to embed format
  const getEmbedUrl = (rawUrl: string) => {
    if (rawUrl.includes('youtube.com/watch')) {
      const videoId = new URL(rawUrl).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (rawUrl.includes('youtu.be/')) {
      const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (rawUrl.includes('figma.com')) {
      return `https://www.figma.com/embed?embed_host=notion&url=${encodeURIComponent(rawUrl)}`;
    }
    return rawUrl;
  };

  if (!url) {
    return (
      <div className="py-2" data-block-id={blockId}>
        <div className="border border-dashed border-[#e3e3e0] dark:border-[#3f3f3f] rounded-lg p-6 flex flex-col items-center gap-3">
          <span className="text-2xl">🌐</span>
          <div className="flex gap-2 w-full max-w-md">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputUrl) {
                  updateBlockContent(blockId, { url: inputUrl });
                }
              }}
              placeholder="Paste URL (YouTube, Figma, etc.)"
              className="flex-1 text-sm outline-none border border-[#e3e3e0] dark:border-[#3f3f3f] rounded px-3 py-2 bg-transparent"
            />
            <button
              onClick={() => { if (inputUrl) updateBlockContent(blockId, { url: inputUrl }); }}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Embed
            </button>
          </div>
          <p className="text-xs text-gray-500">Supports YouTube, Figma, Google Maps, and more</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2" data-block-id={blockId}>
      <div className="rounded overflow-hidden border border-[#e3e3e0] dark:border-[#3f3f3f]">
        <iframe
          src={getEmbedUrl(url)}
          className="w-full h-[400px] border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <div className="text-xs text-gray-500 mt-1 text-center truncate">{url}</div>
    </div>
  );
}
