'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';

export default function NotificationsPage() {
  const notifications = [
    { title: 'New Risk Alert: 12 students require immediate attention', time: '10 mins ago', unread: true },
    { title: 'Faculty Dr. Ramesh Joshi submitted outcome for Karan Desai', time: '1 hour ago', unread: true },
    { title: 'Weekly Cohort Model Retraining Completed', time: '4 hours ago', unread: false },
    { title: 'Department attendance summary for Sep 2025 generated', time: 'Yesterday', unread: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="h-6 w-6 text-purple-600" />
              System Notifications
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time administrative broadcasts, case updates, and predictive anomaly pings.
          </p>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => (
          <Card key={i} className={`p-4 border-slate-200 bg-white ${n.unread ? 'border-purple-200 bg-purple-50/20' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-2.5 w-2.5 rounded-full ${n.unread ? 'bg-purple-600' : 'bg-slate-300'}`} />
                <span className="text-xs font-semibold text-slate-800">{n.title}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">{n.time}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
