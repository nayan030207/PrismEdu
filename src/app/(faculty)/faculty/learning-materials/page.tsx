'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Download, Plus, FileText } from 'lucide-react';

export default function FacultyLearningMaterialsPage() {
  const materials = [
    { id: '1', title: 'Data Structures: Tree & Graph Algorithms Question Bank', type: 'PDF', size: '2.4 MB', date: 'Sep 25, 2025' },
    { id: '2', title: 'Digital Electronics Lab Manual & Circuit Diagrams', type: 'PDF', size: '4.1 MB', date: 'Sep 20, 2025' },
    { id: '3', title: 'Discrete Mathematics Mid-Term Remedial Handout', type: 'Doc', size: '1.2 MB', date: 'Sep 15, 2025' },
    { id: '4', title: 'Computer Architecture & Microprocessors Summary', type: 'PDF', size: '3.8 MB', date: 'Sep 10, 2025' },
  ];

  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/faculty/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-purple-600" />
              Learning Materials Repository
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Course handouts, lab worksheets, and remedial study resources for assigned students.
          </p>
        </div>

        <Link href="/faculty/resources/add">
          <Button size="sm" className="text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Upload Material
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.map((m) => (
          <Card key={m.id} className="p-4 border-slate-200 bg-white hover:border-purple-200 transition-all shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm leading-snug">{m.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {m.type} · {m.size} · Uploaded {m.date}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1 shrink-0 text-purple-600 border-purple-200">
                <Download className="h-3 w-3" /> Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
