import React, { useState } from 'react';
import { 
  Plus,
  Search,
  Link,
  ChevronDown,
  Pencil,
  Trash,
  ArrowUpAZ,
  ArrowDownAZ
} from 'lucide-react';

// Datos de ejemplo - Terceros (Personal)
const tercerosIniciales = [
  {
    id: '1',
    nombre: 'Carlos García',
    tipoRelacion: 'Relacion 1 de prueba'
  },
  {
    id: '2',
    nombre: 'Andrea Molina',
    tipoRelacion: 'Relacion 1 de prueba'
  },
  {
    id: '3',
    nombre: 'Luis Ramírez',
    tipoRelacion: 'Relacion 1 de prueba'
  },
  {
    id: '4',
    nombre: 'Sofía Paredes',
    tipoRelacion: 'Relacion 1 de prueba'
  },
  {
    id: '5',
    nombre: 'Mateo Torres',
    tipoRelacion: 'Relacion 1 de prueba'
  },
  {
    id: '6',
    nombre: 'Daniela Valencia',
    tipoRelacion: 'Relacion 1 de prueba'
  }
];

// Datos de ejemplo - Contratos
const contratosIniciales = [
  {
    id: '1',
    tipoContrato: 'Prestación de Servicios',
    urlContrato: 'http://contrato1.pdf',
    terceroId: '1',
    fechaInicio: '2024-01-15',
    fechaFin: '2024-12-31',
    honorarios: 3000,
    horasHombreSemanal: 40,
    idMoneda: 'Dólar estadounidense',
    modoPago: 'Mensual',
    tituloContrato: 'CONTRATO_1',
    urlAnexosContrato: 'http://anexo1.zip',
    urlContratoFirmado: 'http://contrato1.pdf',
    baseOperaciones: 'Base de colombia',
    alertaControlada: false,
    faseOperaciones: '',
    pqrPrevia: '',
    observacionAdicional: '',
    tipoIncidente: ''
  }
];

const Contratos = () => {
  const [terceros, setTerceros] = useState(tercerosIniciales);
  const [contratos, setContratos] = useState(contratosIniciales);
  const [searchTerceros, setSearchTerceros] = useState('');
  const [searchContratos, setSearchContratos] = useState('');
  const [terceroSeleccionado, setTerceroSeleccionado] = useState(null);
  const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
  const [editando, setEditando] = useState(false);
  const [sortTercerosAsc, setSortTercerosAsc] = useState(true);
  const [sortContratosAsc, setSortContratosAsc] = useState(true);

  const handleTerceroClick = (tercero) => {
    setTerceroSeleccionado(tercero);
    setContratoSeleccionado(null);
  };

  const handleContratoClick = (contrato) => {
    setContratoSeleccionado(contrato);
    setEditando(false);
  };

  const filtrarTerceros = terceros
    .filter((tercero) =>
      tercero.nombre.toLowerCase().includes(searchTerceros.toLowerCase())
    )
    .sort((a, b) =>
      sortTercerosAsc
        ? a.nombre.localeCompare(b.nombre)
        : b.nombre.localeCompare(a.nombre)
    );

  const filtrarContratos = contratos
    .filter(
      (contrato) => terceroSeleccionado && contrato.terceroId === terceroSeleccionado.id
    )
    .sort((a, b) =>
      sortContratosAsc
        ? a.tipoContrato.localeCompare(b.tipoContrato)
        : b.tipoContrato.localeCompare(a.tipoContrato)
    );

  const handleNuevoContrato = () => {
    if (!terceroSeleccionado) {
      alert('Por favor seleccione un tercero primero');
      return;
    }
    setEditando(true);
    setContratoSeleccionado({
      terceroId: terceroSeleccionado.id,
      fechaInicio: new Date().toISOString().split('T')[0],
      fechaFin: '',
      honorarios: '',
      horasHombreSemanal: '',
      idMoneda: 'Dólar estadounidense',
      modoPago: 'Mensual',
      tipoContrato: 'Prestación de Servicios',
      tituloContrato: '',
      urlAnexosContrato: '',
      urlContratoFirmado: '',
      baseOperaciones: '',
      alertaControlada: false,
      faseOperaciones: '',
      pqrPrevia: '',
      observacionAdicional: '',
      tipoIncidente: ''
    });
  };

  return (
    <div className="h-full bg-gray-50">
      <div className="flex h-full">
        {/* Panel de Terceros */}
        <div className="w-1/5 border-r bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Terceros</h2>
            <button
              className="text-gray-600"
              onClick={() => setSortTercerosAsc(!sortTercerosAsc)}
            >
              {sortTercerosAsc ? (
                <ArrowDownAZ className="w-5 h-5" />
              ) : (
                <ArrowUpAZ className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar"
              className="w-full pl-8 pr-4 py-2 border rounded-lg"
              value={searchTerceros}
              onChange={(e) => setSearchTerceros(e.target.value)}
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-sm font-medium text-gray-600">NOMBRE</div>
            <div className="text-sm font-medium text-gray-600">TIPO DE RELACIÓN</div>
          </div>
          <div className="space-y-2">
            {filtrarTerceros.map((tercero) => (
              <div
                key={tercero.id}
                onClick={() => handleTerceroClick(tercero)}
                className={`p-3 rounded-lg cursor-pointer ${
                  terceroSeleccionado?.id === tercero.id
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">{tercero.nombre}</div>
                  <div className="text-sm text-gray-600">{tercero.tipoRelacion}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de Contratos */}
        <div className="w-1/5 border-r bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Contratos</h2>
            <button
              className="text-gray-600"
              onClick={() => setSortContratosAsc(!sortContratosAsc)}
            >
              {sortContratosAsc ? (
                <ArrowDownAZ className="w-5 h-5" />
              ) : (
                <ArrowUpAZ className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Buscar"
              className="w-full pl-8 pr-4 py-2 border rounded-lg"
              value={searchContratos}
              onChange={(e) => setSearchContratos(e.target.value)}
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-sm font-medium text-gray-600">TIPO DE CONTRATO</div>
            <div className="text-sm font-medium text-gray-600">URL CONTRATO</div>
          </div>
          <div className="space-y-2">
            {filtrarContratos.map((contrato) => (
              <div
                key={contrato.id}
                onClick={() => handleContratoClick(contrato)}
                className={`p-3 rounded-lg cursor-pointer ${
                  contratoSeleccionado?.id === contrato.id
                    ? 'bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">{contrato.tipoContrato}</div>
                  <div className="text-sm text-blue-600 flex items-center">
                    <Link className="w-4 h-4 mr-1" />
                    Ver contrato
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de Detalle/Edición */}
        <div className="w-3/5 bg-white p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Detalle contrato</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleNuevoContrato}
                className="bg-[#1b355d] text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo
              </button>
              {contratoSeleccionado && !editando && (
                <>
                  <button
                    onClick={() => setEditando(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Trash className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {contratoSeleccionado && (
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    fecha_fin
                  </label>
                  <input
                    type="date"
                    value={contratoSeleccionado.fechaFin}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    honorarios
                  </label>
                  <input
                    type="number"
                    value={contratoSeleccionado.honorarios}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    id_moneda
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.idMoneda}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    modo_pago
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.modoPago}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    titulo_contrato
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.tituloContrato}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    url_contrato_firmado
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.urlContratoFirmado}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    fecha_inicio_contrato
                  </label>
                  <input
                    type="date"
                    value={contratoSeleccionado.fechaInicio}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    horas_hombre_semanal
                  </label>
                  <input
                    type="number"
                    value={contratoSeleccionado.horasHombreSemanal}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    id_tercero
                  </label>
                  <input
                    type="text"
                    value={terceroSeleccionado?.nombre || ''}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    tipo_contrato
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.tipoContrato}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    url_anexos_contrato
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.urlAnexosContrato}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    base_operaciones
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.baseOperaciones}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    alerta_controlada
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.alertaControlada ? 'Si' : 'No'}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    fase_operaciones
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.faseOperaciones}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    pqr_previa_numero_radicacion
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.pqrPrevia}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    observacion_adicional
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.observacionAdicional}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    tipo_incidente
                  </label>
                  <input
                    type="text"
                    value={contratoSeleccionado.tipoIncidente}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly={!editando}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contratos; 