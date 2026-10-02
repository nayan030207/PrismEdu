'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GitBranch, ArrowLeft, CheckCircle2, RefreshCw } from 'lucide-react';

export default function IntegrationsPage() {
  const integrations = [
    { name: 'Campus ERP & SIS Portal', status: 'Connected', lastSync: '10 mins ago', type: 'Database' },
    { name: 'Moodle / Canvas LMS', status: 'Connected', lastSync: '1 hour ago', type: 'API' },
    { name: 'Biometric Attendance Hardware', status: 'Connected', lastSync: '5 mins ago', type: 'Webhook' },
    { name: 'Accounts & Fee Collection Gateways', status: 'Connected', lastSync: 'Daily at midnight', type: 'SFTP' },
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
              <GitBranch className="h-6 w-6 text-purple-600" />
              Institutional Integrations & Data Connectors
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time synchronization pipelines connecting PRISM-EDU with campus infrastructure.
          </p>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => (
          <Card key={item.name} className="border-slate-200 bg-white p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
              </div>
              <div className="text-xs text-slate-400 mt-1 pl-6">
                Protocol: {item.type} · Sync: {item.lastSync}
              </div>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {item.status}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
