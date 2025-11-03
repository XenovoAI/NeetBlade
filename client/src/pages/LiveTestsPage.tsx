import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, Play, Users, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/lib/supabaseClient";

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

interface TestSession {
  id: string;
  test_id: string;
  active_participants: number;
  completed_participants: number;
  session_status: 'waiting' | 'active' | 'ended';
  actual_start_time?: string;
  actual_end_time?: string;
}

export default function LiveTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [sessions, setSessions] = useState<Map<string, TestSession>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTests();
    const interval = setInterval(fetchTests, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTests = async () => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/tests?status=scheduled,active,completed', {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tests');
      }

      const data = await response.json();
      setTests(data.data || []);

      // Fetch session data for active tests
      const activeTests = (data.data || []).filter((test: Test) =>
        test.status === 'scheduled' || test.status === 'active'
      );

      for (const test of activeTests) {
        fetchTestSession(test.id);
      }

    } catch (error) {
      console.error('Error fetching tests:', error);
      setError('Failed to load tests');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestSession = async (testId: string) => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) return;

      const response = await fetch(`/api/tests/${testId}/session`, {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setSessions(prev => new Map(prev.set(testId, data.data)));
        }
      }
    } catch (error) {
      console.error('Error fetching test session:', error);
    }
  };

  const formatTimeRemaining = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();

    if (diff <= 0) return 'Starting soon';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: Test['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionText = (test: Test) => {
    switch (test.status) {
      case 'scheduled':
        return 'Join Waiting Room';
      case 'active':
        const endTime = new Date(test.scheduled_end!);
        const now = new Date();
        if (now >= endTime) return 'Test Ended';
        return 'Start Test';
      case 'completed':
        return 'View Results';
      default:
        return 'Not Available';
    }
  };

  const getActionLink = (test: Test) => {
    switch (test.status) {
      case 'scheduled':
        return `/test/${test.id}/waiting`;
      case 'active':
        return `/test/${test.id}`;
      case 'completed':
        return `/test/${test.id}/results`;
      default:
        return '#';
    }
  };

  const isActionDisabled = (test: Test) => {
    if (test.status === 'active') {
      const endTime = new Date(test.scheduled_end!);
      const now = new Date();
      return now >= endTime;
    }
    return test.status === 'draft';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading tests...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-red-600">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Live Test Series</h1>
          <p className="text-lg text-muted-foreground">Practice with timed tests and improve your performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allTests.map((test) => (
            <Card key={test.id} className="p-6 hover-elevate transition-all" data-testid={`card-test-${test.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{test.name}</h3>
                  <Badge variant="outline" className="mb-2" data-testid={`badge-subject-${test.id}`}>{test.subject}</Badge>
                </div>
                <Badge className={difficultyColors[test.difficulty as keyof typeof difficultyColors]} data-testid={`badge-difficulty-${test.id}`}>
                  {test.difficulty}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{test.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{test.questions} questions</span>
                </div>
              </div>

              <Link href={`/test/${test.id}`}>
                <Button className="w-full" data-testid={`button-start-${test.id}`}>
                  <Play className="h-4 w-4 mr-2" />
                  Start Test
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
