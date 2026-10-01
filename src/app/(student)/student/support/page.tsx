'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatWindow } from '@/components/ai/chat-window';
import { LifeBuoy, Mail, Phone, Clock, MapPin, ShieldCheck, Heart, AlertCircle, Sparkles, Building2, HelpCircle } from 'lucide-react';

export default function StudentSupportPage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/student/support')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const counsellors = data?.counsellors || [
    {
      id: 'c1',
      name: 'Dr. Aruna Sharma, Ph.D.',
      specialization: 'Student Wellness, Academic Stress & Anxiety Management',
      email: 'wellness.counsellor@prismedu.com',
      mobile: '+91 9822334455',
      availability: 'Mon - Fri: 10:00 AM - 4:00 PM (In-person & Confidential Video Call)',
      office_location: 'Student Welfare Centre, Block B, Room 204',
    },
    {
      id: 'c2',
      name: 'Prof. Rajesh Ramanathan',
      specialization: 'Career Transitions, Motivation & Personal Mentorship',
      email: 'mentorship@prismedu.com',
      mobile: '+91 9822334456',
      availability: 'Tue, Thu, Sat: 2:00 PM - 5:00 PM',
      office_location: 'Academic Block C, Room 112',
    },
  ];

  const suggestedSupportQuestions = [
    'How do I book a confidential session with Dr. Aruna Sharma?',
    'I am feeling stressed about semester exams and attendance',
    'Where is the on-campus student wellness centre located?',
    'What emergency student helpline numbers are available?',
  ];

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading support resources...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Personal & Family Support
        </h2>
        <p className="text-sm text-slate-500">
          Campus professional counselling services with AI Support Agent in vertical side panel.
        </p>
      </div>

      {/* Main Grid: Left Side Content + Right Side Vertical AI Agent Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Counsellors & Campus Wellness Facilities (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Mandatory Disclaimer (Section 13) */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/60 text-purple-900 flex items-start gap-3">
            <Heart className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-bold">Confidential Support & Campus Wellness</span>
              <p className="text-purple-800 leading-relaxed">
                {data?.aiSupportDisclaimer ||
                  'The AI companion provides supportive guidance and connects you to institutional resources. It is not a substitute for licensed counsellors or crisis services. For serious emotional distress, please contact Dr. Aruna Sharma or visit the Wellness Centre.'}
              </p>
            </div>
          </div>

          {/* Approved Campus Counsellors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-purple-600" />
                <span>Approved Campus Counsellors</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">2 Verified Experts</span>
            </div>

            <div className="space-y-4">
              {counsellors.map((c: any) => (
                <Card key={c.id} className="border-slate-200 hover:shadow-xs transition-all">
                  <CardContent className="p-5 space-y-3">
                    <div>
                      <h4 className="font-bold text-base text-slate-900">{c.name}</h4>
                      <p className="text-xs text-purple-700 font-medium mt-0.5">{c.specialization}</p>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <a href={`mailto:${c.email}`} className="text-indigo-600 hover:underline">
                          {c.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-slate-800">{c.mobile}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{c.availability}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{c.office_location}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a href={`mailto:${c.email}?subject=Confidential%20Mentorship%20Request`}>
                        <Button size="sm" variant="outline" className="w-full text-xs gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-purple-600" />
                          <span>Book Appointment</span>
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Campus Emergency Helplines & On-Campus Facilities */}
          <Card className="border-slate-200 bg-slate-50/50">
            <CardHeader className="pb-2 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <CardTitle className="text-sm font-bold text-slate-900">On-Campus Student Support Hub</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block">Student Health & Medical Desk</span>
                  <p className="text-slate-500">Block A, Ground Floor • Ext. 4091</p>
                  <span className="text-emerald-700 font-medium text-[11px] block mt-1">24/7 On-Call Medical Officer</span>
                </div>
                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block">Confidential Crisis Helpline</span>
                  <p className="text-slate-500">Free Toll-Free Call • +91 1800-419-7788</p>
                  <span className="text-purple-700 font-medium text-[11px] block mt-1">Anonymous & Confidential 24/7</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: AI AGENT PANEL (lg:col-span-5) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-md overflow-hidden">
            <ChatWindow
              agentType="support"
              title="HearMe"
              subtitle="A Comfortable place to share concerns"
              endpoint="/api/ai/support-chat"
              suggestedQuestions={suggestedSupportQuestions}
              privacyNotice="Privacy Protection: Personal support conversations are private and never shared with faculty."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

