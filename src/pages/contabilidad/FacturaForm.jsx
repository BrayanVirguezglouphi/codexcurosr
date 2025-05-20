import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import FormField from '@/components/FormField';
import { DialogFooter } from '@/components/ui/dialog';

const FacturaForm = ({ initialData, clientes, onSubmit, onCancel, isEditing }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Número"
          name="numero"
          value={formData.numero}
          onChange={handleChange}
          required
          disabled={isEditing}
        />
        <FormField
          label="Cliente"
          name="cliente"
          type="select"
          value={formData.cliente}
          onChange={handleChange}
          options={clientes.map(cliente => ({
            value: cliente.nombre,
            label: cliente.nombre
          }))}
          required
        />
        <FormField
          label="Fecha"
          name="fecha"
          type="date"
          value={formData.fecha}
          onChange={handleChange}
          required
        />
        <FormField
          label="Monto ($)"
          name="monto"
          type="number"
          value={formData.monto}
          onChange={handleChange}
          required
        />
        <FormField
          label="Estado"
          name="estado"
          type="select"
          value={formData.estado}
          onChange={handleChange}
          options={[
            { value: 'Pendiente', label: 'Pendiente' },
            { value: 'Pagada', label: 'Pagada' },
            { value: 'Vencida', label: 'Vencida' },
            { value: 'Anulada', label: 'Anulada' }
          ]}
          required
        />
        <div className="md:col-span-2">
          <FormField
            label="Descripción"
            name="descripcion"
            type="textarea"
            value={formData.descripcion}
            onChange={handleChange}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default FacturaForm;
