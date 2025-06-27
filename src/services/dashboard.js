import { apiCall } from '@/config/api';

const obtenerActividadesRecientes = async () => {
  try {
    // Obtenemos datos de diferentes fuentes
    const [facturas, clientes, solicitudes, transacciones] = await Promise.all([
      apiCall('/api/facturas?limit=5&sort=fecha_creacion:desc').catch(() => []),
      apiCall('/api/terceros?tipo=CLIENTE&limit=5&sort=fecha_creacion:desc').catch(() => []),
      apiCall('/api/rrhh/solicitudes?limit=5&sort=fecha_creacion:desc').catch(() => []),
      apiCall('/api/transacciones?limit=5&sort=fecha_creacion:desc').catch(() => [])
    ]);

    // Combinamos todas las actividades
    const actividades = [
      // Mapear facturas a actividades
      ...facturas.map(f => ({
        tipo: 'FACTURA',
        descripcion: `Factura #${f.numero_factura} ${f.estado_factura === 'PAGADA' ? 'marcada como pagada' : 'creada'}`,
        fecha: new Date(f.fecha_creacion),
        tiempo: formatearTiempo(new Date(f.fecha_creacion))
      })),

      // Mapear clientes nuevos
      ...clientes.map(c => ({
        tipo: 'CLIENTE',
        descripcion: `Nuevo cliente agregado: ${c.nombre_tercero}`,
        fecha: new Date(c.fecha_creacion),
        tiempo: formatearTiempo(new Date(c.fecha_creacion))
      })),

      // Mapear solicitudes de RRHH
      ...solicitudes.map(s => ({
        tipo: 'RRHH',
        descripcion: `Solicitud de ${s.tipo_solicitud.toLowerCase()} ${s.estado === 'APROBADA' ? 'aprobada' : 'creada'} para ${s.nombre_empleado}`,
        fecha: new Date(s.fecha_creacion),
        tiempo: formatearTiempo(new Date(s.fecha_creacion))
      })),

      // Mapear transacciones
      ...transacciones.map(t => ({
        tipo: 'TRANSACCION',
        descripcion: `Nueva ${t.tipo_transaccion.toLowerCase()} registrada por ${formatearMoneda(t.valor_total_transaccion)}`,
        fecha: new Date(t.fecha_creacion),
        tiempo: formatearTiempo(new Date(t.fecha_creacion))
      }))
    ];

    // Ordenar por fecha más reciente
    return actividades
      .sort((a, b) => b.fecha - a.fecha)
      .slice(0, 5); // Limitar a 5 actividades
  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    return [];
  }
};

export const getDashboardData = async () => {
  try {
    const [
      facturas,
      transacciones,
      clientes,
      empleados,
      solicitudesRRHH
    ] = await Promise.all([
      apiCall('/api/facturas').catch(() => []),
      apiCall('/api/transacciones').catch(() => []),
      apiCall('/api/terceros?tipo=CLIENTE').catch(() => []),
      apiCall('/api/terceros?tipo=EMPLEADO').catch(() => []),
      apiCall('/api/rrhh/solicitudes').catch(() => [])
    ]);

    // Obtener actividades recientes
    const actividades = await obtenerActividadesRecientes();

    // Calcular ingresos mensuales
    const mesActual = new Date().getMonth();
    const ingresosMesActual = transacciones
      .filter(t => {
        const fechaTransaccion = new Date(t.fecha_transaccion);
        return fechaTransaccion.getMonth() === mesActual && 
               (t.tipo_transaccion === 'VENTA' || t.tipo_transaccion === 'INGRESO');
      })
      .reduce((total, t) => total + parseFloat(t.valor_total_transaccion || 0), 0);

    const ingresosMesAnterior = transacciones
      .filter(t => {
        const fechaTransaccion = new Date(t.fecha_transaccion);
        return fechaTransaccion.getMonth() === (mesActual - 1) && 
               (t.tipo_transaccion === 'VENTA' || t.tipo_transaccion === 'INGRESO');
      })
      .reduce((total, t) => total + parseFloat(t.valor_total_transaccion || 0), 0);

    // Calcular cambio porcentual en ingresos
    const cambioIngresos = ingresosMesAnterior > 0 
      ? ((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior * 100).toFixed(1)
      : 0;

    // Calcular nuevos clientes
    const mesActualDate = new Date();
    mesActualDate.setMonth(mesActualDate.getMonth() - 1);
    
    const clientesNuevos = clientes.filter(c => new Date(c.fecha_creacion) > mesActualDate).length;
    const clientesTotalMesAnterior = clientes.filter(c => new Date(c.fecha_creacion) <= mesActualDate).length;
    const cambioClientes = clientesTotalMesAnterior > 0
      ? ((clientesNuevos / clientesTotalMesAnterior) * 100).toFixed(1)
      : 0;

    // Facturas pendientes
    const facturasPendientes = facturas.filter(f => f.estado_factura === 'PENDIENTE').length;
    const facturasPendientesMesAnterior = facturas.filter(f => {
      const fechaFactura = new Date(f.fecha_creacion);
      return fechaFactura.getMonth() === (mesActual - 1) && f.estado_factura === 'PENDIENTE';
    }).length;
    
    const cambioFacturas = facturasPendientesMesAnterior > 0
      ? ((facturasPendientes - facturasPendientesMesAnterior) / facturasPendientesMesAnterior * 100).toFixed(1)
      : 0;

    // Solicitudes RRHH
    const solicitudesActivas = solicitudesRRHH.filter(s => s.estado === 'PENDIENTE').length;
    const solicitudesMesAnterior = solicitudesRRHH.filter(s => {
      const fechaSolicitud = new Date(s.fecha_creacion);
      return fechaSolicitud.getMonth() === (mesActual - 1) && s.estado === 'PENDIENTE';
    }).length;

    const cambioSolicitudes = solicitudesMesAnterior > 0
      ? ((solicitudesActivas - solicitudesMesAnterior) / solicitudesMesAnterior * 100).toFixed(1)
      : 0;

    return {
      stats: {
        ingresosMensuales: {
          valor: ingresosMesActual,
          cambio: cambioIngresos
        },
        nuevosClientes: {
          valor: clientesNuevos,
          cambio: cambioClientes
        },
        facturasPendientes: {
          valor: facturasPendientes,
          cambio: cambioFacturas
        },
        solicitudesRRHH: {
          valor: solicitudesActivas,
          cambio: cambioSolicitudes
        }
      },
      modulos: {
        crm: {
          clientesActivos: clientes.filter(c => c.estado === 'ACTIVO').length
        },
        contabilidad: {
          facturasPendientes: facturasPendientes
        },
        rrhh: {
          empleadosActivos: empleados.filter(e => e.estado === 'ACTIVO').length
        }
      },
      actividades
    };
  } catch (error) {
    console.error('Error obteniendo datos del dashboard:', error);
    return null;
  }
};

const formatearTiempo = (fecha) => {
  const ahora = new Date();
  const diferencia = ahora - fecha;
  const minutos = Math.floor(diferencia / 1000 / 60);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 0) {
    return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
  } else if (horas > 0) {
    return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  } else {
    return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
  }
};

const formatearMoneda = (valor) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor);
}; 