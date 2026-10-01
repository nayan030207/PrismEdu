'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertTriangle,
  BookOpen,
  CalendarCheck,
  Activity,
  HeartHandshake,
  ExternalLink,
  ShieldAlert,
  BarChart2,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function StudentAnalysisPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      fetch(`/api/predictions/student/${params.id}`).then(r => r.json()),
      fetch(`/api/activity/student/${params.id}/summary`).then(r => r.json()),
    ])
      .then(([predRes, actRes]) => {
        setData({
          prediction: predRes.prediction,
          summary: actRes.summary,
        });
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [params.id]);

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading comprehensive predictive student analysis...</div>;
  }

  const prediction = data?.prediction;
  const summary = data?.summary;
  const isHighRisk = prediction?.riskCategory === 'HIGH' || prediction?.riskCategory === 'CRITICAL';

  const gpaTrend = [
    { sem: 'Sem 1', gpa: 8.2 },
    { sem: 'Sem 2', gpa: 8.0 },
    { sem: 'Sem 3', gpa: 7.4 },
    { sem: 'Sem 4 (Current)', gpa: 6.8 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Predictive Risk & Early Warning Analysis</h2>
              <span className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-full ${
                prediction?.riskCategory === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                prediction?.riskCategory === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                prediction?.riskCategory === 'MODERATE' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {prediction?.riskCategory} RISK ({prediction?.riskProbability}%)
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Student ID: {params.id} • Automated Multi-Source Telemetry Analysis
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/faculty/interventions">
            <Button size="sm" className="gap-1.5 text-xs">
              <HeartHandshake className="h-4 w-4" />
              <span>Create Intervention</span>
            </Button>
          </Link>
        </div>
      </div>



      {/* Top Telemetry Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">Risk Score & Delta</div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-900">{prediction?.riskProbability || 35}%</div>
              {prediction?.riskChangeDelta !== undefined && (
                <span className={`text-xs font-bold ${prediction.riskChangeDelta > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {prediction.riskChangeDelta > 0 ? `+${prediction.riskChangeDelta}%` : `${prediction.riskChangeDelta}%`}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Classification: {prediction?.riskCategory}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">Attendance Telemetry</div>
            <div className="text-2xl font-black text-amber-600">68.5%</div>
            <p className="text-[11px] text-red-500 mt-1">Below 75% Institutional Threshold</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">Current Academic CGPA</div>
            <div className="text-2xl font-black text-slate-900">6.80</div>
            <p className="text-[11px] text-amber-600 mt-1">1 Pending Backlog Subject</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="text-xs text-slate-500 mb-1">Platform Engagement</div>
            <div className="text-2xl font-black text-indigo-600">{summary?.engagementScore || 45}/100</div>
            <p className="text-[11px] text-slate-400 mt-1">{summary?.loginFrequency30d || 12} logins in last 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Risk Factors & Academic Trends */}
        <div className="lg:col-span-2 space-y-6">
          {/* Explainable Risk Factors */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <span>Explainable Risk Factors Breakdown</span>
              </CardTitle>
              <p className="text-xs text-slate-500">
                Key contributing indicators associated with student dropout risk probability
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {prediction?.riskFactors.length === 0 ? (
                <div className="text-xs text-slate-400">No high-risk factors detected for this student.</div>
              ) : (
                prediction?.riskFactors.map((rf: any, idx: number) => (
                  <div key={idx} className="space-y-1.5 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800">{rf.featureName} ({rf.featureValue})</span>
                      <span className="font-mono text-slate-500">Importance: {rf.importanceScore}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${rf.importanceScore}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-600">{rf.description}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Academic Performance Trend Chart */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-indigo-600" />
                <span>Semester GPA Progression</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gpaTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="sem" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="gpa" stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Catalog Recommendations & Actions */}
        <div className="space-y-6">
          <Card className="border-indigo-100 bg-indigo-50/20">
            <CardHeader className="pb-3 border-b border-indigo-100">
              <CardTitle className="text-base text-indigo-950 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-indigo-600" />
                <span>Matched Catalog Recommendations</span>
              </CardTitle>
              <p className="text-xs text-indigo-700">
                Automated recommendations mapped from Resource Catalog to address risk factors
              </p>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Wellness Counseling Cell</span>
                  <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Urgent</span>
                </div>
                <p className="text-[11px] text-slate-600">Matched to Attendance Decline (&lt; 75%)</p>
                <Link href="/faculty/resources" className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline pt-1">
                  <span>View in Resource Catalog</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">DBMS Normalization Remedial Notes</span>
                  <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">High</span>
                </div>
                <p className="text-[11px] text-slate-600">Matched to Academic GPA Drop & Backlog</p>
                <Link href="/faculty/resources" className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:underline pt-1">
                  <span>View in Resource Catalog</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
