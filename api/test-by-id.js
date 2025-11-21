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

  async getTestById(id) {
    const { data, error } = await this.supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch test: ${error.message}`);
    }
    return data;
  }

  async getQuestionsByTestId(testId) {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_index', { ascending: true });

    if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
    return data || [];
  }
}

const testService = new SimpleTestService();

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
    const { method, query } = req;
    const { id, action } = query;

    if (!id) {
      return res.status(400).json({ error: 'Test ID is required' });
    }

    if (method === 'GET') {
      if (action === 'questions') {
        // GET /api/test-by-id?id=123&action=questions
        const questions = await testService.getQuestionsByTestId(id);
        return res.status(200).json({ success: true, data: questions });
      } else {
        // GET /api/test-by-id?id=123
        const test = await testService.getTestById(id);
        
        if (!test) {
          return res.status(404).json({ error: 'Test not found' });
        }

        return res.status(200).json({ success: true, data: test });
      }
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