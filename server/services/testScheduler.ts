import cron from 'node-cron';
import { testService } from './testService';

export class TestScheduler {
  private static instance: TestScheduler;
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();

  private constructor() {
    this.initializeScheduler();
  }

  public static getInstance(): TestScheduler {
    if (!TestScheduler.instance) {
      TestScheduler.instance = new TestScheduler();
    }
    return TestScheduler.instance;
  }

  private initializeScheduler() {
    console.log('Initializing test scheduler...');

    // Check for tests that need to start every minute
    cron.schedule('* * * * *', async () => {
      await this.checkForTestsToStart();
    });

    // Check for tests that need to end every minute
    cron.schedule('* * * * *', async () => {
      await this.checkForTestsToEnd();
    });

    // Cleanup old completed test sessions daily at 2 AM
    cron.schedule('0 2 * * *', async () => {
      await this.cleanupOldSessions();
    });

    console.log('Test scheduler initialized successfully');
  }

  private async checkForTestsToStart() {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

      // Get tests that are scheduled and should start now
      const scheduledTests = await testService.getTests({
        status: 'scheduled'
      });

      const testsToStart = scheduledTests.filter(test => {
        const startTime = new Date(test.scheduled_start);
        return startTime <= now && startTime > oneMinuteAgo;
      });

      for (const test of testsToStart) {
        await this.startTest(test);
      }
    } catch (error) {
      console.error('Error checking for tests to start:', error);
    }
  }

  private async checkForTestsToEnd() {
    try {
      const now = new Date();

      // Get active tests that should end now
      const activeTests = await testService.getTests({
        status: 'active'
      });

      const testsToEnd = activeTests.filter(test => {
        const endTime = new Date(test.scheduled_end!);
        return endTime <= now;
      });

      for (const test of testsToEnd) {
        await this.endTest(test);
      }
    } catch (error) {
      console.error('Error checking for tests to end:', error);
    }
  }

  private async startTest(test: any) {
    try {
      console.log(`Starting test: ${test.title} (ID: ${test.id})`);

      // Update test status to active
      await testService.updateTest(test.id, { status: 'active' });

      // Create or update test session
      const existingSession = await testService.getTestSession(test.id);

      if (existingSession) {
        await testService.updateTestSession(test.id, {
          session_status: 'active',
          actual_start_time: new Date().toISOString()
        });
      } else {
        // This should be handled by the database trigger, but we'll create it manually
        await testService.updateTestSession(test.id, {
          session_status: 'active',
          actual_start_time: new Date().toISOString()
        });
      }

      console.log(`Test started successfully: ${test.title}`);
    } catch (error) {
      console.error(`Error starting test ${test.id}:`, error);
    }
  }

  private async endTest(test: any) {
    try {
      console.log(`Ending test: ${test.title} (ID: ${test.id})`);

      // Update test status to completed
      await testService.updateTest(test.id, { status: 'completed' });

      // Update test session
      await testService.updateTestSession(test.id, {
        session_status: 'ended',
        actual_end_time: new Date().toISOString()
      });

      // Mark all in-progress attempts as timed out
      const attempts = await testService.getTestAttemptsByTestId(test.id);
      const inProgressAttempts = attempts.filter(attempt => attempt.status === 'in_progress');

      for (const attempt of inProgressAttempts) {
        try {
          const { score, totalPoints } = await testService.calculateTestScore(attempt.id);
          await testService.timeoutTestAttempt(attempt.id, score, totalPoints);
          console.log(`Timed out attempt ${attempt.id} for user ${attempt.user_id}`);
        } catch (error) {
          console.error(`Error timing out attempt ${attempt.id}:`, error);
        }
      }

      console.log(`Test ended successfully: ${test.title}`);
    } catch (error) {
      console.error(`Error ending test ${test.id}:`, error);
    }
  }

  private async cleanupOldSessions() {
    try {
      console.log('Cleaning up old test sessions...');

      // This could be enhanced to archive old data instead of just logging
      // For now, we'll just log the cleanup process

      const completedTests = await testService.getTests({
        status: 'completed'
      });

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldTests = completedTests.filter(test => {
        const endTime = new Date(test.scheduled_end!);
        return endTime < thirtyDaysAgo;
      });

      console.log(`Found ${oldTests.length} old test sessions to consider for cleanup`);

      // Here you could implement archiving or cleanup logic
      // For now, we'll just keep the data but log what could be cleaned up

    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Manual test control methods for admin use
  public async manuallyStartTest(testId: string): Promise<void> {
    try {
      const test = await testService.getTestById(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      if (test.status !== 'scheduled') {
        throw new Error(`Cannot start test with status: ${test.status}`);
      }

      await this.startTest(test);
    } catch (error) {
      console.error(`Manual start error for test ${testId}:`, error);
      throw error;
    }
  }

  public async manuallyEndTest(testId: string): Promise<void> {
    try {
      const test = await testService.getTestById(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      if (test.status !== 'active') {
        throw new Error(`Cannot end test with status: ${test.status}`);
      }

      await this.endTest(test);
    } catch (error) {
      console.error(`Manual end error for test ${testId}:`, error);
      throw error;
    }
  }

  public async rescheduleTest(testId: string, newStartTime: string): Promise<void> {
    try {
      const test = await testService.getTestById(testId);
      if (!test) {
        throw new Error('Test not found');
      }

      if (test.status !== 'scheduled') {
        throw new Error(`Cannot reschedule test with status: ${test.status}`);
      }

      // Calculate new end time
      const newEndTime = new Date(newStartTime);
      newEndTime.setMinutes(newEndTime.getMinutes() + test.duration_minutes);

      await testService.updateTest(testId, {
        scheduled_start: newStartTime,
        // scheduled_end will be calculated automatically by the database trigger
      });

      console.log(`Test ${testId} rescheduled to start at ${newStartTime}`);
    } catch (error) {
      console.error(`Reschedule error for test ${testId}:`, error);
      throw error;
    }
  }

  public getSchedulerStatus() {
    return {
      active: true,
      cronJobsCount: this.cronJobs.size,
      lastCheck: new Date().toISOString()
    };
  }

  public stop() {
    // Stop all cron jobs
    this.cronJobs.forEach(job => job.stop());
    this.cronJobs.clear();
    console.log('Test scheduler stopped');
  }
}

// Export singleton instance
export const testScheduler = TestScheduler.getInstance();