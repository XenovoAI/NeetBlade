import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Clock, ChevronLeft, ChevronRight, AlertCircle, Save } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useRealtimeTest } from "@/hooks/useRealtimeTest";

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
  created_at: string;
}

interface TestAttempt {
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

interface Test {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  scheduled_start: string;
  scheduled_end?: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
}

export default function TestInterface() {
  const { testId } = useParams<{ testId: string }>();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [startTime] = useState(new Date());

  const { isConnected } = useRealtimeTest({
    testId,
    autoConnect: false
  });

  useEffect(() => {
    if (!testId) {
      setError('Test ID is required');
      return;
    }

    initializeTest();
  }, [testId]);

  useEffect(() => {
    if (timeLeft <= 0 && attempt) {
      handleTimeout();
    }

    // Show 5-minute warning
    if (timeLeft === 300 && attempt) {
      setShowWarningDialog(true);
    }
  }, [timeLeft, attempt]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (timeLeft > 0 && attempt?.status === 'in_progress') {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, attempt?.status]);

  const initializeTest = async () => {
    try {
      setLoading(true);
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      // Fetch test details
      const testResponse = await fetch(`/api/tests/${testId}`, {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (!testResponse.ok) {
        // Check if response is HTML (authentication redirect)
        const contentType = testResponse.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error('Authentication required. Please log in to access this test.');
        }

        throw new Error('Failed to fetch test details');
      }

      // Ensure response is JSON
      const testContentType = testResponse.headers.get("content-type");
      if (!testContentType || !testContentType.includes("application/json")) {
        throw new TypeError('Expected JSON response for test details');
      }

      const testData = await testResponse.json();
      setTest(testData.data);

      // Check if test is active
      if (testData.data.status !== 'active') {
        throw new Error(`Test is ${testData.data.status}. Cannot start test.`);
      }

      // Fetch questions
      const questionsResponse = await fetch(`/api/tests/${testId}/questions`, {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (!questionsResponse.ok) {
        // Check if response is HTML (authentication redirect)
        const questionsContentType = questionsResponse.headers.get("content-type");
        if (questionsContentType && questionsContentType.includes("text/html")) {
          throw new Error('Authentication required. Please log in to access test questions.');
        }

        throw new Error('Failed to fetch questions');
      }

      // Ensure response is JSON
      const questionsContentType = questionsResponse.headers.get("content-type");
      if (!questionsContentType || !questionsContentType.includes("application/json")) {
        throw new TypeError('Expected JSON response for questions');
      }

      const questionsData = await questionsResponse.json();
      setQuestions(questionsData.data || []);

      // Start or get existing attempt
      const attemptResponse = await fetch(`/api/tests/${testId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!attemptResponse.ok) {
        const errorData = await attemptResponse.json();
        throw new Error(errorData.error || 'Failed to start test');
      }

      const attemptData = await attemptResponse.json();
      setAttempt(attemptData.data);

      // Calculate time remaining
      const endTime = new Date(testData.data.scheduled_end!);
      const now = new Date();
      const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
      setTimeLeft(remainingSeconds);

      // Fetch existing answers
      await fetchExistingAnswers(attemptData.data.id, token.data.session.access_token);

    } catch (error) {
      console.error('Error initializing test:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize test');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingAnswers = async (attemptId: string, token: string) => {
    try {
      const response = await fetch(`/api/attempts/${attemptId}/answers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        // Check if response is HTML (authentication redirect)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          console.warn('Received HTML response for answers, authentication may be required');
          return;
        }

        console.error('Failed to fetch existing answers:', response.status);
        return;
      }

      // Ensure response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error('Expected JSON response for answers');
        return;
      }

      const data = await response.json();
      const existingAnswers: Record<string, number> = {};
      data.data?.forEach((answer: any) => {
        if (answer.selected_option !== null) {
          existingAnswers[answer.question_id] = answer.selected_option;
        }
      });
      setAnswers(existingAnswers);
    } catch (error) {
      console.error('Error fetching existing answers:', error);
    }
  };

  const saveAnswer = async (questionId: string, selectedOption: number) => {
    if (!attempt || saving) return;

    try {
      setSaving(true);
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) return;

      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      const response = await fetch(`/api/attempts/${attempt.id}/answers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question_id: questionId,
          selected_option: selectedOption,
          time_spent_seconds: timeSpent
        })
      });

      if (!response.ok) {
        // Check if response is HTML (authentication redirect)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          throw new Error('Authentication required. Please log in to save answers.');
        }

        throw new Error('Failed to save answer');
      }

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving answer:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAnswerChange = (questionId: string, selectedOption: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
    saveAnswer(questionId, selectedOption);
  };

  const handleTimeout = async () => {
    if (!attempt) return;

    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) return;

      const response = await fetch(`/api/attempts/${attempt.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Check if response is HTML (authentication redirect)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          console.warn('Authentication required during timeout submission');
          window.location.href = `/login?redirect=/test/${testId}`;
          return;
        }

        console.error('Failed to submit test on timeout:', response.status);
      }

      window.location.href = `/test/${testId}/results`;
    } catch (error) {
      console.error('Error handling timeout:', error);
    }
  };

  const handleSubmit = async () => {
    if (!attempt) return;

    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        setError('Authentication required. Please log in to submit the test.');
        return;
      }

      const response = await fetch(`/api/attempts/${attempt.id}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Check if response is HTML (authentication redirect)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
          setError('Authentication required. Please log in to submit the test.');
          return;
        }

        throw new Error('Failed to submit test');
      }

      window.location.href = `/test/${testId}/results`;
    } catch (error) {
      console.error('Error submitting test:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit test');
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Initializing test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/live-tests'}>
              Back to Tests
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!test || !attempt || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Test Not Available</h2>
            <p className="text-muted-foreground mb-4">This test is not available at the moment.</p>
            <Button onClick={() => window.location.href = '/live-tests'}>
              Back to Tests
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-foreground">{test.title}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected ? 'Connected' : 'Offline'}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {lastSaved && (
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <Save className="h-4 w-4" />
                  Saved {lastSaved.toLocaleTimeString()}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${timeLeft < 300 ? "text-destructive animate-pulse" : "text-muted-foreground"}`} />
                <span className={`text-lg font-semibold ${timeLeft < 300 ? "text-destructive" : "text-foreground"}`} data-testid="text-timer">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className="mb-4" data-testid="badge-question-number">
                    Question {currentQuestion + 1} of {questions.length}
                  </Badge>
                  <Badge variant="outline">
                    {currentQuestionData.points} point{currentQuestionData.points > 1 ? 's' : ''}
                  </Badge>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-6" data-testid="text-question">
                  {currentQuestionData.question_text}
                </h2>

                <RadioGroup
                  value={answers[currentQuestionData.id]?.toString()}
                  onValueChange={(value) => {
                    handleAnswerChange(currentQuestionData.id, parseInt(value));
                  }}
                  data-testid="radio-options"
                  disabled={saving}
                >
                  {[
                    { option: currentQuestionData.option_a, index: 0 },
                    { option: currentQuestionData.option_b, index: 1 },
                    { option: currentQuestionData.option_c, index: 2 },
                    { option: currentQuestionData.option_d, index: 3 }
                  ].map(({ option, index }) => (
                    <div key={index} className="flex items-center space-x-2 p-3 rounded-lg hover-elevate transition-all">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} data-testid={`radio-option-${index}`} />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        <span className="font-medium mr-2">({String.fromCharCode(65 + index)})</span>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {saving && (
                  <div className="mt-4 text-sm text-blue-600 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                    Saving answer...
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  data-testid="button-previous"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentQuestion === questions.length - 1 ? (
                  <Button onClick={() => setShowSubmitDialog(true)} data-testid="button-submit">
                    Submit Test
                  </Button>
                ) : (
                  <Button
                    onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                    data-testid="button-next"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-24">
              <h3 className="font-semibold text-foreground mb-4">Question Navigation</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((question, index) => {
                  const isAnswered = answers[question.id] !== undefined;
                  const isCurrent = index === currentQuestion;

                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-10 h-10 rounded-md font-medium transition-all ${
                        isCurrent
                          ? "bg-primary text-primary-foreground ring-2 ring-primary"
                          : isAnswered
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      } hover-elevate`}
                      data-testid={`button-question-${index + 1}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100"></div>
                  <span className="text-muted-foreground">Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-secondary"></div>
                  <span className="text-muted-foreground">Not Answered ({questions.length - answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-primary"></div>
                  <span className="text-muted-foreground">Current</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Test Progress</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Progress:</span>
                    <span>{Math.round((answeredCount / questions.length) * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Left:</span>
                    <span className={timeLeft < 300 ? "text-red-600 font-medium" : ""}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(answeredCount / questions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit the test? You have answered {answeredCount} out of {questions.length} questions.
              {answeredCount < questions.length && (
                <span className="block mt-2 text-orange-600">
                  ⚠️ You have {questions.length - answeredCount} unanswered questions.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-submit">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} data-testid="button-confirm-submit">
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Time Warning Dialog */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>⏰ Time Warning</AlertDialogTitle>
            <AlertDialogDescription>
              You have only 5 minutes left to complete the test. Please make sure to submit your answers before time runs out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowWarningDialog(false)}>
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
