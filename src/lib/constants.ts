import type { SlashCommand } from '@/types';

export const SLASH_COMMANDS: SlashCommand[] = [
  // Basic blocks
  { id: 'text', label: 'Text', description: 'Plain text', icon: '📝', blockType: 'text', keywords: ['text', 'paragraph', 'plain'], category: 'Basic' },
  { id: 'h1', label: 'Heading 1', description: 'Large section heading', icon: 'H₁', blockType: 'heading1', keywords: ['heading', 'h1', 'title', 'large'], category: 'Basic' },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading', icon: 'H₂', blockType: 'heading2', keywords: ['heading', 'h2', 'subtitle'], category: 'Basic' },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading', icon: 'H₃', blockType: 'heading3', keywords: ['heading', 'h3'], category: 'Basic' },
  { id: 'bullet', label: 'Bulleted List', description: 'Unordered list', icon: '•', blockType: 'bullet', keywords: ['bullet', 'list', 'unordered', 'ul'], category: 'Basic' },
  { id: 'numbered', label: 'Numbered List', description: 'Ordered list', icon: '1.', blockType: 'numbered', keywords: ['number', 'ordered', 'list', 'ol'], category: 'Basic' },
  { id: 'todo', label: 'To-do List', description: 'Task checkbox', icon: '☑️', blockType: 'todo', keywords: ['todo', 'checkbox', 'task', 'check'], category: 'Basic' },
  { id: 'toggle', label: 'Toggle', description: 'Collapsible content', icon: '▶', blockType: 'toggle', keywords: ['toggle', 'collapse', 'expand', 'accordion'], category: 'Basic' },
  { id: 'quote', label: 'Quote', description: 'Block quote', icon: '❝', blockType: 'quote', keywords: ['quote', 'blockquote'], category: 'Basic' },
  { id: 'callout', label: 'Callout', description: 'Highlighted note', icon: '💡', blockType: 'callout', keywords: ['callout', 'note', 'tip', 'warning', 'info'], category: 'Basic' },
  { id: 'divider', label: 'Divider', description: 'Horizontal line', icon: '—', blockType: 'divider', keywords: ['divider', 'line', 'separator', 'hr'], category: 'Basic' },

  // Media
  { id: 'image', label: 'Image', description: 'Upload or embed image', icon: '🖼️', blockType: 'image', keywords: ['image', 'picture', 'photo', 'img'], category: 'Media' },
  { id: 'video', label: 'Video', description: 'Embed video', icon: '🎬', blockType: 'video', keywords: ['video', 'movie', 'youtube'], category: 'Media' },
  { id: 'audio', label: 'Audio', description: 'Embed audio', icon: '🎵', blockType: 'audio', keywords: ['audio', 'music', 'sound'], category: 'Media' },
  { id: 'file', label: 'File', description: 'Upload file', icon: '📎', blockType: 'file', keywords: ['file', 'attachment', 'upload'], category: 'Media' },
  { id: 'pdf', label: 'PDF', description: 'Embed PDF', icon: '📄', blockType: 'pdf', keywords: ['pdf', 'document'], category: 'Media' },
  { id: 'bookmark', label: 'Bookmark', description: 'Save a link preview', icon: '🔖', blockType: 'bookmark', keywords: ['bookmark', 'link', 'preview'], category: 'Media' },
  { id: 'embed', label: 'Embed', description: 'Embed external content', icon: '🌐', blockType: 'embed', keywords: ['embed', 'iframe', 'widget'], category: 'Media' },

  // Advanced
  { id: 'code', label: 'Code', description: 'Code block with syntax', icon: '<>', blockType: 'code', keywords: ['code', 'snippet', 'programming'], category: 'Advanced' },
  { id: 'equation', label: 'Equation', description: 'LaTeX math formula', icon: '∑', blockType: 'equation', keywords: ['equation', 'math', 'latex', 'formula'], category: 'Advanced' },
  { id: 'table', label: 'Table', description: 'Simple table', icon: '📊', blockType: 'table', keywords: ['table', 'grid', 'spreadsheet'], category: 'Advanced' },
  { id: 'columns', label: 'Columns', description: 'Multi-column layout', icon: '▥', blockType: 'columns', keywords: ['columns', 'layout', 'side'], category: 'Advanced' },
  { id: 'toc', label: 'Table of Contents', description: 'Auto-generated TOC', icon: '📋', blockType: 'table_of_contents', keywords: ['toc', 'table of contents', 'contents', 'outline'], category: 'Advanced' },
  { id: 'synced', label: 'Synced Block', description: 'Content synced everywhere', icon: '🔄', blockType: 'synced_ref', keywords: ['synced', 'sync', 'linked'], category: 'Advanced' },
];

export const TEXT_COLORS: { name: string; value: string; class: string }[] = [
  { name: 'Default', value: 'default', class: 'text-notion-text dark:text-gray-200' },
  { name: 'Gray', value: 'gray', class: 'text-gray-500' },
  { name: 'Brown', value: 'brown', class: 'text-amber-700' },
  { name: 'Orange', value: 'orange', class: 'text-orange-500' },
  { name: 'Yellow', value: 'yellow', class: 'text-yellow-600' },
  { name: 'Green', value: 'green', class: 'text-green-600' },
  { name: 'Blue', value: 'blue', class: 'text-blue-600' },
  { name: 'Purple', value: 'purple', class: 'text-purple-600' },
  { name: 'Pink', value: 'pink', class: 'text-pink-600' },
  { name: 'Red', value: 'red', class: 'text-red-600' },
];

export const BG_COLORS: { name: string; value: string; class: string }[] = [
  { name: 'Default', value: 'default', class: '' },
  { name: 'Gray', value: 'gray_bg', class: 'bg-gray-100 dark:bg-gray-800' },
  { name: 'Brown', value: 'brown_bg', class: 'bg-amber-50 dark:bg-amber-900/30' },
  { name: 'Orange', value: 'orange_bg', class: 'bg-orange-50 dark:bg-orange-900/30' },
  { name: 'Yellow', value: 'yellow_bg', class: 'bg-yellow-50 dark:bg-yellow-900/30' },
  { name: 'Green', value: 'green_bg', class: 'bg-green-50 dark:bg-green-900/30' },
  { name: 'Blue', value: 'blue_bg', class: 'bg-blue-50 dark:bg-blue-900/30' },
  { name: 'Purple', value: 'purple_bg', class: 'bg-purple-50 dark:bg-purple-900/30' },
  { name: 'Pink', value: 'pink_bg', class: 'bg-pink-50 dark:bg-pink-900/30' },
  { name: 'Red', value: 'red_bg', class: 'bg-red-50 dark:bg-red-900/30' },
];

export const CODE_LANGUAGES = [
  'plaintext', 'javascript', 'typescript', 'python', 'java', 'c', 'cpp',
  'csharp', 'go', 'rust', 'kotlin', 'swift', 'ruby', 'php', 'html',
  'css', 'scss', 'json', 'yaml', 'xml', 'markdown', 'bash', 'shell',
  'sql', 'graphql', 'dockerfile', 'makefile', 'lua', 'r', 'matlab',
  'scala', 'haskell', 'elixir', 'clojure', 'dart', 'objective-c',
];

export const EMOJI_LIST = [
  '📄', '📝', '📋', '📁', '🗃️', '💡', '⭐', '🎯', '🚀', '💻',
  '📊', '📈', '🎨', '🔧', '⚡', '🌟', '📌', '🔖', '💼', '🎓',
  '🏠', '🌍', '❤️', '🔥', '✅', '📚', '🎬', '🎵', '🎮', '🏆',
  '🍕', '☕', '🌱', '🦋', '🌈', '🎉', '💎', '🔑', '🎁', '📷',
  '🧠', '💪', '🎲', '🔬', '🧪', '📐', '🗓️', '⏰', '🌙', '☀️',
  '🐱', '🐶', '🦊', '🐻', '🐼', '🦁', '🐸', '🦄', '🐝', '🦅',
  '🍎', '🍊', '🍋', '🍇', '🍓', '🥑', '🌽', '🍔', '🍩', '🍰',
  '⚽', '🏀', '🎾', '🏐', '🎱', '🛹', '🏄', '🚴', '🎿', '🏋️',
];

export const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=300&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=300&fit=crop',
];

export const KEYBOARD_SHORTCUTS = [
  { keys: 'Ctrl+N', action: 'New page' },
  { keys: 'Ctrl+P', action: 'Quick search' },
  { keys: 'Ctrl+\\', action: 'Toggle sidebar' },
  { keys: 'Ctrl+B', action: 'Bold' },
  { keys: 'Ctrl+I', action: 'Italic' },
  { keys: 'Ctrl+U', action: 'Underline' },
  { keys: 'Ctrl+Shift+S', action: 'Strikethrough' },
  { keys: 'Ctrl+E', action: 'Inline code' },
  { keys: 'Ctrl+K', action: 'Link' },
  { keys: 'Ctrl+Z', action: 'Undo' },
  { keys: 'Ctrl+Shift+Z', action: 'Redo' },
  { keys: 'Tab', action: 'Indent' },
  { keys: 'Shift+Tab', action: 'Outdent' },
  { keys: 'Enter', action: 'New block' },
  { keys: '/', action: 'Slash command' },
  { keys: 'Ctrl+Shift+0', action: 'Text' },
  { keys: 'Ctrl+Shift+1', action: 'Heading 1' },
  { keys: 'Ctrl+Shift+2', action: 'Heading 2' },
  { keys: 'Ctrl+Shift+3', action: 'Heading 3' },
  { keys: 'Ctrl+Shift+4', action: 'Todo' },
  { keys: 'Ctrl+Shift+5', action: 'Bullet list' },
  { keys: 'Ctrl+Shift+6', action: 'Numbered list' },
  { keys: 'Ctrl+Shift+7', action: 'Toggle' },
  { keys: 'Ctrl+Shift+8', action: 'Code' },
  { keys: 'Ctrl+Shift+9', action: 'Quote' },
];
