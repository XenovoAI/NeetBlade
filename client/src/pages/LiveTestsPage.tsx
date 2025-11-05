import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

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

export default function LiveTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tests?status=scheduled,active,completed`);

      if (!response.ok) {
        let errorMessage = `Failed to fetch tests (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText.substring(0, 100);
          }
        }
        throw new Error(errorMessage);
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
        return 'View Test';
      case 'active':
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
        return `/test/${test.id}`;
      case 'active':
        return `/test/${test.id}`;
      case 'completed':
        return `/test/${test.id}/results`;
      default:
        return '#';
    }
  };

  const isActionDisabled = (test: Test) => {
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
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Test Series</h1>
          <p className="text-lg text-muted-foreground">Practice with available tests</p>
        </div>

        {tests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No tests available at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <Card key={test.id} className="p-6 hover-elevate transition-all" data-testid={`card-test-${test.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{test.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" data-testid={`badge-subject-${test.id}`}>
                        {test.subject}
                      </Badge>
                      <Badge className={getStatusColor(test.status)} data-testid={`badge-status-${test.id}`}>
                        {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
                      </Badge>
                    </div>
                    {test.description && (
                      <p className="text-sm text-muted-foreground mb-2">{test.description}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{test.duration_minutes} minutes</span>
                  </div>
                </div>

                <Link href={getActionLink(test)}>
                  <Button
                    className="w-full"
                    disabled={isActionDisabled(test)}
                    data-testid={`button-action-${test.id}`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {getActionText(test)}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
