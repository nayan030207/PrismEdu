'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bell, Clock, TrendingDown, AlertTriangle, ClipboardList, BookOpen, Eye } from 'lucide-react';
import { getFacultyAlerts } from '@/lib/store/faculty-data';

const ICON_MAP = {
  TrendingDown,
  AlertTriangle,
  ClipboardList,
  BookOpen,
};

export default function FacultyAlertsPage() {
  const alerts = getFacultyAlerts();

  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/faculty/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bell className="h-6 w-6 text-purple-600" />
              Recent Alerts (My Assigned Students)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time dropout alerts and indicators computed for your 54 cohort students.
          </p>
        </div>

        <Link href="/faculty/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {alerts.map((item) => {
          const Icon = ICON_MAP[item.iconName] || AlertTriangle;
          return (
            <Card key={item.id} className="p-4 border-slate-200 bg-white hover:border-purple-200 transition-all shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl ${item.iconBg} shrink-0 mt-0.5`}>
                    <Icon className={`h-4 w-4 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                    <p className="text-xs text-purple-700 font-medium mt-0.5">
                      {item.studentName} ({item.studentId})
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                    <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-1.5">
                      <Clock className="h-3 w-3" />
                      {item.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/faculty/students/${item.studentId}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs text-purple-600 border-purple-200 gap-1">
                      <Eye className="h-3.5 w-3.5" /> Review Student
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
