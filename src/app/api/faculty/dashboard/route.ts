import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { analyticsService } from '@/lib/services/analytics.service';
import { getDemoStudents } from '@/lib/store/demo-students';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const facultyId = session.entityId;
  const stats = await analyticsService.getFacultyDashboardStats(facultyId);
  const students = getDemoStudents();

  // Actionable student attention rows computed dynamically from imported/registered cohort
  const attentionStudents = students
    .filter(
      (s) =>
        s.insight?.academic === 'attention_required' ||
        s.insight?.academic === 'critical' ||
        s.insight?.attendance === 'declining' ||
        s.insight?.attendance === 'critical' ||
        s.insight?.financial === 'attention_required'
    )
    .map((s) => ({
      id: s.id,
      student_id: s.student_id,
      full_name: s.full_name,
      course: s.course,
      academic_level: s.insight?.academic || 'good',
      attendance_level: s.insight?.attendance || 'good',
      financial_level: s.insight?.financial || 'good',
      career_level: s.insight?.career || 'good',
      recent_changes: s.recent_changes || [],
      attendance_rate: 75,
      previous_attendance_rate: 85,
    }));

  const recentChanges: any[] = [];
  students.forEach((s) => {
    (s.recent_changes || []).forEach((change) => {
      recentChanges.push({
        studentName: s.full_name,
        studentId: s.student_id,
        change,
        time: 'Recent',
        severity: change.toLowerCase().includes('declined') || change.toLowerCase().includes('dropped') ? 'high' : 'medium',
      });
    });
  });

  const pendingInterventions: any[] = [];

  return NextResponse.json({
    stats,
    attentionStudents,
    recentChanges,
    pendingInterventions,
  });
}
