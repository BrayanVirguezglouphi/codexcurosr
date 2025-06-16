// Ruta /api/test para Vercel
export default function handler(req, res) {
  console.log('✅ Ruta /api/test ejecutada correctamente');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  res.status(200).json({
    success: true,
    message: 'API funciona correctamente en Vercel',
    timestamp: new Date().toISOString(),
    environment: {
      vercel: process.env.VERCEL === '1',
      nodeEnv: process.env.NODE_ENV,
      hasDbHost: !!process.env.DB_HOST
    },
    request: {
      method: req.method,
      url: req.url
    }
  });
} 