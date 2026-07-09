import { useEditorStore } from '@/store/editor-store';
import { TextBlock } from './blocks/TextBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { TodoBlock } from './blocks/TodoBlock';
import { BulletBlock } from './blocks/BulletBlock';
import { NumberedBlock } from './blocks/NumberedBlock';
import { QuoteBlock } from './blocks/QuoteBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { CodeBlock } from './blocks/CodeBlock';
import { DividerBlock } from './blocks/DividerBlock';

interface BlockRendererProps {
  blockId: string;
}

export function BlockRenderer({ blockId }: BlockRendererProps) {
  const block = useEditorStore((s) => s.blocks[blockId]);

  if (!block) return null;

  switch (block.type) {
    case 'text':
      return <TextBlock blockId={blockId} />;
    case 'heading1':
    case 'heading2':
    case 'heading3':
      return <HeadingBlock blockId={blockId} level={parseInt(block.type.slice(-1)) as 1 | 2 | 3} />;
    case 'todo':
      return <TodoBlock blockId={blockId} />;
    case 'bullet':
      return <BulletBlock blockId={blockId} />;
    case 'numbered':
      return <NumberedBlock blockId={blockId} />;
    case 'quote':
      return <QuoteBlock blockId={blockId} />;
    case 'image':
      return <ImageBlock blockId={blockId} />;
    case 'code':
      return <CodeBlock blockId={blockId} />;
    case 'divider':
      return <DividerBlock />;
    default:
      return <TextBlock blockId={blockId} />;
  }
}
