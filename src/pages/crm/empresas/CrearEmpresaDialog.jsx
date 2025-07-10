import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { apiCall } from '@/config/api';
import { useForm } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Globe,
  MapPin,
  Users,
  ExternalLink,
  FileText,
  Linkedin
} from 'lucide-react';

const CrearEmpresaDialog = ({ open, onClose, onEmpresaCreada }) => {
  const { register, handleSubmit, formState: { errors }, reset, control, setValue, watch } = useForm({
    defaultValues: {
      empresa: '',
      id_mercado: '',
      id_pais: '',
      tamano_empleados: '',
      website: '',
      linkedin: '',
      observaciones: ''
    }
  });
  const { toast } = useToast();

  // Estados para los catálogos
  const [mercados, setMercados] = useState([]);
  const [paises, setPaises] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  // Cargar catálogos al abrir el diálogo
  useEffect(() => {
    if (open) {
      cargarCatalogos();
    }
  }, [open]);

  const cargarCatalogos = async () => {
    try {
      setLoadingCatalogos(true);
      
      const [mercadosData, paisesData] = await Promise.all([
        apiCall('/api/crm/mercados'),
        apiCall('/api/catalogos/paises')
      ]);
      
      setMercados(mercadosData || []);
      setPaises(paisesData || []);
      
      console.log('Catálogos cargados:', { mercados: mercadosData, paises: paisesData });
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
        empresa: data.empresa,
        id_mercado: data.id_mercado ? parseInt(data.id_mercado) : null,
        id_pais: data.id_pais ? parseInt(data.id_pais) : null,
        tamano_empleados: data.tamano_empleados || null,
        website: data.website || null,
        linkedin: data.linkedin || null,
        observaciones: data.observaciones || null
      };

      console.log('Enviando datos:', formattedData);
      
      const empresa = await apiCall('/api/crm/empresas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });

      toast({
        title: "¡Éxito!",
        description: "Empresa creada correctamente",
        variant: "success"
      });

      reset();
      onEmpresaCreada?.(empresa);
      onClose();
    } catch (error) {
      console.error('Error al crear empresa:', error);
      toast({
        title: "Error",
        description: error.message || "Error al crear la empresa",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Opciones para los selects
  const opcionesMercados = mercados.map(mercado => ({
    value: mercado.id_mercado?.toString(),
    label: `${mercado.segmento_mercado} - ${mercado.resumen_mercado || 'Sin descripción'}`,
    searchText: `${mercado.segmento_mercado} ${mercado.resumen_mercado || ''} ${mercado.id_mercado}`
  }));

  const opcionesPaises = paises.map(pais => ({
    value: pais.id_pais?.toString(),
    label: pais.pais,
    searchText: `${pais.pais} ${pais.codigo_iso} ${pais.region || ''}`
  }));

  const opcionesTamanoEmpleados = [
    { value: '1-10', label: '1-10 empleados' },
    { value: '11-50', label: '11-50 empleados' },
    { value: '51-200', label: '51-200 empleados' },
    { value: '201-500', label: '201-500 empleados' },
    { value: '501-1000', label: '501-1000 empleados' },
    { value: '1001-5000', label: '1001-5000 empleados' },
    { value: '5000+', label: 'Más de 5000 empleados' }
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Crear Nueva Empresa
          </DialogTitle>
          <DialogDescription>
            Complete la información para registrar una nueva empresa en el CRM
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="empresa" className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Nombre de la Empresa *
                  </Label>
                  <Input
                    id="empresa"
                    placeholder="Ej: Tech Solutions S.A.S., Microsoft Corp, etc."
                    {...register('empresa', { 
                      required: 'El nombre de la empresa es requerido' 
                    })}
                  />
                  {errors.empresa && (
                    <p className="text-sm text-red-500">{errors.empresa.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_mercado" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Mercado
                  </Label>
                  <Select
                    value={watch('id_mercado')}
                    onValueChange={(value) => setValue('id_mercado', value)}
                    disabled={loadingCatalogos}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mercado..." />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesMercados.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-gray-500">
                          No se encontraron mercados
                        </div>
                      ) : (
                        opcionesMercados.map((mercado) => (
                          <SelectItem key={mercado.value} value={mercado.value}>
                            {mercado.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="id_pais" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    País
                  </Label>
                  <Select
                    value={watch('id_pais')}
                    onValueChange={(value) => setValue('id_pais', value)}
                    disabled={loadingCatalogos}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar país..." />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesPaises.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-gray-500">
                          No se encontraron países
                        </div>
                      ) : (
                        opcionesPaises.map((pais) => (
                          <SelectItem key={pais.value} value={pais.value}>
                            {pais.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tamano_empleados" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Tamaño (Empleados)
                  </Label>
                  <Select
                    value={watch('tamano_empleados')}
                    onValueChange={(value) => setValue('tamano_empleados', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tamaño..." />
                    </SelectTrigger>
                    <SelectContent>
                      {opcionesTamanoEmpleados.map((tamano) => (
                        <SelectItem key={tamano.value} value={tamano.value}>
                          {tamano.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enlaces y contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Enlaces y Presencia Digital
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Sitio Web
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://empresa.com"
                    {...register('website')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/company/empresa"
                    {...register('linkedin')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Información Adicional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Notas adicionales sobre la empresa, sector, características especiales..."
                  rows={4}
                  {...register('observaciones')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Empresa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CrearEmpresaDialog; 