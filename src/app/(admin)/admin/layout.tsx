import * as React from 'react';
import { requireRole } from '@/lib/auth/session';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole('admin');

  return (
    <DashboardLayout role="admin" user={session} title="Institutional Management">
      {children}
    </DashboardLayout>
  );
}
