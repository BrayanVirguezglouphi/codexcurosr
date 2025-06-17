// Ruta /api/health para Vercel
export default function handler(req, res) {
  console.log('✅ Health check ejecutado en Vercel');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Servidor funcionando correctamente',
    environment: process.env.NODE_ENV,
    platform: 'Vercel',
    database: {
      host: process.env.DB_HOST,
      status: 'testing...',
      note: 'Conexión se prueba bajo demanda'
    }
  });
} 