import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

const COUNSELLORS: any[] = [];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    counsellors: COUNSELLORS,
    aiSupportDisclaimer: 'The PRISM Support AI assistant provides supportive institutional guidance and connects students to on-campus wellness services. It is NOT a substitute for licensed counsellors or medical providers.',
  });
}
