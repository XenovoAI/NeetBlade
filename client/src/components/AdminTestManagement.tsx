import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Clock, Play, Square, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface Test {
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

interface Question {
  id?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: number;
  order_index: number;
  points: number;
}

export default function AdminTestManagement() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showQuestionsDialog, setShowQuestionsDialog] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const { toast } = useToast();

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: 'physics',
    duration_minutes: 180,
    scheduled_start: ''
  });

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
      toast({
        title: "Error",
        description: "Failed to fetch tests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          scheduled_start: new Date(formData.scheduled_start).toISOString(),
          status: 'draft'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create test');
      }

      toast({
        title: "Success",
        description: "Test created successfully"
      });

      setShowCreateDialog(false);
      setFormData({
        title: '',
        description: '',
        subject: 'physics',
        duration_minutes: 180,
        scheduled_start: ''
      });
      fetchTests();
    } catch (error) {
      console.error('Error creating test:', error);
      toast({
        title: "Error",
        description: "Failed to create test",
        variant: "destructive"
      });
    }
  };

  const handleUpdateTestStatus = async (testId: string, newStatus: Test['status']) => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/tests/${testId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update test status');
      }

      toast({
        title: "Success",
        description: `Test ${newStatus === 'active' ? 'started' : newStatus === 'completed' ? 'completed' : 'updated'} successfully`
      });

      fetchTests();
    } catch (error) {
      console.error('Error updating test status:', error);
      toast({
        title: "Error",
        description: "Failed to update test status",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTest = async (testId: string) => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete test');
      }

      toast({
        title: "Success",
        description: "Test deleted successfully"
      });

      fetchTests();
    } catch (error) {
      console.error('Error deleting test:', error);
      toast({
        title: "Error",
        description: "Failed to delete test",
        variant: "destructive"
      });
    }
  };

  const fetchQuestions = async (testId: string) => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/tests/${testId}/questions`, {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data = await response.json();
      setQuestions(data.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch questions",
        variant: "destructive"
      });
    }
  };

  const handleManageQuestions = (test: Test) => {
    setSelectedTest(test);
    fetchQuestions(test.id);
    setShowQuestionsDialog(true);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 0,
      order_index: questions.length,
      points: 1
    }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const saveQuestions = async () => {
    if (!selectedTest) return;

    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/tests/${selectedTest.id}/questions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ questions })
      });

      if (!response.ok) {
        throw new Error('Failed to save questions');
      }

      toast({
        title: "Success",
        description: "Questions saved successfully"
      });

      setShowQuestionsDialog(false);
    } catch (error) {
      console.error('Error saving questions:', error);
      toast({
        title: "Error",
        description: "Failed to save questions",
        variant: "destructive"
      });
    }
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

  const getStatusIcon = (status: Test['status']) => {
    switch (status) {
      case 'draft': return <Edit className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Square className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading tests...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Test Management</h2>
          <p className="text-muted-foreground">Create and manage live tests</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Test
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Test</DialogTitle>
              <DialogDescription>
                Create a new live test for students to take
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTest} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <select
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="physics">Physics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="biology">Biology</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                  min="1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="scheduled_start">Scheduled Start</Label>
                <Input
                  id="scheduled_start"
                  type="datetime-local"
                  value={formData.scheduled_start}
                  onChange={(e) => setFormData({...formData, scheduled_start: e.target.value})}
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Create Test
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <Card key={test.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">{test.title}</h3>
                {test.description && (
                  <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{test.subject}</Badge>
                  <Badge className={getStatusColor(test.status)}>
                    {getStatusIcon(test.status)}
                    <span className="ml-1 capitalize">{test.status}</span>
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{test.duration_minutes} minutes</span>
                  </div>
                  <div>
                    <span>Start: {new Date(test.scheduled_start).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleManageQuestions(test)}
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Manage Questions
              </Button>
              
              <div className="flex gap-2">
                {test.status === 'draft' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateTestStatus(test.id, 'scheduled')}
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                )}
                
                {test.status === 'scheduled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateTestStatus(test.id, 'active')}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                )}
                
                {test.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateTestStatus(test.id, 'completed')}
                    className="flex-1"
                  >
                    <Square className="h-4 w-4 mr-1" />
                    End
                  </Button>
                )}
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Test</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this test? This action cannot be undone.
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
            </div>
          </Card>
        ))}
      </div>

      {tests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No tests created yet</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Test
          </Button>
        </div>
      )}

      {/* Questions Management Dialog */}
      <Dialog open={showQuestionsDialog} onOpenChange={setShowQuestionsDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Questions - {selectedTest?.title}
            </DialogTitle>
            <DialogDescription>
              Add and edit questions for this test
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={index} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Question {index + 1}</Label>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Textarea
                    placeholder="Enter question text"
                    value={question.question_text}
                    onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                    rows={2}
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
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
                  
                  <div className="flex gap-4">
                    <div>
                      <Label>Correct Answer</Label>
                      <select
                        value={question.correct_option}
                        onChange={(e) => updateQuestion(index, 'correct_option', parseInt(e.target.value))}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value={0}>A</option>
                        <option value={1}>B</option>
                        <option value={2}>C</option>
                        <option value={3}>D</option>
                      </select>
                    </div>
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        value={question.points}
                        onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                        min="1"
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
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowQuestionsDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={saveQuestions} className="flex-1">
                Save Questions
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}