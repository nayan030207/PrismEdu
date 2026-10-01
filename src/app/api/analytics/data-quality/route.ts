import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';
import type { DataQualityReport } from '@/lib/types';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const students = getDemoStudents();
  const total = students.length;

  let missingAttendance = 0;
  let missingAcademic = 0;
  let missingEngagement = 0;

  students.forEach(s => {
    if (!s.attendance_rate && !s.attendance_percentage) missingAttendance++;
    if (!s.academic_cgpa && !s.previous_gpa) missingAcademic++;
  });

  const complete = total - Math.max(missingAttendance, missingAcademic);

  const report: DataQualityReport = {
    totalStudentRecords: total,
    completeRecords: Math.max(1, complete),
    missingAttendance,
    missingAcademicData: missingAcademic,
    missingEngagementData: 0,
    duplicateRecords: 0,
    invalidRecords: 0,
    failedImports: 0,
    overallCompletenessPercentage: Number(((complete / total) * 100).toFixed(1)),
  };

  return NextResponse.json({ report });
}
