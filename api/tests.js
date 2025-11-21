// Simple mock data - no external dependencies
const mockTests = [
  {
    id: '1',
    title: 'NEET Physics Mock Test 1',
    description: 'Comprehensive physics test covering mechanics and thermodynamics',
    subject: 'physics',
    duration_minutes: 180,
    scheduled_start: new Date(Date.now() + 60000).toISOString(),
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'NEET Chemistry Mock Test 1',
    description: 'Organic and inorganic chemistry fundamentals',
    subject: 'chemistry',
    duration_minutes: 180,
    scheduled_start: new Date(Date.now() + 3600000).toISOString(),
    status: 'scheduled',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'NEET Biology Mock Test 1',
    description: 'Cell biology and genetics comprehensive test',
    subject: 'biology',
    duration_minutes: 180,
    scheduled_start: new Date(Date.now() - 3600000).toISOString(),
    status: 'completed',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

module.exports = function handler(req, res) {
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

    // GET /api/tests - Get all tests
    if (method === 'GET') {
      let filteredTests = mockTests;
      
      // Apply filters if provided
      if (query.status) {
        filteredTests = filteredTests.filter(test => test.status === query.status);
      }
      
      if (query.subject) {
        filteredTests = filteredTests.filter(test => test.subject === query.subject);
      }
      
      return res.status(200).json({ 
        success: true, 
        data: filteredTests 
      });
    }

    // Method not allowed
    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    // Always return mock data on any error
    return res.status(200).json({ 
      success: true, 
      data: mockTests,
      note: 'Using fallback data due to error'
    });
  }
};