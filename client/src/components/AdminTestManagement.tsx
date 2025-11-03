import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Edit,
  Trash2,
  Play,
  Clock,
  Users,
  Eye,
  BarChart3,
  Calendar,
  Save
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import TestMonitoringDashboard from './TestMonitoringDashboard';

interface Test {
  id: string;
  title: string;
  description?: string;
  subject: string;
  duration_minutes: number;
  scheduled_start: string;
  scheduled_end?: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

interface Question {
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
}

interface TestFormData {
  title: string;
  description: string;
  subject: string;
  duration_minutes: number;
  scheduled_start: string;
  status: 'draft' | 'scheduled';
}

interface QuestionFormData {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: number;
  points: number;
}

export default function AdminTestManagement() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);
  const [showMonitoringDialog, setShowMonitoringDialog] = useState(false);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);

  // Form states
  const [testForm, setTestForm] = useState<TestFormData>({
    title: '',
    description: '',
    subject: '',
    duration_minutes: 60,
    scheduled_start: '',
    status: 'draft'
  });

  const [questions, setQuestions] = useState<QuestionFormData[]>([
    {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 0,
      points: 1
    }
  ]);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/tests', {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tests');
      }

      const data = await response.json();
      setTests(data.data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestQuestions = async (testId: string) => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) return;

      const response = await fetch(`/api/tests/${testId}/questions`, {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTestQuestions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleCreateTest = async () => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) return;

      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testForm)
      });

      if (!response.ok) {
        throw new Error('Failed to create test');
      }

      const data = await response.json();
      setTests(prev => [...prev, data.data]);
      setShowCreateDialog(false);
      resetTestForm();
    } catch (error) {
      console.error('Error creating test:', error);
      setError('Failed to create test');
    }
  };

  const handleUpdateTest = async (testId: string, updates: Partial<Test>) => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) return;

      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update test');
      }

      const data = await response.json();
      setTests(prev => prev.map(test => test.id === testId ? data.data : test));
    } catch (error) {
      console.error('Error updating test:', error);
      setError('Failed to update test');
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) return;

      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete test');
      }

      setTests(prev => prev.filter(test => test.id !== testId));
    } catch (error) {
      console.error('Error deleting test:', error);
      setError('Failed to delete test');
    }
  };

  const handleSaveQuestions = async () => {
    if (!selectedTest) return;

    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) return;

      const response = await fetch(`/api/tests/${selectedTest.id}/questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          questions: questions.map((q, index) => ({
            ...q,
            order_index: index
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save questions');
      }

      setShowQuestionsDialog(false);
      fetchTestQuestions(selectedTest.id);
      resetQuestionsForm();
    } catch (error) {
      console.error('Error saving questions:', error);
      setError('Failed to save questions');
    }
  };

  const resetTestForm = () => {
    setTestForm({
      title: '',
      description: '',
      subject: '',
      duration_minutes: 60,
      scheduled_start: '',
      status: 'draft'
    });
  };

  const resetQuestionsForm = () => {
    setQuestions([{
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 0,
      points: 1
    }]);
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 0,
      points: 1
    }]);
  };

  const updateQuestion = (index: number, field: keyof QuestionFormData, value: any) => {
    setQuestions(prev => prev.map((q, i) =>
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const removeQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusColor = (status: Test['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test Management</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Test</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Test Title</Label>
                <Input
                  id="title"
                  value={testForm.title}
                  onChange={(e) => setTestForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter test title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={testForm.description}
                  onChange={(e) => setTestForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter test description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={testForm.subject} onValueChange={(value) => setTestForm(prev => ({ ...prev, subject: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Full Test">Full Test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={testForm.duration_minutes}
                    onChange={(e) => setTestForm(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="scheduled_start">Scheduled Start Time</Label>
                <Input
                  id="scheduled_start"
                  type="datetime-local"
                  value={testForm.scheduled_start}
                  onChange={(e) => setTestForm(prev => ({ ...prev, scheduled_start: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="status">Initial Status</Label>
                <Select value={testForm.status} onValueChange={(value: 'draft' | 'scheduled') => setTestForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTest}>
                  Create Test
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600">{error}</p>
        </Card>
      )}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Title</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Scheduled Start</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.map((test) => (
              <TableRow key={test.id}>
                <TableCell className="font-medium">{test.title}</TableCell>
                <TableCell>{test.subject}</TableCell>
                <TableCell>{test.duration_minutes} min</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(test.status)}>
                    {test.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {test.scheduled_start ? formatDateTime(test.scheduled_start) : 'Not scheduled'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTest(test);
                        fetchTestQuestions(test.id);
                        setShowQuestionsDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedTest(test);
                        setShowMonitoringDialog(true);
                      }}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>

                    {test.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateTest(test.id, { status: 'scheduled' })}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    )}

                    {test.status === 'scheduled' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateTest(test.id, { status: 'active' })}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Test</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{test.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteTest(test.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Questions Dialog */}
      <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTest ? `Manage Questions for ${selectedTest.title}` : 'Manage Questions'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="existing" className="w-full">
            <TabsList>
              <TabsTrigger value="existing">Existing Questions ({testQuestions.length})</TabsTrigger>
              <TabsTrigger value="add">Add New Questions</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4">
              {testQuestions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No questions added yet</p>
              ) : (
                testQuestions.map((question, index) => (
                  <Card key={question.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">Q{index + 1}: {question.question_text}</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>A) {question.option_a}</div>
                          <div>B) {question.option_b}</div>
                          <div>C) {question.option_c}</div>
                          <div>D) {question.option_d}</div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          Correct: {String.fromCharCode(65 + question.correct_option)} | Points: {question.points}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="add" className="space-y-4">
              {questions.map((question, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Question {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        value={question.question_text}
                        onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                        placeholder="Enter question"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Option A</Label>
                        <Input
                          value={question.option_a}
                          onChange={(e) => updateQuestion(index, 'option_a', e.target.value)}
                          placeholder="Option A"
                        />
                      </div>
                      <div>
                        <Label>Option B</Label>
                        <Input
                          value={question.option_b}
                          onChange={(e) => updateQuestion(index, 'option_b', e.target.value)}
                          placeholder="Option B"
                        />
                      </div>
                      <div>
                        <Label>Option C</Label>
                        <Input
                          value={question.option_c}
                          onChange={(e) => updateQuestion(index, 'option_c', e.target.value)}
                          placeholder="Option C"
                        />
                      </div>
                      <div>
                        <Label>Option D</Label>
                        <Input
                          value={question.option_d}
                          onChange={(e) => updateQuestion(index, 'option_d', e.target.value)}
                          placeholder="Option D"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Correct Answer</Label>
                        <Select
                          value={question.correct_option.toString()}
                          onValueChange={(value) => updateQuestion(index, 'correct_option', parseInt(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">A</SelectItem>
                            <SelectItem value="1">B</SelectItem>
                            <SelectItem value="2">C</SelectItem>
                            <SelectItem value="3">D</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Points</Label>
                        <Input
                          type="number"
                          value={question.points}
                          onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value) || 1)}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              <Button onClick={addQuestion} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowQuestionsDialog(false)}>
              Close
            </Button>
            <Button onClick={handleSaveQuestions}>
              <Save className="h-4 w-4 mr-2" />
              Save Questions
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Monitoring Dialog */}
      <Dialog open={showMonitoringDialog} onOpenChange={setShowMonitoringDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Test Monitoring</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <TestMonitoringDashboard testId={selectedTest.id} test={selectedTest} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}