import { useEffect, useState } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { MainContent } from './components/MainContent';
import { useWorkspaceStore } from './store/workspace-store';
import { initializeDatabase } from './lib/local-db';
import { initKeyboardManager, registerShortcut } from './lib/keyboard';
import { onSyncMessage } from './lib/tab-sync';
import { initTheme } from './lib/theme';

export default function App() {
  const [ready, setReady] = useState(false);
  const initialize = useWorkspaceStore((s) => s.initialize);
  const createPage = useWorkspaceStore((s) => s.createPage);
  const sidebarWidth = useWorkspaceStore((s) => s.sidebarWidth);
  const sidebarCollapsed = useWorkspaceStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);
  const theme = useWorkspaceStore((s) => s.theme);

  useEffect(() => {
    async function init() {
      initTheme();
      await initializeDatabase();
      await initialize();
      setReady(true);
    }
    init();
  }, [initialize]);

  useEffect(() => {
    const cleanupKb = initKeyboardManager();

    const unregNewPage = registerShortcut({
      key: 'n',
      ctrl: true,
      handler: () => { createPage(); },
      description: 'Create new page',
    });

    const unregToggleSidebar = registerShortcut({
      key: '\\',
      ctrl: true,
      handler: () => { toggleSidebar(); },
      description: 'Toggle sidebar',
    });

    return () => { cleanupKb(); unregNewPage(); unregToggleSidebar(); };
  }, [createPage, toggleSidebar]);

  useEffect(() => {
    const unsub = onSyncMessage((msg) => {
      if (msg.type === 'page_create' || msg.type === 'page_delete' || msg.type === 'page_update') {
        initialize();
      }
    });
    return unsub;
  }, [initialize]);

  if (!ready) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-[#191919]">
        <div className="text-gray-500 text-sm animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-[#191919] text-[#37352f] dark:text-[#e6e6e4]">
      {!sidebarCollapsed && (
        <div
          style={{ width: sidebarWidth, minWidth: sidebarWidth }}
          className="flex-shrink-0 border-r border-[#e3e3e0] dark:border-[#2f2f2f]"
        >
          <Sidebar />
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <MainContent />
      </div>
    </div>
  );
}
