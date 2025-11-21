import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
  
  return createClient(supabaseUrl, supabaseKey);
}

// Simple test service for Vercel
class SimpleTestService {
  private supabase = getSupabaseClient();

  async getQuestionsByTestId(testId: string) {
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const { id } = query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Test ID is required' });
    }

    // GET /api/tests/[id]/questions - Get questions for a test
    if (method === 'GET') {
      const questions = await testService.getQuestionsByTestId(id);
      return res.status(200).json({ success: true, data: questions });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}