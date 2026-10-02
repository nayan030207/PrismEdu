import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';
import { predictiveMlService } from '@/lib/services/predictive-ml.service';
import { featureEngineeringService } from '@/lib/services/feature-engineering.service';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const EMERGING_RISK_INCREASE_THRESHOLD = 8; // risk points increase to qualify

  const students = getDemoStudents();
  const emergingStudents: any[] = [];

  for (const student of students) {
    const pred = await predictiveMlService.getLatestPrediction(student.id);
    const snapshot = await featureEngineeringService.generateFeatureSnapshot(student.id);

    const riskScore = pred.riskProbability;
    const prevRisk = pred.previousRiskProbability;
    const riskChange = prevRisk !== undefined ? riskScore - prevRisk : 0;

    // Emerging = not yet CRITICAL but rising, or just entered HIGH
    const isEmerging =
      riskChange >= EMERGING_RISK_INCREASE_THRESHOLD &&
      (pred.riskCategory === 'MODERATE' || pred.riskCategory === 'HIGH');

    if (isEmerging) {
      // Determine primary risk driver from prediction factors
      const topFactor = pred.riskFactors.sort((a, b) => b.importanceScore - a.importanceScore)[0];

      emergingStudents.push({
        id: student.id,
        studentId: student.student_id,
        name: student.full_name,
        department: student.department,
        course: student.course,
        academicYear: student.academic_year,
        currentRisk: Math.round(riskScore),
        previousRisk: prevRisk !== undefined ? Math.round(prevRisk) : null,
        riskChange: Math.round(riskChange),
        riskLevel: pred.riskCategory,
        primaryRiskDriver: topFactor
          ? topFactor.featureName
          : 'Multiple risk indicators',
        primaryRiskDescription: topFactor ? topFactor.description : null,
        attendanceRate: snapshot.attendancePercentage,
        currentGpa: snapshot.currentGpa,
        lastUpdated: pred.predictionDate,
        riskFactors: pred.riskFactors.slice(0, 3).map((f) => ({
          name: f.featureName,
          importance: f.importanceScore,
          description: f.description,
        })),
      });
    }
  }

  // Sort by risk change descending (fastest rising first)
  emergingStudents.sort((a, b) => b.riskChange - a.riskChange);

  return NextResponse.json({
    emergingStudents: emergingStudents.slice(0, limit),
    total: emergingStudents.length,
    threshold: EMERGING_RISK_INCREASE_THRESHOLD,
  });
}
