'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Zap, AlertTriangle, AlertCircle, Info, Calendar, CreditCard, ArrowRight } from 'lucide-react';

export default function AdminPriorityActionsPage() {
  const [data, setData] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/admin/dashboard/full-metrics')
      .then((res) => res.json())
      .then((d) => {
        if (Array.isArray(d.priorityActions)) {
          setData(d.priorityActions);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Zap className="h-6 w-6 text-purple-600" />
              Priority Action Center
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Algorithmic queue of urgent institutional retention actions and pending mentor escalations.
          </p>
        </div>

        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item) => (
          <div
            key={item.id}
            className={`${item.bgColor} ${item.borderColor} border rounded-xl p-4 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className={`text-base font-bold text-slate-900`}>{item.count}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.iconColor} bg-white/70 border border-current`}>
                  {item.tone}
                </span>
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mt-1">{item.title}</h3>
              <ul className="mt-3 space-y-1 text-xs text-slate-600 list-disc pl-4">
                {item.points?.map((pt: string, i: number) => (
                  <li key={i}>{pt}</li>
                ))}
              </ul>
            </div>

            <Link
              href={item.href || '/admin/students'}
              className={`mt-4 pt-2.5 border-t border-black/5 text-xs font-semibold ${item.iconColor} hover:underline flex items-center gap-1`}
            >
              <span>{item.actionText}</span>
              <span>→</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
