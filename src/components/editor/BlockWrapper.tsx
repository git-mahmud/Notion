import { useEditorStore } from '@/store/editor-store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockRenderer } from './BlockRenderer';
import { useState } from 'react';

interface BlockWrapperProps {
  blockId: string;
  depth: number;
}

export function BlockWrapper({ blockId, depth }: BlockWrapperProps) {
  const block = useEditorStore((s) => s.blocks[blockId]);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const addBlock = useEditorStore((s) => s.addBlock);
  const [showMenu, setShowMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: blockId });

  if (!block) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: depth * 24,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="block-wrapper group relative">
      {/* Drag Handle + Menu */}
      <div className="drag-handle absolute -left-8 top-0.5 flex items-center gap-0.5">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-notion-hover"
          title="Click for menu"
        >
          <svg className="w-4 h-4 text-notion-text-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        <button
          {...listeners}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-notion-hover cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4 text-notion-text-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </button>
      </div>

      {/* Block Menu Dropdown */}
      {showMenu && (
        <div
          className="absolute -left-8 top-7 bg-white border border-notion-border rounded shadow-lg z-50 py-1 min-w-[160px]"
          onMouseLeave={() => setShowMenu(false)}
        >
          <button
            onClick={() => { deleteBlock(blockId); setShowMenu(false); }}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover flex items-center gap-2"
          >
            <span>🗑️</span> Delete
          </button>
          <button
            onClick={() => { duplicateBlock(blockId); setShowMenu(false); }}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover flex items-center gap-2"
          >
            <span>📋</span> Duplicate
          </button>
          <button
            onClick={() => { addBlock('text', blockId, block.parentId); setShowMenu(false); }}
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover flex items-center gap-2"
          >
            <span>➕</span> Add block below
          </button>
        </div>
      )}

      {/* Block Content */}
      <BlockRenderer blockId={blockId} />

      {/* Nested children */}
      {block.childrenIds.length > 0 && (
        <div>
          {block.childrenIds.map((childId) => (
            <BlockWrapper key={childId} blockId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
