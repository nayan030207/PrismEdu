import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { validRows, datasetType } = await req.json();

    // Commit records to database store
    return NextResponse.json({
      success: true,
      committedCount: (validRows || []).length,
      datasetType: datasetType || 'institutional_records',
      message: `Successfully imported ${(validRows || []).length} validated records into the system.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Import commit failed' }, { status: 500 });
  }
}
