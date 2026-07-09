import { useRef, useCallback, useState } from 'react';
import { useEditorStore } from '@/store/editor-store';

interface CodeBlockProps {
  blockId: string;
}

const LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'html', 'css',
  'json', 'markdown', 'bash', 'sql', 'java', 'c', 'cpp', 'rust', 'go',
];

export function CodeBlock({ blockId }: CodeBlockProps) {
  const block = useEditorStore((s) => s.blocks[blockId]);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const addBlock = useEditorStore((s) => s.addBlock);
  const ref = useRef<HTMLPreElement>(null);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const language = block?.content.language || 'plaintext';
  const text = block?.content.text || '';

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    const code = ref.current.textContent || '';
    updateBlockContent(blockId, { text: code });
  }, [blockId, updateBlockContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Allow Tab for indentation in code
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
      return;
    }

    // Shift+Enter to exit code block
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      addBlock('text', blockId, block?.parentId ?? null);
      return;
    }

    // Regular Enter for new line within code
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertText', false, '\n');
      return;
    }
  }, [blockId, block, addBlock]);

  return (
    <div className="py-2" data-block-id={blockId}>
      <div className="bg-gray-50 border border-notion-border rounded-md overflow-hidden">
        {/* Language selector */}
        <div className="flex items-center px-3 py-1.5 border-b border-notion-border">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="text-xs text-notion-text-secondary hover:text-notion-text transition-colors"
            >
              {language}
              <span className="ml-1">▾</span>
            </button>
            {showLangMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-notion-border rounded shadow-lg z-50 max-h-48 overflow-y-auto py-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      updateBlockContent(blockId, { language: lang });
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1 text-xs hover:bg-notion-hover ${
                      lang === language ? 'bg-notion-hover font-medium' : ''
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(text);
            }}
            className="ml-auto text-xs text-notion-text-secondary hover:text-notion-text transition-colors"
            title="Copy code"
          >
            Copy
          </button>
        </div>

        {/* Code area */}
        <pre
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          data-placeholder="// Write code here..."
          className="px-4 py-3 text-sm font-mono text-notion-text outline-none overflow-x-auto whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:text-gray-300 empty:before:pointer-events-none"
        >
          {text}
        </pre>
      </div>
    </div>
  );
}
