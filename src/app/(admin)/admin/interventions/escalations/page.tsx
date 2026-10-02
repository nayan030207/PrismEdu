'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUpCircle } from 'lucide-react';

export default function AdminInterventionEscalationsPage() {
  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex items-center gap-2">
        <Link href="/admin/interventions" className="text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ArrowUpCircle className="h-6 w-6 text-rose-600" />
            Intervention Escalations & Overdue Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cases requiring administrative dean review or parent-teacher conference escalations.</p>
        </div>
      </div>

      <Card className="p-4 border-slate-200 bg-white shadow-2xs">
        <div className="text-xs text-slate-600 space-y-2">
          <p>7 cases are currently overdue past their target follow-up date and have been flagged for HOD sign-off.</p>
          <div className="pt-2">
            <Link href="/admin/interventions?status=overdue">
              <Button size="sm" className="text-xs bg-rose-600 hover:bg-rose-700 text-white">
                Review 7 Overdue Cases
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
