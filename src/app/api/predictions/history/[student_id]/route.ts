import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET(
  req: Request,
  { params }: { params: { student_id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const history = globalThis.__PRISM_PREDICTIONS_DB?.get(params.student_id) || [];
  return NextResponse.json({ history });
}
