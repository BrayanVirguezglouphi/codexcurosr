// Ruta /api/transacciones para Vercel
export default function handler(req, res) {
  console.log('✅ Ruta /api/transacciones - Modo simplificado');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Respuesta inmediata sin intentar DB (para evitar conflictos de dependencias)
  res.status(200).json({
    success: true,
    message: 'Endpoint de transacciones funcionando (modo simplificado)',
    note: 'Funcionando sin conexión a DB para evitar conflictos',
    data: [
      {
        id: 1,
        titulo: 'Transacción de prueba',
        timestamp: new Date().toISOString(),
        valor: 1000,
        tipo: 'Ingreso'
      },
      {
        id: 2,
        titulo: 'Segunda transacción',
        timestamp: new Date().toISOString(),
        valor: 2500,
        tipo: 'Egreso'
      }
    ],
    total: 2,
    mode: 'simplified',
    platform: 'Vercel'
  });
} 