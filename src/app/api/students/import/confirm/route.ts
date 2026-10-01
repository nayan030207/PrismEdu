import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { studentService } from '@/lib/services/student.service';
import type { StudentImportRow } from '@/types';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized: Faculty access required' }, { status: 403 });
  }

  try {
    const { rows } = (await req.json()) as { rows: StudentImportRow[] };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No student records to import' }, { status: 400 });
    }

    const facultyId = session.entityId;
    const result = await studentService.importValidatedStudents(rows, facultyId);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.createdCount} student profile(s) with initial predictive assessment triggered.`,
      result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Import confirmation failed' },
      { status: 500 }
    );
  }
}
