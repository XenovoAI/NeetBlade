import { Router, Request, Response, NextFunction } from 'express';
import { testService, Test, Question, TestAttempt } from '../services/testService';
import { createClient } from '@supabase/supabase-js';

// Validation schemas
import { z } from 'zod';

// Lazy Supabase client for auth
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
  
  console.log('TestRoutes Supabase config:', { 
    url: supabaseUrl, 
    keyLength: supabaseKey?.length,
    hasUrl: !!process.env.SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_ANON_KEY
  });
  
  return createClient(supabaseUrl, supabaseKey);
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const createTestSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  scheduled_start: z.string().datetime('Invalid start time'),
  status: z.enum(['draft', 'scheduled']).default('draft')
});

const updateTestSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  subject: z.string().min(1).optional(),
  duration_minutes: z.number().min(1).optional(),
  scheduled_start: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled', 'active', 'completed']).optional()
});

const createQuestionsSchema = z.object({
  questions: z.array(z.object({
    question_text: z.string().min(1, 'Question text is required'),
    option_a: z.string().min(1, 'Option A is required'),
    option_b: z.string().min(1, 'Option B is required'),
    option_c: z.string().min(1, 'Option C is required'),
    option_d: z.string().min(1, 'Option D is required'),
    correct_option: z.number().min(0).max(3, 'Correct option must be 0-3'),
    order_index: z.number().min(0),
    points: z.number().min(1).default(1)
  })).min(1, 'At least one question is required')
});

const saveAnswerSchema = z.object({
  question_id: z.string().uuid('Invalid question ID'),
  selected_option: z.number().min(0).max(3, 'Selected option must be 0-3'),
  time_spent_seconds: z.number().min(0).optional()
});

// Middleware to verify user is authenticated and is admin
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    // TODO: Verify JWT token with Supabase
    // For now, we'll assume the token contains user info
    // In production, you should verify the token with Supabase auth

    const { data: { user }, error } = await getSupabaseClient().auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user is admin
    const { data: userData } = await getSupabaseClient()
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

// Middleware to verify user is authenticated
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await getSupabaseClient().auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

const router = Router();

// GET /api/tests - Get all tests (public for scheduled/active/completed)
router.get('/', async (req, res) => {
  try {
    const { status, subject } = req.query;

    const filters: any = {};
    if (status && typeof status === 'string') {
      filters.status = status;
    }
    if (subject && typeof subject === 'string') {
      filters.subject = subject;
    }

    const tests = await testService.getTests(filters);
    res.json({ success: true, data: tests });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// GET /api/tests/:id - Get test by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const test = await testService.getTestById(id);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({ success: true, data: test });
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
});

// POST /api/tests - Create new test (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const validatedData = createTestSchema.parse(req.body);

    const testData = {
      ...validatedData,
      created_by: req.user.id
    };

    const test = await testService.createTest(testData);
    res.status(201).json({ success: true, data: test });
  } catch (error) {
    console.error('Create test error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }

    res.status(500).json({ error: 'Failed to create test' });
  }
});

// PUT /api/tests/:id - Update test (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateTestSchema.parse(req.body);

    const test = await testService.updateTest(id, validatedData);
    res.json({ success: true, data: test });
  } catch (error) {
    console.error('Update test error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }

    res.status(500).json({ error: 'Failed to update test' });
  }
});

// DELETE /api/tests/:id - Delete test (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await testService.deleteTest(id);
    res.json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

// GET /api/tests/:id/questions - Get questions for a test
router.get('/:id/questions', async (req, res) => {
  try {
    const { id } = req.params;
    const questions = await testService.getQuestionsByTestId(id);
    res.json({ success: true, data: questions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST /api/tests/:id/questions - Add questions to test (admin only)
router.post('/:id/questions', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { questions } = createQuestionsSchema.parse(req.body);

    const questionsData = questions.map((q, index) => ({
      ...q,
      test_id: id
    }));

    const createdQuestions = await testService.createQuestions(questionsData);
    res.status(201).json({ success: true, data: createdQuestions });
  } catch (error) {
    console.error('Create questions error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }

    res.status(500).json({ error: 'Failed to create questions' });
  }
});

// PUT /api/questions/:questionId - Update question (admin only)
router.put('/questions/:questionId', requireAdmin, async (req, res) => {
  try {
    const { questionId } = req.params;
    const updates = req.body;

    const question = await testService.updateQuestion(questionId, updates);
    res.json({ success: true, data: question });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// DELETE /api/questions/:questionId - Delete question (admin only)
router.delete('/questions/:questionId', requireAdmin, async (req, res) => {
  try {
    const { questionId } = req.params;
    await testService.deleteQuestion(questionId);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// POST /api/tests/:id/start - Start a test attempt
router.post('/:id/start', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const attempt = await testService.startTestAttempt(id, userId);
    res.status(201).json({ success: true, data: attempt });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({ error: 'Failed to start test' });
  }
});

// GET /api/attempts/:attemptId - Get test attempt
router.get('/attempts/:attemptId', requireAuth, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    const attempt = await testService.getTestAttempt(attemptId, userId);

    if (!attempt) {
      return res.status(404).json({ error: 'Test attempt not found' });
    }

    res.json({ success: true, data: attempt });
  } catch (error) {
    console.error('Get test attempt error:', error);
    res.status(500).json({ error: 'Failed to fetch test attempt' });
  }
});

// POST /api/attempts/:attemptId/answers - Save answer for a question
router.post('/attempts/:attemptId/answers', requireAuth, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { question_id, selected_option, time_spent_seconds } = saveAnswerSchema.parse(req.body);

    // Get the question to determine if answer is correct
    const questions = await testService.getQuestionsByTestId(
      (await testService.getTestAttempt(attemptId))!.test_id
    );
    const question = questions.find(q => q.id === question_id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const answerData = {
      attempt_id: attemptId,
      question_id,
      selected_option,
      is_correct: selected_option === question.correct_option,
      time_spent_seconds
    };

    const answer = await testService.saveTestAnswer(answerData);
    res.json({ success: true, data: answer });
  } catch (error) {
    console.error('Save answer error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }

    res.status(500).json({ error: 'Failed to save answer' });
  }
});

// GET /api/attempts/:attemptId/answers - Get all answers for an attempt
router.get('/attempts/:attemptId/answers', requireAuth, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    // Verify user owns this attempt
    const attempt = await testService.getTestAttempt(attemptId, userId);
    if (!attempt) {
      return res.status(404).json({ error: 'Test attempt not found' });
    }

    const answers = await testService.getTestAnswersByAttemptId(attemptId);
    res.json({ success: true, data: answers });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ error: 'Failed to fetch answers' });
  }
});

// POST /api/attempts/:attemptId/submit - Submit test attempt
router.post('/attempts/:attemptId/submit', requireAuth, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user.id;

    // Verify user owns this attempt and it's in progress
    const attempt = await testService.getTestAttempt(attemptId, userId);
    if (!attempt) {
      return res.status(404).json({ error: 'Test attempt not found' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ error: 'Test attempt is not in progress' });
    }

    // Calculate score
    const { score, totalPoints } = await testService.calculateTestScore(attemptId);

    // Complete the attempt
    const completedAttempt = await testService.completeTestAttempt(attemptId, score, totalPoints);

    res.json({ success: true, data: completedAttempt });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

// GET /api/user/attempts - Get current user's test attempts
router.get('/user/attempts', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const attempts = await testService.getTestAttemptsByUserId(userId);
    res.json({ success: true, data: attempts });
  } catch (error) {
    console.error('Get user attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch user attempts' });
  }
});

// GET /api/tests/:id/attempts - Get all attempts for a test (admin only)
router.get('/:id/attempts', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const attempts = await testService.getTestAttemptsByTestId(id);
    res.json({ success: true, data: attempts });
  } catch (error) {
    console.error('Get test attempts error:', error);
    res.status(500).json({ error: 'Failed to fetch test attempts' });
  }
});



export default router;