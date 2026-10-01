import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

let NOTIFICATIONS = [
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
    title: 'Attendance Advisory',
    message: 'Your overall attendance is currently at 69%. Academic regulations require a minimum of 75% for end-semester examinations.',
    type: 'attendance',
    time: '1 day ago',
    read: false,
    action_url: '/student/attendance',
  },
  {
    id: 'notif-3',
    title: 'Scholarship Deadline Notice',
    message: 'Merit-cum-Means Post-Matric Scholarship applications will close in 45 days. Review eligibility and upload income certificate.',
    type: 'financial',
    time: '2 days ago',
    read: false,
    action_url: '/student/financial',
  },
  {
    id: 'notif-4',
    title: 'New Course Assignment',
    message: 'Assignment 1: Relational Schema Normalization Exercise has been posted in DBMS. Due in 7 days.',
    type: 'learning',
    time: '3 days ago',
    read: true,
    action_url: '/student/learning',
  },
  {
    id: 'notif-5',
    title: 'New Internship Matching Your Profile',
    message: 'ThoughtWorks is hiring Full Stack Software Engineering Interns (Open to B.Tech CSE students).',
    type: 'career',
    time: '4 days ago',
    read: true,
    action_url: '/student/career',
  },
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ notifications: NOTIFICATIONS });
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
