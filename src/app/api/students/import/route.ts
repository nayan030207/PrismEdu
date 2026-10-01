import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { ImportService } from '@/lib/services/import.service';
import { studentService } from '@/lib/services/student.service';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized: Faculty access required' }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const service = new ImportService();
    let parseResult: { rows: Record<string, unknown>[]; tagMappings: any[]; headerRowIndex: number };

    try {
      parseResult = service.parseFileWithTags(buffer);
    } catch (parseErr: any) {
      return NextResponse.json(
        { error: `File parsing error: ${parseErr.message || 'Invalid spreadsheet file'}` },
        { status: 400 }
      );
    }

    const rawRows = parseResult.rows;

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'The uploaded file has no data rows' }, { status: 400 });
    }

    // Check existing student IDs from database if live
    const existingIds = new Set<string>();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isLiveDb = supabaseUrl && !supabaseUrl.includes('your-project') && !supabaseUrl.includes('test.supabase');

    if (isLiveDb) {
      try {
        const supabase = createSupabaseServiceClient();
        const { data } = await supabase.from('students').select('student_id');
        (data || []).forEach((s) => existingIds.add(s.student_id.toUpperCase()));
      } catch {
        // Fallback
      }
    } else {
      // Demo seed IDs
      ['STU1021', 'STU1024', 'STU1035', 'STU1042', 'STU1058', 'STU1063'].forEach((id) =>
        existingIds.add(id)
      );
    }

    // Validate rows, columns, data types, and check for duplicates
    const validationResult = service.validateRows(rawRows, existingIds);

    // Automatically commit valid rows to the Database and Auth Platform
    let importResult: any = null;
    if (validationResult.valid.length > 0) {
      importResult = await studentService.importValidatedStudents(validationResult.valid, session.entityId);
    }

    return NextResponse.json({
      success: true,
      totalRows: rawRows.length,
      validCount: validationResult.valid.length,
      errorCount: validationResult.errors.length,
      duplicateCount: validationResult.duplicates.length,
      tagMappings: parseResult.tagMappings,
      headerRowIndex: parseResult.headerRowIndex,
      validRows: validationResult.valid,
      errors: validationResult.errors,
      duplicates: validationResult.duplicates,
      autoImported: true,
      importResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to process student import file' },
      { status: 500 }
    );
  }
}
