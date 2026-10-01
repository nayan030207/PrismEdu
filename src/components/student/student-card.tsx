import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { InsightBadge } from '@/components/ui/insight-badge';
import { Button } from '@/components/ui/button';
import { User, ChevronRight, AlertTriangle, Edit3 } from 'lucide-react';
import type { InsightLevel } from '@/lib/types';

interface StudentCardProps {
  id: string;
  studentId: string;
  fullName: string;
  course: string;
  academicLevel: InsightLevel;
  attendanceLevel: InsightLevel;
  financialLevel: InsightLevel;
  careerLevel: InsightLevel;
  recentChanges?: string[];
  attendanceRate?: number;
}

export function StudentCard({
  id,
  studentId,
  fullName,
  course,
  academicLevel,
  attendanceLevel,
  financialLevel,
  careerLevel,
  recentChanges,
  attendanceRate,
}: StudentCardProps) {
  const isAttentionRequired =
    academicLevel === 'attention_required' ||
    academicLevel === 'critical' ||
    attendanceLevel === 'declining' ||
    attendanceLevel === 'critical' ||
    financialLevel === 'attention_required';

  return (
    <Card className="hover:shadow-md transition-all border-slate-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 text-base leading-snug">{fullName}</h4>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {studentId}
                </span>
                {isAttentionRequired && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                    <AlertTriangle className="h-3 w-3" />
                    Attention
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{course}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Link href={`/faculty/students/${id}/edit`}>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs gap-1 text-slate-600 hover:text-indigo-600">
                <Edit3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            </Link>
            <Link href={`/faculty/students/${id}`}>
              <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs gap-1">
                <span>View</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Actionable Status Indicators Grid */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Academic</div>
            <InsightBadge level={academicLevel} category="academic" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Attendance</div>
            <InsightBadge level={attendanceLevel} category="attendance" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Financial</div>
            <InsightBadge level={financialLevel} category="financial" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1">Career</div>
            <InsightBadge level={careerLevel} category="career" />
          </div>
        </div>

        {/* Contributing Factors preview */}
        {recentChanges && recentChanges.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="text-[11px] font-medium text-slate-700 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span>{recentChanges[0]}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
