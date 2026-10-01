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
    students.map(async (s) => {
      const pred = await predictiveMlService.getLatestPrediction(s.id);
      return {
        student: s,
        prediction: pred,
      };
    })
  );

  const highRisk = predictions.filter(
    (item) => item.prediction.riskCategory === 'HIGH' || item.prediction.riskCategory === 'CRITICAL'
  );

  return NextResponse.json({ highRiskStudents: highRisk, count: highRisk.length });
}
