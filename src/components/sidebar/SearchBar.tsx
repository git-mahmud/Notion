import { useState, useRef, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';
import { registerShortcut } from '@/lib/keyboard';

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const pages = useWorkspaceStore((s) => s.pages);
  const navigateTo = useWorkspaceStore((s) => s.navigateTo);

  useEffect(() => {
    const unreg = registerShortcut({
      key: 'p',
      ctrl: true,
      handler: () => {
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      },
      description: 'Quick search',
    });
    return unreg;
  }, []);

  const filteredPages = Object.values(pages).filter(
    (p) => !p.isArchived && p.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-hover rounded transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Search</span>
        <span className="ml-auto text-xs opacity-50">Ctrl+P</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => { setTimeout(() => { setIsOpen(false); setQuery(''); }, 200); }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { setIsOpen(false); setQuery(''); }
          if (e.key === 'Enter' && filteredPages.length > 0) {
            navigateTo(filteredPages[0].id);
            setIsOpen(false);
            setQuery('');
          }
        }}
        placeholder="Search pages..."
        className="w-full px-2 py-1.5 text-sm bg-white border border-notion-border rounded outline-none focus:border-notion-accent"
      />
      {query && filteredPages.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-notion-border rounded shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredPages.slice(0, 10).map((page) => (
            <button
              key={page.id}
              onMouseDown={() => {
                navigateTo(page.id);
                setIsOpen(false);
                setQuery('');
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-notion-hover flex items-center gap-2"
            >
              <span>{page.icon || '📄'}</span>
              <span className="truncate">{page.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
