import { useEditorStore } from '@/store/editor-store';
import { BlockWrapper } from './BlockWrapper';
import { SlashCommandMenu } from './SlashCommandMenu';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface BlockEditorProps {
  pageId: string;
}

export function BlockEditor({ pageId }: BlockEditorProps) {
  const rootBlockIds = useEditorStore((s) => s.rootBlockIds);
  const blocks = useEditorStore((s) => s.blocks);
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks);
  const slashMenuOpen = useEditorStore((s) => s.slashMenuOpen);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderBlocks(active.id as string, over.id as string);
    }
  };

  // Flatten all visible block IDs for drag-and-drop
  const allVisibleIds = flattenBlockIds(rootBlockIds, blocks);

  return (
    <div className="block-content min-h-[200px] pb-40">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={allVisibleIds} strategy={verticalListSortingStrategy}>
          {rootBlockIds.map((blockId) => (
            <BlockWrapper key={blockId} blockId={blockId} depth={0} />
          ))}
        </SortableContext>
      </DndContext>

      {slashMenuOpen && <SlashCommandMenu />}
    </div>
  );
}

function flattenBlockIds(ids: string[], blocks: Record<string, { childrenIds: string[] }>): string[] {
  const result: string[] = [];
  for (const id of ids) {
    result.push(id);
    const block = blocks[id];
    if (block?.childrenIds.length > 0) {
      result.push(...flattenBlockIds(block.childrenIds, blocks));
    }
  }
  return result;
}
