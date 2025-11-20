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

  async getTestAttempt(attemptId: string, userId?: string) {
    let query = this.supabase
      .from('test_attempts')
      .select('*')
      .eq('id', attemptId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch test attempt: ${error.message}`);
    }
    return data;
  }

  async getTestAnswersByAttemptId(attemptId: string) {
    const { data, error } = await this.supabase
      .from('test_answers')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('answered_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch test answers: ${error.message}`);
    return data || [];
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

  async saveTestAnswer(answerData: any) {
    const { data, error } = await this.supabase
      .from('test_answers')
      .upsert([answerData])
      .select()
      .single();

    if (error) throw new Error(`Failed to save test answer: ${error.message}`);
    return data;
  }

  async calculateTestScore(attemptId: string) {
    const { data, error } = await this.supabase
      .from('test_answers')
      .select(`
        is_correct,
        questions!inner(points)
      `)
      .eq('attempt_id', attemptId);

    if (error) throw new Error(`Failed to calculate test score: ${error.message}`);

    const answers = data || [];
    const score = answers.filter((answer: any) => answer.is_correct).reduce((sum: number, answer: any) =>
      sum + (answer.questions as any).points, 0
    );
    const totalPoints = answers.reduce((sum: number, answer: any) =>
      sum + (answer.questions as any).points, 0
    );

    return { score, totalPoints };
  }

  async completeTestAttempt(attemptId: string, score: number, totalPoints: number) {
    const updates = {
      status: 'completed',
      ended_at: new Date().toISOString(),
      score,
      total_points: totalPoints
    };

    const { data, error } = await this.supabase
      .from('test_attempts')
      .update(updates)
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update test attempt: ${error.message}`);
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
    const path = event.path.replace('/.netlify/functions/test-attempts', '');
    const method = event.httpMethod;
    const body = parseBody(event.body);

    // Route: GET /api/tests/attempts/:attemptId - Get test attempt
    if (method === 'GET' && path.match(/^\/[^\/]+$/)) {
      const user = await getUserFromAuth(event.headers.authorization);
      const attemptId = path.substring(1);
      const attempt = await testService.getTestAttempt(attemptId, user.id);

      if (!attempt) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Test attempt not found' }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: attempt }),
      };
    }

    // Route: GET /api/tests/attempts/:attemptId/answers - Get all answers for an attempt
    if (method === 'GET' && path.match(/^\/[^\/]+\/answers$/)) {
      const user = await getUserFromAuth(event.headers.authorization);
      const attemptId = path.split('/')[1];

      // Verify user owns this attempt
      const attempt = await testService.getTestAttempt(attemptId, user.id);
      if (!attempt) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Test attempt not found' }),
        };
      }

      const answers = await testService.getTestAnswersByAttemptId(attemptId);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: answers }),
      };
    }

    // Route: POST /api/tests/attempts/:attemptId/answers - Save answer for a question
    if (method === 'POST' && path.match(/^\/[^\/]+\/answers$/)) {
      const user = await getUserFromAuth(event.headers.authorization);
      const attemptId = path.split('/')[1];

      const saveAnswerSchema = z.object({
        question_id: z.string().uuid('Invalid question ID'),
        selected_option: z.number().min(0).max(3, 'Selected option must be 0-3'),
        time_spent_seconds: z.number().min(0).optional()
      });

      const { question_id, selected_option, time_spent_seconds } = saveAnswerSchema.parse(body);

      // Get the question to determine if answer is correct
      const attempt = await testService.getTestAttempt(attemptId, user.id);
      if (!attempt) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Test attempt not found' }),
        };
      }

      const questions = await testService.getQuestionsByTestId(attempt.test_id);
      const question = questions.find(q => q.id === question_id);

      if (!question) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Question not found' }),
        };
      }

      const answerData = {
        attempt_id: attemptId,
        question_id,
        selected_option,
        is_correct: selected_option === question.correct_option,
        time_spent_seconds
      };

      const answer = await testService.saveTestAnswer(answerData);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: answer }),
      };
    }

    // Route: POST /api/tests/attempts/:attemptId/submit - Submit test attempt
    if (method === 'POST' && path.match(/^\/[^\/]+\/submit$/)) {
      const user = await getUserFromAuth(event.headers.authorization);
      const attemptId = path.split('/')[1];

      // Verify user owns this attempt and it's in progress
      const attempt = await testService.getTestAttempt(attemptId, user.id);
      if (!attempt) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Test attempt not found' }),
        };
      }

      if (attempt.status !== 'in_progress') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Test attempt is not in progress' }),
        };
      }

      // Calculate score
      const { score, totalPoints } = await testService.calculateTestScore(attemptId);

      // Complete the attempt
      const completedAttempt = await testService.completeTestAttempt(attemptId, score, totalPoints);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: completedAttempt }),
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