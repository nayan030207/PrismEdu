'use client';

import * as React from 'react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { InterventionCard, InterventionItem } from '@/components/interventions/intervention-card';
import { HeartHandshake } from 'lucide-react';
import type { InterventionStatus, InterventionType } from '@/lib/types';

export default function FacultyInterventionsPage() {
  const [interventions, setInterventions] = React.useState<InterventionItem[]>([]);
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [typeFilter, setTypeFilter] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchInterventions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (typeFilter !== 'all') params.set('type', typeFilter);

      const res = await fetch(`/api/interventions?${params.toString()}`);
      const data = await res.json();
      if (data.interventions) setInterventions(data.interventions);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter]);

  React.useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  const handleUpdateStatus = async (
    id: string,
    newStatus: InterventionStatus,
    outcome?: string
  ) => {
    try {
      const res = await fetch(`/api/interventions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, outcome }),
      });
      if (res.ok) {
        setInterventions((prev) =>
          prev.map((iv) =>
            iv.id === id ? { ...iv, status: newStatus, outcome: outcome || iv.outcome } : iv
          )
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Targeted Interventions</h2>
        <p className="text-sm text-slate-500">
          Faculty-led student support plans, active tracking, follow-ups, and recorded resolution outcomes.
        </p>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Filter by Intervention Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending Action' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
            ]}
          />

          <Select
            label="Filter by Category"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'academic', label: 'Academic' },
              { value: 'attendance_engagement', label: 'Attendance / Engagement' },
              { value: 'financial', label: 'Financial' },
              { value: 'personal_support', label: 'Personal / Support' },
              { value: 'career', label: 'Career' },
            ]}
          />
        </div>
      </Card>

      {/* Interventions List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading interventions...</div>
      ) : interventions.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 border border-dashed rounded-xl">
          No interventions found matching your filter criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {interventions.map((iv) => (
            <InterventionCard
              key={iv.id}
              intervention={iv}
              onUpdateStatus={handleUpdateStatus}
              isFaculty={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
