import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { featureEngineeringService } from '@/lib/services/feature-engineering.service';

export async function POST(
  req: Request,
  { params }: { params: { student_id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const snapshot = await featureEngineeringService.generateFeatureSnapshot(params.student_id);
    return NextResponse.json({ success: true, snapshot });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Feature generation failed' }, { status: 500 });
  }
}
