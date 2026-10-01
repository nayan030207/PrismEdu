import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { updateDemoStudent, getDemoStudents } from '@/lib/store/demo-students';
import { parseAttendanceRow } from '@/lib/utils/attendance-parser';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized. Faculty or Admin privileges required.' }, { status: 403 });
  }

  try {
    const { rows } = await req.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Attendance rows array is required' }, { status: 400 });
    }

    const updated: any[] = [];
    const errors: any[] = [];
    const allStudents = getDemoStudents();

    for (const row of rows) {
      const parsed = parseAttendanceRow(row, allStudents);
      const pct = parsed.attendance_percentage;

      const match = parsed.originalRow && parsed.student_id !== 'N/A'
        ? allStudents.find(
            (s) =>
              s.student_id.toLowerCase() === parsed.student_id.toLowerCase() ||
              s.id.toLowerCase() === parsed.student_id.toLowerCase()
          )
        : null;

      const matchedStudent = match || allStudents.find(
        (s) =>
          (parsed.email && parsed.email !== '—' && s.email.toLowerCase() === parsed.email.toLowerCase()) ||
          (parsed.student_name && parsed.student_name !== '—' && s.full_name.toLowerCase() === parsed.student_name.toLowerCase())
      );

      if (matchedStudent) {
        const result = updateDemoStudent(matchedStudent.id, {
          attendance_percentage: pct,
          recent_changes: [
            `Attendance updated via Excel to ${pct}% (${pct < 75 ? 'Declining below 75%' : 'Good Standing'})`,
          ],
        });
        if (result) updated.push(result);
      } else {
        const identifier = parsed.student_name !== '—' ? parsed.student_name : (parsed.email !== '—' ? parsed.email : (parsed.student_id !== 'N/A' ? parsed.student_id : 'Unknown Student'));
        errors.push({ student_id: identifier, error: 'Student record not found in cohort database' });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${updated.length} student attendance records`,
      updatedCount: updated.length,
      errors,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Attendance import failed' }, { status: 500 });
  }
}

