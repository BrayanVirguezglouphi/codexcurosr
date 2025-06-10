import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Filter, 
  Search,
  Check,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react';

const FilterableTableHeader = ({ 
  title, 
  data = [], 
  field, 
  onSort, 
  onFilter, 
  sortDirection,
  activeFilters = []
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [selectAll, setSelectAll] = useState(true);
  const [filterPosition, setFilterPosition] = useState({ top: 0, right: 0 });
  const headerRef = useRef(null);

  // Calcular posición del filtro
  const calculateFilterPosition = () => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      const top = Math.min(rect.bottom + 5, window.innerHeight - 450);
      const right = Math.max(window.innerWidth - rect.right, 20);
      setFilterPosition({ top, right });
    }
  };

  // Función para obtener valor anidado (para campos como tipoTransaccion.tipo_transaccion)
  const getNestedValue = (obj, path) => {
    if (!path || typeof path !== 'string') return obj;
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Obtener valores únicos de la columna
  const uniqueValues = [...new Set(data.map(item => {
    let value = getNestedValue(item, field);
    
    // Manejar casos específicos según el campo
    if (field === 'nombre_completo') {
      // Este campo es calculado, ya viene procesado
      value = value || '(Vacío)';
    }
    // Manejar fechas - formatear como en la página principal
    else if (field === 'fecha_radicado' || field === 'fecha_estimada_pago' || field === 'fecha_transaccion') {
      if (!value) return '(Vacío)';
      const fecha = new Date(value);
      value = fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    // Manejar monedas - formatear como en la página principal
    else if (field === 'subtotal_facturado_moneda' || field === 'valor_tax' || field === 'valor_total_transaccion' || field === 'trm_moneda_base') {
      if (!value || value === 0) return '$ 0';
      value = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP'
      }).format(value);
    }
    // Manejar booleanos para estados
    else if (field === 'registro_validado') {
      return value ? 'Validada' : 'Pendiente';
    }
    else if (field === 'registro_auxiliar' || field === 'aplica_retencion' || field === 'aplica_impuestos') {
      return value ? 'Sí' : 'No';
    }
    
    if (value === null || value === undefined || value === '') return '(Vacío)';
    return String(value);
  }))].sort();

  // Filtrar valores basado en búsqueda
  const filteredValues = uniqueValues.filter(value =>
    value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Inicializar selectedFilters cuando cambien activeFilters
  useEffect(() => {
    if (activeFilters.length === 0 || activeFilters.length === uniqueValues.length) {
      // Si no hay filtros activos o están todos seleccionados, mostrar todos
      setSelectedFilters(new Set(uniqueValues));
      setSelectAll(true);
    } else {
      // Si hay filtros específicos, mostrar solo esos
      setSelectedFilters(new Set(activeFilters));
      setSelectAll(false);
    }
  }, [activeFilters.length, uniqueValues.length]);

  // Recalcular posición si la ventana cambia de tamaño
  useEffect(() => {
    const handleResize = () => {
      if (isFilterOpen) {
        calculateFilterPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isFilterOpen]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedFilters(new Set(uniqueValues));
      setSelectAll(true);
    } else {
      setSelectedFilters(new Set());
      setSelectAll(false);
    }
  };

  const handleFilterToggle = (value) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(value)) {
      newFilters.delete(value);
    } else {
      newFilters.add(value);
    }
    setSelectedFilters(newFilters);
    
    // Actualizar el estado de "Seleccionar todo"
    if (newFilters.size === 0) {
      setSelectAll(false);
    } else if (newFilters.size === uniqueValues.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  const applyFilters = () => {
    const filtersArray = Array.from(selectedFilters);
    // Si están todos seleccionados o no hay ninguno, limpiar filtros
    if (filtersArray.length === uniqueValues.length || filtersArray.length === 0) {
      onFilter(field, []);
    } else {
      onFilter(field, filtersArray);
    }
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setSelectedFilters(new Set(uniqueValues));
    setSelectAll(true);
    onFilter(field, []); // Esto debería eliminar el filtro completamente
    setIsFilterOpen(false);
  };

  const handleSort = (direction) => {
    onSort(field, direction);
  };

  // Verificar si esta columna específica tiene filtros activos
  // Un filtro está activo si:
  // 1. Hay filtros seleccionados Y
  // 2. No están todos los valores únicos seleccionados (es decir, hay algún filtro aplicado)
  const hasActiveFilters = activeFilters.length > 0 && activeFilters.length < uniqueValues.length;

  return (
    <div className="flex items-center justify-between group relative" ref={headerRef}>
      <span className="font-medium">{title}</span>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`opacity-0 group-hover:opacity-100 transition-opacity ${hasActiveFilters ? 'opacity-100 text-blue-600 bg-blue-50' : ''}`}
          >
            <ChevronDown className="h-4 w-4" />
            {hasActiveFilters && <Filter className="h-3 w-3 ml-1 text-blue-600" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleSort('asc')}>
            <SortAsc className="mr-2 h-4 w-4" />
            Ordenar A → Z
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSort('desc')}>
            <SortDesc className="mr-2 h-4 w-4" />
            Ordenar Z → A
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onSelect={(e) => {
              e.preventDefault();
              calculateFilterPosition();
              setIsFilterOpen(true);
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                {activeFilters.length}
              </span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Overlay de filtros - posicionado fuera de la tabla */}
      {isFilterOpen && (
        <>
          {/* Backdrop para cerrar al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsFilterOpen(false)}
          />
          
          {/* Panel de filtros */}
          <div 
            className="fixed bg-white border rounded-lg shadow-xl w-72 z-50 max-h-96"
            style={{
              top: `${filterPosition.top}px`,
              right: `${filterPosition.right}px`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b">
              <div className="flex items-center space-x-2 mb-3">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`select-all-${field}`}
                  checked={selectAll}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor={`select-all-${field}`} className="text-sm font-medium cursor-pointer">
                  Seleccionar todo
                </label>
              </div>
            </div>
            
            <div className="max-h-48 overflow-y-auto p-2">
              {filteredValues.map((value) => (
                <div 
                  key={value} 
                  className="flex items-center space-x-2 py-1 px-1 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => handleFilterToggle(value)}
                >
                  <Checkbox
                    id={`filter-${field}-${value}`}
                    checked={selectedFilters.has(value)}
                    onCheckedChange={() => handleFilterToggle(value)}
                  />
                  <label 
                    htmlFor={`filter-${field}-${value}`} 
                    className="text-sm flex-1 cursor-pointer"
                  >
                    {value}
                  </label>
                </div>
              ))}
              
              {filteredValues.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-2">
                  No se encontraron resultados
                </div>
              )}
            </div>
            
            <div className="p-3 border-t flex justify-between">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
              <Button size="sm" onClick={applyFilters}>
                <Check className="h-3 w-3 mr-1" />
                Aplicar ({selectedFilters.size})
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FilterableTableHeader; 