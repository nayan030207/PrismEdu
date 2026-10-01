import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { analyticsService } from '@/lib/services/analytics.service';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const stats = await analyticsService.getAdminDashboardStats();
  return NextResponse.json({ stats });
}
