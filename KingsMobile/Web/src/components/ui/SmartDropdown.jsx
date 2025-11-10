import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

export function SmartDropdown({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  placeholder, 
  required = false,
  allowAddNew = true 
}) {
  const [showAddNew, setShowAddNew] = useState(false);
  const [newOption, setNewOption] = useState('');

  const handleAddNew = () => {
    if (newOption.trim()) {
      // Call onChange with the new value
      onChange({
        target: {
          name,
          value: newOption.trim()
        }
      });
      setNewOption('');
      setShowAddNew(false);
    }
  };

  const handleSelectChange = (e) => {
    if (e.target.value === '__ADD_NEW__') {
      setShowAddNew(true);
    } else {
      onChange(e);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {!showAddNew ? (
        <select
          name={name}
          value={value || ''}
          onChange={handleSelectChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required={required}
        >
          <option value="">{placeholder || `Select ${label}`}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
          {allowAddNew && (
            <option value="__ADD_NEW__" className="font-medium text-blue-600">
              + Add New {label}
            </option>
          )}
        </select>
      ) : (
        <div className="flex space-x-2">
          <Input
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder={`Enter new ${label.toLowerCase()}`}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddNew();
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddNew}
            disabled={!newOption.trim()}
            className="px-3"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setShowAddNew(false);
              setNewOption('');
            }}
            className="px-3"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
