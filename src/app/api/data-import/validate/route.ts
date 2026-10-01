import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { rows } = await req.json();

    const validRows: any[] = [];
    const errors: any[] = [];

    (rows || []).forEach((row: any, idx: number) => {
      const rowNum = idx + 1;
      if (!row.student_id && !row.studentId && !row.email) {
        errors.push({
          rowNumber: rowNum,
          field: 'student_id',
          message: 'Missing required student identifier (student_id or email).',
        });
      } else {
        validRows.push(row);
      }
    });

    return NextResponse.json({
      totalRows: (rows || []).length,
      validCount: validRows.length,
      errorCount: errors.length,
      errors,
      validRows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Validation failed' }, { status: 500 });
  }
}
