import { useEffect, useState } from 'react';
import { Sidebar } from './components/sidebar/Sidebar';
import { MainContent } from './components/MainContent';
import { useWorkspaceStore } from './store/workspace-store';
import { initializeDatabase } from './lib/local-db';
import { initKeyboardManager, registerShortcut } from './lib/keyboard';
import { onSyncMessage } from './lib/tab-sync';

export default function App() {
  const [ready, setReady] = useState(false);
  const initialize = useWorkspaceStore((s) => s.initialize);
  const createPage = useWorkspaceStore((s) => s.createPage);
  const sidebarWidth = useWorkspaceStore((s) => s.sidebarWidth);
  const sidebarCollapsed = useWorkspaceStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useWorkspaceStore((s) => s.toggleSidebar);

  useEffect(() => {
    async function init() {
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

    return () => {
      cleanupKb();
      unregNewPage();
      unregToggleSidebar();
    };
  }, [createPage, toggleSidebar]);

  // Multi-tab sync
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
      <div className="h-screen flex items-center justify-center">
        <div className="text-notion-text-secondary text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {!sidebarCollapsed && (
        <div style={{ width: sidebarWidth, minWidth: sidebarWidth }} className="flex-shrink-0">
          <Sidebar />
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <MainContent />
      </div>
    </div>
  );
}
