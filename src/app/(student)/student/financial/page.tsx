'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BadgePercent, ExternalLink, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function StudentFinancialPage() {
  const [data, setData] = React.useState<any>(null);
  const [activeTab, setActiveTab] = React.useState<'scholarships' | 'loans'>('scholarships');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/student/financial')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading financial opportunities...</div>;
  }

  const scholarships = data?.scholarships || [];
  const educationalLoans = data?.educationalLoans || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Financial Support & Scholarships
        </h2>
        <p className="text-sm text-slate-500">
          Institutional and government scholarship programs, fee relief schemes, and subsidized educational loans.
        </p>
      </div>

      {/* Advisory Notice (Section 12 Exact Disclaimer Requirement) */}
      <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 text-indigo-900 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-bold">Potentially Matching Financial Programs:</span>
          <p className="text-indigo-800 leading-relaxed">
            {data?.disclaimer ||
              'Potential eligibility tags are advisory indicators based on your admission profile. Final eligibility and approvals are strictly determined by the official awarding bodies.'}
          </p>
        </div>
      </div>

      {/* Sub-Tabs (Scholarships vs Educational Loans) */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('scholarships')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'scholarships'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BadgePercent className="h-4 w-4" />
          <span>Scholarships ({scholarships.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`pb-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-all ${
            activeTab === 'loans'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Educational Loans ({educationalLoans.length})</span>
        </button>
      </div>

      {/* Tab 1: Scholarships (Section 12 Fields) */}
      {activeTab === 'scholarships' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scholarships.map((sch: any) => (
            <Card key={sch.id} className="border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug">{sch.name}</h3>
                    <p className="text-xs text-indigo-600 font-medium mt-0.5">{sch.provider}</p>
                  </div>
                  {sch.isPotentiallyEligible && (
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      Potentially Eligible
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <strong className="text-slate-800">Eligibility: </strong>
                    <span>{sch.eligibility}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Benefits: </strong>
                    <span className="text-emerald-700 font-semibold">{sch.benefits}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Application Deadline: </strong>
                    <span className="text-red-600 font-medium">{sch.deadline}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Required Documents:</strong>
                    <ul className="list-disc list-inside space-y-0.5 pl-2 mt-1 text-slate-500">
                      {sch.required_documents.map((doc: string, idx: number) => (
                        <li key={idx}>{doc}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">External application portal</span>
                  <a href={sch.application_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="text-xs gap-1.5">
                      <span>Apply on Portal</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Educational Loans (Section 12 Fields) */}
      {activeTab === 'loans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {educationalLoans.map((loan: any) => (
            <Card key={loan.id} className="border-slate-200 flex flex-col justify-between hover:shadow-md transition-all">
              <CardContent className="p-6 space-y-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{loan.name}</h3>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">{loan.provider}</p>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <strong className="text-slate-800">Loan Details: </strong>
                    <span>{loan.loan_info}</span>
                  </div>
                  <div>
                    <strong className="text-slate-800">Eligibility: </strong>
                    <span>{loan.eligibility}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <span className="text-slate-400 text-[11px]">Interest Rate</span>
                      <p className="font-bold text-slate-800 text-sm">{loan.interest_rate}% p.a.</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Maximum Amount</span>
                      <p className="font-bold text-slate-800 text-sm">₹{loan.max_amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div>
                    <strong className="text-slate-800">Important Conditions: </strong>
                    <span className="text-slate-600">{loan.important_conditions}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Nationalized bank portal</span>
                  <a href={loan.application_link} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="text-xs gap-1.5">
                      <span>Loan Portal Info</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
