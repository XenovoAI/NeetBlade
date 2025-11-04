import express from 'express';

const router = express.Router();

// In-memory storage for demo (replace with database later)
let tests = [
  {
    id: '1',
    title: 'NEET Physics Mock Test',
    subject: 'Physics',
    duration_minutes: 180,
    scheduled_start: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    status: 'scheduled',
    description: 'Complete Physics syllabus test',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

let questions = [
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
    points: 1,
    created_at: new Date().toISOString()
  }
];

// GET all tests
router.get('/', (req, res) => {
  try {
    const { status, subject } = req.query;
    let filteredTests = tests;

    if (status && typeof status === 'string') {
      const statuses = status.split(',');
      filteredTests = filteredTests.filter(test => statuses.includes(test.status));
    }

    if (subject && typeof subject === 'string') {
      filteredTests = filteredTests.filter(test => test.subject === subject);
    }

    res.json({ success: true, data: filteredTests });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

// GET test by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const test = tests.find(t => t.id === id);

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({ success: true, data: test });
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
});

// POST create test
router.post('/', (req, res) => {
  try {
    const { title, description, subject, duration_minutes, scheduled_start, status } = req.body;

    // Basic validation
    if (!title || !subject || !duration_minutes) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Title, subject, and duration are required'
      });
    }

    const newTest = {
      id: Date.now().toString(),
      title: title || 'Untitled Test',
      description: description || '',
      subject: subject || 'General',
      duration_minutes: parseInt(duration_minutes) || 60,
      scheduled_start: scheduled_start || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      status: status || 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    tests.push(newTest);
    res.status(201).json({ success: true, data: newTest });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

// PUT update test
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const testIndex = tests.findIndex(t => t.id === id);

    if (testIndex === -1) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const updatedTest = { ...tests[testIndex], ...req.body, updated_at: new Date().toISOString() };
    tests[testIndex] = updatedTest;
    res.json({ success: true, data: updatedTest });
  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
});

// DELETE test
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const testIndex = tests.findIndex(t => t.id === id);

    if (testIndex === -1) {
      return res.status(404).json({ error: 'Test not found' });
    }

    tests.splice(testIndex, 1);
    res.json({ success: true, message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

// GET questions for a test
router.get('/:id/questions', (req, res) => {
  try {
    const { id } = req.params;
    const testQuestions = questions.filter(q => q.test_id === id);
    res.json({ success: true, data: testQuestions });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// POST add questions to test
router.post('/:id/questions', (req, res) => {
  try {
    const { id } = req.params;
    const { questions: newQuestions } = req.body;

    if (!newQuestions || !Array.isArray(newQuestions)) {
      return res.status(400).json({ error: 'Invalid questions data' });
    }

    const createdQuestions = newQuestions.map((q, index) => ({
      id: Date.now().toString() + index,
      test_id: id,
      question_text: q.question_text || '',
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_option: q.correct_option || 0,
      order_index: q.order_index || index + 1,
      points: q.points || 1,
      created_at: new Date().toISOString()
    }));

    questions.push(...createdQuestions);
    res.status(201).json({ success: true, data: createdQuestions });
  } catch (error) {
    console.error('Create questions error:', error);
    res.status(500).json({ error: 'Failed to create questions' });
  }
});

export default router;