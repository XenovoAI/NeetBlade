import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'wouter';
import { supabase } from '@/lib/supabaseClient';

interface Test {
  id: string;
  title: string;
  description?: string;
  subject: string;
  duration_minutes: number;
  scheduled_start: string;
  scheduled_end?: string;
  status: 'scheduled' | 'active' | 'completed';
}

interface TestSession {
  id: string;
  test_id: string;
  active_participants: number;
  completed_participants: number;
  session_status: 'waiting' | 'active' | 'ended';
}

interface TestWaitingRoomProps {
  testId: string;
}

export default function TestWaitingRoom({ testId }: TestWaitingRoomProps) {
  const [test, setTest] = useState<Test | null>(null);
  const [session, setSession] = useState<TestSession | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canStartTest, setCanStartTest] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchTestData();
    const interval = setInterval(fetchTestData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [testId]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (test && test.status === 'scheduled') {
        updateCountdown();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [test]);

  const fetchTestData = async () => {
    try {
      setIsRefreshing(true);
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
        throw new Error('Failed to fetch test details');
      }

      const testData = await testResponse.json();
      setTest(testData.data);

      // Fetch session details
      const sessionResponse = await fetch(`/api/tests/${testId}/session`, {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        setSession(sessionData.data);
      }

      // Check if test can be started
      if (testData.data.status === 'active') {
        await checkCanStartTest();
      }

    } catch (error) {
      console.error('Error fetching test data:', error);
      setError('Failed to load test information');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const checkCanStartTest = async () => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) return;

      const response = await fetch(`/api/tests/${testId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCanStartTest(true);
      } else {
        const errorData = await response.json();
        if (errorData.error === 'Test has not started yet') {
          setCanStartTest(false);
        }
      }
    } catch (error) {
      console.error('Error checking if test can be started:', error);
    }
  };

  const updateCountdown = () => {
    if (!test || test.status !== 'scheduled') return;

    const now = new Date();
    const startTime = new Date(test.scheduled_start);
    const diff = startTime.getTime() - now.getTime();

    if (diff <= 0) {
      setTimeRemaining('Starting now...');
      // Fetch fresh test data
      fetchTestData();
      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    } else if (minutes > 0) {
      setTimeRemaining(`${minutes}m ${seconds}s`);
    } else {
      setTimeRemaining(`${seconds}s`);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getStatusMessage = () => {
    if (!test) return '';

    switch (test.status) {
      case 'scheduled':
        return 'Test is scheduled to start soon. Please wait in the waiting room.';
      case 'active':
        if (canStartTest) {
          return 'Test is now active! Click "Start Test" to begin.';
        }
        return 'Test is active but you cannot start it. Please check your eligibility.';
      case 'completed':
        return 'This test has already ended.';
      default:
        return 'Test status unknown.';
    }
  };

  const getStatusColor = () => {
    if (!test) return 'text-gray-600';

    switch (test.status) {
      case 'scheduled':
        return 'text-blue-600';
      case 'active':
        return canStartTest ? 'text-green-600' : 'text-yellow-600';
      case 'completed':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading waiting room...</p>
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
            <Button onClick={fetchTestData}>Try Again</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Test Not Found</h2>
            <p className="text-muted-foreground mb-4">The test you're looking for doesn't exist.</p>
            <Link href="/live-tests">
              <Button>Back to Tests</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (test.status === 'completed') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Test Ended</h2>
            <p className="text-muted-foreground mb-4">This test has already completed.</p>
            <Link href="/live-tests">
              <Button>Back to Tests</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/live-tests" className="text-primary hover:underline mb-4 inline-block">
            ← Back to Tests
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Test Waiting Room</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Test Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2">{test.title}</h2>
                <Badge variant="outline" className="mb-2">{test.subject}</Badge>
                <Badge className={test.status === 'scheduled' ? 'bg-blue-100 text-blue-800 ml-2' : 'bg-green-100 text-green-800 ml-2'}>
                  {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                </Badge>
                {test.description && (
                  <p className="text-muted-foreground mt-2">{test.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(test.duration_minutes)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Participants</p>
                    <p className="font-medium">
                      {session ? `${session.active_participants + session.completed_participants}` : '0'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">Test Schedule</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start Time:</span>
                    <span className="ml-2 font-medium">
                      {new Date(test.scheduled_start).toLocaleString()}
                    </span>
                  </div>
                  {test.scheduled_end && (
                    <div>
                      <span className="text-muted-foreground">End Time:</span>
                      <span className="ml-2 font-medium">
                        {new Date(test.scheduled_end).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Status and Actions */}
            <Card className="p-6">
              <div className="text-center">
                <div className={`text-lg font-medium mb-4 ${getStatusColor()}`}>
                  {getStatusMessage()}
                </div>

                {test.status === 'scheduled' && timeRemaining && (
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {timeRemaining}
                    </div>
                    <div className="text-sm text-muted-foreground">Time until start</div>
                  </div>
                )}

                {test.status === 'active' && canStartTest && (
                  <Link href={`/test/${testId}`}>
                    <Button size="lg" className="text-lg px-8 py-3">
                      Start Test
                    </Button>
                  </Link>
                )}

                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={fetchTestData}
                    disabled={isRefreshing}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-medium mb-4">Instructions</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Make sure you have a stable internet connection</li>
                <li>• Find a quiet place to take the test</li>
                <li>• The test will start automatically at the scheduled time</li>
                <li>• You cannot pause the test once started</li>
                <li>• Make sure you're ready before clicking "Start Test"</li>
              </ul>
            </Card>

            {session && (
              <Card className="p-6">
                <h3 className="font-medium mb-4">Live Statistics</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Active Participants</span>
                      <span>{session.active_participants}</span>
                    </div>
                    <Progress
                      value={(session.active_participants / Math.max(session.active_participants + session.completed_participants, 1)) * 100}
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Completed</span>
                      <span>{session.completed_participants}</span>
                    </div>
                    <Progress
                      value={(session.completed_participants / Math.max(session.active_participants + session.completed_participants, 1)) * 100}
                      className="h-2"
                    />
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="font-medium mb-2">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                If you're experiencing technical issues, please refresh the page or contact support.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Contact Support
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}