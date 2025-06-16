// Ruta /api/facturas para Vercel
export default function handler(req, res) {
  console.log('✅ Ruta /api/facturas ejecutada correctamente');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Respuesta de prueba para facturas
  res.status(200).json({
    success: true,
    message: 'Endpoint de facturas funcionando (modo simplificado)',
    note: 'Funcionando sin conexión a DB para evitar conflictos',
    data: [
      {
        id: 1,
        numero_factura: 'FAC-001',
        cliente: 'Carlos Pérez',
        valor: 5000,
        fecha: new Date().toISOString(),
        estado: 'Pagada'
      },
      {
        id: 2,
        numero_factura: 'FAC-002',
        cliente: 'María González',
        valor: 3500,
        fecha: new Date().toISOString(),
        estado: 'Pendiente'
      }
    ],
    total: 2,
    mode: 'simplified',
    platform: 'Vercel'
  });
} 