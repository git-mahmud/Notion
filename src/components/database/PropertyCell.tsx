import { useState } from 'react';
import { useDatabaseStore } from '@/store/database-store';

interface PropertyCellProps {
  pageId: string;
  propertyId: string;
}

export function PropertyCell({ pageId, propertyId }: PropertyCellProps) {
  const properties = useDatabaseStore((s) => s.properties);
  const getPageProperty = useDatabaseStore((s) => s.getPageProperty);
  const setPageProperty = useDatabaseStore((s) => s.setPageProperty);
  const evaluateFormulaProperty = useDatabaseStore((s) => s.evaluateFormulaProperty);
  const evaluateRollup = useDatabaseStore((s) => s.evaluateRollup);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const prop = properties[propertyId];
  if (!prop) return null;

  const value = getPageProperty(pageId, propertyId);

  // Formula and rollup are read-only computed values
  if (prop.type === 'formula') {
    const result = evaluateFormulaProperty(pageId, propertyId);
    return <span className="text-sm text-notion-text-secondary">{String(result ?? '')}</span>;
  }

  if (prop.type === 'rollup') {
    const result = evaluateRollup(pageId, propertyId);
    return <span className="text-sm text-notion-text-secondary">{String(result ?? '')}</span>;
  }

  const handleStartEdit = () => {
    setEditValue(value != null ? String(value) : '');
    setIsEditing(true);
  };

  const handleSave = () => {
    let parsed: any = editValue;
    if (prop.type === 'number') parsed = editValue ? Number(editValue) : null;
    if (prop.type === 'checkbox') parsed = !value;
    setPageProperty(pageId, propertyId, parsed);
    setIsEditing(false);
  };

  // Checkbox
  if (prop.type === 'checkbox') {
    return (
      <button
        onClick={() => setPageProperty(pageId, propertyId, !value)}
        className={`w-4 h-4 border rounded transition-colors ${
          value ? 'bg-notion-accent border-notion-accent' : 'border-gray-400'
        }`}
      >
        {value && (
          <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    );
  }

  // Select
  if (prop.type === 'select') {
    const options = prop.config.options || [];
    const selectedOption = options.find((o) => o.name === value);

    return (
      <div className="relative group">
        <button
          onClick={handleStartEdit}
          className="text-sm px-2 py-0.5 rounded"
          style={{ backgroundColor: selectedOption?.color ? `${selectedOption.color}20` : undefined }}
        >
          {selectedOption?.name || <span className="text-gray-400">Empty</span>}
        </button>
        {isEditing && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-notion-border rounded shadow-lg z-50 py-1 min-w-[120px]">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setPageProperty(pageId, propertyId, opt.name); setIsEditing(false); }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover"
              >
                <span
                  className="inline-block w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: opt.color }}
                />
                {opt.name}
              </button>
            ))}
            <button
              onClick={() => { setPageProperty(pageId, propertyId, null); setIsEditing(false); }}
              className="w-full text-left px-3 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-hover"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    );
  }

  // Multi-select
  if (prop.type === 'multi_select') {
    const selected = Array.isArray(value) ? value : [];
    const options = prop.config.options || [];

    return (
      <div className="relative group">
        <div className="flex flex-wrap gap-1" onClick={handleStartEdit}>
          {selected.length > 0 ? (
            selected.map((val) => {
              const opt = options.find((o) => o.name === val);
              return (
                <span
                  key={val as string}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: opt?.color ? `${opt.color}20` : '#f0f0f0' }}
                >
                  {val as string}
                </span>
              );
            })
          ) : (
            <span className="text-sm text-gray-400 cursor-pointer">Empty</span>
          )}
        </div>
        {isEditing && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-notion-border rounded shadow-lg z-50 py-1 min-w-[120px]">
            {options.map((opt) => {
              const isSelected = selected.includes(opt.name);
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    const newVal = isSelected
                      ? selected.filter((s) => s !== opt.name)
                      : [...selected, opt.name];
                    setPageProperty(pageId, propertyId, newVal);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm hover:bg-notion-hover flex items-center gap-2"
                >
                  <span className={`w-3 h-3 border rounded ${isSelected ? 'bg-notion-accent border-notion-accent' : 'border-gray-400'}`} />
                  {opt.name}
                </button>
              );
            })}
            <button
              onClick={() => setIsEditing(false)}
              className="w-full text-left px-3 py-1.5 text-sm text-notion-text-secondary hover:bg-notion-hover"
            >
              Done
            </button>
          </div>
        )}
      </div>
    );
  }

  // Date
  if (prop.type === 'date') {
    return (
      <input
        type="date"
        value={typeof value === 'string' ? value : ''}
        onChange={(e) => setPageProperty(pageId, propertyId, e.target.value)}
        className="text-sm text-notion-text bg-transparent outline-none border-none"
      />
    );
  }

  // URL
  if (prop.type === 'url') {
    if (isEditing) {
      return (
        <input
          autoFocus
          type="url"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          className="text-sm w-full outline-none border border-notion-border rounded px-1"
        />
      );
    }
    return (
      <button onClick={handleStartEdit} className="text-sm text-notion-accent hover:underline truncate max-w-[200px]">
        {(value as string) || <span className="text-gray-400">Empty</span>}
      </button>
    );
  }

  // Text / Number (default inline edit)
  if (isEditing) {
    return (
      <input
        autoFocus
        type={prop.type === 'number' ? 'number' : 'text'}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false); }}
        className="text-sm w-full outline-none border border-notion-border rounded px-1"
      />
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      className="text-sm text-notion-text text-left w-full truncate"
    >
      {value != null && value !== '' ? String(value) : <span className="text-gray-400">Empty</span>}
    </button>
  );
}
