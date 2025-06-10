import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, Eye, EyeOff } from 'lucide-react';

const ColumnSelector = ({ 
  availableColumns, 
  visibleColumns, 
  onColumnsChange,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColumnToggle = (columnKey) => {
    const newVisibleColumns = { ...visibleColumns };
    newVisibleColumns[columnKey] = !newVisibleColumns[columnKey];
    onColumnsChange(newVisibleColumns);
  };

  const showAllColumns = () => {
    const allVisible = {};
    availableColumns.forEach(col => {
      allVisible[col.key] = true;
    });
    onColumnsChange(allVisible);
  };

  const hideAllColumns = () => {
    const allHidden = {};
    availableColumns.forEach(col => {
      allHidden[col.key] = false;
    });
    onColumnsChange(allHidden);
  };

  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`${className}`}
        >
          <Settings className="mr-2 h-4 w-4" />
          Columnas ({visibleCount}/{availableColumns.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mostrar/Ocultar Columnas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Acciones rápidas */}
        <div className="px-2 py-1 flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={showAllColumns}
            className="flex-1 text-xs"
          >
            <Eye className="mr-1 h-3 w-3" />
            Todas
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={hideAllColumns}
            className="flex-1 text-xs"
          >
            <EyeOff className="mr-1 h-3 w-3" />
            Ninguna
          </Button>
        </div>
        
        <DropdownMenuSeparator />
        
        {/* Lista de columnas */}
        <div className="max-h-64 overflow-y-auto">
          {availableColumns.map((column) => (
            <DropdownMenuItem 
              key={column.key} 
              className="flex items-center space-x-2 cursor-pointer"
              onSelect={(e) => e.preventDefault()}
              onClick={() => handleColumnToggle(column.key)}
            >
              <Checkbox
                id={`column-${column.key}`}
                checked={visibleColumns[column.key]}
                onCheckedChange={() => handleColumnToggle(column.key)}
              />
              <label 
                htmlFor={`column-${column.key}`} 
                className="flex-1 cursor-pointer text-sm"
              >
                {column.label}
              </label>
              {column.required && (
                <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                  Req
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1 text-xs text-gray-500">
          {visibleCount} de {availableColumns.length} columnas visibles
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ColumnSelector; 