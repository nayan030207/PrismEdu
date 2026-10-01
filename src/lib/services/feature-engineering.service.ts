import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getDemoStudents } from '@/lib/store/demo-students';
import { activityService } from '@/lib/services/activity.service';
import type { FeatureSnapshot } from '@/lib/types';

declare global {
  // eslint-disable-next-line no-var
  var __PRISM_FEATURE_SNAPSHOTS: Map<string, FeatureSnapshot[]> | undefined;
}

if (!globalThis.__PRISM_FEATURE_SNAPSHOTS) {
  globalThis.__PRISM_FEATURE_SNAPSHOTS = new Map();
}

export class FeatureEngineeringService {
  /**
   * Generates a comprehensive feature snapshot for a given student ID
   */
  async generateFeatureSnapshot(studentId: string): Promise<FeatureSnapshot> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

    let currentGpa = 7.5;
    let previousGpa = 7.8;
    let backlogCount = 0;
    let failedSubjectCount = 0;
    let attendancePercentage = 85.0;
    let attendanceChange = -2.5;
    let absenceFrequency = 3;
    let consecutiveAbsences = 0;
    let financialStatus = 'not_required';

    // Fetch student profile & telemetry
    const demoStudents = getDemoStudents();
    const targetStudent = demoStudents.find(s => s.id === studentId || s.student_id === studentId);

    if (targetStudent) {
      currentGpa = targetStudent.academic_cgpa ?? targetStudent.previous_gpa ?? 7.5;
      previousGpa = targetStudent.admission?.previous_gpa ?? targetStudent.previous_gpa ?? (currentGpa + 0.3);
      backlogCount = targetStudent.academic_backlogs ?? targetStudent.previous_backlogs ?? 0;
      failedSubjectCount = backlogCount > 0 ? backlogCount : 0;
      attendancePercentage = targetStudent.attendance_rate ?? targetStudent.attendance_percentage ?? 82.0;
      attendanceChange = attendancePercentage < 75 ? -8.5 : -1.5;
      absenceFrequency = Math.round((100 - attendancePercentage) / 5);
      consecutiveAbsences = attendancePercentage < 70 ? 3 : 0;
      financialStatus = targetStudent.financial_assistance ?? targetStudent.admission?.financial_assistance ?? 'not_required';
    }

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        const { data: stu } = await supabase
          .from('students')
          .select('*, admission_profiles(*)')
          .or(`id.eq.${studentId},student_id.eq.${studentId}`)
          .single();

        if (stu) {
          if (stu.attendance_rate) attendancePercentage = stu.attendance_rate;
          if (stu.academic_cgpa) currentGpa = stu.academic_cgpa;
          if (stu.academic_backlogs !== undefined) backlogCount = stu.academic_backlogs;
        }
      } catch {
        // Fallback to local store values
      }
    }

    // Get aggregated activity telemetry
    const activitySummary = await activityService.getActivitySummary(studentId);

    const gpaChange = Number((currentGpa - previousGpa).toFixed(2));
    const marksAverage = currentGpa * 9.5; // Conversion factor
    const performanceTrend = gpaChange < 0 ? -1 : gpaChange > 0 ? 1 : 0;

    const dataCompletenessScore = Math.min(
      100,
      Math.round(
        (currentGpa ? 25 : 0) +
        (attendancePercentage !== undefined ? 25 : 0) +
        (activitySummary.engagementScore > 0 ? 25 : 0) +
        25
      )
    );

    const snapshot: FeatureSnapshot = {
      id: `feat-${studentId}-${Date.now()}`,
      studentId,
      observationDate: new Date().toISOString().split('T')[0],
      // Academic
      currentGpa,
      previousGpa,
      gpaChange,
      marksAverage,
      failedSubjectCount,
      backlogCount,
      performanceTrend,
      // Attendance
      attendancePercentage,
      attendanceChange,
      absenceFrequency,
      consecutiveAbsences,
      monthlyAttendance: attendancePercentage,
      attendanceTrend: attendanceChange < 0 ? -1 : 1,
      // Engagement
      loginFrequency: activitySummary.loginFrequency30d,
      activeDays: activitySummary.activeDays30d,
      averageSessionDuration: activitySummary.averageSessionDuration,
      resourceAccessFrequency: activitySummary.resourceAccessFrequency,
      assignmentSubmissionRate: activitySummary.assignmentActivity,
      quizActivity: activitySummary.quizActivity,
      engagementScore: activitySummary.engagementScore,
      engagementChange: activitySummary.engagementChange,
      // Financial & Support
      financialStatus,
      scholarshipStatus: financialStatus === 'required' ? 'applied' : 'none',
      feeAssistanceStatus: financialStatus === 'required' ? 'pending' : 'none',
      dataCompletenessScore,
      createdAt: new Date().toISOString(),
    };

    // Save snapshot in history
    if (!globalThis.__PRISM_FEATURE_SNAPSHOTS) {
      globalThis.__PRISM_FEATURE_SNAPSHOTS = new Map();
    }
    const studentHistory = globalThis.__PRISM_FEATURE_SNAPSHOTS.get(studentId) || [];
    studentHistory.unshift(snapshot);
    globalThis.__PRISM_FEATURE_SNAPSHOTS.set(studentId, studentHistory);

    return snapshot;
  }

  /**
   * Get latest feature snapshot for a student
   */
  async getLatestSnapshot(studentId: string): Promise<FeatureSnapshot> {
    const history = globalThis.__PRISM_FEATURE_SNAPSHOTS?.get(studentId);
    if (history && history.length > 0) {
      return history[0];
    }
    return this.generateFeatureSnapshot(studentId);
  }
}

export const featureEngineeringService = new FeatureEngineeringService();
