module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('Health check called');
    
    return res.status(200).json({ 
      success: true, 
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: {
        hasSupabaseUrl: !!process.env.SUPABASE_URL || !!process.env.VITE_SUPABASE_URL,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY || !!process.env.VITE_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Health check failed',
      message: error.message || 'Unknown error'
    });
  }
};