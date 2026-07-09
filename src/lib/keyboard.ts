// ─── Keyboard Shortcut Manager ───────────────────────────────

type ShortcutHandler = (e: KeyboardEvent) => void;

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: ShortcutHandler;
  description: string;
}

const shortcuts: Shortcut[] = [];

export function registerShortcut(shortcut: Shortcut): () => void {
  shortcuts.push(shortcut);
  return () => {
    const idx = shortcuts.indexOf(shortcut);
    if (idx >= 0) shortcuts.splice(idx, 1);
  };
}

export function handleKeyDown(e: KeyboardEvent): void {
  for (const shortcut of shortcuts) {
    const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
    const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
    const altMatch = shortcut.alt ? e.altKey : !e.altKey;

    if (
      e.key.toLowerCase() === shortcut.key.toLowerCase() &&
      ctrlMatch &&
      shiftMatch &&
      altMatch
    ) {
      e.preventDefault();
      shortcut.handler(e);
      return;
    }
  }
}

export function initKeyboardManager(): () => void {
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}
