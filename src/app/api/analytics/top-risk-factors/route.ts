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

  const factorCounts: Record<string, { count: number; avgImportance: number }> = {};

  predictions.forEach(p => {
    p.riskFactors.forEach(rf => {
      if (!factorCounts[rf.featureName]) {
        factorCounts[rf.featureName] = { count: 0, avgImportance: 0 };
      }
      factorCounts[rf.featureName].count += 1;
      factorCounts[rf.featureName].avgImportance += rf.importanceScore;
    });
  });

  const topFactors = Object.entries(factorCounts).map(([featureName, val]) => ({
    featureName,
    affectedStudents: val.count,
    averageImportanceScore: Number((val.avgImportance / val.count).toFixed(1)),
  })).sort((a, b) => b.affectedStudents - a.affectedStudents);

  return NextResponse.json({ topFactors });
}
