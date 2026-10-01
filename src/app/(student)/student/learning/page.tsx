'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { QuizRunner } from '@/components/learning/quiz-runner';
import {
  BookOpen,
  FileText,
  Video,
  FileCheck,
  HelpCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Send,
} from 'lucide-react';

export default function StudentLearningPage() {
  const [subjects, setSubjects] = React.useState<any[]>([]);
  const [activeSubjectId, setActiveSubjectId] = React.useState<string>('sub11111-1111-1111-1111-111111111111');
  const [activeCategory, setActiveCategory] = React.useState<'notes' | 'pdfs' | 'videos' | 'assignments' | 'quizzes'>('notes');
  const [isLoading, setIsLoading] = React.useState(true);

  // Selected note modal viewer
  const [selectedNote, setSelectedNote] = React.useState<any | null>(null);

  // Assignment submission modal
  const [selectedAssignment, setSelectedAssignment] = React.useState<any | null>(null);
  const [submissionText, setSubmissionText] = React.useState('');
  const [isSubmittingAssignment, setIsSubmittingAssignment] = React.useState(false);
  const [assignmentSubmittedSuccess, setAssignmentSubmittedSuccess] = React.useState(false);

  // Selected quiz runner modal
  const [selectedQuiz, setSelectedQuiz] = React.useState<any | null>(null);

  React.useEffect(() => {
    fetch('/api/student/learning')
      .then((res) => res.json())
      .then((data) => {
        setSubjects(data.subjects || []);
        if (data.subjects && data.subjects.length > 0) {
          setActiveSubjectId(data.subjects[0].id);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0];

  const handleOpenNote = (note: any) => {
    setSelectedNote(note);
    // Track resource opened telemetry event
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'RESOURCE_OPENED',
        event_data: { resource_id: note.id, title: note.title, type: 'note' },
      }),
    }).catch(() => {});
  };

  const handleCompleteNote = () => {
    if (!selectedNote) return;
    fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'RESOURCE_COMPLETED',
        event_data: { resource_id: selectedNote.id, title: selectedNote.title },
      }),
    }).catch(() => {});
    setSelectedNote(null);
    alert('Resource marked as complete! Your learning progress has been updated.');
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !submissionText.trim()) return;

    setIsSubmittingAssignment(true);
    try {
      const res = await fetch(`/api/student/assignments/${selectedAssignment.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission_text: submissionText }),
      });
      if (res.ok) {
        setAssignmentSubmittedSuccess(true);
        setTimeout(() => {
          setSelectedAssignment(null);
          setSubmissionText('');
          setAssignmentSubmittedSuccess(false);
        }, 1500);
      }
    } finally {
      setIsSubmittingAssignment(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading learning environment...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Learning Environment</h2>
        <p className="text-sm text-slate-500">
          Access course materials, notes, technical handbooks, video lectures, assignments, and self-quizzes.
        </p>
      </div>

      {/* Subject Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {subjects.map((sub) => {
          const isActive = sub.id === activeSubjectId;
          return (
            <Card
              key={sub.id}
              onClick={() => setActiveSubjectId(sub.id)}
              className={`cursor-pointer p-4 transition-all ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {sub.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">{sub.progress}% Complete</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{sub.name}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Semester {sub.semester} • {sub.credits} Credits • {sub.completedResources}/{sub.totalResources} completed
              </p>
              <Progress value={sub.progress} className="h-1.5 mt-3" />
            </Card>
          );
        })}
      </div>

      {/* Resource Category Selector (Section 8: Notes, PDFs, Videos, Assignments, Quizzes) */}
      {activeSubject && (
        <Card className="border-slate-200">
          <div className="border-b border-slate-200 px-6 pt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('notes')}
              className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeCategory === 'notes'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Lecture Notes ({activeSubject.resources?.notes?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveCategory('pdfs')}
              className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeCategory === 'pdfs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>PDF Handbooks ({activeSubject.resources?.pdfs?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveCategory('videos')}
              className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeCategory === 'videos'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Video Lectures ({activeSubject.resources?.videos?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveCategory('assignments')}
              className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeCategory === 'assignments'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileCheck className="h-4 w-4" />
              <span>Assignments ({activeSubject.resources?.assignments?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveCategory('quizzes')}
              className={`pb-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
                activeCategory === 'quizzes'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Quizzes ({activeSubject.resources?.quizzes?.length || 0})</span>
            </button>
          </div>

          <CardContent className="p-6">
            {/* Notes Tab */}
            {activeCategory === 'notes' && (
              <div className="space-y-3">
                {activeSubject.resources?.notes?.map((note: any) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4 hover:border-indigo-200 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{note.title}</h4>
                        {note.completed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{note.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Est. Duration: {note.duration_minutes} mins
                        </span>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleOpenNote(note)} className="shrink-0 text-xs">
                      Open Note
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* PDFs Tab */}
            {activeCategory === 'pdfs' && (
              <div className="space-y-3">
                {activeSubject.resources?.pdfs?.map((pdf: any) => (
                  <div
                    key={pdf.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{pdf.title}</h4>
                      <p className="text-xs text-slate-500">{pdf.description}</p>
                      <span className="text-[11px] text-slate-400">PDF Guide • {pdf.duration_minutes} mins reading</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`Opening PDF Guide: ${pdf.title}\n\n${pdf.content}`)}
                      className="shrink-0 text-xs gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Read PDF</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Videos Tab */}
            {activeCategory === 'videos' && (
              <div className="space-y-3">
                {activeSubject.resources?.videos?.map((vid: any) => (
                  <div
                    key={vid.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{vid.title}</h4>
                      <p className="text-xs text-slate-500">{vid.description}</p>
                      <span className="text-[11px] text-slate-400">Video Lecture • {vid.duration_minutes} mins</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert(`Streaming video lecture: ${vid.title}\nURL: ${vid.video_url}`)}
                      className="shrink-0 text-xs gap-1.5"
                    >
                      <Video className="h-3.5 w-3.5 text-red-600" />
                      <span>Watch Lecture</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Assignments Tab */}
            {activeCategory === 'assignments' && (
              <div className="space-y-3">
                {activeSubject.resources?.assignments?.map((asg: any) => (
                  <div
                    key={asg.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{asg.title}</h4>
                      <p className="text-xs text-slate-500">{asg.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>Max Marks: {asg.max_marks}</span>
                        <span className="text-amber-700 font-semibold">Due: {asg.due_date}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedAssignment(asg)}
                      className="shrink-0 text-xs gap-1.5"
                    >
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Submit Assignment</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Quizzes Tab */}
            {activeCategory === 'quizzes' && (
              <div className="space-y-3">
                {activeSubject.resources?.quizzes?.map((qz: any) => (
                  <div
                    key={qz.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{qz.title}</h4>
                      <p className="text-xs text-slate-500">{qz.description}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>{qz.total_questions} Questions</span>
                        <span>{qz.total_marks} Marks</span>
                        <span>{qz.duration_minutes} Minutes</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => setSelectedQuiz(qz)}
                      className="shrink-0 text-xs gap-1.5"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Attempt Quiz</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Note Reader Modal */}
      {selectedNote && (
        <Dialog
          isOpen={!!selectedNote}
          onClose={() => setSelectedNote(null)}
          title={selectedNote.title}
          description={`Lecture Note • Estimated reading time ${selectedNote.duration_minutes} minutes`}
          footer={
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => setSelectedNote(null)}>
                Close
              </Button>
              <Button variant="success" onClick={handleCompleteNote} className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Mark as Completed</span>
              </Button>
            </div>
          }
        >
          <div className="p-4 bg-slate-50 rounded-lg text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {selectedNote.content}
          </div>
        </Dialog>
      )}

      {/* Assignment Submission Modal */}
      {selectedAssignment && (
        <Dialog
          isOpen={!!selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          title={`Submit: ${selectedAssignment.title}`}
          description={`Max Marks: ${selectedAssignment.max_marks} • Due Date: ${selectedAssignment.due_date}`}
        >
          {assignmentSubmittedSuccess ? (
            <div className="p-6 text-center space-y-2 text-emerald-700 bg-emerald-50 rounded-lg">
              <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-600" />
              <h4 className="font-bold text-sm">Assignment Submitted Successfully!</h4>
              <p className="text-xs">Your response has been submitted for faculty evaluation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <p className="text-xs text-slate-600">{selectedAssignment.description}</p>
              <Textarea
                label="Your Solution / Response Text *"
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Type or paste your relational schema decomposition steps, functional dependency proofs, or answer code here..."
                rows={6}
                required
              />
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => setSelectedAssignment(null)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmittingAssignment} className="gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Solution</span>
                </Button>
              </div>
            </form>
          )}
        </Dialog>
      )}

      {/* Quiz Modal Runner */}
      {selectedQuiz && (
        <Dialog
          isOpen={!!selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          title="Curriculum Assessment Quiz"
          className="max-w-3xl"
        >
          <QuizRunner
            quizId={selectedQuiz.id}
            title={selectedQuiz.title}
            description={selectedQuiz.description}
            questions={selectedQuiz.questions || []}
            totalMarks={selectedQuiz.total_marks}
            durationMinutes={selectedQuiz.duration_minutes}
            onComplete={() => {
              // Quiz completed
            }}
          />
        </Dialog>
      )}
    </div>
  );
}
