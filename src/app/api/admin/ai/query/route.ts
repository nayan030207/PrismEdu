import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { institutionalEngineService } from '@/lib/services/institutional-engine.service';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const query = body.query || '';

  const answer = await institutionalEngineService.processAiQuery(query);
  return NextResponse.json({ query, answer, timestamp: new Date().toISOString() });
}
