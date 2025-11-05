import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  TrendingUp,
  UserCheck,
  UserX
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Test {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  scheduled_start: string;
  scheduled_end?: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
}

interface TestAttempt {
  id: string;
  test_id: string;
  user_id: string;
  user_email?: string;
  started_at: string;
  ended_at?: string;
  status: 'in_progress' | 'completed' | 'timed_out';
  time_spent_seconds?: number;
  score?: number;
  total_points?: number;
}

interface TestStats {
  active_participants: number;
  completed_participants: number;
  total_participants: number;
  session_status: 'waiting' | 'active' | 'ended';
  test_status: 'draft' | 'scheduled' | 'active' | 'completed';
  scheduled_start: string;
  scheduled_end?: string;
  current_time?: string;
}

interface TestMonitoringDashboardProps {
  testId: string;
  test: Test;
}

export default function TestMonitoringDashboard({ testId, test }: TestMonitoringDashboardProps) {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<TestAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<TestStats | null>(null);

  useEffect(() => {
    fetchAttempts();
    const interval = setInterval(fetchAttempts, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [testId]);



  const fetchAttempts = async () => {
    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/tests/${testId}/attempts`, {
        headers: {
          'Authorization': `Bearer ${token.data.session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test attempts');
      }

      const data = await response.json();
      setAttempts(data.data || []);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      setError('Failed to load test attempts');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'timed_out':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'timed_out':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateCompletionRate = () => {
    if (!stats || stats.total_participants === 0) return 0;
    return Math.round((stats.completed_participants / stats.total_participants) * 100);
  };

  const calculateAverageScore = () => {
    const completedAttempts = attempts.filter(a => a.status === 'completed' && a.score !== undefined && a.total_points !== undefined);
    if (completedAttempts.length === 0) return 0;

    const totalScore = completedAttempts.reduce((sum, attempt) => {
      const percentage = (attempt.score! / attempt.total_points!) * 100;
      return sum + percentage;
    }, 0);

    return Math.round(totalScore / completedAttempts.length);
  };

  const refreshData = () => {
    fetchAttempts();
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

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData}>Retry</Button>
        </Card>
      </div>
    );
  }

  const completionRate = calculateCompletionRate();
  const averageScore = calculateAverageScore();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{test.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{test.subject}</Badge>
            <Badge className={test.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
              {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Connected
            </div>
          </div>
        </div>
        <Button onClick={refreshData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Real-time Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Participants</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active_participants}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed_participants}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold text-orange-600">{averageScore}%</p>
              </div>
              <Activity className="h-8 w-8 text-orange-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Progress Bars */}
      {stats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Progress Overview</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completion Progress</span>
                <span>{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Active</span>
                  <span>{stats.active_participants}</span>
                </div>
                <Progress
                  value={(stats.active_participants / stats.total_participants) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Completed</span>
                  <span>{stats.completed_participants}</span>
                </div>
                <Progress
                  value={(stats.completed_participants / stats.total_participants) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Detailed Attempts Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Participant Details</h3>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({attempts.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({attempts.filter(a => a.status === 'in_progress').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({attempts.filter(a => a.status === 'completed').length})
            </TabsTrigger>
            <TabsTrigger value="timed_out">
              Timed Out ({attempts.filter(a => a.status === 'timed_out').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <AttemptsTable attempts={attempts} onSelectAttempt={setSelectedAttempt} />
          </TabsContent>
          <TabsContent value="active" className="mt-4">
            <AttemptsTable
              attempts={attempts.filter(a => a.status === 'in_progress')}
              onSelectAttempt={setSelectedAttempt}
            />
          </TabsContent>
          <TabsContent value="completed" className="mt-4">
            <AttemptsTable
              attempts={attempts.filter(a => a.status === 'completed')}
              onSelectAttempt={setSelectedAttempt}
            />
          </TabsContent>
          <TabsContent value="timed_out" className="mt-4">
            <AttemptsTable
              attempts={attempts.filter(a => a.status === 'timed_out')}
              onSelectAttempt={setSelectedAttempt}
            />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Selected Attempt Details */}
      {selectedAttempt && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Attempt Details</h3>
            <Button variant="outline" onClick={() => setSelectedAttempt(null)}>
              Close
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-medium">{selectedAttempt.user_id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(selectedAttempt.status)}>
                {selectedAttempt.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Started At</p>
              <p className="font-medium">
                {new Date(selectedAttempt.started_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ended At</p>
              <p className="font-medium">
                {selectedAttempt.ended_at
                  ? new Date(selectedAttempt.ended_at).toLocaleString()
                  : 'Still in progress'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Spent</p>
              <p className="font-medium">{formatDuration(selectedAttempt.time_spent_seconds)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="font-medium">
                {selectedAttempt.score !== undefined && selectedAttempt.total_points !== undefined
                  ? `${selectedAttempt.score}/${selectedAttempt.total_points} (${Math.round((selectedAttempt.score / selectedAttempt.total_points) * 100)}%)`
                  : 'Not available'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

interface AttemptsTableProps {
  attempts: TestAttempt[];
  onSelectAttempt: (attempt: TestAttempt) => void;
}

function AttemptsTable({ attempts, onSelectAttempt }: AttemptsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'timed_out':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getScoreColor = (score?: number, total?: number) => {
    if (score === undefined || total === undefined) return 'text-gray-500';
    const percentage = (score / total) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (attempts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No attempts found for this filter.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attempts.map((attempt) => (
          <TableRow key={attempt.id} className="cursor-pointer hover:bg-gray-50">
            <TableCell className="font-medium">{attempt.user_email || attempt.user_id}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {getStatusIcon(attempt.status)}
                <span className="capitalize">{attempt.status.replace('_', ' ')}</span>
              </div>
            </TableCell>
            <TableCell>{new Date(attempt.started_at).toLocaleTimeString()}</TableCell>
            <TableCell>{formatDuration(attempt.time_spent_seconds)}</TableCell>
            <TableCell className={getScoreColor(attempt.score, attempt.total_points)}>
              {attempt.score !== undefined && attempt.total_points !== undefined
                ? `${attempt.score}/${attempt.total_points}`
                : 'N/A'}
            </TableCell>
            <TableCell>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectAttempt(attempt)}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}