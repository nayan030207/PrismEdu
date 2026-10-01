export function extractRowValue(row: Record<string, any>, possibleKeys: string[]): any {
  if (!row || typeof row !== 'object') return undefined;

  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
      return row[key];
    }
  }

  const normalizedRowMap = new Map<string, string>();
  for (const k of Object.keys(row)) {
    const cleanKey = k.toLowerCase().replace(/[\s_\-%]/g, '');
    normalizedRowMap.set(cleanKey, k);
  }

  for (const key of possibleKeys) {
    const cleanSearchKey = key.toLowerCase().replace(/[\s_\-%]/g, '');
    if (normalizedRowMap.has(cleanSearchKey)) {
      const origKey = normalizedRowMap.get(cleanSearchKey)!;
      const val = row[origKey];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return val;
      }
    }
  }

  return undefined;
}

export function parseAttendanceRow(row: Record<string, any>, cohortStudents: any[] = []) {
  const rawStudentId = extractRowValue(row, [
    'student_id', 'studentId', 'Student ID', 'Student_ID', 'ID', 'id', 'Roll No', 'Roll_No', 'Enrollment No'
  ]);
  const rawName = extractRowValue(row, [
    'student_name', 'studentName', 'Student Name', 'Name', 'full_name', 'fullName', 'Full Name', 'Student'
  ]);
  const rawEmail = extractRowValue(row, [
    'email', 'Email', 'student_email', 'Student Email', 'Email Address', 'email_address'
  ]);
  const rawTotal = extractRowValue(row, [
    'total_classes', 'totalClasses', 'Total Classes', 'Total', 'Total Days', 'Classes Total'
  ]);
  const rawAttended = extractRowValue(row, [
    'attended_classes', 'attendedClasses', 'Attended Classes', 'Classes Attended', 'Attended', 'Present', 'Present Days'
  ]);
  const rawPct = extractRowValue(row, [
    'attendance_percentage', 'attendancePercentage', 'Attendance %', 'Attendance Percentage',
    'Attendance', 'attendance', 'Percentage', 'pct', 'Attendance Rate'
  ]);

  let studentId = rawStudentId ? String(rawStudentId).trim() : '';
  let studentName = rawName ? String(rawName).trim() : '';
  let email = rawEmail ? String(rawEmail).trim() : '';
  let totalClasses = rawTotal !== undefined ? parseInt(String(rawTotal), 10) : undefined;
  let attendedClasses = rawAttended !== undefined ? parseInt(String(rawAttended), 10) : undefined;

  let pct: number | undefined = undefined;

  if (rawPct !== undefined && rawPct !== null) {
    const cleanedPct = String(rawPct).replace('%', '').trim();
    const num = parseFloat(cleanedPct);
    if (!isNaN(num)) {
      if (num > 0 && num <= 1) {
        pct = Math.round(num * 10000) / 100;
      } else {
        pct = Math.round(num * 100) / 100;
      }
    }
  }

  if ((pct === undefined || isNaN(pct)) && attendedClasses !== undefined && totalClasses !== undefined && totalClasses > 0) {
    pct = Math.round((attendedClasses / totalClasses) * 10000) / 100;
  }

  const match = cohortStudents.find((s) => {
    if (studentId && (s.student_id?.toLowerCase() === studentId.toLowerCase() || s.id?.toLowerCase() === studentId.toLowerCase())) {
      return true;
    }
    if (email && s.email?.toLowerCase() === email.toLowerCase()) {
      return true;
    }
    if (studentName && s.full_name?.toLowerCase() === studentName.toLowerCase()) {
      return true;
    }
    return false;
  });

  if (match) {
    if (!studentId) studentId = match.student_id;
    if (!studentName) studentName = match.full_name;
    if (!email) email = match.email;
  }

  return {
    student_id: studentId || (match ? match.student_id : 'N/A'),
    student_name: studentName || (match ? match.full_name : '—'),
    email: email || (match ? match.email : '—'),
    total_classes: totalClasses !== undefined && !isNaN(totalClasses) ? totalClasses : '—',
    attended_classes: attendedClasses !== undefined && !isNaN(attendedClasses) ? attendedClasses : '—',
    attendance_percentage: pct !== undefined && !isNaN(pct) ? pct : 0,
    matched: !!match,
    originalRow: row,
  };
}
