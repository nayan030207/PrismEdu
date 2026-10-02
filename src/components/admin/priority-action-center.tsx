'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, TrendingUp, TrendingDown, BookOpen, Banknote, Clock, ArrowRight, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { InsightBadge } from '@/components/ui/insight-badge';

export function PriorityActionCenter() {
  const router = useRouter();
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    setIsLoading(true);
    fetch(`/api/admin/priority-actions?filter=${activeFilter}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [activeFilter]);

  if (isLoading && !data) {
    return (
      <Card className="border-slate-200 shadow-sm mb-8 animate-pulse">
        <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
          <div className="h-6 w-48 bg-slate-200 rounded"></div>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 bg-slate-100 rounded-lg"></div>)}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const summary = data.summary;
  const students = data.priorityStudents;

  const cards = [
    {
      id: 'critical-risk',
      title: 'Immediate Attention',
      count: summary.immediateAttention,
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      color: 'border-red-200 bg-red-50 hover:bg-red-100',
      textColor: 'text-red-900',
      description: 'Critical Dropout Risk (Score ≥ 70)'
    },
    {
      id: 'risk-increasing',
      title: 'Risk Increasing',
      count: summary.riskIncreasing,
      icon: <TrendingUp className="h-5 w-5 text-orange-600" />,
      color: 'border-orange-200 bg-orange-50 hover:bg-orange-100',
      textColor: 'text-orange-900',
      description: 'Score surged by 15+ points'
    },
    {
      id: 'attendance-decline',
      title: 'Attendance Decline',
      count: summary.attendanceDecline,
      icon: <TrendingDown className="h-5 w-5 text-amber-600" />,
      color: 'border-amber-200 bg-amber-50 hover:bg-amber-100',
      textColor: 'text-amber-900',
      description: 'Dropped by 10%+ recently'
    },
    {
      id: 'academic-decline',
      title: 'Academic Decline',
      count: summary.academicDecline,
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      textColor: 'text-blue-900',
      description: 'Significant GPA/Marks drop'
    },
    {
      id: 'financial-support',
      title: 'Financial Support',
      count: summary.financialSupport,
      icon: <Banknote className="h-5 w-5 text-emerald-600" />,
      color: 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100',
      textColor: 'text-emerald-900',
      description: 'Aid required / requested'
    },
    {
      id: 'overdue',
      title: 'Overdue Interventions',
      count: summary.overdueInterventions,
      icon: <Clock className="h-5 w-5 text-purple-600" />,
      color: 'border-purple-200 bg-purple-50 hover:bg-purple-100',
      textColor: 'text-purple-900',
      description: 'Past due resolution date'
    }
  ];

  const totalAlerts = Object.values(summary).reduce((a: number, b: any) => a + Number(b), 0) as number;

  return (
    <div className="mb-8 space-y-4">
      <Card className="border-slate-200 shadow-md overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-4 flex flex-row items-center justify-between border-b-0">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" />
              Priority Action Center
            </CardTitle>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Automatically flags students needing immediate attention based on live predictive metrics.
            </p>
          </div>
          {totalAlerts === 0 ? (
            <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              All Clear
            </div>
          ) : (
            <div className="bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-rose-500/30">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
              {totalAlerts} Active Alerts
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 bg-slate-50 border-t border-slate-200">
          {totalAlerts === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-bold text-slate-500">No students currently require priority attention.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {cards.map(card => (
                <div 
                  key={card.id}
                  onClick={() => {
                    setActiveFilter(activeFilter === card.id ? 'all' : card.id);
                    setIsExpanded(true);
                  }}
                  className={`relative p-3 rounded-xl border cursor-pointer transition-all ${
                    activeFilter === card.id ? 'ring-2 ring-indigo-500 shadow-md ' + card.color : card.color
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-1.5 bg-white rounded-lg shadow-xs">{card.icon}</div>
                    <span className={`text-xl font-black ${card.textColor}`}>{card.count}</span>
                  </div>
                  <h4 className={`text-xs font-bold ${card.textColor}`}>{card.title}</h4>
                  <p className="text-[10px] text-slate-600 mt-1 leading-tight line-clamp-2">{card.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Priority Student List */}
      {(isExpanded || activeFilter !== 'all') && students.length > 0 && (
        <Card className="border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-base text-slate-900">
              {activeFilter === 'all' ? 'Top Priority Students' : `Filtered: ${cards.find(c => c.id === activeFilter)?.title}`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={() => setIsExpanded(false)} className="text-xs h-8">
                Hide List
              </Button>
              <Button 
                size="sm" 
                onClick={() => router.push(activeFilter === 'overdue' ? '/admin/interventions' : `/admin/students?filter=${activeFilter}`)} 
                className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
              >
                View Full Directory <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-12 text-center text-xs">#</TableHead>
                <TableHead className="text-xs">Student</TableHead>
                <TableHead className="text-xs">Priority Score</TableHead>
                <TableHead className="text-xs">Alert Reasons</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.slice(0, 5).map((s: any, idx: number) => (
                <TableRow key={s.id} className="hover:bg-slate-50/80">
                  <TableCell className="text-center font-bold text-xs text-slate-400">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900 text-sm">{s.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{s.studentId}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-black text-slate-800">{s.priorityScore}</div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">/ 100</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {s.alerts.includes('CRITICAL_RISK') && (
                        <div className="text-[11px] text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-medium inline-block mr-1">
                          Critical Risk Score: {s.riskScore}%
                        </div>
                      )}
                      {s.alerts.includes('RISK_INCREASING') && (
                        <div className="text-[11px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 font-medium inline-block mr-1">
                          Risk +{s.riskChange} pts
                        </div>
                      )}
                      {s.alerts.includes('ATTENDANCE_DECLINE') && (
                        <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 font-medium inline-block mr-1">
                          Attendance Drop: {s.attendanceDecline}%
                        </div>
                      )}
                      {s.alerts.includes('ACADEMIC_DECLINE') && (
                        <div className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-medium inline-block mr-1">
                          Academic Score Drop
                        </div>
                      )}
                      {s.alerts.includes('FINANCIAL_SUPPORT') && (
                        <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-medium inline-block mr-1">
                          Financial Need Flagged
                        </div>
                      )}
                      {s.alerts.includes('OVERDUE_INTERVENTION') && (
                        <div className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 font-medium inline-block mr-1">
                          Action Overdue
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/students/${s.id}`}>
                      <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5 text-slate-700 hover:text-indigo-700 hover:border-indigo-200 hover:bg-indigo-50">
                        <User className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {students.length > 5 && (
            <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
              <p className="text-xs text-slate-500">
                And {students.length - 5} more priority students. 
                <button onClick={() => router.push(activeFilter === 'overdue' ? '/admin/interventions' : `/admin/students?filter=${activeFilter}`)} className="text-indigo-600 font-bold ml-1 hover:underline">View full list</button>
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
