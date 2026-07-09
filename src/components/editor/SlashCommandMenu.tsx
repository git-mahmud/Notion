import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editor-store';
import type { BlockType, SlashCommand } from '@/types';

const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'text', label: 'Text', description: 'Plain text block', icon: '📝', blockType: 'text', keywords: ['text', 'paragraph'] },
  { id: 'h1', label: 'Heading 1', description: 'Large heading', icon: 'H₁', blockType: 'heading1', keywords: ['heading', 'h1', 'title'] },
  { id: 'h2', label: 'Heading 2', description: 'Medium heading', icon: 'H₂', blockType: 'heading2', keywords: ['heading', 'h2', 'subtitle'] },
  { id: 'h3', label: 'Heading 3', description: 'Small heading', icon: 'H₃', blockType: 'heading3', keywords: ['heading', 'h3'] },
  { id: 'bullet', label: 'Bullet List', description: 'Unordered list item', icon: '•', blockType: 'bullet', keywords: ['bullet', 'list', 'unordered'] },
  { id: 'numbered', label: 'Numbered List', description: 'Ordered list item', icon: '1.', blockType: 'numbered', keywords: ['number', 'ordered', 'list'] },
  { id: 'todo', label: 'To-do', description: 'Checkbox item', icon: '☑️', blockType: 'todo', keywords: ['todo', 'checkbox', 'task'] },
  { id: 'quote', label: 'Quote', description: 'Block quote', icon: '❝', blockType: 'quote', keywords: ['quote', 'blockquote'] },
  { id: 'divider', label: 'Divider', description: 'Horizontal line', icon: '—', blockType: 'divider', keywords: ['divider', 'line', 'separator', 'hr'] },
  { id: 'code', label: 'Code', description: 'Code block', icon: '<>', blockType: 'code', keywords: ['code', 'snippet', 'programming'] },
  { id: 'image', label: 'Image', description: 'Upload or embed image', icon: '🖼️', blockType: 'image', keywords: ['image', 'picture', 'photo'] },
];

export function SlashCommandMenu() {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const slashMenuPosition = useEditorStore((s) => s.slashMenuPosition);
  const slashMenuBlockId = useEditorStore((s) => s.slashMenuBlockId);
  const closeSlashMenu = useEditorStore((s) => s.closeSlashMenu);
  const updateBlockType = useEditorStore((s) => s.updateBlockType);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.toLowerCase()) ||
      cmd.keywords.some((k) => k.includes(query.toLowerCase()))
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeCommand = (command: SlashCommand) => {
    if (slashMenuBlockId) {
      updateBlockType(slashMenuBlockId, command.blockType);
      updateBlockContent(slashMenuBlockId, { text: '' });
    }
    closeSlashMenu();

    // Re-focus the block
    setTimeout(() => {
      const el = document.querySelector(`[data-block-id="${slashMenuBlockId}"]`) as HTMLElement;
      el?.focus();
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      closeSlashMenu();
    }
  };

  if (!slashMenuPosition) return null;

  return (
    <div
      ref={menuRef}
      className="slash-menu fixed bg-white border border-notion-border rounded-lg overflow-hidden z-[100] w-72"
      style={{
        top: slashMenuPosition.y + 4,
        left: slashMenuPosition.x,
      }}
    >
      {/* Search input */}
      <div className="px-3 py-2 border-b border-notion-border">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(closeSlashMenu, 150)}
          placeholder="Filter..."
          className="w-full text-sm outline-none placeholder-gray-400"
        />
      </div>

      {/* Commands list */}
      <div className="max-h-64 overflow-y-auto py-1">
        {filteredCommands.length === 0 ? (
          <div className="px-3 py-2 text-sm text-notion-text-secondary">No results</div>
        ) : (
          filteredCommands.map((cmd, idx) => (
            <button
              key={cmd.id}
              onMouseDown={(e) => { e.preventDefault(); executeCommand(cmd); }}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full text-left px-3 py-2 flex items-center gap-3 transition-colors ${
                idx === selectedIndex ? 'bg-notion-hover' : ''
              }`}
            >
              <span className="w-8 h-8 flex items-center justify-center bg-white border border-notion-border rounded text-sm">
                {cmd.icon}
              </span>
              <div>
                <div className="text-sm font-medium text-notion-text">{cmd.label}</div>
                <div className="text-xs text-notion-text-secondary">{cmd.description}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
