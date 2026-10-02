'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardList, CheckCircle2 } from 'lucide-react';

export default function AdminInterventionAssignmentsPage() {
  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex items-center gap-2">
        <Link href="/admin/interventions" className="text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-purple-600" />
            Faculty Intervention Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review mentorship allocation and student workload across departments.</p>
        </div>
      </div>

      <Card className="p-4 border-slate-200 bg-white shadow-2xs">
        <div className="text-xs text-slate-600 space-y-2">
          <p>42 active and completed interventions are currently mapped across 5 engineering faculties.</p>
          <div className="pt-2">
            <Link href="/admin/interventions">
              <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white">
                View All in Intervention Center
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
