import * as React from 'react';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import type { UserRole, SessionUser } from '@/lib/types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: UserRole;
  user: SessionUser;
  title?: string;
}

export function DashboardLayout({
  children,
  role,
  user,
  title,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar
        role={role}
        userName={user.name}
        userEmail={user.email}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          role={role}
          userName={user.name}
          title={title}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
