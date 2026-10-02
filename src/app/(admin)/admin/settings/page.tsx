'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft, Save, Sliders, Shield, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [riskThreshold, setRiskThreshold] = React.useState('75');
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [autoEscalate, setAutoEscalate] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Settings className="h-6 w-6 text-purple-600" />
              Institutional System Configuration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global alert thresholds, notification triggers, and predictive modeling policies.
          </p>
        </div>

        <Button
          onClick={handleSave}
          size="sm"
          className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-2"
        >
          <Save className="h-3.5 w-3.5" />
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>

      <div className="space-y-4 max-w-3xl">
        <Card className="border-slate-200 bg-white p-5 space-y-4">
          <CardTitle className="text-sm font-bold text-slate-900">
            Early Warning Thresholds
          </CardTitle>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Critical Risk Cutoff Percentage
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(e.target.value)}
                className="w-24 text-xs p-2 border border-slate-200 rounded-lg"
              />
              <span className="text-xs text-slate-500">
                Students above this probability score trigger mandatory immediate attention flags.
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span>Send automated email digest to Department Heads when critical cases emerge</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={autoEscalate}
                onChange={(e) => setAutoEscalate(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span>Auto-escalate overdue interventions exceeding 7 calendar days</span>
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
}
