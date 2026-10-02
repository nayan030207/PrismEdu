'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, Calendar, Clock, Video, CheckCircle2 } from 'lucide-react';
import { getFacultyMeetings } from '@/lib/store/faculty-data';

export default function FacultyMeetingsPage() {
  const meetings = getFacultyMeetings();

  return (
    <div className="space-y-5 pb-10 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/faculty/dashboard" className="text-slate-400 hover:text-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-purple-600" />
              Meetings & Mentorship Notes
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scheduled one-on-one counseling and group review sessions for SE Computer Engineering.
          </p>
        </div>

        <Link href="/faculty/dashboard">
          <Button variant="outline" size="sm" className="text-xs">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetings.map((m) => (
          <Card key={m.id} className="p-4 border-slate-200 bg-white hover:border-purple-200 transition-all shadow-2xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${m.avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                  {m.avatarText}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{m.name}</h3>
                  <p className="text-xs text-purple-700 font-medium">{m.subtitle}</p>
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    {m.time}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <Button size="sm" className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1">
                  <Video className="h-3 w-3" /> Start
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs text-slate-600">
                  Notes
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
