'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bell,
  CheckCheck,
  HeartHandshake,
  Calendar,
  BadgePercent,
  BookOpen,
  Briefcase,
  ChevronRight,
} from 'lucide-react';

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchNotifications = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/student/notifications');
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    try {
      await fetch('/api/student/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch('/api/student/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      // ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'intervention':
        return <HeartHandshake className="h-4 w-4 text-purple-600" />;
      case 'attendance':
        return <Calendar className="h-4 w-4 text-amber-600" />;
      case 'financial':
        return <BadgePercent className="h-4 w-4 text-emerald-600" />;
      case 'learning':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'career':
        return <Briefcase className="h-4 w-4 text-indigo-600" />;
      default:
        return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">In-App Notifications</h2>
          <p className="text-sm text-slate-500">
            Timely academic updates, mentorship schedule reminders, and scholarship deadlines.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5 text-xs">
            <CheckCheck className="h-4 w-4 text-indigo-600" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Card className="border-slate-200 divide-y divide-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            You have no notifications at this time.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                n.read ? 'bg-white hover:bg-slate-50/60' : 'bg-indigo-50/30 hover:bg-indigo-50/50'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <span className="text-[11px] text-slate-400 block pt-0.5">{n.time}</span>
                </div>
              </div>

              {n.action_url && (
                <Link href={n.action_url} className="shrink-0 mt-1">
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-indigo-600">
                    <span>View</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
