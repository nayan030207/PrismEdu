import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { facultyEngineService } from '@/lib/services/faculty-engine.service';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized: Faculty access required' }, { status: 403 });
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Valid query string is required' }, { status: 400 });
    }

    const answer = await facultyEngineService.processAiQuery(query);
    return NextResponse.json({ query, answer, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process AI query' },
      { status: 500 }
    );
  }
}
