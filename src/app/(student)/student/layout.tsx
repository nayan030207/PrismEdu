import * as React from 'react';
import { requireRole } from '@/lib/auth/session';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('student');

  return (
    <DashboardLayout role="student" user={session} title="Student Portal">
      {children}
    </DashboardLayout>
  );
}
