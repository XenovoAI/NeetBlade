const express = require('express');
const path = require('path');
const { createServer } = require('http');

const app = express();
app.use(express.json());

// Simple in-memory storage for demo
let tests = [
  {
    id: '1',
    title: 'NEET Physics Mock Test',
    subject: 'Physics',
    duration_minutes: 180,
    scheduled_start: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
    status: 'scheduled',
    description: 'Complete Physics syllabus test with multiple choice questions'
  },
  {
    id: '2',
    title: 'NEET Chemistry Test',
    subject: 'Chemistry',
    duration_minutes: 120,
    scheduled_start: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    status: 'scheduled',
    description: 'Chemistry test covering organic and inorganic topics'
  }
];

// API Routes
app.get('/api/tests', (req, res) => {
  res.json({ success: true, data: tests });
});

app.post('/api/tests', (req, res) => {
  const newTest = {
    id: Date.now().toString(),
    ...req.body,
    created_at: new Date().toISOString(),
    status: 'draft'
  };
  tests.push(newTest);
  res.json({ success: true, data: newTest });
});

// Serve static files
app.use(express.static('dist/client'));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/client/index.html'));
});

const server = createServer(app);
const PORT = process.env.PORT || 5000;

server.listen(PORT, 'localhost', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Live Test System Ready!`);
  console.log(`👥 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`🎯 Live Tests: http://localhost:${PORT}/live-tests`);
});

// Auto-unlock tests at scheduled time
setInterval(() => {
  const now = new Date();
  tests.forEach(test => {
    if (test.status === 'scheduled' && new Date(test.scheduled_start) <= now) {
      test.status = 'active';
      console.log(`🔓 Test "${test.title}" is now LIVE!`);
    }
  });
}, 5000); // Check every 5 seconds

module.exports = app;