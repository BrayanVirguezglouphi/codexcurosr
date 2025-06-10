import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";

const EditableCell = ({
  value,
  onSave,
  onCancel,
  field,
  type = 'text',
  options = [],
  isEditing = false,
  onStartEdit,
  className = "",
  disabled = false
}) => {
  const [editValue, setEditValue] = useState(value || '');
  const [localIsEditing, setLocalIsEditing] = useState(isEditing);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  useEffect(() => {
    setLocalIsEditing(isEditing);
    if (isEditing && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setLocalIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setLocalIsEditing(false);
    onCancel && onCancel();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const formatDisplayValue = (val) => {
    if (!val) return '—';
    
    switch (type) {
      case 'date':
        if (val) {
          const date = new Date(val);
          return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
        }
        return '—';
      case 'currency':
        if (val && !isNaN(val)) {
          return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP'
          }).format(val);
        }
        return '$ 0';
      case 'select':
        const option = options.find(opt => opt.value === val);
        return option ? option.label : val;
      default:
        return val;
    }
  };

  if (disabled) {
    return (
      <div className={`p-2 text-gray-500 ${className}`}>
        {formatDisplayValue(value)}
      </div>
    );
  }

  if (!localIsEditing) {
    return (
      <div 
        className={`group relative p-2 cursor-pointer hover:bg-gray-50 rounded ${className}`}
        onClick={() => {
          setLocalIsEditing(true);
          onStartEdit && onStartEdit();
        }}
      >
        <div className="flex items-center justify-between">
          <span>{formatDisplayValue(value)}</span>
          <Edit className="h-3 w-3 opacity-0 group-hover:opacity-50 ml-2" />
        </div>
      </div>
    );
  }

  // Renderizar según el tipo de campo
  if (type === 'select') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Select value={editValue} onValueChange={setEditValue}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Input
        ref={inputRef}
        type={type === 'currency' ? 'number' : type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="h-8 text-xs"
        step={type === 'currency' ? '0.01' : undefined}
      />
      <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
        <Check className="h-3 w-3 text-green-600" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
        <X className="h-3 w-3 text-red-600" />
      </Button>
    </div>
  );
};

export default EditableCell; 