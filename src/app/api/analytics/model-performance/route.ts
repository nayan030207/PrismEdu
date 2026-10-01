import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { predictiveMlService } from '@/lib/services/predictive-ml.service';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const metrics = await predictiveMlService.getModelMetrics();
  return NextResponse.json({ metrics });
}
