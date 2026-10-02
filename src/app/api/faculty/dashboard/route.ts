import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { facultyEngineService } from '@/lib/services/faculty-engine.service';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized: Faculty access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get('filter') || 'my_students';

  const dashboardData = await facultyEngineService.getFacultyDashboard(filter);

  return NextResponse.json({
    ...dashboardData,
    // Backwards compatibility keys
    stats: {
      totalAssignedStudents: dashboardData.facultyProfile.totalStudents,
      studentsRequiringAttention: dashboardData.kpis.highRisk.count,
      academicConcerns: dashboardData.kpis.academicDecline.count,
      attendanceConcerns: dashboardData.kpis.attendanceConcern.count,
      activeInterventions: dashboardData.kpis.activeInterventions.count,
    },
    attentionStudents: dashboardData.atRiskStudents.map((s) => ({
      id: s.id,
      student_id: s.student_id,
      full_name: s.full_name,
      course: s.course,
      attendance_rate: s.attendance,
      cgpa: s.cgpa,
      risk_score: s.riskScore,
      intervention: s.intervention,
    })),
  });
}
