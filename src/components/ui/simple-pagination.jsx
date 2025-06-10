import React from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SimplePagination = ({ 
  data = [], 
  itemsPerPage = 10, 
  currentPage = 1, 
  onPageChange,
  onItemsPerPageChange
}) => {
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  
  const startItem = startIndex + 1;
  const endItem = Math.min(endIndex, data.length);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const goToPrevPage = () => {
    if (canGoPrev) {
      onPageChange(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (canGoNext) {
      onPageChange(currentPage + 1);
    }
  };

  if (data.length === 0) {
    return {
      paginatedData: [],
      paginationComponent: null
    };
  }

  const paginationComponent = (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
      {/* Información de registros */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-700">
          Mostrando <span className="font-medium">{startItem}</span> a{' '}
          <span className="font-medium">{endItem}</span> de{' '}
          <span className="font-medium">{data.length}</span> registros
        </div>
        
        {/* Selector de registros por página */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Mostrar:</span>
          <Select 
            value={itemsPerPage.toString()} 
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="w-20 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="30">30</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-700">por página</span>
        </div>
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevPage}
          disabled={!canGoPrev}
          className="h-8"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        <span className="text-sm text-gray-700 px-3">
          Página {currentPage} de {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={!canGoNext}
          className="h-8"
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );

  return {
    paginatedData: currentData,
    paginationComponent
  };
};

export default SimplePagination; 