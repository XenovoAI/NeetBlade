const { createClient } = require('@supabase/supabase-js');

// Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
  
  return createClient(supabaseUrl, supabaseKey);
}

// Simple test service for Vercel
class SimpleTestService {
  constructor() {
    this.supabase = getSupabaseClient();
  }

  async getTests(filters = {}) {
    let query = this.supabase.from('tests').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.subject) {
      query = query.eq('subject', filters.subject);
    }

    const { data, error } = await query.order('scheduled_start', { ascending: true });

    if (error) throw new Error(`Failed to fetch tests: ${error.message}`);
    return data || [];
  }
}

const testService = new SimpleTestService();

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  console.log('API tests endpoint called:', req.method, req.url);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { method, query } = req;

    // GET /api/tests - Get all tests
    if (method === 'GET') {
      console.log('API called with query:', query);
      
      const { status, subject } = query;
      const filters = {};
      if (status && typeof status === 'string') filters.status = status;
      if (subject && typeof subject === 'string') filters.subject = subject;

      console.log('Fetching tests with filters:', filters);
      const tests = await testService.getTests(filters);
      console.log('Found tests:', tests.length);
      
      return res.status(200).json({ success: true, data: tests });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message || 'Unknown error'
    });
  }
};