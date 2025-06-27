import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const EditableCell = ({
  value,
  displayValue,
  onSave,
  onCancel,
  field,
  type = 'text',
  options = [],
  isEditing = false,
  onStartEdit,
  className = "",
  disabled = false,
  validationRules = {}
}) => {
  const [editValue, setEditValue] = useState(value || '');
  const [localIsEditing, setLocalIsEditing] = useState(isEditing);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    setEditValue(value || '');
  }, [value]);

  useEffect(() => {
    setLocalIsEditing(isEditing);
    if (isEditing && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isEditing]);

  const validateValue = (val) => {
    setError(null);
    
    if (validationRules.required && !val) {
      setError('Este campo es requerido');
      return false;
    }

    switch (type) {
      case 'currency':
      case 'number':
        const num = parseFloat(val);
        if (isNaN(num)) {
          setError('Debe ser un número válido');
          return false;
        }
        if (validationRules.min !== undefined && num < validationRules.min) {
          setError(`El valor mínimo es ${validationRules.min}`);
          return false;
        }
        if (validationRules.max !== undefined && num > validationRules.max) {
          setError(`El valor máximo es ${validationRules.max}`);
          return false;
        }
        break;

      case 'date':
        const date = new Date(val);
        if (isNaN(date.getTime())) {
          setError('Fecha inválida');
          return false;
        }
        if (validationRules.minDate && date < new Date(validationRules.minDate)) {
          setError(`La fecha debe ser posterior a ${new Date(validationRules.minDate).toLocaleDateString()}`);
          return false;
        }
        if (validationRules.maxDate && date > new Date(validationRules.maxDate)) {
          setError(`La fecha debe ser anterior a ${new Date(validationRules.maxDate).toLocaleDateString()}`);
          return false;
        }
        break;

      case 'select':
        if (!options.some(opt => opt.value === val)) {
          setError('Opción no válida');
          return false;
        }
        break;

      default:
        if (validationRules.maxLength && val.length > validationRules.maxLength) {
          setError(`Máximo ${validationRules.maxLength} caracteres`);
          return false;
        }
        if (validationRules.pattern && !validationRules.pattern.test(val)) {
          setError('Formato inválido');
          return false;
        }
    }

    return true;
  };

  const handleSave = () => {
    if (!validateValue(editValue)) {
      toast({
        title: "Error de validación",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (editValue !== value) {
      onSave(editValue);
    }
    setLocalIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setLocalIsEditing(false);
    setError(null);
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
    if (displayValue !== undefined) {
      return displayValue || '—';
    }
    
    if (!val && val !== 0) return '—';
    
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
        if (val !== undefined && !isNaN(val)) {
          return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(val);
        }
        return '$ 0,00';
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

  const renderInput = () => {
    switch (type) {
      case 'select':
        return (
          <Select value={editValue} onValueChange={setEditValue}>
            <SelectTrigger className={`h-8 text-xs ${error ? 'border-red-500' : ''}`}>
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
        );

      case 'date':
        return (
          <Input
            ref={inputRef}
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`h-8 text-xs ${error ? 'border-red-500' : ''}`}
          />
        );

      case 'currency':
        return (
          <Input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`h-8 text-xs ${error ? 'border-red-500' : ''}`}
            step="0.01"
            min={validationRules.min}
            max={validationRules.max}
          />
        );

      default:
        return (
          <Input
            ref={inputRef}
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`h-8 text-xs ${error ? 'border-red-500' : ''}`}
            maxLength={validationRules.maxLength}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <div className={`flex items-center gap-1 ${className}`}>
        {renderInput()}
        <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
          <Check className="h-3 w-3 text-green-600" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
          <X className="h-3 w-3 text-red-600" />
        </Button>
      </div>
      {error && (
        <div className="text-xs text-red-500 px-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default EditableCell; 