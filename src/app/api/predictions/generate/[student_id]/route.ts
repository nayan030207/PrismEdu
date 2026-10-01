import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { predictiveMlService } from '@/lib/services/predictive-ml.service';

export async function POST(
  req: Request,
  { params }: { params: { student_id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const prediction = await predictiveMlService.generatePrediction(params.student_id);
    return NextResponse.json({ success: true, prediction });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Prediction generation failed' }, { status: 500 });
  }
}
