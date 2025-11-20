import { createClient } from '@supabase/supabase-js';

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

export class TestService {
  private _supabase: any = null;

  private get supabase() {
    if (!this._supabase) {
      const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
      const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
      
      console.log('TestService Supabase config:', { 
        url: supabaseUrl, 
        keyLength: supabaseKey?.length,
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_ANON_KEY
      });
      
      this._supabase = createClient(supabaseUrl, supabaseKey);
    }
    return this._supabase;
  }

  // Test CRUD operations
  async createTest(testData: Omit<Test, 'id' | 'created_at' | 'updated_at' | 'scheduled_end'>): Promise<Test> {
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

  async getTests(filters?: {
    status?: Test['status'];
    subject?: string;
    user_id?: string;
  }): Promise<Test[]> {
    let query = this.supabase.from('tests').select('*');

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

  async updateTest(id: string, updates: Partial<Test>): Promise<Test> {
    // If updating scheduled_start or duration_minutes, recalculate scheduled_end
    if (updates.scheduled_start || updates.duration_minutes) {
      const currentTest = await this.getTestById(id);
      if (currentTest) {
        const scheduledStart = new Date(updates.scheduled_start || currentTest.scheduled_start);
        const durationMinutes = updates.duration_minutes || currentTest.duration_minutes;
        const scheduledEnd = new Date(scheduledStart.getTime() + (durationMinutes * 60 * 1000));
        updates.scheduled_end = scheduledEnd.toISOString();
      }
    }

    const { data, error } = await this.supabase
      .from('tests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update test: ${error.message}`);
    return data;
  }

  async deleteTest(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('tests')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete test: ${error.message}`);
  }

  // Question CRUD operations
  async createQuestions(questionsData: Omit<Question, 'id' | 'created_at'>[]): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .insert(questionsData)
      .select();

    if (error) throw new Error(`Failed to create questions: ${error.message}`);
    return data || [];
  }

  async getQuestionsByTestId(testId: string): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('test_id', testId)
      .order('order_index', { ascending: true });

    if (error) throw new Error(`Failed to fetch questions: ${error.message}`);
    return data || [];
  }

  async updateQuestion(id: string, updates: Partial<Question>): Promise<Question> {
    const { data, error } = await this.supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update question: ${error.message}`);
    return data;
  }

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete question: ${error.message}`);
  }

  // Test Attempt operations
  async startTestAttempt(testId: string, userId: string): Promise<TestAttempt> {
    // Check if user already has an in-progress attempt
    const { canStart, existingAttempt, reason } = await this.canUserStartTest(testId, userId);
    
    if (!canStart) {
      throw new Error(reason || 'Cannot start test attempt');
    }

    // Return existing attempt if available
    if (existingAttempt) {
      return existingAttempt;
    }

    // Create new attempt
    const attemptData = {
      test_id: testId,
      user_id: userId,
      status: 'in_progress' as const
    };

    const { data, error } = await this.supabase
      .from('test_attempts')
      .insert([attemptData])
      .select()
      .single();

    if (error) throw new Error(`Failed to start test attempt: ${error.message}`);
    return data;
  }

  async getTestAttempt(attemptId: string, userId?: string): Promise<TestAttempt | null> {
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

  async getTestAttemptsByTestId(testId: string): Promise<TestAttempt[]> {
    const { data, error } = await this.supabase
      .from('test_attempts')
      .select('*')
      .eq('test_id', testId)
      .order('started_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch test attempts: ${error.message}`);
    return data || [];
  }

  async getTestAttemptsByUserId(userId: string): Promise<TestAttempt[]> {
    const { data, error } = await this.supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch user test attempts: ${error.message}`);
    return data || [];
  }

  async updateTestAttempt(id: string, updates: Partial<TestAttempt>): Promise<TestAttempt> {
    const { data, error } = await this.supabase
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
    const { data, error } = await this.supabase
      .from('test_answers')
      .upsert([answerData])
      .select()
      .single();

    if (error) throw new Error(`Failed to save test answer: ${error.message}`);
    return data;
  }

  async getTestAnswersByAttemptId(attemptId: string): Promise<TestAnswer[]> {
    const { data, error } = await this.supabase
      .from('test_answers')
      .select('*')
      .eq('attempt_id', attemptId)
      .order('answered_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch test answers: ${error.message}`);
    return data || [];
  }

  async calculateTestScore(attemptId: string): Promise<{ score: number; totalPoints: number }> {
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

  // Test validation
  async canUserStartTest(testId: string, userId: string): Promise<{ canStart: boolean; reason?: string; existingAttempt?: TestAttempt }> {
    const test = await this.getTestById(testId);
    if (!test) {
      return { canStart: false, reason: 'Test not found' };
    }

    if (test.status !== 'active') {
      return { canStart: false, reason: `Test is ${test.status}` };
    }

    // Check if user already has an attempt
    const existingAttempts = await this.supabase
      .from('test_attempts')
      .select('*')
      .eq('test_id', testId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (existingAttempts.data && existingAttempts.data.length > 0) {
      const attempt = existingAttempts.data[0];
      if (attempt.status === 'in_progress') {
        // Return the existing attempt instead of blocking
        return { canStart: true, existingAttempt: attempt };
      } else if (attempt.status === 'completed' || attempt.status === 'timed_out') {
        return { canStart: false, reason: 'You have already completed this test' };
      }
    }

    return { canStart: true };
  }
}

export const testService = new TestService();