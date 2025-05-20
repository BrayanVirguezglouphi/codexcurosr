import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Alert,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useForm } from 'react-hook-form';

const Cargos = () => {
  const [cargos, setCargos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCargo, setEditingCargo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    // Cargar datos iniciales
    fetchCargos();
  }, []);

  const fetchCargos = async () => {
    try {
      const response = await fetch('/api/cargos');
      const data = await response.json();
      setCargos(data);
    } catch (error) {
      setAlertMessage('Error al cargar los cargos');
    }
  };

  const handleOpenDialog = (cargo = null) => {
    setEditingCargo(cargo);
    reset(cargo || {});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCargo(null);
    reset();
  };

  const onSubmit = async (data) => {
    try {
      const method = editingCargo ? 'PUT' : 'POST';
      const url = editingCargo 
        ? `/api/cargos/${editingCargo.id}`
        : '/api/cargos';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setAlertMessage(editingCargo ? 'Cargo actualizado con éxito' : 'Cargo creado con éxito');
        fetchCargos();
        handleCloseDialog();
      }
    } catch (error) {
      setAlertMessage('Error al guardar el cargo');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cargo?')) {
      try {
        const response = await fetch(`/api/cargos/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setAlertMessage('Cargo eliminado con éxito');
          fetchCargos();
        }
      } catch (error) {
        setAlertMessage('Error al eliminar el cargo');
      }
    }
  };

  const filteredCargos = cargos.filter(cargo =>
    cargo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cargo.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4">
      <Card className="mb-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Gestión de Cargos y Funciones</h1>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Nuevo Cargo
            </Button>
          </div>

          <TextField
            fullWidth
            label="Buscar"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          {alertMessage && (
            <Alert 
              severity="info" 
              onClose={() => setAlertMessage('')}
              className="mb-4"
            >
              {alertMessage}
            </Alert>
          )}

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre del Cargo</TableCell>
                <TableCell>Departamento</TableCell>
                <TableCell>Nivel</TableCell>
                <TableCell>Funciones</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCargos.map((cargo) => (
                <TableRow key={cargo.id}>
                  <TableCell>{cargo.nombre}</TableCell>
                  <TableCell>{cargo.departamento}</TableCell>
                  <TableCell>{cargo.nivel}</TableCell>
                  <TableCell>{cargo.funciones}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(cargo)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(cargo.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editingCargo ? 'Editar Cargo' : 'Nuevo Cargo'}
          </DialogTitle>
          <DialogContent>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <TextField
                fullWidth
                label="Nombre del Cargo"
                {...register('nombre', { required: 'Este campo es requerido' })}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
              />
              <TextField
                fullWidth
                label="Departamento"
                {...register('departamento', { required: 'Este campo es requerido' })}
                error={!!errors.departamento}
                helperText={errors.departamento?.message}
              />
              <TextField
                fullWidth
                label="Nivel"
                {...register('nivel', { required: 'Este campo es requerido' })}
                error={!!errors.nivel}
                helperText={errors.nivel?.message}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Funciones"
                {...register('funciones', { required: 'Este campo es requerido' })}
                error={!!errors.funciones}
                helperText={errors.funciones?.message}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingCargo ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default Cargos; 