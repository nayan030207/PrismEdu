import * as React from 'react';
import { requireRole } from '@/lib/auth/session';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('faculty');

  return (
    <DashboardLayout role="faculty" user={session} title="Faculty Mentorship Portal">
      {children}
    </DashboardLayout>
  );
}
