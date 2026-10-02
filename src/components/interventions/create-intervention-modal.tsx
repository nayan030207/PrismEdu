'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import type { InterventionType } from '@/lib/types';

interface CreateInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  initialStudentId?: string;
}

export function CreateInterventionModal({
  isOpen,
  onClose,
  onCreated,
  initialStudentId,
}: CreateInterventionModalProps) {
  const [studentSearch, setStudentSearch] = React.useState('');
  const [students, setStudents] = React.useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = React.useState<any>(null);
  const [type, setType] = React.useState<InterventionType>('academic');
  const [priority, setPriority] = React.useState('medium');
  const [description, setDescription] = React.useState('');
  const [followUpDate, setFollowUpDate] = React.useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<'select' | 'form'>('select');

  // If initialStudentId is provided, skip student selection
  React.useEffect(() => {
    if (initialStudentId) {
      // Pre-select this student
      fetch(`/api/admin/students?search=${initialStudentId}`)
        .then((r) => r.json())
        .then((data) => {
          const found = (data.students || []).find(
            (s: any) => s.id === initialStudentId || s.student_id === initialStudentId
          );
          if (found) {
            setSelectedStudent(found);
            setStep('form');
          }
        })
        .catch(() => {});
    }
  }, [initialStudentId]);

  // Student search
  React.useEffect(() => {
    if (!studentSearch.trim() || studentSearch.length < 2) {
      setStudents([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`/api/admin/students?search=${encodeURIComponent(studentSearch)}&limit=10`)
        .then((r) => r.json())
        .then((data) => setStudents(data.students || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timeout);
  }, [studentSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setError('Please select a student first.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide an intervention description.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/interventions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          student_name: selectedStudent.full_name,
          type,
          priority,
          description,
          follow_up_date: followUpDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create intervention');

      onCreated();
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create intervention');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStudentSearch('');
    setStudents([]);
    setSelectedStudent(null);
    setType('academic');
    setPriority('medium');
    setDescription('');
    setError(null);
    setStep('select');
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Student Intervention"
      description="Log a targeted support action for a student requiring attention."
    >
      {step === 'select' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Search & Select Student
            </label>
            <input
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="Type name, ID or email..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
            />

            {students.length > 0 && (
              <div className="mt-2 border border-slate-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                {students.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudent(s);
                      setStep('form');
                    }}
                    className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-purple-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{s.full_name}</div>
                      <div className="text-[11px] text-slate-500">
                        {s.student_id} · {s.department}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {studentSearch.length >= 2 && students.length === 0 && (
              <p className="text-xs text-slate-400 mt-2 text-center">No students found for &quot;{studentSearch}&quot;</p>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          {/* Selected student header */}
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-indigo-900">{selectedStudent?.full_name}</div>
              <div className="text-xs text-indigo-600">
                {selectedStudent?.student_id} · {selectedStudent?.department}
              </div>
            </div>
            {!initialStudentId && (
              <button
                type="button"
                onClick={() => setStep('select')}
                className="text-xs text-indigo-500 hover:underline"
              >
                Change
              </button>
            )}
          </div>

          <Select
            label="Intervention Type"
            value={type}
            onChange={(e) => setType(e.target.value as InterventionType)}
            options={[
              { value: 'academic', label: 'Academic Support (Tutoring, remedial sessions)' },
              { value: 'attendance_engagement', label: 'Attendance / Engagement' },
              { value: 'financial', label: 'Financial Support' },
              { value: 'personal_support', label: 'Personal / Wellness Support' },
              { value: 'career', label: 'Career Guidance' },
            ]}
          />

          <Select
            label="Priority Level"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: 'critical', label: '🔴 Critical — Immediate action required' },
              { value: 'high', label: '🟠 High — Action within 48 hours' },
              { value: 'medium', label: '🟡 Medium — Action within 1 week' },
              { value: 'low', label: '🟢 Low — Routine follow-up' },
            ]}
          />

          <Textarea
            label="Intervention Description & Action Plan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Scheduled weekly 1-on-1 mentoring sessions on core subjects. Provided practice problem sets and arranged peer tutoring support."
            rows={4}
            required
          />

          <Input
            label="Target Follow-up Date"
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
              Create Intervention
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
