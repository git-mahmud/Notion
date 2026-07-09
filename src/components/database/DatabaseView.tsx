import { useEffect, useState } from 'react';
import { useDatabaseStore } from '@/store/database-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import { TableView } from './TableView';
import { BoardView } from './BoardView';
import { ListView } from './ListView';
import { ViewTabs } from './ViewTabs';
import { FilterBar } from './FilterBar';

interface DatabaseViewProps {
  databaseId: string;
}

export function DatabaseView({ databaseId }: DatabaseViewProps) {
  const loadDatabase = useDatabaseStore((s) => s.loadDatabase);
  const activeViewId = useDatabaseStore((s) => s.activeViewId);
  const views = useDatabaseStore((s) => s.views);
  const pages = useWorkspaceStore((s) => s.pages);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadDatabase(databaseId).then(() => setLoaded(true));
  }, [databaseId, loadDatabase]);

  if (!loaded) return null;

  const activeView = activeViewId ? views[activeViewId] : null;

  // Get child pages of the database
  const dbPage = pages[databaseId];
  const childPageIds = dbPage?.childrenIds ?? [];

  return (
    <div className="mt-4">
      <ViewTabs />
      <FilterBar />

      <div className="mt-3">
        {activeView?.type === 'table' && <TableView pageIds={childPageIds} />}
        {activeView?.type === 'board' && <BoardView pageIds={childPageIds} />}
        {activeView?.type === 'list' && <ListView pageIds={childPageIds} />}
      </div>
    </div>
  );
}
