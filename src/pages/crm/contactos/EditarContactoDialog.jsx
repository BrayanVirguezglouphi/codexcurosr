import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Building2,
  Users,
  Mail,
  Phone,
  UserCheck,
  Briefcase,
  Edit
} from 'lucide-react';

const EditarContactoDialog = ({ open, onClose, contacto, onContactoActualizado }) => {
  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm({
    defaultValues: {
      nombre_primero: '',
      nombre_segundo: '',
      apellido_primero: '',
      apellido_segundo: '',
      id_empresa: '',
      cargo: '',
      correo_corporativo: '',
      correo_personal: '',
      telefono: '',
      rol: '',
      id_buyer: ''
    }
  });
  const { toast } = useToast();

  // Estados para los catálogos
  const [empresas, setEmpresas] = useState([]);
  const [buyerPersonas, setBuyerPersonas] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Cargar catálogos al abrir el diálogo
  useEffect(() => {
    if (open) {
      cargarCatalogos();
    }
  }, [open]);

  // Cargar datos del contacto cuando cambie
  useEffect(() => {
    if (contacto && open) {
      console.log('Cargando datos del contacto:', contacto);
      
      reset({
        nombre_primero: contacto.nombre_primero || '',
        nombre_segundo: contacto.nombre_segundo || '',
        apellido_primero: contacto.apellido_primero || '',
        apellido_segundo: contacto.apellido_segundo || '',
        id_empresa: contacto.id_empresa?.toString() || '',
        cargo: contacto.cargo || '',
        correo_corporativo: contacto.correo_corporativo || '',
        correo_personal: contacto.correo_personal || '',
        telefono: contacto.telefono || '',
        rol: contacto.rol || '',
        id_buyer: contacto.id_buyer?.toString() || ''
      });
    }
  }, [contacto, open, reset]);

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      
      const [empresasData, buyerPersonasData] = await Promise.all([
        apiCall('/api/crm/empresas'),
        apiCall('/api/crm/buyer-personas')
      ]);
      
      setEmpresas(empresasData || []);
      setBuyerPersonas(buyerPersonasData || []);
      
      console.log('Catálogos cargados:', { empresas: empresasData, buyerPersonas: buyerPersonasData });
    } catch (error) {
      console.error('Error cargando catálogos:', error);
      toast({
        title: "Error",
        description: "Error al cargar los catálogos",
        variant: "destructive"
      });
    } finally {
      setLoadingCatalogos(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        nombre_primero: data.nombre_primero,
        nombre_segundo: data.nombre_segundo || null,
        apellido_primero: data.apellido_primero,
        apellido_segundo: data.apellido_segundo || null,
        id_empresa: data.id_empresa ? parseInt(data.id_empresa) : null,
        cargo: data.cargo || null,
        correo_corporativo: data.correo_corporativo || null,
        correo_personal: data.correo_personal || null,
        telefono: data.telefono || null,
        rol: data.rol || null,
        id_buyer: data.id_buyer ? parseInt(data.id_buyer) : null
      };

      console.log('Actualizando contacto:', contacto.id_persona, formattedData);
      
      const contactoActualizado = await apiCall(`/api/crm/contactos/${contacto.id_persona}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });

      toast({
        title: "¡Éxito!",
        description: "Contacto actualizado correctamente",
        variant: "success"
      });

      onContactoActualizado?.(contactoActualizado);
      onClose();
    } catch (error) {
      console.error('Error al actualizar contacto:', error);
      toast({
        title: "Error",
        description: error.message || "Error al actualizar el contacto",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!contacto) return null;

  // Opciones para los selects
  const opcionesEmpresas = empresas.map(empresa => ({
    value: empresa.id_empresa?.toString(),
    label: `${empresa.empresa}`,
    searchText: `${empresa.empresa} ${empresa.mercado?.segmento_mercado || ''} ${empresa.pais?.pais || ''}`
  }));

  const opcionesBuyerPersonas = buyerPersonas.map(buyer => ({
    value: buyer.id_buyer?.toString(),
    label: buyer.buyer,
    searchText: `${buyer.buyer} ${buyer.background || ''} ${buyer.metas || ''}`
  }));

  const opcionesRol = [
    { value: 'Decisor', label: 'Decisor' },
    { value: 'Influenciador', label: 'Influenciador' },
    { value: 'Usuario', label: 'Usuario' },
    { value: 'Comprador', label: 'Comprador' },
    { value: 'Bloqueador', label: 'Bloqueador' },
    { value: 'Coach', label: 'Coach' },
    { value: 'Campeón', label: 'Campeón' },
    { value: 'Guardián', label: 'Guardián' }
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Editar Contacto
          </DialogTitle>
          <DialogDescription>
            Modifique la información del contacto: {contacto.nombre_primero} {contacto.apellido_primero}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre_primero" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Primer Nombre *
                  </Label>
                  <Input
                    id="nombre_primero"
                    placeholder="Ej: Juan, María, Carlos..."
                    {...register('nombre_primero', { 
                      required: 'El primer nombre es requerido' 
                    })}
                  />
                  {errors.nombre_primero && (
                    <p className="text-sm text-red-500">{errors.nombre_primero.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre_segundo">Segundo Nombre</Label>
                  <Input
                    id="nombre_segundo"
                    placeholder="Ej: José, Elena, Luis..."
                    {...register('nombre_segundo')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido_primero" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Primer Apellido *
                  </Label>
                  <Input
                    id="apellido_primero"
                    placeholder="Ej: García, López, Martínez..."
                    {...register('apellido_primero', { 
                      required: 'El primer apellido es requerido' 
                    })}
                  />
                  {errors.apellido_primero && (
                    <p className="text-sm text-red-500">{errors.apellido_primero.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellido_segundo">Segundo Apellido</Label>
                  <Input
                    id="apellido_segundo"
                    placeholder="Ej: Rodríguez, Hernández, Jiménez..."
                    {...register('apellido_segundo')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información profesional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Información Profesional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_empresa" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Empresa
                  </Label>
                  <Select
                    value={watch('id_empresa')}
                    onValueChange={(value) => setValue('id_empresa', value)}
                    disabled={loadingCatalogos}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empresa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesEmpresas.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-gray-500">
                          No se encontraron empresas
                        </div>
                      ) : (
                        opcionesEmpresas.map((empresa) => (
                          <SelectItem key={empresa.value} value={empresa.value}>
                            {empresa.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Cargo/Posición
                  </Label>
                  <Input
                    id="cargo"
                    placeholder="Ej: CEO, Gerente de TI, Director de Ventas..."
                    {...register('cargo')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rol" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Rol en Proceso de Compra
                  </Label>
                  <Select
                    value={watch('rol')}
                    onValueChange={(value) => setValue('rol', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol..." />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesRol.map((rol) => (
                        <SelectItem key={rol.value} value={rol.value}>
                          {rol.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_buyer" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Buyer Persona
                  </Label>
                  <Select
                    value={watch('id_buyer')}
                    onValueChange={(value) => setValue('id_buyer', value)}
                    disabled={loadingCatalogos}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar buyer persona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesBuyerPersonas.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-gray-500">
                          No se encontraron buyer personas
                        </div>
                      ) : (
                        opcionesBuyerPersonas.map((buyer) => (
                          <SelectItem key={buyer.value} value={buyer.value}>
                            {buyer.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="correo_corporativo" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo Corporativo
                  </Label>
                  <Input
                    id="correo_corporativo"
                    type="email"
                    placeholder="juan.garcia@empresa.com"
                    {...register('correo_corporativo', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Formato de correo inválido'
                      }
                    })}
                  />
                  {errors.correo_corporativo && (
                    <p className="text-sm text-red-500">{errors.correo_corporativo.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correo_personal" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Correo Personal
                  </Label>
                  <Input
                    id="correo_personal"
                    type="email"
                    placeholder="juan.garcia@gmail.com"
                    {...register('correo_personal', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Formato de correo inválido'
                      }
                    })}
                  />
                  {errors.correo_personal && (
                    <p className="text-sm text-red-500">{errors.correo_personal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </Label>
                  <Input
                    id="telefono"
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    {...register('telefono')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Actualizar Contacto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditarContactoDialog; 