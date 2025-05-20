import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import { useStorage } from '@/lib/storage';

const Buyer = () => {
  const storage = useStorage();
  const [perfiles, setPerfiles] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [dialogoAbierto, setDialogoAbierto] = useState(false);
  const [perfilActual, setPerfilActual] = useState({
    titulo: '',
    industria: '',
    tamanoEmpresa: '',
    dolorPrincipal: '',
    presupuestoPromedio: '',
    criteriosDecision: ''
  });

  useEffect(() => {
    const perfilesGuardados = storage.getItems('perfiles_compradores');
    setPerfiles(perfilesGuardados);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (perfilActual.id) {
      const exito = storage.updateItem('perfiles_compradores', perfilActual.id, perfilActual);
      if (exito) {
        const perfilesActualizados = storage.getItems('perfiles_compradores');
        setPerfiles(perfilesActualizados);
        setDialogoAbierto(false);
        setPerfilActual({
          titulo: '',
          industria: '',
          tamanoEmpresa: '',
          dolorPrincipal: '',
          presupuestoPromedio: '',
          criteriosDecision: ''
        });
      }
    } else {
      const nuevoPerfil = storage.createItem('perfiles_compradores', perfilActual);
      if (nuevoPerfil) {
        const perfilesActualizados = storage.getItems('perfiles_compradores');
        setPerfiles(perfilesActualizados);
        setDialogoAbierto(false);
        setPerfilActual({
          titulo: '',
          industria: '',
          tamanoEmpresa: '',
          dolorPrincipal: '',
          presupuestoPromedio: '',
          criteriosDecision: ''
        });
      }
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este perfil?')) {
      const exito = storage.deleteItem('perfiles_compradores', id);
      if (exito) {
        const perfilesActualizados = storage.getItems('perfiles_compradores');
        setPerfiles(perfilesActualizados);
      }
    }
  };

  const perfilesFiltrados = perfiles.filter(perfil =>
    perfil.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    perfil.industria.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <Typography variant="h4" component="h1">Perfiles de Compradores</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogoAbierto(true)}
        >
          Nuevo Perfil
        </Button>
      </div>

      <Card>
        <CardHeader 
          title="Perfiles de Compradores"
          action={
            <TextField
              placeholder="Buscar perfiles..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ width: 300 }}
            />
          }
        />
        <CardContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Título/Cargo</TableCell>
                <TableCell>Industria</TableCell>
                <TableCell>Tamaño de Empresa</TableCell>
                <TableCell>Presupuesto</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {perfilesFiltrados.map((perfil) => (
                <TableRow key={perfil.id}>
                  <TableCell>{perfil.titulo}</TableCell>
                  <TableCell>{perfil.industria}</TableCell>
                  <TableCell>{perfil.tamanoEmpresa}</TableCell>
                  <TableCell>{perfil.presupuestoPromedio}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setPerfilActual(perfil);
                          setDialogoAbierto(true);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(perfil.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog 
        open={dialogoAbierto} 
        onClose={() => setDialogoAbierto(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {perfilActual.id ? 'Editar' : 'Nuevo'} Perfil de Comprador
          </DialogTitle>
          <DialogContent>
            <div className="space-y-4 mt-4">
              <TextField
                fullWidth
                label="Título/Cargo"
                value={perfilActual.titulo}
                onChange={(e) => setPerfilActual({...perfilActual, titulo: e.target.value})}
                required
              />
              <TextField
                fullWidth
                label="Industria"
                value={perfilActual.industria}
                onChange={(e) => setPerfilActual({...perfilActual, industria: e.target.value})}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Tamaño de Empresa</InputLabel>
                <Select
                  value={perfilActual.tamanoEmpresa}
                  onChange={(e) => setPerfilActual({...perfilActual, tamanoEmpresa: e.target.value})}
                  label="Tamaño de Empresa"
                >
                  <MenuItem value="Pequeña">Pequeña</MenuItem>
                  <MenuItem value="Mediana">Mediana</MenuItem>
                  <MenuItem value="Grande">Grande</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Dolor Principal"
                value={perfilActual.dolorPrincipal}
                onChange={(e) => setPerfilActual({...perfilActual, dolorPrincipal: e.target.value})}
                required
              />
              <TextField
                fullWidth
                label="Presupuesto Promedio"
                value={perfilActual.presupuestoPromedio}
                onChange={(e) => setPerfilActual({...perfilActual, presupuestoPromedio: e.target.value})}
                required
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Criterios de Decisión"
                value={perfilActual.criteriosDecision}
                onChange={(e) => setPerfilActual({...perfilActual, criteriosDecision: e.target.value})}
                required
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogoAbierto(false)}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
};

export default Buyer; 