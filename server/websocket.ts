import WebSocket from 'ws';
import { createClient } from '@supabase/supabase-js';
import { testService } from './services/testService';

const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAdmin?: boolean;
  subscriptions?: Set<string>;
}

interface Room {
  testId: string;
  clients: Set<WebSocketClient>;
  lastActivity: Date;
}

export class WebSocketServer {
  private wss: WebSocket.Server;
  private rooms: Map<string, Room> = new Map();
  private clients: Map<WebSocketClient, Set<string>> = new Map();

  constructor(port: number = 5050) {
    this.wss = new WebSocket.Server({ port });
    this.initializeServer();
    this.initializeDatabaseSubscriptions();
    console.log(`WebSocket server running on port ${port}`);
  }

  private initializeServer() {
    this.wss.on('connection', (ws: WebSocketClient, req) => {
      console.log('New WebSocket connection');

      // Extract token from URL query parameters or headers
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        console.log('Connection rejected: No authentication token');
        ws.close(1008, 'Authentication required');
        return;
      }

      // Authenticate user
      this.authenticateUser(ws, token);

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('Invalid message format:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      this.sendMessage(ws, {
        type: 'connection_established',
        timestamp: new Date().toISOString()
      });
    });
  }

  private async authenticateUser(ws: WebSocketClient, token: string) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        console.log('Authentication failed:', error?.message);
        ws.close(1008, 'Authentication failed');
        return;
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      ws.userId = user.id;
      ws.isAdmin = userData?.is_admin || false;
      ws.subscriptions = new Set();
      this.clients.set(ws, new Set());

      console.log(`User authenticated: ${user.id} (Admin: ${ws.isAdmin})`);

      this.sendMessage(ws, {
        type: 'authentication_success',
        userId: user.id,
        isAdmin: ws.isAdmin,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Authentication error:', error);
      ws.close(1008, 'Authentication error');
    }
  }

  private async handleMessage(ws: WebSocketClient, data: any) {
    if (!ws.userId) {
      this.sendError(ws, 'Not authenticated');
      return;
    }

    switch (data.type) {
      case 'join_test_session':
        await this.handleJoinTestSession(ws, data.testId);
        break;

      case 'leave_test_session':
        await this.handleLeaveTestSession(ws, data.testId);
        break;

      case 'get_test_status':
        await this.handleGetTestStatus(ws, data.testId);
        break;

      case 'ping':
        this.sendMessage(ws, { type: 'pong', timestamp: new Date().toISOString() });
        break;

      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  private async handleJoinTestSession(ws: WebSocketClient, testId: string) {
    try {
      // Verify user has access to this test
      const test = await testService.getTestById(testId);
      if (!test) {
        this.sendError(ws, 'Test not found');
        return;
      }

      // Only admins can monitor test sessions
      if (!ws.isAdmin) {
        this.sendError(ws, 'Admin access required for test monitoring');
        return;
      }

      // Join the room
      this.joinRoom(ws, testId);

      // Send current test session status
      const session = await testService.getTestSession(testId);
      const attempts = await testService.getTestAttemptsByTestId(testId);

      const stats = {
        active_participants: attempts.filter(a => a.status === 'in_progress').length,
        completed_participants: attempts.filter(a => a.status === 'completed').length,
        total_participants: attempts.length,
        session_status: session?.session_status || 'waiting',
        test_status: test.status,
        scheduled_start: test.scheduled_start,
        scheduled_end: test.scheduled_end
      };

      this.sendMessage(ws, {
        type: 'test_session_joined',
        testId,
        stats,
        timestamp: new Date().toISOString()
      });

      // Notify others in the room
      this.broadcastToRoom(testId, {
        type: 'admin_joined_session',
        adminId: ws.userId,
        timestamp: new Date().toISOString()
      }, ws);

      console.log(`Admin ${ws.userId} joined test session ${testId}`);

    } catch (error) {
      console.error('Error joining test session:', error);
      this.sendError(ws, 'Failed to join test session');
    }
  }

  private async handleLeaveTestSession(ws: WebSocketClient, testId: string) {
    this.leaveRoom(ws, testId);

    this.sendMessage(ws, {
      type: 'test_session_left',
      testId,
      timestamp: new Date().toISOString()
    });

    // Notify others in the room
    this.broadcastToRoom(testId, {
      type: 'admin_left_session',
      adminId: ws.userId,
      timestamp: new Date().toISOString()
    }, ws);

    console.log(`Admin ${ws.userId} left test session ${testId}`);
  }

  private async handleGetTestStatus(ws: WebSocketClient, testId: string) {
    try {
      const test = await testService.getTestById(testId);
      if (!test) {
        this.sendError(ws, 'Test not found');
        return;
      }

      const session = await testService.getTestSession(testId);
      const attempts = await testService.getTestAttemptsByTestId(testId);

      const stats = {
        active_participants: attempts.filter(a => a.status === 'in_progress').length,
        completed_participants: attempts.filter(a => a.status === 'completed').length,
        total_participants: attempts.length,
        session_status: session?.session_status || 'waiting',
        test_status: test.status,
        scheduled_start: test.scheduled_start,
        scheduled_end: test.scheduled_end,
        current_time: new Date().toISOString()
      };

      this.sendMessage(ws, {
        type: 'test_status_update',
        testId,
        stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting test status:', error);
      this.sendError(ws, 'Failed to get test status');
    }
  }

  private initializeDatabaseSubscriptions() {
    // Subscribe to test_attempts changes
    testService.subscribeToTestAttempts((payload) => {
      this.handleTestAttemptChange(payload);
    });

    // Subscribe to test_sessions changes
    testService.subscribeToTestSessions((payload) => {
      this.handleTestSessionChange(payload);
    });
  }

  private async handleTestAttemptChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT' && newRecord.status === 'in_progress') {
      // New participant joined
      await this.broadcastToTestRoom(newRecord.test_id, {
        type: 'participant_joined',
        participantId: newRecord.user_id,
        attemptId: newRecord.id,
        timestamp: new Date().toISOString()
      });

      await this.updateTestStats(newRecord.test_id);

    } else if (eventType === 'UPDATE') {
      const testId = newRecord.test_id || oldRecord.test_id;

      if (oldRecord.status === 'in_progress' &&
          (newRecord.status === 'completed' || newRecord.status === 'timed_out')) {
        // Participant completed or timed out
        await this.broadcastToTestRoom(testId, {
          type: 'participant_completed',
          participantId: newRecord.user_id,
          attemptId: newRecord.id,
          finalStatus: newRecord.status,
          score: newRecord.score,
          timestamp: new Date().toISOString()
        });

        await this.updateTestStats(testId);
      }
    }
  }

  private async handleTestSessionChange(payload: any) {
    const { eventType, new: newRecord } = payload;

    if (eventType === 'UPDATE') {
      await this.broadcastToTestRoom(newRecord.test_id, {
        type: 'session_status_changed',
        sessionStatus: newRecord.session_status,
        activeParticipants: newRecord.active_participants,
        completedParticipants: newRecord.completed_participants,
        actualStartTime: newRecord.actual_start_time,
        actualEndTime: newRecord.actual_end_time,
        timestamp: new Date().toISOString()
      });
    }
  }

  private async updateTestStats(testId: string) {
    try {
      const attempts = await testService.getTestAttemptsByTestId(testId);
      const session = await testService.getTestSession(testId);

      const stats = {
        active_participants: attempts.filter(a => a.status === 'in_progress').length,
        completed_participants: attempts.filter(a => a.status === 'completed').length,
        total_participants: attempts.length,
        session_status: session?.session_status || 'waiting',
        timestamp: new Date().toISOString()
      };

      await this.broadcastToTestRoom(testId, {
        type: 'test_stats_update',
        testId,
        stats
      });

    } catch (error) {
      console.error('Error updating test stats:', error);
    }
  }

  private joinRoom(ws: WebSocketClient, testId: string) {
    if (!this.rooms.has(testId)) {
      this.rooms.set(testId, {
        testId,
        clients: new Set(),
        lastActivity: new Date()
      });
    }

    const room = this.rooms.get(testId)!;
    room.clients.add(ws);
    room.lastActivity = new Date();

    const userRooms = this.clients.get(ws)!;
    userRooms.add(testId);

    ws.subscriptions!.add(testId);
  }

  private leaveRoom(ws: WebSocketClient, testId: string) {
    const room = this.rooms.get(testId);
    if (room) {
      room.clients.delete(ws);

      // Clean up empty rooms
      if (room.clients.size === 0) {
        this.rooms.delete(testId);
      }
    }

    const userRooms = this.clients.get(ws);
    if (userRooms) {
      userRooms.delete(testId);
    }

    ws.subscriptions!.delete(testId);
  }

  private broadcastToTestRoom(testId: string, message: any, excludeWs?: WebSocketClient) {
    const room = this.rooms.get(testId);
    if (!room) return;

    room.clients.forEach(client => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        this.sendMessage(client, message);
      }
    });
  }

  private sendMessage(ws: WebSocketClient, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocketClient, error: string) {
    this.sendMessage(ws, {
      type: 'error',
      error,
      timestamp: new Date().toISOString()
    });
  }

  private handleDisconnection(ws: WebSocketClient) {
    console.log(`Client disconnected: ${ws.userId}`);

    // Remove client from all rooms
    const userRooms = this.clients.get(ws);
    if (userRooms) {
      userRooms.forEach(testId => {
        this.leaveRoom(ws, testId);
      });
      this.clients.delete(ws);
    }
  }

  // Public methods for external use
  public broadcastToAll(message: any) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        this.sendMessage(client as WebSocketClient, message);
      }
    });
  }

  public broadcastToAdmins(message: any) {
    this.wss.clients.forEach(client => {
      const wsClient = client as WebSocketClient;
      if (client.readyState === WebSocket.OPEN && wsClient.isAdmin) {
        this.sendMessage(wsClient, message);
      }
    });
  }

  public getRoomStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalClients: this.clients.size,
      roomDetails: Array.from(this.rooms.entries()).map(([testId, room]) => ({
        testId,
        clientCount: room.clients.size,
        lastActivity: room.lastActivity
      }))
    };
    return stats;
  }

  public close() {
    this.wss.close(() => {
      console.log('WebSocket server closed');
    });
  }
}

// Export singleton instance
let wsServer: WebSocketServer;

export const initializeWebSocketServer = (port: number = 5050): WebSocketServer => {
  if (!wsServer) {
    wsServer = new WebSocketServer(port);
  }
  return wsServer;
};

export const getWebSocketServer = (): WebSocketServer => {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized');
  }
  return wsServer;
};