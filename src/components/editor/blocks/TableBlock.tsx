import { useEditorStore } from '@/store/editor-store';

interface TableBlockProps {
  blockId: string;
}

export function TableBlock({ blockId }: TableBlockProps) {
  const block = useEditorStore((s) => s.blocks[blockId]);
  const updateBlockContent = useEditorStore((s) => s.updateBlockContent);

  const rows = block?.content.rows || [['', '', ''], ['', '', ''], ['', '', '']];

  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    const newRows = rows.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => (ci === colIdx ? value : cell)) : [...row]
    );
    updateBlockContent(blockId, { rows: newRows });
  };

  const addRow = () => {
    const cols = rows[0]?.length || 3;
    const newRows = [...rows, Array(cols).fill('')];
    updateBlockContent(blockId, { rows: newRows });
  };

  const addColumn = () => {
    const newRows = rows.map((row) => [...row, '']);
    updateBlockContent(blockId, { rows: newRows });
  };

  const deleteRow = (idx: number) => {
    if (rows.length <= 1) return;
    const newRows = rows.filter((_, i) => i !== idx);
    updateBlockContent(blockId, { rows: newRows });
  };

  const deleteColumn = (idx: number) => {
    if ((rows[0]?.length || 0) <= 1) return;
    const newRows = rows.map((row) => row.filter((_, i) => i !== idx));
    updateBlockContent(blockId, { rows: newRows });
  };

  return (
    <div className="py-2 overflow-x-auto" data-block-id={blockId}>
      <table className="simple-table">
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="group/row">
              {row.map((cell, colIdx) => (
                <td key={colIdx} className="relative">
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => updateCell(rowIdx, colIdx, (e.target as HTMLElement).textContent || '')}
                    className="outline-none min-h-[24px] text-sm"
                  >
                    {cell}
                  </div>
                </td>
              ))}
              {/* Delete row button */}
              <td className="border-0 w-6 p-0">
                <button
                  onClick={() => deleteRow(rowIdx)}
                  className="opacity-0 group-hover/row:opacity-100 w-5 h-5 text-xs text-red-400 hover:text-red-600 transition-opacity"
                  title="Delete row"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex gap-2 mt-2">
        <button
          onClick={addRow}
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          + Row
        </button>
        <button
          onClick={addColumn}
          className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          + Column
        </button>
      </div>
    </div>
  );
}
