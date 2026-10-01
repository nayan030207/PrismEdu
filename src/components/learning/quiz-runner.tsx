'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, XCircle, HelpCircle, Trophy, RotateCcw } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_index?: number;
  explanation?: string;
}

interface QuizRunnerProps {
  quizId: string;
  title: string;
  description?: string;
  questions: Question[];
  totalMarks: number;
  durationMinutes?: number;
  onComplete?: (score: number, total: number) => void;
}

export function QuizRunner({
  quizId,
  title,
  description,
  questions,
  totalMarks,
  durationMinutes = 20,
  onComplete,
}: QuizRunnerProps) {
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<any | null>(null);

  const handleSelect = (qId: string, optIndex: number) => {
    if (result) return; // Locked once submitted
    setSelectedAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/student/quizzes/${quizId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selectedAnswers }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        if (onComplete) onComplete(data.score, data.totalMarks);
      }
    } catch {
      // Offline calculation fallback
      let score = 0;
      const breakdown: Record<string, any> = {};
      questions.forEach((q) => {
        const correct = q.correct_index ?? 0;
        const sel = selectedAnswers[q.id];
        const isCorrect = sel === correct;
        if (isCorrect) score += Math.round(totalMarks / questions.length);
        breakdown[q.id] = { selected: sel, correct, isCorrect };
      });
      const offlineResult = {
        score,
        totalMarks,
        percentage: Math.round((score / totalMarks) * 100),
        breakdown,
      };
      setResult(offlineResult);
      if (onComplete) onComplete(score, totalMarks);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setResult(null);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === questions.length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Quiz Header Card */}
      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-white">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
              Assessment Quiz • {durationMinutes} Minutes
            </span>
            <span className="text-xs font-medium text-slate-500">
              {questions.length} Questions • {totalMarks} Total Marks
            </span>
          </div>
          <CardTitle className="text-xl mt-2">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      </Card>

      {/* Results Banner (If Submitted) */}
      {result && (
        <Card className="border-emerald-200 bg-emerald-50/50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">
                  Quiz Completed: {result.score} / {result.totalMarks} Marks ({result.percentage}%)
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {result.percentage >= 70
                    ? 'Excellent mastery of concepts! Your activity has been recorded.'
                    : 'Good attempt. Review the detailed explanations below to strengthen concepts.'}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} className="shrink-0 bg-white">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Retry Quiz
            </Button>
          </div>
        </Card>
      )}

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, qIndex) => {
          const qResult = result?.breakdown?.[q.id];
          const isAnswered = selectedAnswers[q.id] !== undefined;

          return (
            <Card
              key={q.id}
              className={`transition-all ${
                result
                  ? qResult?.isCorrect
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-red-200 bg-red-50/20'
                  : 'border-slate-200'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <span className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-600 font-bold">
                      {qIndex + 1}
                    </span>
                    <span>{q.question}</span>
                  </span>
                  {result && (
                    <span className="shrink-0">
                      {qResult?.isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </span>
                  )}
                </div>

                {/* Options */}
                <div className="space-y-2 pl-8">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[q.id] === optIdx;
                    const isCorrectOption = q.correct_index === optIdx;

                    let optionStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700';

                    if (result) {
                      if (isCorrectOption) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-medium';
                      } else if (isSelected && !qResult?.isCorrect) {
                        optionStyle = 'border-red-400 bg-red-50 text-red-900 font-medium';
                      } else {
                        optionStyle = 'border-slate-200 bg-white opacity-60 text-slate-500';
                      }
                    } else if (isSelected) {
                      optionStyle = 'border-indigo-600 bg-indigo-50/60 text-indigo-900 font-medium';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelect(q.id, optIdx)}
                        disabled={!!result}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-sm flex items-center justify-between transition-all ${optionStyle}`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300'
                            }`}
                          >
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </span>
                          <span>{opt}</span>
                        </span>
                        {result && isCorrectOption && (
                          <span className="text-xs font-semibold text-emerald-700">Correct Answer</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation text when evaluated */}
                {result && q.explanation && (
                  <div className="mt-4 ml-8 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                    <HelpCircle className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">Explanation: </span>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Submission Footer */}
      {!result && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-xs text-slate-500">
            Answered: {answeredCount} of {questions.length} questions
          </span>
          <Button
            onClick={handleSubmit}
            disabled={!isAllAnswered || isSubmitting}
            isLoading={isSubmitting}
          >
            Submit Quiz Assessment
          </Button>
        </div>
      )}
    </div>
  );
}
