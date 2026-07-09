import { useState, useRef } from 'react';
import { useEditorStore } from '@/store/editor-store';

interface ImageBlockProps {
  blockId: string;
}

export function ImageBlock({ blockId }: ImageBlockProps) {
  const block = useEditorStore((s) => s.blocks[blockId]);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const url = block?.content.url;
  const caption = block?.content.caption;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateBlockContent(blockId, { url: dataUrl });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleUrlInput = () => {
    const inputUrl = prompt('Enter image URL:');
    if (inputUrl) {
      updateBlockContent(blockId, { url: inputUrl });
    }
  };

  if (!url) {
    return (
      <div className="py-2">
        <div className="border border-dashed border-notion-border rounded-lg p-8 flex flex-col items-center gap-3 hover:bg-notion-hover transition-colors">
          <svg className="w-8 h-8 text-notion-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-sm bg-notion-accent text-white rounded hover:bg-notion-accent-hover transition-colors"
            >
              Upload
            </button>
            <button
              onClick={handleUrlInput}
              className="px-3 py-1.5 text-sm border border-notion-border rounded hover:bg-notion-hover transition-colors"
            >
              Embed link
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {isUploading && <span className="text-sm text-notion-text-secondary">Loading...</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="py-2" data-block-id={blockId}>
      <div className="rounded overflow-hidden">
        <img
          src={url}
          alt={caption || 'Image'}
          className="max-w-full h-auto rounded"
        />
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder="Add a caption..."
        onInput={(e) => {
          updateBlockContent(blockId, { caption: (e.target as HTMLElement).textContent || '' });
        }}
        className="mt-1 text-sm text-notion-text-secondary outline-none text-center empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
      >
        {caption}
      </div>
    </div>
  );
}
