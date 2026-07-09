import { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';
import { Breadcrumbs } from './page/Breadcrumbs';
import { PageView } from './page/PageView';

export function MainContent() {
  const activePageId = useWorkspaceStore((s) => s.activePageId);
  const sidebarCollapsed = useWorkspaceStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const pages = useWorkspaceStore((s) => s.pages);
  const toggleFavorite = useWorkspaceStore((s) => s.toggleFavorite);
  const toggleLock = useWorkspaceStore((s) => s.toggleLock);
  const toggleFullWidth = useWorkspaceStore((s) => s.toggleFullWidth);
  const toggleSmallText = useWorkspaceStore((s) => s.toggleSmallText);
  const duplicatePage = useWorkspaceStore((s) => s.duplicatePage);
  const archivePage = useWorkspaceStore((s) => s.archivePage);
  const goBack = useWorkspaceStore((s) => s.goBack);
  const goForward = useWorkspaceStore((s) => s.goForward);
  const [showPageMenu, setShowPageMenu] = useState(false);

  const activePage = activePageId ? pages[activePageId] : null;

  if (!activePageId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-500">
        {sidebarCollapsed && (
          <button onClick={toggleSidebar} className="absolute top-3 left-3 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="text-5xl mb-4">📝</div>
        <p className="text-lg font-medium">Select or create a page</p>
        <p className="text-sm mt-2 opacity-60">Ctrl+N to create a new page</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center h-11 px-3 flex-shrink-0 border-b border-[#e3e3e0]/50 dark:border-[#2f2f2f]">
        <div className="flex items-center gap-1">
          {sidebarCollapsed && (
            <button onClick={toggleSidebar} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 mr-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          {/* Navigation arrows */}
          <button onClick={goBack} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" title="Back">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={goForward} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" title="Forward">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 mx-3">
          <Breadcrumbs />
        </div>

        {/* Page actions */}
        <div className="flex items-center gap-1">
          {activePage?.isLocked && (
            <span className="text-xs text-orange-500 px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 rounded">🔒 Locked</span>
          )}

          <button
            onClick={() => toggleFavorite(activePageId)}
            className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${activePage?.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
            title={activePage?.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-4 h-4" fill={activePage?.isFavorite ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>

          {/* More menu */}
          <div className="relative">
            <button
              onClick={() => setShowPageMenu(!showPageMenu)}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </button>

            {showPageMenu && (
              <div
                className="context-menu absolute top-full right-0 mt-1 bg-white dark:bg-[#252525] border border-[#e3e3e0] dark:border-[#3f3f3f] rounded-lg shadow-lg z-50 py-1 min-w-[200px]"
                onMouseLeave={() => setShowPageMenu(false)}
              >
                <button
                  onClick={() => { toggleLock(activePageId); setShowPageMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <span>🔒</span> {activePage?.isLocked ? 'Unlock page' : 'Lock page'}
                </button>
                <button
                  onClick={() => { toggleFullWidth(activePageId); setShowPageMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <span>↔️</span> {activePage?.isFullWidth ? 'Default width' : 'Full width'}
                </button>
                <button
                  onClick={() => { toggleSmallText(activePageId); setShowPageMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <span>🔤</span> {activePage?.isSmallText ? 'Default text' : 'Small text'}
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => { duplicatePage(activePageId); setShowPageMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <span>📋</span> Duplicate
                </button>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); setShowPageMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                >
                  <span>🔗</span> Copy link
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => { archivePage(activePageId); setShowPageMenu(false); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                >
                  <span>🗑️</span> Move to trash
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <PageView pageId={activePageId} />
      </div>
    </div>
  );
}
