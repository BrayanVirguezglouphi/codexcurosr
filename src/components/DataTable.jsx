
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Search, Plus, FileDown, Filter } from 'lucide-react';
import { Menu } from '@headlessui/react';
import { ChevronDown, ArrowDownAZ, ArrowUpZA } from 'lucide-react';

const DataTable = ({ 
  data, 
  columns, 
  onEdit, 
  onDelete, 
  onAdd,
  title,
  description
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtrar datos según el término de búsqueda
  const filteredData = data.filter(item => {
    return columns.some(column => {
      const value = item[column.accessor];
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Detectar si el usuario ya definió una columna de acciones personalizada
  const tieneColumnaAcciones = columns.some(col => col.accessor === 'acciones');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {title && <h2 className="text-xl font-bold">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-8 w-full sm:w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={onAdd} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.accessor} className={column.className}>
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.accessor !== 'acciones' && (
                      <Menu as="div" className="relative inline-block text-left">
                        <Menu.Button className="ml-1 p-1 rounded hover:bg-accent focus:outline-none">
                          <ChevronDown className="h-4 w-4" />
                        </Menu.Button>
                        <Menu.Items className="absolute z-10 mt-2 w-40 origin-top-right rounded-md bg-popover shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            {({ active }) => (
                              <button className={`flex items-center w-full px-2 py-2 text-sm ${active ? 'bg-accent' : ''}`}> <ArrowDownAZ className="h-4 w-4 mr-2" /> Ordenar A → Z </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button className={`flex items-center w-full px-2 py-2 text-sm ${active ? 'bg-accent' : ''}`}> <ArrowUpZA className="h-4 w-4 mr-2" /> Ordenar Z → A </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button className={`flex items-center w-full px-2 py-2 text-sm ${active ? 'bg-accent' : ''}`}> <Filter className="h-4 w-4 mr-2" /> Filtros </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Menu>
                    )}
                  </div>
                </TableHead>
              ))}
              {!tieneColumnaAcciones && (
                <TableHead className="w-[100px]">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={`${row.id}-${column.accessor}`} className={column.cellClassName}>
                      {column.cell ? column.cell(row) : row[column.accessor]}
                    </TableCell>
                  ))}
                  {!tieneColumnaAcciones && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(row)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(row.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + (tieneColumnaAcciones ? 0 : 1)} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} de {filteredData.length}
          </p>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DataTable;
