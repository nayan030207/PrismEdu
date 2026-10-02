'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings, Bell, Shield, Sliders } from 'lucide-react';

export default function FacultySettingsPage() {
  const [saved, setSaved] = React.useState(false);

  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex items-center gap-2">
        <Link href="/faculty/dashboard" className="text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-purple-600" />
            Faculty Preferences & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">Configure threshold notifications, alert emails, and automated mentoring reminders.</p>
        </div>
      </div>

      <Card className="p-5 border-slate-200 bg-white space-y-4 max-w-2xl">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Early Warning Triggers</h3>
        <div className="space-y-3 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
            <span className="text-slate-700">Send instant alert when a mentee attendance falls below 65%</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
            <span className="text-slate-700">Alert me when a student&apos;s risk surges by &gt; 15% in 30 days</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded border-slate-300 text-purple-600 focus:ring-purple-500" />
            <span className="text-slate-700">Daily morning digest of scheduled meetings and overdue interventions</span>
          </label>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <Button
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 2000);
            }}
            size="sm"
            className="text-xs bg-purple-600 hover:bg-purple-700 text-white"
          >
            {saved ? 'Saved!' : 'Save Preferences'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
