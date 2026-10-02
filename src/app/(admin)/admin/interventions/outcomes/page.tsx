'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminInterventionOutcomesPage() {
  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex items-center gap-2">
        <Link href="/admin/interventions" className="text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            Intervention Efficacy & Outcomes
          </h1>
          <p className="text-xs text-slate-500 mt-1">Measuring post-intervention risk reduction and academic recovery rates.</p>
        </div>
      </div>

      <Card className="p-4 border-slate-200 bg-white shadow-2xs">
        <div className="text-xs text-slate-600 space-y-2">
          <p>Overall Institutional Intervention Success Rate is <span className="font-bold text-emerald-600">68%</span> (24 cases resolved with lower risk scores).</p>
          <div className="pt-2">
            <Link href="/admin/dashboard">
              <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
                View on Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
