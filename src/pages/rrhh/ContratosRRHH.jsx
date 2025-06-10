import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Trash2, Plus, Link as LinkIcon } from 'lucide-react';

// Modal simple reutilizable
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Datos de ejemplo
const tercerosEjemplo = [
  { id: 1, nombre: 'Carlos Garcia', tipoRelacion: 'Relacion 1 de prueba' },
  { id: 2, nombre: 'Andrea Molina', tipoRelacion: 'Relacion 1 de prueba' },
  { id: 3, nombre: 'Luis Ramirez', tipoRelacion: 'Relacion 1 de prueba' },
  { id: 4, nombre: 'Sofia Paredes', tipoRelacion: 'Relacion 1 de prueba' },
  { id: 5, nombre: 'Mateo Torres', tipoRelacion: 'Relacion 1 de prueba' },
  { id: 6, nombre: 'Daniela Valencia', tipoRelacion: 'Relacion 1 de prueba' },
];

const contratosEjemplo = [
  {
    id: 1,
    id_tercero: 1,
    tipo_contrato: 'Prestación de Servicios',
    url_contrato: 'http://contrato1.pdf',
    fecha_inicio_contrato: '2024-01-15',
    fecha_fin: '',
    horas_hombre_semanal: 40,
    honorarios: 3000,
    id_moneda: 'Dólar estadounidense',
    modo_pago: 'Mensual',
    titulo_contrato: 'CONTRATO_1',
    url_anexos_contrato: 'http://anexo1.zip',
    url_contrato_firmado: 'http://contrato1.pdf',
    base_operaciones: 'Base de colombia',
  },
];

const camposContrato = [
  { name: 'fecha_inicio_contrato', label: 'Fecha inicio', type: 'date' },
  { name: 'fecha_fin', label: 'Fecha fin', type: 'date' },
  { name: 'honorarios', label: 'Honorarios', type: 'number' },
  { name: 'id_moneda', label: 'Moneda', type: 'text' },
  { name: 'modo_pago', label: 'Modo de pago', type: 'text' },
  { name: 'titulo_contrato', label: 'Título', type: 'text' },
  { name: 'url_contrato_firmado', label: 'URL Contrato firmado', type: 'text' },
  { name: 'horas_hombre_semanal', label: 'Horas hombre semanal', type: 'number' },
  { name: 'tipo_contrato', label: 'Tipo de contrato', type: 'text' },
  { name: 'url_anexos_contrato', label: 'URL Anexos', type: 'text' },
  { name: 'base_operaciones', label: 'Base operaciones', type: 'text' },
];

const ContratosRRHH = () => {
  const [terceros] = useState(tercerosEjemplo);
  const [contratos, setContratos] = useState(contratosEjemplo);
  const [terceroSeleccionado, setTerceroSeleccionado] = useState(terceros[0]);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(
    contratos.find(c => c.id_tercero === terceros[0].id)
  );
  const [busquedaTercero, setBusquedaTercero] = useState('');
  const [busquedaContrato, setBusquedaContrato] = useState('');
  const [modal, setModal] = useState({ open: false, modo: '', contrato: null });

  // Filtrar terceros
  const tercerosFiltrados = terceros.filter(t =>
    t.nombre.toLowerCase().includes(busquedaTercero.toLowerCase())
  );

  // Filtrar contratos del tercero seleccionado
  const contratosFiltrados = contratos.filter(c =>
    c.id_tercero === (terceroSeleccionado ? terceroSeleccionado.id : null) &&
    c.tipo_contrato.toLowerCase().includes(busquedaContrato.toLowerCase())
  );

  // Seleccionar tercero
  const handleSeleccionarTercero = (tercero) => {
    setTerceroSeleccionado(tercero);
    const contrato = contratos.find(c => c.id_tercero === tercero.id);
    setContratoSeleccionado(contrato || null);
  };

  // Seleccionar contrato
  const handleSeleccionarContrato = (contrato) => {
    setContratoSeleccionado(contrato);
  };

  // Nuevo contrato
  const handleNuevo = () => {
    setModal({ open: true, modo: 'nuevo', contrato: {
      id: Date.now(),
      id_tercero: terceroSeleccionado.id,
      fecha_inicio_contrato: '',
      fecha_fin: '',
      honorarios: '',
      id_moneda: '',
      modo_pago: '',
      titulo_contrato: '',
      url_contrato_firmado: '',
      horas_hombre_semanal: '',
      tipo_contrato: '',
      url_anexos_contrato: '',
      base_operaciones: '',
      url_contrato: '',
    }});
  };

  // Editar contrato
  const handleEditar = () => {
    if (!contratoSeleccionado) return;
    setModal({ open: true, modo: 'editar', contrato: { ...contratoSeleccionado } });
  };

  // Eliminar contrato
  const handleEliminar = () => {
    if (!contratoSeleccionado) return;
    if (window.confirm('¿Seguro que deseas eliminar este contrato?')) {
      setContratos(contratos.filter(c => c.id !== contratoSeleccionado.id));
      setContratoSeleccionado(null);
    }
  };

  // Guardar contrato (nuevo o editado)
  const handleGuardar = (e) => {
    e.preventDefault();
    if (modal.modo === 'nuevo') {
      setContratos([...contratos, modal.contrato]);
      setContratoSeleccionado(modal.contrato);
    } else if (modal.modo === 'editar') {
      setContratos(contratos.map(c => c.id === modal.contrato.id ? modal.contrato : c));
      setContratoSeleccionado(modal.contrato);
    }
    setModal({ open: false, modo: '', contrato: null });
  };

  // Actualizar campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setModal(prev => ({ ...prev, contrato: { ...prev.contrato, [name]: value } }));
  };

  return (
    <div className="flex flex-col h-full w-full p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="inline-block bg-blue-100 p-2 rounded"><LinkIcon className="w-6 h-6 text-blue-700" /></span>
        CONTRATOS
      </h1>
      <div className="flex flex-1 gap-4 bg-white rounded-lg shadow p-4">
        {/* Columna 1: Terceros */}
        <div className="flex flex-col w-1/4 border-r pr-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Terceros</span>
            <Button size="icon" variant="ghost" className="p-1"><span className="text-lg">⇅</span></Button>
          </div>
          <div className="relative mb-2">
            <Input
              placeholder="Buscar"
              value={busquedaTercero}
              onChange={e => setBusquedaTercero(e.target.value)}
              className="pr-8"
            />
            <span className="absolute right-2 top-2 text-gray-400">🔍</span>
          </div>
          <div className="flex font-semibold text-xs text-gray-500 mb-1 px-2">
            <div className="w-1/2">NOMBRE</div>
            <div className="w-1/2">TIPO DE RELACION</div>
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto">
            {tercerosFiltrados.map(tercero => (
              <div
                key={tercero.id}
                className={`flex px-2 py-2 rounded cursor-pointer items-center ${terceroSeleccionado && terceroSeleccionado.id === tercero.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => handleSeleccionarTercero(tercero)}
              >
                <div className="w-1/2 font-medium">{tercero.nombre}</div>
                <div className="w-1/2 text-xs text-gray-500">{tercero.tipoRelacion}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Columna 2: Contratos */}
        <div className="flex flex-col w-1/4 border-r px-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Contratos</span>
            <Button size="icon" variant="ghost" className="p-1"><span className="text-lg">⇅</span></Button>
          </div>
          <div className="relative mb-2">
            <Input
              placeholder="Buscar"
              value={busquedaContrato}
              onChange={e => setBusquedaContrato(e.target.value)}
              className="pr-8"
            />
            <span className="absolute right-2 top-2 text-gray-400">🔍</span>
          </div>
          <div className="flex font-semibold text-xs text-gray-500 mb-1 px-2">
            <div className="w-2/3">TIPO DE CONTRATO</div>
            <div className="w-1/3">URL CONTRATO</div>
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto">
            {contratosFiltrados.map(contrato => (
              <div
                key={contrato.id}
                className={`flex px-2 py-2 rounded cursor-pointer items-center ${contratoSeleccionado && contratoSeleccionado.id === contrato.id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => handleSeleccionarContrato(contrato)}
              >
                <div className="w-2/3 font-medium">{contrato.tipo_contrato}</div>
                <div className="w-1/3 flex items-center justify-center">
                  <a href={contrato.url_contrato} target="_blank" rel="noopener noreferrer" className="text-blue-600"><LinkIcon className="w-4 h-4" /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Columna 3: Detalle contrato */}
        <div className="flex-1 flex flex-col pl-4">
          <div className="flex items-center gap-2 mb-2">
            <Button size="sm" variant="default" className="font-bold" onClick={handleNuevo}><Plus className="w-4 h-4 mr-1" />Nuevo</Button>
            <Button size="sm" variant="outline" onClick={handleEditar} disabled={!contratoSeleccionado}><Pencil className="w-4 h-4 mr-1" />Editar</Button>
            <Button size="sm" variant="destructive" onClick={handleEliminar} disabled={!contratoSeleccionado}><Trash2 className="w-4 h-4 mr-1" />Eliminar</Button>
            <span className="ml-4 font-semibold text-lg">Detalle contrato</span>
            <span className="ml-auto text-gray-400"><span className="inline-block align-middle">👁️</span></span>
          </div>
          {contratoSeleccionado ? (
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
              <div>
                <label className="text-xs text-gray-500">fecha_fin</label>
                <Input className="mb-2" value={contratoSeleccionado.fecha_fin} disabled />
                <label className="text-xs text-gray-500">honorarios</label>
                <Input className="mb-2" value={contratoSeleccionado.honorarios} disabled />
                <label className="text-xs text-gray-500">id_moneda</label>
                <Input className="mb-2" value={contratoSeleccionado.id_moneda} disabled />
                <label className="text-xs text-gray-500">modo_pago</label>
                <Input className="mb-2" value={contratoSeleccionado.modo_pago} disabled />
                <label className="text-xs text-gray-500">titulo_contrato</label>
                <Input className="mb-2" value={contratoSeleccionado.titulo_contrato} disabled />
                <label className="text-xs text-gray-500">url_contrato_firmado</label>
                <Input className="mb-2" value={contratoSeleccionado.url_contrato_firmado} disabled />
              </div>
              <div>
                <label className="text-xs text-gray-500">fecha_inicio_contrato</label>
                <Input className="mb-2" value={contratoSeleccionado.fecha_inicio_contrato ? new Date(contratoSeleccionado.fecha_inicio_contrato).toLocaleDateString('es-CO', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : ''} disabled />
                <label className="text-xs text-gray-500">horas_hombre_semanal</label>
                <Input className="mb-2" value={contratoSeleccionado.horas_hombre_semanal} disabled />
                <label className="text-xs text-gray-500">id_tercero</label>
                <Input className="mb-2" value={terceroSeleccionado?.nombre} disabled />
                <label className="text-xs text-gray-500">tipo_contrato</label>
                <Input className="mb-2" value={contratoSeleccionado.tipo_contrato} disabled />
                <label className="text-xs text-gray-500">url_anexos_contrato</label>
                <Input className="mb-2" value={contratoSeleccionado.url_anexos_contrato} disabled />
                <label className="text-xs text-gray-500">base_operaciones</label>
                <Input className="mb-2" value={contratoSeleccionado.base_operaciones} disabled />
              </div>
            </div>
          ) : (
            <div className="text-gray-400">Selecciona un contrato para ver el detalle</div>
          )}
        </div>
      </div>
      {/* Modal para crear/editar contrato */}
      <Modal open={modal.open} onClose={() => setModal({ open: false, modo: '', contrato: null })} title={modal.modo === 'nuevo' ? 'Nuevo Contrato' : 'Editar Contrato'}>
        <form onSubmit={handleGuardar} className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            {camposContrato.map(campo => (
              <div key={campo.name}>
                <label className="text-xs text-gray-500">{campo.label}</label>
                <Input
                  name={campo.name}
                  type={campo.type}
                  value={modal.contrato ? modal.contrato[campo.name] : ''}
                  onChange={handleChange}
                  required={campo.name !== 'fecha_fin' && campo.name !== 'url_anexos_contrato'}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setModal({ open: false, modo: '', contrato: null })}>Cancelar</Button>
            <Button type="submit" variant="default">Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ContratosRRHH;
 