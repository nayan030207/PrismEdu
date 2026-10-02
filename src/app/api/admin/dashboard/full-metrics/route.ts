import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { institutionalEngineService } from '@/lib/services/institutional-engine.service';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || (session.role !== 'admin' && session.role !== 'faculty')) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const department = searchParams.get('department') || undefined;

  const raw = await institutionalEngineService.getCalculatedDashboard(department);

  // Transform metrics object into the 8 cards matching Section 1
  const metrics = [
    {
      id: 'total-students',
      title: 'Total Students',
      value: raw.metrics.totalStudentsDisplay || '1,240',
      trend: raw.metrics.totalStudentsTrend || '↑ 3%',
      trendColor: 'text-emerald-600',
      subtitle: 'Active enrollments',
      iconName: 'Users',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 'high-risk',
      title: 'High-Risk Students',
      value: String(raw.metrics.highRiskStudents),
      trend: raw.metrics.highRiskTrend,
      trendColor: 'text-rose-600',
      subtitle: raw.metrics.highRiskSubtitle,
      iconName: 'ShieldAlert',
      iconBg: 'bg-rose-50 text-rose-600',
    },
    {
      id: 'emerging-risk',
      title: 'Emerging-Risk',
      value: String(raw.metrics.emergingRiskStudents),
      trend: raw.metrics.emergingRiskTrend,
      trendColor: 'text-rose-600',
      subtitle: raw.metrics.emergingRiskSubtitle,
      iconName: 'AlertTriangle',
      iconBg: 'bg-amber-50 text-amber-600',
    },
    {
      id: 'increasing-risk',
      title: 'Increasing Risk',
      value: String(raw.metrics.increasingRiskStudents),
      trend: raw.metrics.increasingRiskTrend,
      trendColor: 'text-rose-600',
      subtitle: 'Risk increased > 10%',
      iconName: 'TrendingUp',
      iconBg: 'bg-purple-50 text-purple-600',
    },
    {
      id: 'require-attention',
      title: 'Require Attention',
      value: String(raw.metrics.requireAttentionStudents),
      trend: raw.metrics.requireAttentionTrend,
      trendColor: 'text-rose-600',
      subtitle: 'No active intervention',
      iconName: 'AlertCircle',
      iconBg: 'bg-orange-50 text-orange-600',
    },
    {
      id: 'active-interventions',
      title: 'Active Interventions',
      value: String(raw.metrics.activeInterventions),
      trend: raw.metrics.activeInterventionsTrend,
      trendColor: 'text-emerald-600',
      subtitle: 'In progress',
      iconName: 'HeartPulse',
      iconBg: 'bg-emerald-50 text-emerald-600',
    },
    {
      id: 'overdue-cases',
      title: 'Overdue Cases',
      value: String(raw.metrics.overdueCases),
      trend: raw.metrics.overdueCasesTrend,
      trendColor: 'text-rose-600',
      subtitle: 'Past due date',
      iconName: 'CalendarX',
      iconBg: 'bg-red-50 text-red-600',
    },
    {
      id: 'intervention-success',
      title: 'Intervention Success',
      value: raw.metrics.interventionSuccessDisplay,
      trend: raw.metrics.interventionSuccessTrend,
      trendColor: 'text-emerald-600',
      subtitle: 'Risk reduced after intervention',
      iconName: 'CheckCircle2',
      iconBg: 'bg-teal-50 text-teal-600',
    },
  ];

  return NextResponse.json({
    metrics,
    priorityActions: raw.priorityActions,
    riskDistribution: raw.riskDistribution.categories,
    trendData: raw.trajectories,
    departmentRiskBars: raw.departmentRisks.map((d) => ({
      name: d.name,
      percentage: d.percentage,
      color:
        d.percentage > 10
          ? '#EF4444'
          : d.percentage > 8.5
          ? '#F97316'
          : d.percentage > 7.5
          ? '#F59E0B'
          : d.percentage > 6.5
          ? '#EAB308'
          : '#10B981',
    })),
    heatmap: raw.heatmap,
    emergingRiskStudents: raw.emergingStudents,
    interventionOutcomePie: raw.interventionOverview.outcomes,
    interventionOutcomeStats: {
      total: raw.interventionOverview.total,
      inProgress: raw.interventionOverview.inProgress,
      completed: raw.interventionOverview.completed,
      overdue: raw.interventionOverview.overdue,
      successRate: `${raw.interventionOverview.successRate}%`,
    },
    attentionStudents: raw.attentionStudents,
  });
}
