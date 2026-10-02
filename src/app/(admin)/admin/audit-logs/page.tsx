'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollText, ArrowLeft, Shield, Clock } from 'lucide-react';

export default function AuditLogsPage() {
  const logs = [
    { action: 'Risk Escalation Approved', user: 'admin@prismedu.com', target: 'Vishal More (STD001)', time: 'Today 10:14 AM' },
    { action: 'Intervention Assigned to Faculty', user: 'admin@prismedu.com', target: 'Karan Desai (STD003)', time: 'Today 09:20 AM' },
    { action: 'Batch Predictive Run Triggered', user: 'System Cron', target: '1,240 records', time: 'Today 06:00 AM' },
    { action: 'Faculty Permission Modified', user: 'admin@prismedu.com', target: 'Dr. Ramesh Joshi', time: 'Yesterday 04:30 PM' },
    { action: 'Data Quality Health Check Run', user: 'System Daemon', target: 'Institutional DB', time: 'Yesterday 02:00 PM' },
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
              <ScrollText className="h-6 w-6 text-purple-600" />
              Institutional Audit Logs
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable trace of administrative interventions, faculty actions, and algorithmic decisions.
          </p>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 bg-white p-0 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
            <tr>
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log, i) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="py-3 px-4 font-semibold text-slate-800">{log.action}</td>
                <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{log.user}</td>
                <td className="py-3 px-4 text-slate-600">{log.target}</td>
                <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
