import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { predictiveMlService } from '@/lib/services/predictive-ml.service';

export async function GET(
  req: Request,
  { params }: { params: { student_id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const prediction = await predictiveMlService.getLatestPrediction(params.student_id);
  return NextResponse.json({ prediction });
}
