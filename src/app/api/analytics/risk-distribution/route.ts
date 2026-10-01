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
    students.map(s => predictiveMlService.getLatestPrediction(s.id))
  );

  const distribution = {
    LOW: 0,
    MODERATE: 0,
    HIGH: 0,
    CRITICAL: 0,
  };

  predictions.forEach(p => {
    distribution[p.riskCategory] = (distribution[p.riskCategory] || 0) + 1;
  });

  return NextResponse.json({
    distribution: [
      { category: 'LOW', count: distribution.LOW, label: 'Low Risk (0-29%)', color: '#10b981' },
      { category: 'MODERATE', count: distribution.MODERATE, label: 'Moderate Risk (30-59%)', color: '#f59e0b' },
      { category: 'HIGH', count: distribution.HIGH, label: 'High Risk (60-79%)', color: '#f97316' },
      { category: 'CRITICAL', count: distribution.CRITICAL, label: 'Critical Risk (80-100%)', color: '#ef4444' },
    ],
    total: predictions.length,
  });
}
