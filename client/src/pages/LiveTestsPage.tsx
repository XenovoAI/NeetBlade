import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Play, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Link } from "wouter";

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
}

export default function LiveTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthUser();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests'); // Show all tests

      if (!response.ok) {
        throw new Error('Failed to fetch tests');
      }

      const data = await response.json();
      setTests(data.data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tests');
    } finally {
      setLoading(false);
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
      case 'draft': return <AlertCircle className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      case 'active': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const canJoinTest = (test: Test) => {
    return test.status === 'active' && user;
  };

  const getTestAction = (test: Test) => {
    if (!user) {
      return (
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Login to Join
          </Button>
        </Link>
      );
    }

    if (test.status === 'draft') {
      return (
        <Button variant="outline" disabled className="w-full">
          <AlertCircle className="h-4 w-4 mr-2" />
          Not Scheduled Yet
        </Button>
      );
    }

    if (test.status === 'scheduled') {
      const startTime = new Date(test.scheduled_start);
      const now = new Date();
      const timeUntilStart = startTime.getTime() - now.getTime();
      const minutesUntilStart = Math.floor(timeUntilStart / (1000 * 60));

      if (minutesUntilStart > 0) {
        return (
          <Button variant="outline" disabled className="w-full">
            <Clock className="h-4 w-4 mr-2" />
            Starts in {minutesUntilStart}m
          </Button>
        );
      }
    }

    if (test.status === 'active') {
      return (
        <Link href={`/test/${test.id}`}>
          <Button className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Join Test
          </Button>
        </Link>
      );
    }

    if (test.status === 'completed') {
      return (
        <Link href={`/test/${test.id}/results`}>
          <Button variant="outline" className="w-full">
            <CheckCircle className="h-4 w-4 mr-2" />
            View Results
          </Button>
        </Link>
      );
    }

    return (
      <Button variant="outline" disabled className="w-full">
        Not Available
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading live tests...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="p-8 max-w-md mx-auto text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error Loading Tests</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchTests}>Try Again</Button>
          </Card>
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Live Tests</h1>
          <p className="text-lg text-muted-foreground">Join scheduled and active tests, or view completed results</p>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Live Tests Available</h3>
            <p className="text-muted-foreground mb-4">
              There are no live tests scheduled at the moment. Check back later!
            </p>
            {!user && (
              <Link href="/login">
                <Button>Login to Get Notified</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <Card key={test.id} className="p-6 hover-elevate transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{test.title}</h3>
                    {test.description && (
                      <p className="text-sm text-muted-foreground mb-3">{test.description}</p>
                    )}
                    <div className="flex items-center gap-2 mb-3">
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
                        <span className="font-medium">
                          {test.status === 'scheduled' ? 'Starts: ' : 
                           test.status === 'active' ? 'Started: ' : 'Completed: '}
                        </span>
                        <span>{new Date(test.scheduled_start).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {getTestAction(test)}
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}