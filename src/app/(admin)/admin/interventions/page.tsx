'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/ui/stat-card';
import {
  HeartHandshake,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpCircle,
  RefreshCw,
  Plus,
  Eye,
  Edit2,
  UserCheck,
  CalendarClock,
  ArrowRight,
  Search,
} from 'lucide-react';
import { CreateInterventionModal } from '@/components/interventions/create-intervention-modal';

type InterventionFilter = 'all' | 'active' | 'overdue' | 'completed' | 'escalated';

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'bg-amber-50 text-amber-700 border-amber-200' },
  in_progress: { label: 'In Progress', class: 'bg-blue-50 text-blue-700 border-blue-200' },
  completed: { label: 'Completed', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  overdue: { label: 'Overdue', class: 'bg-red-50 text-red-700 border-red-200' },
  escalated: { label: 'Escalated', class: 'bg-purple-50 text-purple-700 border-purple-200' },
  cancelled: { label: 'Cancelled', class: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const TYPE_LABELS: Record<string, string> = {
  academic: 'Academic Support',
  attendance_engagement: 'Attendance',
  financial: 'Financial Support',
  personal_support: 'Personal Support',
  career: 'Career',
};

export default function InterventionCenterPage() {
  const [interventions, setInterventions] = React.useState<any[]>([]);
  const [summary, setSummary] = React.useState<any>({});
  const [filter, setFilter] = React.useState<InterventionFilter>('all');
  const [search, setSearch] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>('');

  const fetchInterventions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/interventions?filter=${filter}&limit=50`);
      const data = await res.json();
      if (data.interventions) setInterventions(data.interventions);
      if (data.summary) setSummary(data.summary);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  const filteredInterventions = interventions.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (i.studentName || '').toLowerCase().includes(q) ||
      (i.studentId || '').toLowerCase().includes(q) ||
      (i.type || '').toLowerCase().includes(q)
    );
  });

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/interventions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchInterventions();
    } catch {
      // silent
    }
  };

  const filterTabs: { key: InterventionFilter; label: string; count?: number }[] = [
    { key: 'all', label: 'All', count: summary.total },
    { key: 'active', label: 'Active', count: summary.active },
    { key: 'overdue', label: 'Overdue', count: summary.overdue },
    { key: 'completed', label: 'Completed', count: summary.completed },
    { key: 'escalated', label: 'Escalated', count: summary.escalated },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Intervention Center</h2>
          <p className="text-sm text-slate-500">
            Create, track, and manage student intervention workflows from assignment to outcome.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchInterventions}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 text-xs bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4" />
            New Intervention
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard title="Total" value={summary.total || 0} icon={<HeartHandshake className="h-5 w-5" />} color="indigo" />
        <StatCard title="Active" value={summary.active || 0} icon={<Clock className="h-5 w-5" />} color="blue" />
        <StatCard
          title="Overdue"
          value={summary.overdue || 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={summary.overdue > 0 ? 'red' : 'emerald'}
        />
        <StatCard title="Completed" value={summary.completed || 0} icon={<CheckCircle2 className="h-5 w-5" />} color="emerald" />
        <StatCard title="Escalated" value={summary.escalated || 0} icon={<ArrowUpCircle className="h-5 w-5" />} color="amber" />
      </div>

      {/* Filter Tabs + Search */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex gap-1.5 flex-wrap">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    filter === tab.key
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or type..."
                className="pl-8 pr-3 py-2 text-xs w-full border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intervention Table */}
      <Card className="border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="text-xs">Student</TableHead>
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Priority</TableHead>
              <TableHead className="text-xs">Assigned To</TableHead>
              <TableHead className="text-xs">Due Date</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-right text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin opacity-50" />
                    <span className="text-xs">Loading interventions...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredInterventions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <HeartHandshake className="h-10 w-10 text-slate-200" />
                    <p className="text-sm font-medium text-slate-500">No interventions found</p>
                    <p className="text-xs text-slate-400">
                      {filter === 'all'
                        ? 'Create an intervention for a high-risk student to get started.'
                        : `No ${filter} interventions exist.`}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => setIsCreateOpen(true)}
                      className="mt-2 gap-1.5 text-xs bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="h-3.5 w-3.5" /> Create Intervention
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInterventions.map((intv: any) => {
                const statusCfg =
                  STATUS_CONFIG[intv.status] || STATUS_CONFIG['pending'];
                const isOverdue =
                  intv.followUpDate &&
                  intv.followUpDate < new Date().toISOString() &&
                  intv.status !== 'completed';
                return (
                  <TableRow
                    key={intv.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isOverdue ? 'bg-red-50/20' : ''
                    }`}
                  >
                    <TableCell>
                      <div className="font-semibold text-sm text-slate-900">
                        {intv.studentName || intv.student?.full_name || 'Student'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {intv.studentId || intv.student?.student_id || ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {TYPE_LABELS[intv.type] || intv.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {intv.priority === 'critical' ? (
                        <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-100 uppercase">
                          {intv.priority}
                        </span>
                      ) : intv.priority === 'high' ? (
                        <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 uppercase">
                          {intv.priority}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                          {intv.priority || 'medium'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-700">
                        {intv.facultyName || intv.faculty?.full_name || (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {intv.followUpDate ? (
                        <div className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                          {isOverdue && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                          {new Date(intv.followUpDate).toLocaleDateString('en-IN')}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          isOverdue ? STATUS_CONFIG['overdue'].class : statusCfg.class
                        }`}
                      >
                        {isOverdue ? 'Overdue' : statusCfg.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {intv.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-50"
                            onClick={() => updateStatus(intv.id, 'completed')}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Done
                          </Button>
                        )}
                        <Link href={`/faculty/students/${intv.studentId}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            <Eye className="h-3 w-3 mr-1" /> View
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <CreateInterventionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={fetchInterventions}
        initialStudentId={selectedStudentId}
      />
    </div>
  );
}
