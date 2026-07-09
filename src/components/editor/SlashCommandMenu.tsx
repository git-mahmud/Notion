import { useState, useEffect, useRef, useMemo } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { SLASH_COMMANDS } from '@/lib/constants';
import type { SlashCommand } from '@/types';

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

  const filteredCommands = useMemo(() =>
    SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.keywords.some((k) => k.includes(query.toLowerCase()))
    ), [query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, SlashCommand[]> = {};
    for (const cmd of filteredCommands) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filteredCommands]);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setSelectedIndex(0); }, [query]);

  const executeCommand = (command: SlashCommand) => {
    if (slashMenuBlockId) {
      updateBlockType(slashMenuBlockId, command.blockType);
      updateBlockContent(slashMenuBlockId, { text: '' });

      // Set defaults for special blocks
      if (command.blockType === 'callout') {
        updateBlockContent(slashMenuBlockId, { emoji: '💡', text: '' });
      }
      if (command.blockType === 'toggle') {
        updateBlockContent(slashMenuBlockId, { expanded: true, text: '' });
      }
      if (command.blockType === 'code') {
        updateBlockContent(slashMenuBlockId, { language: 'javascript', text: '' });
      }
      if (command.blockType === 'table') {
        updateBlockContent(slashMenuBlockId, {
          rows: [['', '', ''], ['', '', ''], ['', '', '']],
        });
      }
      if (command.blockType === 'columns') {
        updateBlockContent(slashMenuBlockId, { columnCount: 2 });
      }
    }
    closeSlashMenu();
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
      if (filteredCommands[selectedIndex]) executeCommand(filteredCommands[selectedIndex]);
    } else if (e.key === 'Escape') {
      closeSlashMenu();
    }
  };

  if (!slashMenuPosition) return null;

  let flatIdx = 0;

  return (
    <div
      ref={menuRef}
      className="slash-menu fixed bg-white dark:bg-[#252525] border border-[#e3e3e0] dark:border-[#3f3f3f] rounded-lg overflow-hidden z-[100] w-80"
      style={{ top: Math.min(slashMenuPosition.y + 4, window.innerHeight - 350), left: slashMenuPosition.x }}
    >
      <div className="px-3 py-2 border-b border-[#e3e3e0] dark:border-[#3f3f3f]">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(closeSlashMenu, 200)}
          placeholder="Filter blocks..."
          className="w-full text-sm outline-none bg-transparent placeholder-gray-400"
        />
      </div>

      <div className="max-h-72 overflow-y-auto py-1">
        {filteredCommands.length === 0 ? (
          <div className="px-3 py-4 text-sm text-gray-500 text-center">No results</div>
        ) : (
          Object.entries(grouped).map(([category, commands]) => (
            <div key={category}>
              <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                {category}
              </div>
              {commands.map((cmd) => {
                const idx = flatIdx++;
                return (
                  <button
                    key={cmd.id}
                    onMouseDown={(e) => { e.preventDefault(); executeCommand(cmd); }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-3 py-1.5 flex items-center gap-3 transition-colors ${
                      idx === selectedIndex ? 'bg-[#efefef] dark:bg-[#3a3a3a]' : ''
                    }`}
                  >
                    <span className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#2f2f2f] border border-[#e3e3e0] dark:border-[#3f3f3f] rounded text-sm flex-shrink-0">
                      {cmd.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{cmd.label}</div>
                      <div className="text-xs text-gray-500 truncate">{cmd.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
