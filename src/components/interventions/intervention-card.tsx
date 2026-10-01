'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { Calendar, User, CheckCircle2, Clock, FileText } from 'lucide-react';
import type { InterventionType, InterventionStatus } from '@/lib/types';

export interface InterventionItem {
  id: string;
  student_id: string;
  student_name?: string;
  student_code?: string;
  type: InterventionType;
  description: string;
  status: InterventionStatus;
  created_at: string;
  follow_up_date?: string;
  outcome?: string | null;
}

interface InterventionCardProps {
  intervention: InterventionItem;
  onUpdateStatus?: (id: string, status: InterventionStatus, outcome?: string) => Promise<void>;
  isFaculty?: boolean;
}

export function InterventionCard({
  intervention,
  onUpdateStatus,
  isFaculty = true,
}: InterventionCardProps) {
  const [isOutcomeDialogOpen, setIsOutcomeDialogOpen] = React.useState(false);
  const [outcomeText, setOutcomeText] = React.useState(intervention.outcome || '');
  const [isUpdating, setIsUpdating] = React.useState(false);

  const getTypeColor = (type: InterventionType) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'attendance_engagement':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'financial':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'personal_support':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'career':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusBadge = (status: InterventionStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending Action</Badge>;
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelled</Badge>;
    }
  };

  const handleSaveOutcome = async () => {
    if (!onUpdateStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(intervention.id, 'completed', outcomeText);
      setIsOutcomeDialogOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkInProgress = async () => {
    if (!onUpdateStatus) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(intervention.id, 'in_progress');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <Card className="border-slate-200 hover:border-slate-300 transition-all">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full border ${getTypeColor(
                  intervention.type
                )}`}
              >
                {intervention.type.replace('_', ' ')}
              </span>
              {getStatusBadge(intervention.status)}
            </div>

            {intervention.student_name && (
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>{intervention.student_name}</span>
                {intervention.student_code && (
                  <span className="text-slate-400 font-normal">({intervention.student_code})</span>
                )}
              </div>
            )}
          </div>

          <p className="text-sm text-slate-800 leading-relaxed">{intervention.description}</p>

          {/* Outcome (If Completed) */}
          {intervention.outcome && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900">
              <div className="font-bold mb-0.5 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Recorded Outcome:</span>
              </div>
              <p className="pl-5">{intervention.outcome}</p>
            </div>
          )}

          {/* Footer Dates & Actions */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Created: {new Date(intervention.created_at).toLocaleDateString()}</span>
              </span>
              {intervention.follow_up_date && (
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Follow-up: {intervention.follow_up_date}</span>
                </span>
              )}
            </div>

            {isFaculty && intervention.status !== 'completed' && onUpdateStatus && (
              <div className="flex items-center gap-2">
                {intervention.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMarkInProgress}
                    disabled={isUpdating}
                    className="h-7 text-xs"
                  >
                    Start Intervention
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => setIsOutcomeDialogOpen(true)}
                  disabled={isUpdating}
                  className="h-7 text-xs"
                >
                  Record Outcome & Complete
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Outcome Recording Dialog */}
      <Dialog
        isOpen={isOutcomeDialogOpen}
        onClose={() => setIsOutcomeDialogOpen(false)}
        title="Record Intervention Outcome"
        description="Document the support provided, student response, and final results to feed into the historical dataset."
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOutcomeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOutcome} isLoading={isUpdating} disabled={!outcomeText.trim()}>
              Save & Complete
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Textarea
            label="Outcome Notes & Resolution Details"
            value={outcomeText}
            onChange={(e) => setOutcomeText(e.target.value)}
            placeholder="e.g. Student attended tutoring session, completed normal form practice sheets, and improved quiz score to 80%."
            rows={4}
            required
          />
        </div>
      </Dialog>
    </>
  );
}
