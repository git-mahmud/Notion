import { useState } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { TEXT_COLORS, BG_COLORS } from '@/lib/constants';
import type { BlockType } from '@/types';

interface BlockMenuProps {
  blockId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

const TURN_INTO_OPTIONS: { type: BlockType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: '📝' },
  { type: 'heading1', label: 'Heading 1', icon: 'H₁' },
  { type: 'heading2', label: 'Heading 2', icon: 'H₂' },
  { type: 'heading3', label: 'Heading 3', icon: 'H₃' },
  { type: 'bullet', label: 'Bullet list', icon: '•' },
  { type: 'numbered', label: 'Numbered list', icon: '1.' },
  { type: 'todo', label: 'To-do', icon: '☑️' },
  { type: 'toggle', label: 'Toggle', icon: '▶' },
  { type: 'quote', label: 'Quote', icon: '❝' },
  { type: 'callout', label: 'Callout', icon: '💡' },
  { type: 'code', label: 'Code', icon: '<>' },
];

export function BlockMenu({ blockId, position, onClose }: BlockMenuProps) {
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const updateBlockType = useEditorStore((s) => s.updateBlockType);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const block = useEditorStore((s) => s.blocks[blockId]);
  const [subMenu, setSubMenu] = useState<'turn_into' | 'color' | null>(null);

  if (!block) return null;

  const handleTurnInto = (type: BlockType) => {
    updateBlockType(blockId, type);
    onClose();
  };

  const handleSetColor = (color: string) => {
    updateBlockContent(blockId, { color: color as any });
    onClose();
  };

  const handleSetBgColor = (bgColor: string) => {
    updateBlockContent(blockId, { bgColor: bgColor as any });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150]" onClick={onClose}>
      <div
        className="context-menu absolute bg-white dark:bg-[#252525] border border-[#e3e3e0] dark:border-[#3f3f3f] rounded-lg shadow-xl py-1 min-w-[220px] text-sm"
        style={{ top: position.y, left: position.x }}
        onClick={(e) => e.stopPropagation()}
      >
        {subMenu === null && (
          <>
            <button
              onClick={() => { deleteBlock(blockId); onClose(); }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <span>🗑️</span> Delete
            </button>
            <button
              onClick={() => { duplicateBlock(blockId); onClose(); }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <span>📋</span> Duplicate
            </button>
            <button
              onClick={() => setSubMenu('turn_into')}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 justify-between"
            >
              <span className="flex items-center gap-2"><span>🔄</span> Turn into</span>
              <span className="text-gray-400">›</span>
            </button>
            <button
              onClick={() => setSubMenu('color')}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 justify-between"
            >
              <span className="flex items-center gap-2"><span>🎨</span> Color</span>
              <span className="text-gray-400">›</span>
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <button
              onClick={() => { navigator.clipboard.writeText(`#${blockId}`); onClose(); }}
              className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
            >
              <span>🔗</span> Copy link to block
            </button>
          </>
        )}

        {subMenu === 'turn_into' && (
          <>
            <button onClick={() => setSubMenu(null)} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-500">
              ← Back
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            {TURN_INTO_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => handleTurnInto(opt.type)}
                className={`w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 ${block.type === opt.type ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              >
                <span className="w-5 text-center">{opt.icon}</span> {opt.label}
              </button>
            ))}
          </>
        )}

        {subMenu === 'color' && (
          <>
            <button onClick={() => setSubMenu(null)} className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-500">
              ← Back
            </button>
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <div className="px-3 py-1 text-xs text-gray-500 font-medium">Text color</div>
            {TEXT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => handleSetColor(c.value)}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
              >
                <span className={`w-4 h-4 rounded ${c.class}`}>A</span> {c.name}
              </button>
            ))}
            <hr className="my-1 border-gray-200 dark:border-gray-700" />
            <div className="px-3 py-1 text-xs text-gray-500 font-medium">Background</div>
            {BG_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => handleSetBgColor(c.value)}
                className="w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
              >
                <span className={`w-4 h-4 rounded border border-gray-200 ${c.class}`} /> {c.name}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
