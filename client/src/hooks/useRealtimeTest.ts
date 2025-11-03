import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
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

interface UseRealtimeTestOptions {
  testId?: string;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

interface UseRealtimeTestReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  stats: TestStats | null;
  participants: any[];
  connect: () => void;
  disconnect: () => void;
  sendMessage: (message: any) => void;
  joinTestSession: (testId: string) => void;
  leaveTestSession: (testId: string) => void;
  getTestStatus: (testId: string) => void;
}

export function useRealtimeTest(options: UseRealtimeTestOptions = {}): UseRealtimeTestReturn {
  const {
    testId: initialTestId,
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 3000
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TestStats | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  const getWebSocketUrl = () => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname;
    const wsPort = process.env.NODE_ENV === 'development' ? '5050' : window.location.port;
    return `${wsProtocol}//${wsHost}:${wsPort}`;
  };

  const connect = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const token = await supabase.auth.getSession();
      if (!token.data.session?.access_token) {
        throw new Error('Not authenticated');
      }

      const wsUrl = `${getWebSocketUrl()}?token=${token.data.session.access_token}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);
        reconnectCountRef.current = 0;

        // Re-subscribe to previous subscriptions
        subscriptionsRef.current.forEach(testId => {
          sendMessage({
            type: 'join_test_session',
            testId
          });
        });

        // Join initial test session if provided
        if (initialTestId) {
          joinTestSession(initialTestId);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectCountRef.current < reconnectAttempts) {
          setTimeout(() => {
            reconnectCountRef.current++;
            console.log(`Attempting to reconnect (${reconnectCountRef.current}/${reconnectAttempts})`);
            connect();
          }, reconnectDelay);
        } else if (reconnectCountRef.current >= reconnectAttempts) {
          setError('Failed to reconnect to real-time updates');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
        setError('Connection error');
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnecting(false);
      setError('Failed to connect to real-time updates');
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    subscriptionsRef.current.clear();
  };

  const sendMessage = (message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case 'connection_established':
        console.log('WebSocket connection established');
        break;

      case 'authentication_success':
        console.log('WebSocket authentication successful');
        break;

      case 'test_session_joined':
        console.log('Joined test session:', message.testId);
        setStats(message.stats);
        break;

      case 'test_session_left':
        console.log('Left test session:', message.testId);
        setStats(null);
        break;

      case 'test_status_update':
        setStats(message.stats);
        break;

      case 'test_stats_update':
        setStats(message.stats);
        break;

      case 'participant_joined':
        console.log('Participant joined:', message.participantId);
        // Refresh stats when participant joins
        if (message.testId) {
          getTestStatus(message.testId);
        }
        break;

      case 'participant_completed':
        console.log('Participant completed:', message.participantId);
        // Refresh stats when participant completes
        if (message.testId) {
          getTestStatus(message.testId);
        }
        break;

      case 'session_status_changed':
        console.log('Session status changed:', message);
        setStats(prev => prev ? { ...prev, session_status: message.sessionStatus } : null);
        break;

      case 'error':
        console.error('WebSocket error:', message.error);
        setError(message.error);
        break;

      case 'pong':
        // Heartbeat response, connection is alive
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  };

  const joinTestSession = (testId: string) => {
    if (!isConnected) {
      console.warn('Cannot join test session: WebSocket not connected');
      return;
    }

    subscriptionsRef.current.add(testId);
    sendMessage({
      type: 'join_test_session',
      testId
    });
  };

  const leaveTestSession = (testId: string) => {
    subscriptionsRef.current.delete(testId);
    sendMessage({
      type: 'leave_test_session',
      testId
    });

    // Clear stats if this was the only subscription
    if (subscriptionsRef.current.size === 0) {
      setStats(null);
    }
  };

  const getTestStatus = (testId: string) => {
    if (!isConnected) return;

    sendMessage({
      type: 'get_test_status',
      testId
    });
  };

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000); // Send ping every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    error,
    stats,
    participants,
    connect,
    disconnect,
    sendMessage,
    joinTestSession,
    leaveTestSession,
    getTestStatus
  };
}

// Hook for Supabase real-time subscriptions (alternative to WebSocket)
export function useSupabaseRealtime(testId?: string) {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) return;

    const channels = [];

    // Subscribe to test_attempts changes
    const attemptsChannel = supabase
      .channel(`test_attempts_${testId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_attempts',
          filter: `test_id=eq.${testId}`
        },
        async (payload) => {
          console.log('Test attempts change:', payload);
          // Refresh test stats
          try {
            const response = await fetch(`/api/tests/${testId}/session`);
            if (response.ok) {
              const data = await response.json();
              setStats(data.data);
            }
          } catch (error) {
            console.error('Error fetching updated stats:', error);
          }
        }
      )
      .subscribe();

    channels.push(attemptsChannel);

    // Subscribe to test_sessions changes
    const sessionChannel = supabase
      .channel(`test_sessions_${testId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'test_sessions',
          filter: `test_id=eq.${testId}`
        },
        (payload) => {
          console.log('Test session change:', payload);
          if (payload.new) {
            setStats(payload.new);
          }
        }
      )
      .subscribe();

    channels.push(sessionChannel);

    // Initial fetch
    fetch(`/api/tests/${testId}/session`)
      .then(response => response.json())
      .then(data => setStats(data.data))
      .catch(error => {
        console.error('Error fetching initial stats:', error);
        setError('Failed to load real-time data');
      });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [testId]);

  return { stats, error };
}