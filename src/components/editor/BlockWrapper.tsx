import { useState } from 'react';
import { useEditorStore } from '@/store/editor-store';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockRenderer } from './BlockRenderer';
import { BlockMenu } from './BlockMenu';

interface BlockWrapperProps {
  blockId: string;
  depth: number;
}

export function BlockWrapper({ blockId, depth }: BlockWrapperProps) {
  const block = useEditorStore((s) => s.blocks[blockId]);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);

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
    opacity: isDragging ? 0.4 : 1,
    paddingLeft: depth * 24,
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="block-wrapper group relative"
      onContextMenu={handleContextMenu}
    >
      {/* Drag Handle + Block menu trigger */}
      <div className="drag-handle absolute -left-10 top-0.5 flex items-center">
        <button
          onClick={(e) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            setMenuPos({ x: rect.left, y: rect.bottom });
            setShowMenu(!showMenu);
          }}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Click for actions"
        >
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </button>
        <button
          {...listeners}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-grab active:cursor-grabbing"
          title="Drag to move"
        >
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 10 16" fill="currentColor">
            <circle cx="3" cy="2" r="1.5" /><circle cx="7" cy="2" r="1.5" />
            <circle cx="3" cy="8" r="1.5" /><circle cx="7" cy="8" r="1.5" />
            <circle cx="3" cy="14" r="1.5" /><circle cx="7" cy="14" r="1.5" />
          </svg>
        </button>
      </div>

      {/* Block Content */}
      <BlockRenderer blockId={blockId} />

      {/* Nested children (for non-toggle blocks — toggle handles its own) */}
      {block.type !== 'toggle' && block.type !== 'columns' && block.childrenIds.length > 0 && (
        <div>
          {block.childrenIds.map((childId) => (
            <BlockWrapper key={childId} blockId={childId} depth={depth + 1} />
          ))}
        </div>
      )}

      {/* Block Menu */}
      {showMenu && menuPos && (
        <BlockMenu
          blockId={blockId}
          position={menuPos}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
