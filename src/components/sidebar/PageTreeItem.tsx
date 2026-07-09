import { useState } from 'react';
import { useWorkspaceStore } from '@/store/workspace-store';

interface PageTreeItemProps {
  pageId: string;
  depth: number;
}

export function PageTreeItem({ pageId, depth }: PageTreeItemProps) {
  const page = useWorkspaceStore((s) => s.pages[pageId]);
  const activePageId = useWorkspaceStore((s) => s.activePageId);
  const navigateTo = useWorkspaceStore((s) => s.navigateTo);
  const toggleExpand = useWorkspaceStore((s) => s.toggleExpand);
  const createPage = useWorkspaceStore((s) => s.createPage);
  const deletePage = useWorkspaceStore((s) => s.deletePage);
  const renamePage = useWorkspaceStore((s) => s.renamePage);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  if (!page) return null;

  const isActive = activePageId === pageId;
  const hasChildren = page.childrenIds.length > 0;
  const paddingLeft = 8 + depth * 16;

  const handleRenameStart = () => {
    setRenameValue(page.title);
    setIsRenaming(true);
    setShowMenu(false);
  };

  const handleRenameEnd = () => {
    if (renameValue.trim()) {
      renamePage(pageId, renameValue.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div>
      <div
        className={`sidebar-item group flex items-center h-7 rounded cursor-pointer relative ${
          isActive ? 'bg-notion-hover' : 'hover:bg-notion-hover'
        }`}
        style={{ paddingLeft }}
        onClick={() => navigateTo(pageId)}
        onDoubleClick={handleRenameStart}
      >
        {/* Expand toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleExpand(pageId); }}
          className={`w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 mr-0.5 flex-shrink-0 ${
            !hasChildren ? 'invisible' : ''
          }`}
        >
          <svg
            className={`w-3 h-3 text-notion-text-secondary transition-transform ${page.isExpanded ? 'rotate-90' : ''}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Icon */}
        <span className="text-sm mr-1.5 flex-shrink-0">{page.icon || (page.isDatabase ? '🗃️' : '📄')}</span>

        {/* Title */}
        {isRenaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameEnd}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRenameEnd();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-sm bg-white border border-notion-accent rounded px-1 outline-none min-w-0"
          />
        ) : (
          <span className="text-sm truncate flex-1 text-notion-text">
            {page.title || 'Untitled'}
          </span>
        )}

        {/* Actions */}
        <div className="sidebar-actions flex items-center gap-0.5 mr-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200"
            title="More actions"
          >
            <svg className="w-3.5 h-3.5 text-notion-text-secondary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); createPage(pageId); }}
            className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200"
            title="Add sub-page"
          >
            <svg className="w-3.5 h-3.5 text-notion-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Context Menu */}
        {showMenu && (
          <div
            className="absolute left-full top-0 ml-1 bg-white border border-notion-border rounded shadow-lg z-50 py-1 min-w-[140px]"
            onMouseLeave={() => setShowMenu(false)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleRenameStart(); }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover"
            >
              Rename
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); createPage(pageId); setShowMenu(false); }}
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover"
            >
              Add sub-page
            </button>
            <hr className="my-1 border-notion-border" />
            <button
              onClick={(e) => { e.stopPropagation(); deletePage(pageId); setShowMenu(false); }}
              className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Children */}
      {page.isExpanded && hasChildren && (
        <div>
          {page.childrenIds.map((childId) => (
            <PageTreeItem key={childId} pageId={childId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
