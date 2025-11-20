import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Trophy, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { supabase } from "@/lib/supabaseClient";

export default function TestResults() {
  const params = useParams<{ id: string }>();
  const [location] = useLocation();
  
  // Extract testId using multiple methods as fallback
  const [testId, setTestId] = useState<string | undefined>(() => {
    return params.id || (() => {
      const path = window.location.pathname;
      const pathMatch = path.match(/\/test\/([^\/]+)\/results/);
      return pathMatch ? pathMatch[1] : undefined;
    })();
  });

  // Update testId when params change
  useEffect(() => {
    if (params.id && params.id !== testId) {
      setTestId(params.id);
    } else if (!params.id && !testId) {
      // Try to extract from current URL
      const path = window.location.pathname;
      const pathMatch = path.match(/\/test\/([^\/]+)\/results/);
      if (pathMatch && pathMatch[1]) {
        setTestId(pathMatch[1]);
      }
    }
  }, [params.id, location]);

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (testId) {
      fetchResults();
    }
  }, [testId]);

  const fetchResults = async () => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      console.log('🔍 Fetching results for testId:', testId);

      // Get user's test attempts for this test
      console.log('📡 Calling /api/tests/user/attempts');
      const response = await fetch(`/api/tests/user/attempts`, {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('📡 Response status:', response.status, 'Content-Type:', response.headers.get('content-type'));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ User attempts error:', errorText);
        throw new Error(`Failed to fetch test results: ${response.status}`);
      }

      let attempts: any[] = [];

      // Handle 304 Not Modified responses
      if (response.status === 304) {
        console.log('📡 Got 304 Not Modified, trying to get fresh data');
        // For 304 responses, try again with cache-busting
        const freshResponse = await fetch(`/api/tests/user/attempts?t=${Date.now()}`, {
          headers: {
            'Authorization': `Bearer ${token.data.session.access_token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!freshResponse.ok) {
          const errorText = await freshResponse.text();
          console.error('❌ Fresh request error:', errorText);
          throw new Error(`Failed to fetch test results: ${freshResponse.status}`);
        }
        
        const freshData = await freshResponse.json();
        attempts = freshData.data || [];
      } else {
        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await response.text();
          console.error('❌ Expected JSON but got:', contentType, responseText.substring(0, 200));
          throw new Error('Server returned non-JSON response for user attempts');
        }

        const data = await response.json();
        attempts = data.data || [];
      }
      
      console.log('📊 Found attempts:', attempts.length);
      
      // Find the attempt for this test
      const testAttempt = attempts.find((attempt: any) => attempt.test_id === testId);
      
      if (!testAttempt) {
        throw new Error('Test attempt not found');
      }

      console.log('📝 Found test attempt:', testAttempt.id);

      // Get test answers for detailed results
      console.log('📡 Calling /api/tests/attempts/' + testAttempt.id + '/answers');
      const answersResponse = await fetch(`/api/tests/attempts/${testAttempt.id}/answers`, {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      console.log('📡 Answers response status:', answersResponse.status, 'Content-Type:', answersResponse.headers.get('content-type'));

      if (!answersResponse.ok) {
        const errorText = await answersResponse.text();
        console.error('❌ Answers error:', errorText);
        throw new Error(`Failed to fetch test answers: ${answersResponse.status}`);
      }

      // Check content type before parsing JSON
      const answersContentType = answersResponse.headers.get('content-type');
      if (!answersContentType || !answersContentType.includes('application/json')) {
        const responseText = await answersResponse.text();
        console.error('❌ Expected JSON but got:', answersContentType, responseText.substring(0, 200));
        throw new Error('Server returned non-JSON response for answers');
      }

      const answersData = await answersResponse.json();
      const answers = answersData.data || [];

      console.log('📊 Found answers:', answers.length);

      // Get test questions to calculate total questions
      console.log('📡 Calling /api/tests/' + testId + '/questions');
      const questionsResponse = await fetch(`/api/tests/${testId}/questions`);
      
      console.log('📡 Questions response status:', questionsResponse.status, 'Content-Type:', questionsResponse.headers.get('content-type'));

      if (!questionsResponse.ok) {
        const errorText = await questionsResponse.text();
        console.error('❌ Questions error:', errorText);
        throw new Error(`Failed to fetch test questions: ${questionsResponse.status}`);
      }

      // Check content type before parsing JSON
      const questionsContentType = questionsResponse.headers.get('content-type');
      if (!questionsContentType || !questionsContentType.includes('application/json')) {
        const responseText = await questionsResponse.text();
        console.error('❌ Expected JSON but got:', questionsContentType, responseText.substring(0, 200));
        throw new Error('Server returned non-JSON response for questions');
      }

      const questionsData = await questionsResponse.json();
      const questions = questionsData.data || [];

      console.log('📊 Found questions:', questions.length);

      // Calculate results
      const correctAnswers = answers.filter((answer: any) => answer.is_correct).length;
      const incorrectAnswers = answers.filter((answer: any) => answer.is_correct === false).length;
      const unanswered = questions.length - answers.length;
      const scorePercentage = testAttempt.total_points > 0 ? Math.round((testAttempt.score / testAttempt.total_points) * 100) : 0;

      // Calculate time taken
      const startTime = new Date(testAttempt.started_at);
      const endTime = new Date(testAttempt.ended_at || new Date());
      const timeTakenMs = endTime.getTime() - startTime.getTime();
      const hours = Math.floor(timeTakenMs / (1000 * 60 * 60));
      const minutes = Math.floor((timeTakenMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeTakenMs % (1000 * 60)) / 1000);
      const timeTaken = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      setResults({
        score: scorePercentage,
        totalQuestions: questions.length,
        correctAnswers,
        incorrectAnswers,
        unanswered,
        timeTaken,
        totalPoints: testAttempt.total_points,
        earnedPoints: testAttempt.score,
        status: testAttempt.status
      });
    } catch (error) {
      console.error('Error fetching results:', error);
      setError(error instanceof Error ? error.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading results...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8 max-w-md mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Results</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchResults}>Try Again</Button>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const { score, totalQuestions, correctAnswers, incorrectAnswers, unanswered, timeTaken, totalPoints, earnedPoints, status } = results;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Test Completed!</h1>
          <p className="text-lg text-muted-foreground">Here's how you performed</p>
        </div>

        <Card className="p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-primary mb-2" data-testid="text-score">{score}%</div>
            <p className="text-muted-foreground">Overall Score</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 bg-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-foreground" data-testid="text-correct">{correctAnswers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Correct Answers</p>
            </div>

            <div className="text-center p-4 bg-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold text-foreground" data-testid="text-incorrect">{incorrectAnswers}</span>
              </div>
              <p className="text-sm text-muted-foreground">Incorrect Answers</p>
            </div>

            <div className="text-center p-4 bg-card rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground" data-testid="text-time">{timeTaken}</span>
              </div>
              <p className="text-sm text-muted-foreground">Time Taken</p>
            </div>

            <div className="text-center p-4 bg-card rounded-lg">
              <div className="text-2xl font-bold text-foreground mb-2" data-testid="text-unanswered">{unanswered}</div>
              <p className="text-sm text-muted-foreground">Unanswered</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Test Summary</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">Status:</span>
              <Badge variant={status === 'completed' ? 'default' : status === 'timed_out' ? 'destructive' : 'secondary'}>
                {status === 'completed' ? 'Completed' : status === 'timed_out' ? 'Timed Out' : 'In Progress'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">Points Earned:</span>
              <span className="font-semibold">{earnedPoints} / {totalPoints}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-foreground font-medium">Questions Answered:</span>
              <span className="font-semibold">{correctAnswers + incorrectAnswers} / {totalQuestions}</span>
            </div>
            
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-primary h-3 rounded-full transition-all"
                style={{ width: `${score}%` }}
              ></div>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Overall Performance: {score}%
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/live-tests">
            <Button variant="outline" size="lg" className="w-full sm:w-auto" data-testid="button-more-tests">
              Take More Tests
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto" data-testid="button-home">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
