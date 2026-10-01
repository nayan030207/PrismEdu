import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';
import { predictiveMlService } from '@/lib/services/predictive-ml.service';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const students = getDemoStudents();
    const predictions = await Promise.all(
      students.map(s => predictiveMlService.generatePrediction(s.id))
    );

    return NextResponse.json({
      success: true,
      processedCount: predictions.length,
      predictions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Batch prediction failed' }, { status: 500 });
  }
}
