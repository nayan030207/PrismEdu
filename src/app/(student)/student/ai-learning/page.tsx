'use client';

import * as React from 'react';
import { ChatWindow } from '@/components/ai/chat-window';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Bot, BookOpen, ShieldCheck, HelpCircle, CheckCircle2, Sparkles, FileText, Code2, Cpu } from 'lucide-react';

export default function AILearningAgentPage() {
  const suggestedAcademicQuestions = [
    'Explain Database Normalization from 1NF to BCNF with examples',
    'How does Dijkstra algorithm find the shortest path in a graph?',
    'What are ACID properties in database transactions and why is Isolation needed?',
    'What is the difference between 3NF and BCNF?',
    'Explain process scheduling and deadlocks in Operating Systems',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            RAG-Powered Academic Assistant
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <ShieldCheck className="h-3 w-3" />
            Curriculum Grounded
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">AI Learning Agent</h2>
        <p className="text-sm text-slate-500">
          Dedicated academic tutor for doubt-solving, step-by-step concept explanations, practice questions, and exam review.
        </p>
      </div>

      {/* Grid: Left Content + Right Vertical AI Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Academic Capabilities, Modules & Prompt Guidance (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold">Supported Academic Capabilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs text-slate-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Concept Explanations</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Step-by-step breakdowns of complex engineering & computer science concepts.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Code2 className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Code & Proof Walkthroughs</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Algorithms, pseudo-code, mathematical proofs, and data structure traces.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                    <span>Exam Practice & Quizzes</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Curated practice questions, previous year mid-term traces, and quiz prep.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Cpu className="h-3.5 w-3.5 text-purple-600" />
                    <span>Curriculum Alignment</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Grounded in university course syllabi, lecture slides, and reference textbooks.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 bg-gradient-to-b from-indigo-50/40 to-white p-5">
            <h5 className="font-bold text-xs text-indigo-900 mb-1 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-indigo-600" />
              <span>Prompting Best Practices</span>
            </h5>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              To get the most precise academic guidance from the RAG Engine:
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-white border border-indigo-100 text-indigo-800">
                &quot;Break down Dijkstra step-by-step with a 4-node trace.&quot;
              </div>
              <div className="p-2 rounded bg-white border border-indigo-100 text-indigo-800">
                &quot;Compare 3NF and BCNF normalization with a student database example.&quot;
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: AI AGENT PANEL (lg:col-span-5) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
            <ChatWindow
              agentType="learning"
              title="PRISM Academic AI"
              subtitle="Academic Learning & Doubt Solving Engine"
              endpoint="/api/ai/learning-chat"
              suggestedQuestions={suggestedAcademicQuestions}
              privacyNotice="Academic Privacy: Your private doubt questions are never visible to faculty."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

