'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import type { InterventionType } from '@/lib/types';

interface InterventionFormProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  defaultType?: InterventionType;
  onSuccess: (newIntervention: any) => void;
}

export function InterventionForm({
  isOpen,
  onClose,
  studentId,
  studentName,
  defaultType = 'academic',
  onSuccess,
}: InterventionFormProps) {
  const [type, setType] = React.useState<InterventionType>(defaultType);
  const [description, setDescription] = React.useState('');
  const [followUpDate, setFollowUpDate] = React.useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setType(defaultType);
  }, [defaultType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a specific intervention description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          type,
          description,
          follow_up_date: followUpDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create intervention');

      onSuccess(data.intervention);
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error creating intervention');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Targeted Student Intervention"
      description={`Assign actionable institutional support for ${studentName}.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Student
          </label>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 font-medium">
            {studentName}
          </div>
        </div>

        <Select
          label="Intervention Category"
          value={type}
          onChange={(e) => setType(e.target.value as InterventionType)}
          options={[
            { value: 'academic', label: 'Academic (Tutoring, doubt solving, remedial sessions)' },
            { value: 'attendance_engagement', label: 'Attendance / Engagement (Mentor check-in, schedule review)' },
            { value: 'financial', label: 'Financial (Scholarship referral, fee guidance)' },
            { value: 'personal_support', label: 'Personal / Support (Wellness counsellor referral)' },
            { value: 'career', label: 'Career (Skill coaching, internship connection)' },
          ]}
        />

        <Textarea
          label="Intervention Action Plan & Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Arranged weekly mentoring sessions with TA on DBMS Normalization concepts. Provided practice problem set."
          rows={4}
          required
        />

        <Input
          label="Scheduled Follow-up Date"
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          required
        />

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Intervention
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
