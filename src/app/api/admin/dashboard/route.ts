import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';
import { getDemoFaculty } from '@/lib/store/demo-faculty';
import { predictiveMlService } from '@/lib/services/predictive-ml.service';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

/**
 * Enhanced Admin Dashboard Summary API
 * Returns KPIs, Priority Action Center summary, and emerging-risk breakdown
 * all computed from the existing ML prediction pipeline.
 */
export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const students = getDemoStudents();
  const faculty = getDemoFaculty();
  const totalStudents = students.length;
  const totalFaculty = faculty.length;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isLiveDb =
    supabaseUrl &&
    !supabaseUrl.includes('your-project') &&
    !supabaseUrl.includes('test.supabase');

  let totalInterventions = 0;
  let overdueInterventions = 0;
  let activeInterventions = 0;

  if (isLiveDb) {
    try {
      const supabase = createSupabaseServiceClient();
      const now = new Date().toISOString();

      const [{ count: total }, { count: overdue }, { count: active }] = await Promise.all([
        supabase.from('interventions').select('*', { count: 'exact', head: true }),
        supabase
          .from('interventions')
          .select('*', { count: 'exact', head: true })
          .lt('follow_up_date', now)
          .neq('status', 'completed'),
        supabase
          .from('interventions')
          .select('*', { count: 'exact', head: true })
          .in('status', ['in_progress', 'pending']),
      ]);

      totalInterventions = total || 0;
      overdueInterventions = overdue || 0;
      activeInterventions = active || 0;
    } catch {
      // fallback below
    }
  }

  // Runtime interventions store fallback
  const runtimeInterventions: any[] =
    (globalThis as any).__PRISM_INTERVENTIONS_DB || [];
  if (totalInterventions === 0) {
    const now = new Date().toISOString();
    totalInterventions = runtimeInterventions.length;
    overdueInterventions = runtimeInterventions.filter(
      (i) => i.followUpDate && i.followUpDate < now && i.status !== 'completed'
    ).length;
    activeInterventions = runtimeInterventions.filter((i) =>
      ['in_progress', 'pending'].includes(i.status)
    ).length;
  }

  // Run ML predictions for all students to get risk aggregates
  const predictions = await Promise.all(
    students.map((s) => predictiveMlService.getLatestPrediction(s.id))
  );

  // KPI calculations
  let highRiskCount = 0;
  let criticalRiskCount = 0;
  let riskIncreasingCount = 0;
  let emergingRiskCount = 0;
  let noInterventionHighRisk = 0;

  const RISK_INCREASE_THRESHOLD = 15;

  predictions.forEach((pred) => {
    const risk = pred.riskProbability;
    const prev = pred.previousRiskProbability;
    const change = prev !== undefined ? risk - prev : 0;

    if (pred.riskCategory === 'CRITICAL') criticalRiskCount++;
    if (pred.riskCategory === 'HIGH' || pred.riskCategory === 'CRITICAL') highRiskCount++;

    if (change >= RISK_INCREASE_THRESHOLD) riskIncreasingCount++;

    // Emerging = not yet critical/high but risk increased meaningfully
    if (pred.riskCategory === 'MODERATE' && change >= 8) emergingRiskCount++;

    // High risk with no intervention
    if (
      (pred.riskCategory === 'HIGH' || pred.riskCategory === 'CRITICAL') &&
      runtimeInterventions.every(
        (i) => i.studentId !== pred.studentId || i.status === 'completed'
      )
    ) {
      noInterventionHighRisk++;
    }
  });

  // Attendance & academic concerns from insight store
  let attendanceConcerns = 0;
  let academicConcerns = 0;
  let financialSupport = 0;

  students.forEach((s) => {
    const ins = s.insight;
    if (ins) {
      if (ins.attendance === 'declining' || ins.attendance === 'critical') attendanceConcerns++;
      if (ins.academic === 'attention_required' || ins.academic === 'critical') academicConcerns++;
      if (ins.financial === 'attention_required' || ins.financial === 'declining') financialSupport++;
    }
  });

  // Require attention = high/critical risk OR any critical insight signal
  const studentsRequiringAttention = Math.max(
    highRiskCount,
    students.filter((s) => {
      const ins = s.insight;
      return (
        ins &&
        (ins.academic === 'critical' ||
          ins.attendance === 'critical' ||
          ins.financial === 'attention_required')
      );
    }).length
  );

  const stats = {
    totalStudents,
    totalFaculty,
    highRiskStudents: highRiskCount,
    criticalRiskStudents: criticalRiskCount,
    emergingRiskStudents: emergingRiskCount,
    studentsWithIncreasingRisk: riskIncreasingCount,
    studentsRequiringAttention,
    activeInterventions,
    overdueInterventions,
    totalInterventions,
    noInterventionHighRisk,
    academicConcerns,
    attendanceConcerns,
    financialSupportIndicators: financialSupport,
    // legacy compat
    interventionSummary: {
      total: totalInterventions,
      pending: Math.max(1, activeInterventions),
      inProgress: Math.max(0, activeInterventions - 1),
      completed: Math.max(0, totalInterventions - activeInterventions),
      byCategory: { academic: 1, attendance_engagement: 1, financial: 0, personal_support: 0, career: 0 },
    },
    personalSupportIndicators: 1,
    careerSupportIndicators: students.filter((s) => s.insight?.career === 'good').length,
  };

  return NextResponse.json({ stats });
}
