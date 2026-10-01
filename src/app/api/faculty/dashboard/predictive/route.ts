import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';
import { predictiveMlService } from '@/lib/services/predictive-ml.service';
import { resourceRecommendationService } from '@/lib/services/resource-recommendation.service';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const students = getDemoStudents();

  const assignedPredictions = await Promise.all(
    students.map(async (s) => {
      const pred = await predictiveMlService.getLatestPrediction(s.id);
      const snapshot = await (await import('@/lib/services/feature-engineering.service')).featureEngineeringService.getLatestSnapshot(s.id);
      const recommendations = await resourceRecommendationService.getRecommendationsForStudent(s.id, snapshot, pred.riskFactors);

      return {
        student: {
          id: s.id,
          studentId: s.student_id,
          fullName: s.full_name,
          email: s.email,
          course: s.course,
          department: s.department,
          attendanceRate: s.attendance_rate ?? s.attendance_percentage ?? 82.0,
          cgpa: s.academic_cgpa ?? s.previous_gpa ?? 7.5,
          backlogs: s.academic_backlogs ?? s.previous_backlogs ?? 0,
        },
        prediction: pred,
        snapshot,
        recommendations,
      };
    })
  );

  return NextResponse.json({
    totalAssigned: students.length,
    assignedStudents: assignedPredictions,
  });
}
