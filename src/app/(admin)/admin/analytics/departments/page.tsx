'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Building2, RefreshCw, AlertTriangle, Users, TrendingUp } from 'lucide-react';

export default function DepartmentAnalyticsPage() {
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/risk-by-department');
      const data = await res.json();
      if (data.departments) setDepartments(data.departments);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const topDept = departments.sort(
    (a, b) => b.averageRiskScore - a.averageRiskScore
  )[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-indigo-500" /> Department Risk Analytics
          </h2>
          <p className="text-sm text-slate-500">
            Risk concentration, high-risk student counts, and average risk score by department.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-slate-200">
          <div className="text-2xl font-black text-indigo-700">{departments.length}</div>
          <div className="text-xs font-medium text-slate-500">Departments Monitored</div>
        </Card>
        <Card className="p-4 border-slate-200">
          <div className="text-2xl font-black text-red-700">
            {departments.reduce((a, d) => a + d.highRisk + d.criticalRisk, 0)}
          </div>
          <div className="text-xs font-medium text-slate-500">High/Critical Risk Students</div>
        </Card>
        <Card className={`p-4 border-slate-200 ${topDept ? 'bg-amber-50/30 border-amber-200' : ''}`}>
          <div className="text-lg font-black text-amber-700 truncate">
            {topDept ? topDept.department.split(' ').slice(0, 2).join(' ') : '—'}
          </div>
          <div className="text-xs font-medium text-slate-500">Highest Avg Risk Dept</div>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-sm font-bold">Risk Level Distribution by Department</CardTitle>
          <p className="text-xs text-slate-500">Breakdown of moderate, high, and critical-risk students per department</p>
        </CardHeader>
        <CardContent className="pt-4">
          {departments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Building2 className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm">No department data available</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} margin={{ top: 5, right: 10, left: -15, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="department"
                    fontSize={9}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    tickLine={false}
                  />
                  <YAxis fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="moderateRisk" name="Moderate" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="highRisk" name="High" fill="#f97316" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="criticalRisk" name="Critical" fill="#ef4444" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Detail Table */}
      <Card className="border-slate-200">
        <CardHeader className="pb-2 border-b border-slate-100">
          <CardTitle className="text-sm font-bold">Department-Level Detail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600">Department</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Students</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Avg Risk</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Moderate</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">High</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Critical</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600">Risk Concentration</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept, i) => {
                  const riskPct = dept.totalStudents > 0
                    ? Math.round(((dept.highRisk + dept.criticalRisk) / dept.totalStudents) * 100)
                    : 0;
                  return (
                    <tr key={i} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${dept.criticalRisk > 0 ? 'bg-red-50/10' : ''}`}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{dept.department}</td>
                      <td className="px-4 py-3 text-right font-mono">{dept.totalStudents}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${dept.averageRiskScore >= 60 ? 'text-red-600' : dept.averageRiskScore >= 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {dept.averageRiskScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-amber-700 font-semibold">{dept.moderateRisk}</td>
                      <td className="px-4 py-3 text-right text-orange-700 font-semibold">{dept.highRisk}</td>
                      <td className="px-4 py-3 text-right text-red-700 font-bold">{dept.criticalRisk}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${riskPct >= 50 ? 'bg-red-500' : riskPct >= 25 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${riskPct}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold w-8 text-right">{riskPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {departments.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      No department data available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
