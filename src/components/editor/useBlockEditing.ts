import { useRef, useCallback, useEffect } from 'react';
import { useEditorStore } from '@/store/editor-store';
import type { BlockType } from '@/types';

export function useBlockEditing(blockId: string) {
  const ref = useRef<HTMLDivElement>(null);
  const block = useEditorStore((s) => s.blocks[blockId]);
  const activeBlockId = useEditorStore((s) => s.activeBlockId);
  const setActiveBlock = useEditorStore((s) => s.setActiveBlock);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);
  const updateBlockType = useEditorStore((s) => s.updateBlockType);
  const addBlock = useEditorStore((s) => s.addBlock);
  const deleteBlock = useEditorStore((s) => s.deleteBlock);
  const indentBlock = useEditorStore((s) => s.indentBlock);
  const outdentBlock = useEditorStore((s) => s.outdentBlock);
  const openSlashMenu = useEditorStore((s) => s.openSlashMenu);
  const rootBlockIds = useEditorStore((s) => s.rootBlockIds);
  const blocks = useEditorStore((s) => s.blocks);

  // Focus management
  useEffect(() => {
    if (activeBlockId === blockId && ref.current) {
      if (document.activeElement !== ref.current) {
        ref.current.focus();
        // Place cursor at end
        const selection = window.getSelection();
        if (selection && ref.current.childNodes.length > 0) {
          const range = document.createRange();
          range.selectNodeContents(ref.current);
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }
  }, [activeBlockId, blockId]);

  const handleInput = useCallback(() => {
    if (!ref.current) return;
    const text = ref.current.textContent || '';
    updateBlockContent(blockId, { text });
  }, [blockId, updateBlockContent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const text = ref.current?.textContent || '';

    // Slash command
    if (e.key === '/' && text === '') {
      e.preventDefault();
      const rect = ref.current!.getBoundingClientRect();
      openSlashMenu(blockId, { x: rect.left, y: rect.bottom });
      return;
    }

    // Enter - create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const newId = addBlock('text', blockId, block?.parentId ?? null);
      setTimeout(() => {
        const el = document.querySelector(`[data-block-id="${newId}"]`) as HTMLElement;
        el?.focus();
      }, 10);
      return;
    }

    // Backspace on empty - delete block
    if (e.key === 'Backspace' && text === '') {
      e.preventDefault();
      // Find previous block to focus
      const allIds = getAllBlockIds(rootBlockIds, blocks);
      const idx = allIds.indexOf(blockId);
      if (idx > 0) {
        const prevId = allIds[idx - 1];
        deleteBlock(blockId);
        setTimeout(() => {
          const el = document.querySelector(`[data-block-id="${prevId}"]`) as HTMLElement;
          el?.focus();
        }, 10);
      } else if (block?.type !== 'text') {
        // Convert to text instead of deleting
        updateBlockType(blockId, 'text');
      }
      return;
    }

    // Tab - indent
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      indentBlock(blockId);
      return;
    }

    // Shift+Tab - outdent
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      outdentBlock(blockId);
      return;
    }

    // Arrow Up - move to previous block
    if (e.key === 'ArrowUp') {
      const allIds = getAllBlockIds(rootBlockIds, blocks);
      const idx = allIds.indexOf(blockId);
      if (idx > 0) {
        e.preventDefault();
        setActiveBlock(allIds[idx - 1]);
      }
      return;
    }

    // Arrow Down - move to next block
    if (e.key === 'ArrowDown') {
      const allIds = getAllBlockIds(rootBlockIds, blocks);
      const idx = allIds.indexOf(blockId);
      if (idx < allIds.length - 1) {
        e.preventDefault();
        setActiveBlock(allIds[idx + 1]);
      }
      return;
    }

    // Markdown shortcuts on Space
    if (e.key === ' ' && ref.current) {
      const currentText = ref.current.textContent || '';
      const markdownMap: Record<string, BlockType> = {
        '#': 'heading1',
        '##': 'heading2',
        '###': 'heading3',
        '-': 'bullet',
        '*': 'bullet',
        '1.': 'numbered',
        '[]': 'todo',
        '>': 'quote',
        '---': 'divider',
      };

      const trimmed = currentText.trim();
      const blockType = markdownMap[trimmed];
      if (blockType) {
        e.preventDefault();
        updateBlockType(blockId, blockType);
        updateBlockContent(blockId, { text: '' });
        if (ref.current) ref.current.textContent = '';
      }
    }

    // Bold: Ctrl+B
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      document.execCommand('bold');
      return;
    }

    // Italic: Ctrl+I
    if (e.key === 'i' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      document.execCommand('italic');
      return;
    }

    // Underline: Ctrl+U
    if (e.key === 'u' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      document.execCommand('underline');
      return;
    }

    // Strikethrough: Ctrl+Shift+S
    if (e.key === 's' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
      e.preventDefault();
      document.execCommand('strikeThrough');
      return;
    }
  }, [blockId, block, addBlock, deleteBlock, indentBlock, outdentBlock, openSlashMenu, setActiveBlock, updateBlockContent, updateBlockType, rootBlockIds, blocks]);

  const handleFocus = useCallback(() => {
    setActiveBlock(blockId);
  }, [blockId, setActiveBlock]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return {
    ref,
    handleInput,
    handleKeyDown,
    handleFocus,
    handlePaste,
    text: block?.content.text || '',
  };
}

function getAllBlockIds(rootIds: string[], blocks: Record<string, { childrenIds: string[] }>): string[] {
  const result: string[] = [];
  const traverse = (ids: string[]) => {
    for (const id of ids) {
      result.push(id);
      const block = blocks[id];
      if (block?.childrenIds.length > 0) {
        traverse(block.childrenIds);
      }
    }
  };
  traverse(rootIds);
  return result;
}
