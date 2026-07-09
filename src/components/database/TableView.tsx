import { useDatabaseStore } from '@/store/database-store';
import { useWorkspaceStore } from '@/store/workspace-store';
import { PropertyCell } from './PropertyCell';
import { useState } from 'react';

interface TableViewProps {
  pageIds: string[];
}

export function TableView({ pageIds }: TableViewProps) {
  const properties = useDatabaseStore((s) => s.properties);
  const activeViewId = useDatabaseStore((s) => s.activeViewId);
  const getFilteredPages = useDatabaseStore((s) => s.getFilteredPages);
  const getSortedPages = useDatabaseStore((s) => s.getSortedPages);
  const addProperty = useDatabaseStore((s) => s.addProperty);
  const pages = useWorkspaceStore((s) => s.pages);
  const navigateTo = useWorkspaceStore((s) => s.navigateTo);
  const createPage = useWorkspaceStore((s) => s.createPage);
  const activeDatabaseId = useDatabaseStore((s) => s.activeDatabaseId);
  const [showAddProp, setShowAddProp] = useState(false);

  const propList = Object.values(properties).sort((a, b) => a.sortOrder - b.sortOrder);

  let displayIds = pageIds;
  if (activeViewId) {
    displayIds = getFilteredPages(activeViewId, displayIds);
    displayIds = getSortedPages(activeViewId, displayIds);
  }

  const handleAddRow = async () => {
    if (activeDatabaseId) {
      await createPage(activeDatabaseId);
    }
  };

  return (
    <div className="border border-notion-border rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-notion-sidebar border-b border-notion-border">
            <th className="text-left px-3 py-2 font-medium text-notion-text-secondary w-60">
              Name
            </th>
            {propList.map((prop) => (
              <th
                key={prop.id}
                className="text-left px-3 py-2 font-medium text-notion-text-secondary min-w-[150px]"
              >
                {prop.name}
              </th>
            ))}
            <th className="w-8 relative">
              <button
                onClick={() => setShowAddProp(!showAddProp)}
                className="w-full h-full flex items-center justify-center text-notion-text-secondary hover:text-notion-text"
                title="Add property"
              >
                +
              </button>
              {showAddProp && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-notion-border rounded shadow-lg z-50 py-1 min-w-[150px]">
                  {(['text', 'number', 'select', 'multi_select', 'date', 'url', 'checkbox'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => { addProperty(type, type); setShowAddProp(false); }}
                      className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover capitalize"
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {displayIds.map((pageId) => {
            const page = pages[pageId];
            if (!page) return null;
            return (
              <tr key={pageId} className="border-b border-notion-border hover:bg-notion-hover/50">
                <td className="px-3 py-2">
                  <button
                    onClick={() => navigateTo(pageId)}
                    className="text-notion-text hover:underline font-medium"
                  >
                    {page.icon && <span className="mr-1">{page.icon}</span>}
                    {page.title || 'Untitled'}
                  </button>
                </td>
                {propList.map((prop) => (
                  <td key={prop.id} className="px-3 py-2">
                    <PropertyCell pageId={pageId} propertyId={prop.id} />
                  </td>
                ))}
                <td />
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Add row */}
      <button
        onClick={handleAddRow}
        className="w-full px-3 py-2 text-sm text-notion-text-secondary hover:bg-notion-hover text-left transition-colors"
      >
        + New
      </button>
    </div>
  );
}
