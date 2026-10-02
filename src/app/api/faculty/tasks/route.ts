import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { toggleFacultyTask, getFacultyTasks } from '@/lib/store/faculty-data';

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.json({ tasks: getFacultyTasks() });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'faculty' && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { taskId } = await req.json();
    if (!taskId) {
      return NextResponse.json({ error: 'taskId is required' }, { status: 400 });
    }

    const updatedTask = toggleFacultyTask(taskId);
    if (!updatedTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updatedTask, tasks: getFacultyTasks() });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update task' }, { status: 500 });
  }
}
