import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';
import { predictiveMlService } from '@/lib/services/predictive-ml.service';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const students = getDemoStudents();
  const predictions = await Promise.all(
    students.map(async s => ({
      dept: s.department || 'Computer Science and Engineering',
      pred: await predictiveMlService.getLatestPrediction(s.id),
    }))
  );

  const deptMap: Record<string, { total: number; moderate: number; high: number; critical: number; sumRisk: number }> = {};

  predictions.forEach(({ dept, pred }) => {
    if (!deptMap[dept]) {
      deptMap[dept] = { total: 0, moderate: 0, high: 0, critical: 0, sumRisk: 0 };
    }
    const item = deptMap[dept];
    item.total += 1;
    item.sumRisk += pred.riskProbability;
    if (pred.riskCategory === 'MODERATE') item.moderate += 1;
    if (pred.riskCategory === 'HIGH') item.high += 1;
    if (pred.riskCategory === 'CRITICAL') item.critical += 1;
  });

  const departmentRisk = Object.entries(deptMap).map(([department, data]) => ({
    department,
    totalStudents: data.total,
    moderateRisk: data.moderate,
    highRisk: data.high,
    criticalRisk: data.critical,
    averageRiskScore: Number((data.sumRisk / data.total).toFixed(1)),
  }));

  return NextResponse.json({ departments: departmentRisk });
}
