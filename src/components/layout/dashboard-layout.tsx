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

import { cn } from '@/lib/utils';

export function DashboardLayout({
  children,
  role,
  user,
  title,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50/60 text-slate-800">
      <Sidebar
        role={role}
        userName={user.name}
        userEmail={user.email}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          role={role}
          userName={user.name}
          userEmail={user.email}
          title={title}
        />
        <main className={cn(
          "flex-1 p-4 md:p-6 w-full mx-auto",
          role === 'admin' ? "max-w-[1760px]" : "max-w-7xl"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
