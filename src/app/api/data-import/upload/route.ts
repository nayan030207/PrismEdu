import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const datasetType = formData.get('datasetType') as string || 'student_master';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const headers = lines[0]?.split(',').map(h => h.trim().replace(/^"|"$/g, '')) || [];

    return NextResponse.json({
      success: true,
      filename: file.name,
      sizeBytes: file.size,
      datasetType,
      rowCount: lines.length - 1,
      headers,
      previewRows: lines.slice(1, 6).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj: Record<string, string> = {};
        headers.forEach((h, idx) => {
          obj[h] = vals[idx] || '';
        });
        return obj;
      }),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'File parse failed' }, { status: 500 });
  }
}
