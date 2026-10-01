import { createSupabaseServiceClient } from '@/lib/supabase/server';
import axios from 'axios';
import type { StudentActivityEvent, ActivitySummary } from '@/lib/types';

export interface TrackEventPayload {
  student_id: string;
  event_type: string;
  event_data?: Record<string, unknown>;
  session_id?: string;
}

export class ActivityService {
  private mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

  /**
   * Log a student interaction event to the centralized activity_events system
   */
  async recordEvent(payload: TrackEventPayload): Promise<StudentActivityEvent> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

    const event: StudentActivityEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      studentId: payload.student_id,
      eventType: (payload.event_type || 'dashboard_view') as any,
      timestamp: new Date().toISOString(),
      sessionId: payload.session_id,
      durationSeconds: (payload.event_data?.duration_seconds as number) || 120,
      resourceId: payload.event_data?.resource_id as string,
      courseId: payload.event_data?.course_id as string,
      metadata: payload.event_data,
      createdAt: new Date().toISOString(),
    };

    if (!globalThis.__PRISM_ACTIVITY_EVENTS) {
      globalThis.__PRISM_ACTIVITY_EVENTS = new Map();
    }
    const studentEvents = globalThis.__PRISM_ACTIVITY_EVENTS.get(payload.student_id) || [];
    studentEvents.unshift(event);
    globalThis.__PRISM_ACTIVITY_EVENTS.set(payload.student_id, studentEvents);

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        await supabase.from('activity_events').insert({
          student_id: payload.student_id,
          event_type: payload.event_type,
          event_data: payload.event_data || {},
          session_id: payload.session_id,
        });
      } catch (err) {
        console.error('Failed to log activity event to database:', err);
      }
    }

    // Trigger asynchronous feature re-aggregation on high-impact milestone events
    const triggerEvents = [
      'QUIZ_COMPLETED',
      'ASSIGNMENT_SUBMITTED',
      'RESOURCE_COMPLETED',
      'AI_LEARNING_INTERACTION'
    ];

    if (triggerEvents.includes(payload.event_type)) {
      this.triggerAnalyticsUpdate(payload.student_id).catch(() => {
        // Non-blocking background sync
      });
    }

    return event;
  }

  /**
   * Fetch activity events for a student
   */
  async getStudentEvents(studentId: string): Promise<StudentActivityEvent[]> {
    return globalThis.__PRISM_ACTIVITY_EVENTS?.get(studentId) || [];
  }

  /**
   * Compute aggregated engagement metrics for a student
   */
  async getActivitySummary(studentId: string): Promise<ActivitySummary> {
    const events = await this.getStudentEvents(studentId);
    const loginEvents = events.filter(e => e.eventType === 'login' || e.eventType === 'dashboard_view');
    const resourceEvents = events.filter(e => e.eventType === 'resource_view' || e.eventType === 'resource_download');
    const quizEvents = events.filter(e => e.eventType === 'quiz_attempt');
    const assignmentEvents = events.filter(e => e.eventType === 'assignment_submit');

    const totalDuration = events.reduce((sum, e) => sum + (e.durationSeconds || 120), 0);
    const avgDuration = events.length > 0 ? Math.round(totalDuration / events.length) : 180;

    const baseScore = Math.min(100, (loginEvents.length * 5) + (resourceEvents.length * 10) + (quizEvents.length * 15) + (assignmentEvents.length * 15));
    const engagementScore = Math.max(35, baseScore || 65);

    return {
      studentId,
      loginFrequency7d: Math.max(1, loginEvents.length),
      loginFrequency30d: Math.max(3, loginEvents.length * 3),
      activeDays7d: Math.min(7, Math.max(1, loginEvents.length)),
      activeDays30d: Math.min(30, Math.max(5, loginEvents.length * 3)),
      averageSessionDuration: avgDuration,
      resourceAccessFrequency: resourceEvents.length,
      assignmentActivity: assignmentEvents.length,
      quizActivity: quizEvents.length,
      engagementScore,
      engagementChange: engagementScore < 50 ? -15.0 : 2.5,
    };
  }

  /**
   * Notify Python ML service to re-aggregate features and update student_insights
   */
  async triggerAnalyticsUpdate(studentId: string): Promise<void> {
    try {
      await axios.post(`${this.mlServiceUrl}/analytics/compute/${studentId}`, {}, {
        timeout: 3000,
      });
    } catch {
      // Graceful offline/stand-alone fallback
    }
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __PRISM_ACTIVITY_EVENTS: Map<string, StudentActivityEvent[]> | undefined;
}

if (!globalThis.__PRISM_ACTIVITY_EVENTS) {
  globalThis.__PRISM_ACTIVITY_EVENTS = new Map();
}


export const activityService = new ActivityService();
