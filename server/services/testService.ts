import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Test {
  id: string;
  title: string;
  description?: string;
  subject: string;
  duration_minutes: number;
  scheduled_start: string;
  scheduled_end?: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  test_id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: number;
  order_index: number;
  points: number;
  created_at: string;
}

export interface TestAttempt {
  id: string;
  test_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  status: 'in_progress' | 'completed' | 'timed_out';
  time_spent_seconds?: number;
  score?: number;
  total_points?: number;
  created_at: string;
}

export interface TestAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option?: number;
  is_correct?: boolean;
  answered_at: string;
  time_spent_seconds?: number;
}

export interface TestSession {
  id: string;
  test_id: string;
  active_participants: number;
  completed_participants: number;
  session_status: 'waiting' | 'active' | 'ended';
  actual_start_time?: string;
  actual_end_time?: string;
  created_at: string;
  updated_at: string;
}

export class TestService {
  // Test CRUD operations
  async createTest(testData: Omit<Test, 'id' | 'created_at' | 'updated_at' | 'scheduled_end'>): Promise<Test> {
    const { data, error } = await supabase
      .from('tests')
      .insert([testData])
      .select()
      .single();

    if (error) throw new Error(`Failed to create test: ${error.message}`);
    return data;
  }

  async getTests(filters?: {
    status?: Test['status'];
    subject?: string;
    user_id?: string;
  }): Promise<Test[]> {
    let query = supabase.from('tests').select('*');

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.subject) {
      query = query.eq('subject', filters.subject);
    }

    if (filters?.user_id) {
      query = query.eq('created_by', filters.user_id);
    }

    const { data, error } = await query.order('scheduled_start', { ascending: true });

    if (error) throw new Error(`Failed to fetch tests: ${error.message}`);
    return data || [];
  }

  async getTestById(id: string): Promise<Test | null> {
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch test: ${error.message}`);
    }
    return data;
  }

  async updateTest(id: string, updates: Partial<Test>): Promise<Test> {
    const { data, error } = await supabase
      .from('tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update test: ${error.message}`);
    return data;
  }

  async deleteTest(id: string): Promise<void> {
    const { error } = await supabase
      .from('tests')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete test: ${error.message}`);
  }

  // Question CRUD operations
  async createQuestions(questionsData: Omit<Question, 'id' | 'created_at'>[]): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .insert(questionsData)
      .select();

    if (error) throw new Error(`Failed to create questions: ${error.message}`);
    return data || [];
  }

  async getQuestionsByTestId(testId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_index', { ascending: true });

    if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
    return data || [];
  }

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update question: ${error.message}`);
    return data;
  }

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete question: ${error.message}`);
  }

  // Test Attempt operations
  async startTestAttempt(testId: string, userId: string): Promise<TestAttempt> {
    const attemptData = {
      test_id: testId,
      user_id: userId,
      status: 'in_progress' as const
    };

    const { data, error } = await supabase
      .from('test_attempts')
      .insert([attemptData])
      .select()
      .single();

    if (error) throw new Error(`Failed to start test attempt: ${error.message}`);
    return data;
  }

  async getTestAttempt(attemptId: string, userId?: string): Promise<TestAttempt | null> {
    let query = supabase
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

  async getTestAttemptsByTestId(testId: string): Promise<TestAttempt[]> {
    const { data, error } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('test_id', testId)
      .order('started_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch test attempts: ${error.message}`);
    return data || [];
  }

  async getTestAttemptsByUserId(userId: string): Promise<TestAttempt[]> {
    const { data, error } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user test attempts: ${error.message}`);
    return data || [];
  }

  async updateTestAttempt(id: string, updates: Partial<TestAttempt>): Promise<TestAttempt> {
    const { data, error } = await supabase
      .from('test_attempts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update test attempt: ${error.message}`);
    return data;
  }

  async completeTestAttempt(attemptId: string, score: number, totalPoints: number): Promise<TestAttempt> {
    const updates = {
      status: 'completed' as const,
      ended_at: new Date().toISOString(),
      score,
      total_points: totalPoints
    };

    return this.updateTestAttempt(attemptId, updates);
  }

  async timeoutTestAttempt(attemptId: string, score: number, totalPoints: number): Promise<TestAttempt> {
    const updates = {
      status: 'timed_out' as const,
      ended_at: new Date().toISOString(),
      score,
      total_points: totalPoints
    };

    return this.updateTestAttempt(attemptId, updates);
  }

  // Test Answer operations
  async saveTestAnswer(answerData: Omit<TestAnswer, 'id' | 'answered_at'>): Promise<TestAnswer> {
    const { data, error } = await supabase
      .from('test_answers')
      .upsert([answerData])
      .select()
      .single();

    if (error) throw new Error(`Failed to save test answer: ${error.message}`);
    return data;
  }

  async getTestAnswersByAttemptId(attemptId: string): Promise<TestAnswer[]> {
    const { data, error } = await supabase
      .from('test_answers')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('answered_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch test answers: ${error.message}`);
    return data || [];
  }

  async calculateTestScore(attemptId: string): Promise<{ score: number; totalPoints: number }> {
    const { data, error } = await supabase
      .from('test_answers')
      .select(`
        is_correct,
        questions!inner(points)
      `)
      .eq('attempt_id', attemptId);

    if (error) throw new Error(`Failed to calculate test score: ${error.message}`);

    const answers = data || [];
    const score = answers.filter(answer => answer.is_correct).reduce((sum, answer) =>
      sum + (answer.questions as any).points, 0
    );
    const totalPoints = answers.reduce((sum, answer) =>
      sum + (answer.questions as any).points, 0
    );

    return { score, totalPoints };
  }

  // Test Session operations
  async getTestSession(testId: string): Promise<TestSession | null> {
    const { data, error } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('test_id', testId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch test session: ${error.message}`);
    }
    return data;
  }

  async updateTestSession(testId: string, updates: Partial<TestSession>): Promise<TestSession> {
    const { data, error } = await supabase
      .from('test_sessions')
      .update(updates)
      .eq('test_id', testId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update test session: ${error.message}`);
    return data;
  }

  // Real-time subscriptions
  subscribeToTestAttempts(callback: (payload: any) => void) {
    return supabase
      .channel('test_attempts_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'test_attempts' },
        callback
      )
      .subscribe();
  }

  subscribeToTestSessions(callback: (payload: any) => void) {
    return supabase
      .channel('test_sessions_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'test_sessions' },
        callback
      )
      .subscribe();
  }

  // Test validation
  async canUserStartTest(testId: string, userId: string): Promise<{ canStart: boolean; reason?: string }> {
    const test = await this.getTestById(testId);
    if (!test) {
      return { canStart: false, reason: 'Test not found' };
    }

    if (test.status !== 'active') {
      return { canStart: false, reason: `Test is ${test.status}` };
    }

    const now = new Date();
    const startTime = new Date(test.scheduled_start);
    const endTime = new Date(test.scheduled_end!);

    if (now < startTime) {
      return { canStart: false, reason: 'Test has not started yet' };
    }

    if (now > endTime) {
      return { canStart: false, reason: 'Test has already ended' };
    }

    // Check if user already has an attempt
    const existingAttempts = await supabase
      .from('test_attempts')
      .select('*')
      .eq('test_id', testId)
      .eq('user_id', userId);

    if (existingAttempts.data && existingAttempts.data.length > 0) {
      const attempt = existingAttempts.data[0];
      if (attempt.status === 'in_progress') {
        return { canStart: false, reason: 'You already have an active attempt' };
      } else if (attempt.status === 'completed' || attempt.status === 'timed_out') {
        return { canStart: false, reason: 'You have already completed this test' };
      }
    }

    return { canStart: true };
  }
}

export const testService = new TestService();