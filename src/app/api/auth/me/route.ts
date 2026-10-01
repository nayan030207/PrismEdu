import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      userId: session.userId,
      email: session.email,
      role: session.role,
      name: session.name,
      entityId: session.entityId,
    },
  });
}
