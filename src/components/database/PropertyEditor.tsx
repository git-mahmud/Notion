import { useState } from 'react';
import { useDatabaseStore } from '@/store/database-store';
import { generateId } from '@/lib/id';
import type { PropertyType, SelectOption } from '@/types';

interface PropertyEditorProps {
  propertyId: string;
  onClose: () => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' },
  { value: 'multi_select', label: 'Multi-select' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'relation', label: 'Relation' },
  { value: 'rollup', label: 'Rollup' },
  { value: 'formula', label: 'Formula' },
];

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#6b7280', '#14b8a6', '#f43f5e',
];

export function PropertyEditor({ propertyId, onClose }: PropertyEditorProps) {
  const properties = useDatabaseStore((s) => s.properties);
  const updateProperty = useDatabaseStore((s) => s.updateProperty);
  const deleteProperty = useDatabaseStore((s) => s.deleteProperty);
  const addSelectOption = useDatabaseStore((s) => s.addSelectOption);

  const prop = properties[propertyId];
  const [name, setName] = useState(prop?.name ?? '');
  const [newOptionName, setNewOptionName] = useState('');
  const [formula, setFormula] = useState(prop?.config.formula ?? '');

  if (!prop) return null;

  const handleNameChange = (newName: string) => {
    setName(newName);
    updateProperty(propertyId, { name: newName });
  };

  const handleTypeChange = (newType: PropertyType) => {
    updateProperty(propertyId, { type: newType, config: {} });
  };

  const handleAddOption = () => {
    if (!newOptionName.trim()) return;
    const option: SelectOption = {
      id: generateId(),
      name: newOptionName.trim(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    addSelectOption(propertyId, option);
    setNewOptionName('');
  };

  const handleFormulaChange = (f: string) => {
    setFormula(f);
    updateProperty(propertyId, { config: { ...prop.config, formula: f } });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/20" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl border border-notion-border w-80 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-notion-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-notion-text">Edit Property</h3>
          <button onClick={onClose} className="text-notion-text-secondary hover:text-notion-text">✕</button>
        </div>

        <div className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs text-notion-text-secondary block mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-notion-border rounded outline-none focus:border-notion-accent"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs text-notion-text-secondary block mb-1">Type</label>
            <select
              value={prop.type}
              onChange={(e) => handleTypeChange(e.target.value as PropertyType)}
              className="w-full px-2 py-1.5 text-sm border border-notion-border rounded outline-none"
            >
              {PROPERTY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Select options */}
          {(prop.type === 'select' || prop.type === 'multi_select') && (
            <div>
              <label className="text-xs text-notion-text-secondary block mb-1">Options</label>
              <div className="space-y-1 mb-2">
                {(prop.config.options ?? []).map((opt) => (
                  <div key={opt.id} className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: opt.color }} />
                    <span>{opt.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-1">
                <input
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddOption(); }}
                  placeholder="New option..."
                  className="flex-1 px-2 py-1 text-sm border border-notion-border rounded outline-none"
                />
                <button onClick={handleAddOption} className="px-2 py-1 text-sm bg-notion-accent text-white rounded">
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Formula */}
          {prop.type === 'formula' && (
            <div>
              <label className="text-xs text-notion-text-secondary block mb-1">Formula</label>
              <textarea
                value={formula}
                onChange={(e) => handleFormulaChange(e.target.value)}
                placeholder='e.g. if(prop("Status") == "Done", 1, 0)'
                className="w-full px-2 py-1.5 text-sm font-mono border border-notion-border rounded outline-none resize-none h-20"
              />
              <p className="text-xs text-notion-text-secondary mt-1">
                Functions: if, prop, sum, concat, now, dateAdd, dateBetween, upper, lower, length, contains, abs, round
              </p>
            </div>
          )}

          {/* Relation config */}
          {prop.type === 'relation' && (
            <div>
              <label className="text-xs text-notion-text-secondary block mb-1">Related Database ID</label>
              <input
                value={prop.config.relatedDatabaseId ?? ''}
                onChange={(e) => updateProperty(propertyId, { config: { ...prop.config, relatedDatabaseId: e.target.value } })}
                placeholder="Database page ID"
                className="w-full px-2 py-1.5 text-sm border border-notion-border rounded outline-none"
              />
            </div>
          )}

          {/* Delete */}
          <button
            onClick={() => { deleteProperty(propertyId); onClose(); }}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Delete property
          </button>
        </div>
      </div>
    </div>
  );
}
