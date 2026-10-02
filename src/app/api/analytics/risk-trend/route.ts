import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';
import { predictiveMlService } from '@/lib/services/predictive-ml.service';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const timeframe = searchParams.get('timeframe') || '30d';

  const students = getDemoStudents();
  const predictions = await Promise.all(
    students.map((s) => predictiveMlService.getLatestPrediction(s.id))
  );

  // Current distribution
  const currentAvgRisk =
    predictions.length > 0
      ? Math.round(predictions.reduce((a, p) => a + p.riskProbability, 0) / predictions.length)
      : 0;
  const currentHighRisk = predictions.filter(
    (p) => p.riskCategory === 'HIGH' || p.riskCategory === 'CRITICAL'
  ).length;

  // Generate synthetic historical trend — in production this would come from
  // a risk_history table. We simulate realistic month-over-month variance.
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const numPoints = timeframe === '7d' ? 7 : timeframe === '30d' ? 6 : timeframe === 'semester' ? 5 : 4;

  const trend: Array<{
    month: string;
    averageRisk: number;
    highRiskCount: number;
    criticalCount: number;
  }> = [];

  for (let i = numPoints - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const label = months[d.getMonth()];

    // Use current values as anchors and compute deterministic historical progression
    const varianceFactor = i > 0 ? (0.90 + (i * 0.02)) : 1.0;
    trend.push({
      month: i === 0 ? `${label} (Now)` : label,
      averageRisk: Math.round(currentAvgRisk * varianceFactor),
      highRiskCount: Math.round(currentHighRisk * varianceFactor),
      criticalCount: predictions.filter((p) => p.riskCategory === 'CRITICAL').length,
    });
  }

  return NextResponse.json({ timeframe, trend, totalStudents: students.length });
}
