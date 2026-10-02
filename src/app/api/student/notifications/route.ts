import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const students = getDemoStudents();
  const normEmail = (session.email || '').toLowerCase().trim();

  const student = students.find(
    (s) =>
      (s.email && s.email.toLowerCase().trim() === normEmail) ||
      s.id === session.entityId ||
      s.student_id === session.entityId
  );

  const attendanceRate = student ? (student.attendance_percentage ?? student.attendance_rate ?? 85) : 85;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Faculty Intervention Scheduled',
      message: 'Dr. Sarah Mitchell has scheduled an academic tutoring follow-up for DBMS Normalization on Friday at 3:00 PM.',
      type: 'intervention',
      time: '2 hours ago',
      read: false,
      action_url: '/student/support',
    },
    {
      id: 'notif-2',
      title: attendanceRate < 75 ? 'Attendance Advisory Alert' : 'Attendance Record Standing',
      message: attendanceRate < 75
        ? `Your overall attendance is currently at ${attendanceRate}%. Academic regulations require a minimum of 75% for end-semester examinations.`
        : `Your overall attendance is currently at ${attendanceRate}%, satisfying institutional examination criteria.`,
      type: 'attendance',
      time: '1 day ago',
      read: false,
      action_url: '/student/attendance',
    },
    {
      id: 'notif-3',
      title: 'Scholarship Deadline Notice',
      message: 'EBC / Economically Backward Class tuition fee concessions and merit scholarship applications open for submission.',
      type: 'financial',
      time: '2 days ago',
      read: false,
      action_url: '/student/financial',
    },
    {
      id: 'notif-4',
      title: 'New Course Assignment',
      message: 'Assignment 1: Relational Schema Normalization Exercise has been posted in DBMS.',
      type: 'learning',
      time: '3 days ago',
      read: true,
      action_url: '/student/learning',
    },
  ];

  return NextResponse.json({ notifications });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { notification_id, mark_all } = await req.json();

    if (mark_all) {
      NOTIFICATIONS = NOTIFICATIONS.map((n) => ({ ...n, read: true }));
    } else if (notification_id) {
      NOTIFICATIONS = NOTIFICATIONS.map((n) =>
        n.id === notification_id ? { ...n, read: true } : n
      );
    }

    return NextResponse.json({ success: true, notifications: NOTIFICATIONS });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
