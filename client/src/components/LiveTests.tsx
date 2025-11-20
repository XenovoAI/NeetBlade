import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, TrendingUp, Play, AlertCircle } from "lucide-react";
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

function TestCard({ test }: { test: Test }) {
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
      case 'completed': return <FileText className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActionButton = () => {
    if (test.status === 'active') {
      return (
        <Link href={`/test/${test.id}`}>
          <Button className="w-full" data-testid={`button-start-${test.id}`}>
            <Play className="h-4 w-4 mr-2" />
            Join Test
          </Button>
        </Link>
      );
    } else if (test.status === 'completed') {
      return (
        <Link href={`/test/${test.id}/results`}>
          <Button variant="outline" className="w-full" data-testid={`button-results-${test.id}`}>
            View Results
          </Button>
        </Link>
      );
    } else if (test.status === 'scheduled') {
      const startTime = new Date(test.scheduled_start);
      const now = new Date();
      const timeUntilStart = startTime.getTime() - now.getTime();
      const minutesUntilStart = Math.floor(timeUntilStart / (1000 * 60));

      return (
        <Button variant="outline" disabled className="w-full" data-testid={`button-scheduled-${test.id}`}>
          <Clock className="h-4 w-4 mr-2" />
          {minutesUntilStart > 0 ? `Starts in ${minutesUntilStart}m` : 'Starting Soon'}
        </Button>
      );
    } else {
      return (
        <Button variant="outline" disabled className="w-full" data-testid={`button-draft-${test.id}`}>
          Not Available
        </Button>
      );
    }
  };

  return (
    <Card className="p-6 hover-elevate transition-all" data-testid={`card-test-${test.id}`}>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{test.title}</h3>
        <Badge className={getStatusColor(test.status)} data-testid={`badge-status-${test.id}`}>
          {getStatusIcon(test.status)}
          <span className="ml-1 capitalize">{test.status}</span>
        </Badge>
      </div>
      
      {test.description && (
        <p className="text-sm text-muted-foreground mb-4">{test.description}</p>
      )}
      
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{test.duration_minutes} minutes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span className="capitalize">{test.subject}</span>
        </div>
        {test.status === 'scheduled' && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Starts: </span>
            {new Date(test.scheduled_start).toLocaleString()}
          </div>
        )}
      </div>

      {getActionButton()}
    </Card>
  );
}

export default function LiveTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests');
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

  const filterTestsBySubject = (subject: string) => {
    return tests.filter(test => test.subject.toLowerCase() === subject.toLowerCase());
  };

  const getActiveTests = () => {
    return tests.filter(test => test.status === 'active' || test.status === 'scheduled');
  };

  const getCompletedTests = () => {
    return tests.filter(test => test.status === 'completed');
  };

  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading tests...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Tests</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchTests}>Try Again</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Live Test Series & Mock Exams
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practice with timed tests and track your performance
          </p>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tests Available</h3>
            <p className="text-muted-foreground">
              Check back later for new tests and mock exams!
            </p>
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8" data-testid="tabs-test-categories">
              <TabsTrigger value="active" data-testid="tab-active">Active Tests</TabsTrigger>
              <TabsTrigger value="physics" data-testid="tab-physics">Physics</TabsTrigger>
              <TabsTrigger value="chemistry" data-testid="tab-chemistry">Chemistry</TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getActiveTests().length > 0 ? (
                  getActiveTests().map((test) => (
                    <TestCard key={test.id} test={test} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active tests at the moment</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="physics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterTestsBySubject('physics').length > 0 ? (
                  filterTestsBySubject('physics').map((test) => (
                    <TestCard key={test.id} test={test} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No Physics tests available</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="chemistry">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterTestsBySubject('chemistry').length > 0 ? (
                  filterTestsBySubject('chemistry').map((test) => (
                    <TestCard key={test.id} test={test} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No Chemistry tests available</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        <div className="text-center mt-12">
          <Link href="/live-tests">
            <Button size="lg">
              View All Tests
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
