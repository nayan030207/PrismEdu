'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { TrendLineChart } from '@/components/charts/trend-line-chart';
import { CalendarCheck2, AlertTriangle, TrendingDown, Clock, Activity, CheckCircle2 } from 'lucide-react';

export default function StudentAttendancePage() {
  const [data, setData] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/student/attendance')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const d = data || {
    overallRate: 69,
    previousRate: 82,
    rateChange: -13,
    statusIndicator: 'Attendance Decline',
    totalClasses: 45,
    attendedClasses: 31,
    missedClasses: 14,
    subjectBreakdown: [
      { subjectName: 'Database Management Systems', code: 'CS301', totalClasses: 18, attended: 12, rate: 67 },
      { subjectName: 'Data Structures and Algorithms', code: 'CS302', totalClasses: 15, attended: 11, rate: 73 },
      { subjectName: 'Operating Systems', code: 'CS303', totalClasses: 12, attended: 8, rate: 67 },
    ],
    weeklyTrend: [
      { week: 'Week 1', rate: 85 },
      { week: 'Week 2', rate: 82 },
      { week: 'Week 3', rate: 74 },
      { week: 'Week 4', rate: 69 },
    ],
    engagementMetrics: {
      lastLogin: 'Today, 10:15 AM',
      learningSessionsThisWeek: 4,
      resourcesAccessedThisMonth: 12,
      activeStreakDays: 2,
    },
    institutionalThresholdNotice:
      'Institutional Advisory: Your overall attendance is currently at 69%. Academic regulations require a minimum of 75% attendance for end-semester examinations.',
  };

  const trendChartData = d.weeklyTrend.map((w: any) => ({
    date: w.week,
    value: w.rate,
  }));

  if (isLoading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading attendance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance & Engagement</h2>
        <p className="text-sm text-slate-500">
          Track subject lecture attendance, longitudinal engagement trends, and institutional examination thresholds.
        </p>
      </div>

      {/* Attendance Decline Advisory Banner (Section 11) */}
      {d.overallRate < 75 && (
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm">Attendance Advisory: Below 75% Examination Requirement</h4>
            <p className="leading-relaxed text-amber-800">{d.institutionalThresholdNotice}</p>
          </div>
        </div>
      )}

      {/* Metrics Row (Section 11 Example: Previous 82%, Current 69%, Indicator: Attendance Decline) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border-amber-200 bg-gradient-to-b from-amber-50/20 to-white">
          <span className="text-xs font-semibold text-slate-500 uppercase">Current Attendance</span>
          <div className="flex items-baseline justify-between mt-2">
            <p className="text-3xl font-bold text-amber-700">{d.overallRate}%</p>
            <span className="text-xs font-bold text-red-600 flex items-center">
              <TrendingDown className="h-3.5 w-3.5 mr-0.5" />
              {d.rateChange}%
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">Previous Period: {d.previousRate}%</span>
        </Card>

        <Card className="p-5 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Classes Attended</span>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {d.attendedClasses} <span className="text-base text-slate-400 font-normal">/ {d.totalClasses}</span>
          </p>
          <span className="text-xs text-slate-400 mt-1 block">{d.missedClasses} Lectures missed</span>
        </Card>

        <Card className="p-5 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Weekly Learning Sessions</span>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {d.engagementMetrics.learningSessionsThisWeek}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Interactive portal sessions</span>
        </Card>

        <Card className="p-5 border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase">Monthly Resource Activity</span>
          <p className="text-3xl font-bold text-emerald-600 mt-2">
            {d.engagementMetrics.resourcesAccessedThisMonth}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">Notes, quizzes & videos</span>
        </Card>
      </div>

      {/* Weekly Trend Chart (Section 11) */}
      <Card className="border-slate-200 p-6">
        <TrendLineChart
          data={trendChartData}
          title="Attendance Trajectory (Past 4 Weeks - Showing Meaningful Decline)"
          color="#f97316"
          yDomain={[50, 100]}
          height={260}
        />
      </Card>

      {/* Subject-Wise Breakdown Table */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base">Subject-Wise Attendance Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Subject Name</TableHead>
                <TableHead>Attended / Total</TableHead>
                <TableHead>Attendance Rate</TableHead>
                <TableHead>Exam Eligibility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.subjectBreakdown.map((sub: any, idx: number) => {
                const isUnderThreshold = sub.rate < 75;
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-mono text-xs font-bold text-indigo-600">
                      {sub.code}
                    </TableCell>
                    <TableCell className="font-semibold text-sm text-slate-900">
                      {sub.subjectName}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {sub.attended} of {sub.totalClasses} classes
                    </TableCell>
                    <TableCell className="font-bold text-sm">
                      <span className={isUnderThreshold ? 'text-amber-700' : 'text-emerald-700'}>
                        {sub.rate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          isUnderThreshold
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isUnderThreshold ? 'Needs Improvement' : 'Eligible'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
