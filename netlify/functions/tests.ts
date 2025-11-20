import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
  
  return createClient(supabaseUrl, supabaseKey);
}

// Simple test service for Netlify Functions
class SimpleTestService {
  private supabase = getSupabaseClient();

  async getTests(filters?: { status?: string; subject?: string }) {
    let query = this.supabase.from('tests').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.subject) {
      query = query.eq('subject', filters.subject);
    }

    const { data, error } = await query.order('scheduled_start', { ascending: true });

    if (error) throw new Error(`Failed to fetch tests: ${error.message}`);
    return data || [];
  }

  async getTestById(id: string) {
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

  async getQuestionsByTestId(testId: string) {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_index', { ascending: true });

    if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
    return data || [];
  }

  async getTestAttemptsByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user test attempts: ${error.message}`);
    return data || [];
  }

  async startTestAttempt(testId: string, userId: string) {
    // Check if user already has an in-progress attempt
    const { data: existingAttempts } = await this.supabase
      .from('test_attempts')
      .select('*')
      .eq('test_id', testId)
      .eq('user_id', userId)
      .eq('status', 'in_progress');

    if (existingAttempts && existingAttempts.length > 0) {
      return existingAttempts[0];
    }

    // Create new attempt
    const attemptData = {
      test_id: testId,
      user_id: userId,
      status: 'in_progress'
    };

    const { data, error } = await this.supabase
      .from('test_attempts')
      .insert([attemptData])
      .select()
      .single();

    if (error) throw new Error(`Failed to start test attempt: ${error.message}`);
    return data;
  }

  async createTest(testData: any) {
    // Calculate scheduled_end based on scheduled_start + duration
    const scheduledStart = new Date(testData.scheduled_start);
    const scheduledEnd = new Date(scheduledStart.getTime() + (testData.duration_minutes * 60 * 1000));
    
    const testWithEnd = {
      ...testData,
      scheduled_end: scheduledEnd.toISOString()
    };

    const { data, error } = await this.supabase
      .from('tests')
      .insert([testWithEnd])
      .select()
      .single();

    if (error) throw new Error(`Failed to create test: ${error.message}`);
    return data;
  }
}

const testService = new SimpleTestService();

// Helper function to parse request body
const parseBody = (body: string | null) => {
  if (!body) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
};

// Helper function to get user from auth header
async function getUserFromAuth(authHeader: string | undefined) {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await getSupabaseClient().auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid token');
  }

  return user;
}

// Helper function to check if user is admin
async function isUserAdmin(userId: string) {
  const { data: userData } = await getSupabaseClient()
    .from('users')
    .select('is_admin')
    .eq('id', userId)
    .single();

  return userData?.is_admin || false;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    console.log('Function called:', { path: event.path, method: event.httpMethod });
    
    const path = event.path.replace('/.netlify/functions/tests', '');
    const method = event.httpMethod;
    const body = parseBody(event.body);
    const query = event.queryStringParameters || {};

    console.log('Processed path:', path, 'Method:', method);

    // Health check route
    if (method === 'GET' && path === '/health') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Function is working' }),
      };
    }

    // Route: GET /api/tests - Get all tests
    if (method === 'GET' && path === '') {
      console.log('Fetching tests with filters:', query);
      const { status, subject } = query;
      const filters: any = {};
      if (status) filters.status = status;
      if (subject) filters.subject = subject;

      const tests = await testService.getTests(filters);
      console.log('Found tests:', tests.length);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: tests }),
      };
    }

    // Route: GET /api/tests/:id - Get test by ID
    if (method === 'GET' && path.match(/^\/[^\/]+$/)) {
      const id = path.substring(1);
      const test = await testService.getTestById(id);

      if (!test) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Test not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: test }),
      };
    }

    // Route: POST /api/tests - Create new test (admin only)
    if (method === 'POST' && path === '') {
      const user = await getUserFromAuth(event.headers.authorization);
      const isAdmin = await isUserAdmin(user.id);

      if (!isAdmin) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ error: 'Admin access required' }),
        };
      }

      const createTestSchema = z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        subject: z.string().min(1, 'Subject is required'),
        duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
        scheduled_start: z.string().datetime('Invalid start time'),
        status: z.enum(['draft', 'scheduled']).default('draft')
      });

      const validatedData = createTestSchema.parse(body);
      const testData = { ...validatedData, created_by: user.id };
      const test = await testService.createTest(testData);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, data: test }),
      };
    }

    // Route: GET /api/tests/:id/questions - Get questions for a test
    if (method === 'GET' && path.match(/^\/[^\/]+\/questions$/)) {
      const id = path.split('/')[1];
      const questions = await testService.getQuestionsByTestId(id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: questions }),
      };
    }

    // Route: GET /api/tests/user/attempts - Get current user's test attempts
    if (method === 'GET' && path === '/user/attempts') {
      const user = await getUserFromAuth(event.headers.authorization);
      const attempts = await testService.getTestAttemptsByUserId(user.id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: attempts }),
      };
    }

    // Route: POST /api/tests/:id/start - Start a test attempt
    if (method === 'POST' && path.match(/^\/[^\/]+\/start$/)) {
      const user = await getUserFromAuth(event.headers.authorization);
      const id = path.split('/')[1];
      const attempt = await testService.startTestAttempt(id, user.id);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, data: attempt }),
      };
    }

    // Default 404 response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Route not found' }),
    };

  } catch (error) {
    console.error('Function error:', error);
    
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Validation failed', details: error.errors }),
      };
    }

    if (error instanceof Error && error.message.includes('authorization')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: error.message }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };