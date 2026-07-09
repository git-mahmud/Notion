import { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';
import { PageTree } from './PageTree';
import { SearchBar } from './SearchBar';
import { TrashView } from './TrashView';

export function Sidebar() {
  const workspaceName = useWorkspaceStore((s) => s.workspaceName);
  const workspaceIcon = useWorkspaceStore((s) => s.workspaceIcon);
  const createPage = useWorkspaceStore((s) => s.createPage);
  const pages = useWorkspaceStore((s) => s.pages);
  const navigateTo = useWorkspaceStore((s) => s.navigateTo);
  const theme = useWorkspaceStore((s) => s.theme);
  const setTheme = useWorkspaceStore((s) => s.setTheme);
  const [showTrash, setShowTrash] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const favoritePages = Object.values(pages).filter((p) => p.isFavorite);

  return (
    <div className="h-full flex flex-col bg-[#f7f6f3] dark:bg-[#202020] select-none">
      {/* Workspace Header */}
      <div className="px-3 py-2.5 flex items-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
           onClick={() => setShowSettings(!showSettings)}>
        <span className="text-lg">{workspaceIcon}</span>
        <span className="text-sm font-semibold truncate flex-1">{workspaceName}</span>
        <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="mx-2 mb-2 bg-white dark:bg-[#2f2f2f] border border-[#e3e3e0] dark:border-[#3f3f3f] rounded-lg shadow-lg p-2 text-sm">
          <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase">Theme</div>
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`w-full text-left px-2 py-1.5 rounded capitalize ${theme === t ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            >
              {t === 'light' && '☀️'} {t === 'dark' && '🌙'} {t === 'system' && '💻'} {t}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="px-2 pb-1">
        <SearchBar />
      </div>

      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-1">
        {/* Favorites */}
        {favoritePages.length > 0 && (
          <div className="mb-3">
            <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Favorites
            </div>
            {favoritePages.map((page) => (
              <button
                key={page.id}
                onClick={() => navigateTo(page.id)}
                className="w-full flex items-center gap-2 px-2 py-1 text-sm rounded hover:bg-black/5 dark:hover:bg-white/5 text-left"
              >
                <span className="text-sm">{page.icon || '📄'}</span>
                <span className="truncate">{page.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* Private pages */}
        <div className="mb-2">
          <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Pages
          </div>
          <PageTree />
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-2 py-2 border-t border-[#e3e3e0] dark:border-[#2f2f2f] space-y-0.5">
        <button
          onClick={() => createPage()}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New page</span>
        </button>

        <button
          onClick={() => setShowTrash(!showTrash)}
          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Trash</span>
        </button>
      </div>

      {/* Trash modal */}
      {showTrash && <TrashView onClose={() => setShowTrash(false)} />}
    </div>
  );
}
