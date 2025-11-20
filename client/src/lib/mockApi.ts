// Mock API for Netlify deployment when backend functions don't work
export const mockTests = [
  {
    id: '1',
    title: 'NEET Physics Mock Test 1',
    description: 'Comprehensive physics test covering mechanics and thermodynamics',
    subject: 'physics',
    duration_minutes: 180,
    scheduled_start: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'NEET Chemistry Mock Test 1',
    description: 'Organic and inorganic chemistry fundamentals',
    subject: 'chemistry',
    duration_minutes: 180,
    scheduled_start: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
    status: 'scheduled' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'NEET Biology Mock Test 1',
    description: 'Cell biology and genetics comprehensive test',
    subject: 'biology',
    duration_minutes: 180,
    scheduled_start: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    status: 'completed' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockQuestions = [
  {
    id: '1',
    test_id: '1',
    question_text: 'What is the SI unit of force?',
    option_a: 'Newton',
    option_b: 'Joule',
    option_c: 'Watt',
    option_d: 'Pascal',
    correct_option: 0,
    order_index: 1,
    points: 4,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    test_id: '1',
    question_text: 'Which law states that force equals mass times acceleration?',
    option_a: 'First law of motion',
    option_b: 'Second law of motion',
    option_c: 'Third law of motion',
    option_d: 'Law of gravitation',
    correct_option: 1,
    order_index: 2,
    points: 4,
    created_at: new Date().toISOString()
  }
];

export const mockAttempts = [
  {
    id: '1',
    test_id: '3',
    user_id: 'mock-user',
    started_at: new Date(Date.now() - 7200000).toISOString(),
    ended_at: new Date(Date.now() - 3600000).toISOString(),
    status: 'completed' as const,
    score: 32,
    total_points: 40,
    created_at: new Date().toISOString()
  }
];

// Mock API functions
export const mockApi = {
  async getTests() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, data: mockTests };
  },

  async getTestById(id: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const test = mockTests.find(t => t.id === id);
    return test ? { success: true, data: test } : { success: false, error: 'Test not found' };
  },

  async getQuestionsByTestId(testId: string) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const questions = mockQuestions.filter(q => q.test_id === testId);
    return { success: true, data: questions };
  },

  async getUserAttempts() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, data: mockAttempts };
  },

  async startTestAttempt(testId: string) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newAttempt = {
      id: Date.now().toString(),
      test_id: testId,
      user_id: 'mock-user',
      started_at: new Date().toISOString(),
      status: 'in_progress' as const,
      created_at: new Date().toISOString()
    };
    return { success: true, data: newAttempt };
  },

  async saveAnswer(attemptId: string, questionId: string, selectedOption: number) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return { 
      success: true, 
      data: { 
        id: Date.now().toString(),
        attempt_id: attemptId,
        question_id: questionId,
        selected_option: selectedOption,
        answered_at: new Date().toISOString()
      } 
    };
  },

  async submitTest(attemptId: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: {
        id: attemptId,
        status: 'completed',
        ended_at: new Date().toISOString(),
        score: Math.floor(Math.random() * 40) + 20, // Random score between 20-60
        total_points: 40
      }
    };
  }
};

// Check if we should use mock API (when real API fails)
export const shouldUseMockApi = () => {
  return process.env.NODE_ENV === 'production' && window.location.hostname.includes('netlify');
};