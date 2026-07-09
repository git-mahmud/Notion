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
import { ToggleBlock } from './blocks/ToggleBlock';
import { CalloutBlock } from './blocks/CalloutBlock';
import { TableBlock } from './blocks/TableBlock';
import { BookmarkBlock } from './blocks/BookmarkBlock';
import { EmbedBlock } from './blocks/EmbedBlock';
import { EquationBlock } from './blocks/EquationBlock';
import { TableOfContentsBlock } from './blocks/TableOfContentsBlock';
import { ColumnsBlock } from './blocks/ColumnsBlock';

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
      return <HeadingBlock blockId={blockId} level={1} />;
    case 'heading2':
      return <HeadingBlock blockId={blockId} level={2} />;
    case 'heading3':
      return <HeadingBlock blockId={blockId} level={3} />;
    case 'todo':
      return <TodoBlock blockId={blockId} />;
    case 'bullet':
      return <BulletBlock blockId={blockId} />;
    case 'numbered':
      return <NumberedBlock blockId={blockId} />;
    case 'quote':
      return <QuoteBlock blockId={blockId} />;
    case 'callout':
      return <CalloutBlock blockId={blockId} />;
    case 'toggle':
      return <ToggleBlock blockId={blockId} />;
    case 'image':
      return <ImageBlock blockId={blockId} />;
    case 'video':
    case 'audio':
    case 'file':
    case 'pdf':
      return <ImageBlock blockId={blockId} />;
    case 'code':
      return <CodeBlock blockId={blockId} />;
    case 'divider':
      return <DividerBlock />;
    case 'table':
      return <TableBlock blockId={blockId} />;
    case 'bookmark':
      return <BookmarkBlock blockId={blockId} />;
    case 'embed':
      return <EmbedBlock blockId={blockId} />;
    case 'equation':
      return <EquationBlock blockId={blockId} />;
    case 'table_of_contents':
      return <TableOfContentsBlock />;
    case 'columns':
      return <ColumnsBlock blockId={blockId} />;
    default:
      return <TextBlock blockId={blockId} />;
  }
}
