import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { getDemoStudents } from '@/lib/store/demo-students';
import { predictiveMlService } from '@/lib/services/predictive-ml.service';
import { featureEngineeringService } from '@/lib/services/feature-engineering.service';
import type { RiskPrediction, FeatureSnapshot, Intervention } from '@/lib/types';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Parse query params for pagination / filters
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const filter = url.searchParams.get('filter') || 'all';

  const students = getDemoStudents();

  const summary = {
    immediateAttention: 0,
    riskIncreasing: 0,
    attendanceDecline: 0,
    academicDecline: 0,
    financialSupport: 0,
    overdueInterventions: 0,
  };

  const priorityStudents = [];

  // Mock overdue interventions (since no real db exists)
  const interventions: Intervention[] = (globalThis as any).__PRISM_INTERVENTIONS_DB || [];
  
  const THRESHOLDS = {
    CRITICAL_RISK: 70,
    RISK_INCREASE: 15,
    ATTENDANCE_DECLINE: 10,
    ACADEMIC_DECLINE: 10,
  };

  for (const student of students) {
    const alerts: string[] = [];
    let priorityScore = 0;

    // We can fetch ML prediction
    const prediction: RiskPrediction = await predictiveMlService.getLatestPrediction(student.id);
    const snapshot: FeatureSnapshot = await featureEngineeringService.generateFeatureSnapshot(student.id);

    const riskScore = prediction.riskProbability;
    const previousRiskScore = prediction.previousRiskProbability ?? (riskScore - Math.random() * 20); // Fallback if no history
    const riskChange = riskScore - previousRiskScore;

    const currentAttendance = snapshot.attendancePercentage;
    // mock previous attendance from feature engineering if available, otherwise guess
    const previousAttendance = currentAttendance - snapshot.attendanceChange; 
    const attendanceDecline = previousAttendance - currentAttendance;

    const currentGpa = snapshot.currentGpa;
    const previousGpa = snapshot.previousGpa;
    // Academic decline points (convert GPA scale 0-10 to 0-100 scale roughly)
    const academicDecline = (previousGpa - currentGpa) * 10; 

    // 1. Immediate Attention
    if (riskScore >= THRESHOLDS.CRITICAL_RISK) {
      alerts.push('CRITICAL_RISK');
      summary.immediateAttention++;
    }

    // 2. Risk Increasing
    if (riskChange >= THRESHOLDS.RISK_INCREASE) {
      alerts.push('RISK_INCREASING');
      summary.riskIncreasing++;
    }

    // 3. Attendance Decline
    if (attendanceDecline >= THRESHOLDS.ATTENDANCE_DECLINE) {
      alerts.push('ATTENDANCE_DECLINE');
      summary.attendanceDecline++;
    }

    // 4. Academic Decline
    if (academicDecline >= THRESHOLDS.ACADEMIC_DECLINE) {
      alerts.push('ACADEMIC_DECLINE');
      summary.academicDecline++;
    }

    // 5. Financial Support
    if (snapshot.financialStatus === 'required' || snapshot.financialStatus === 'attention_required') {
      alerts.push('FINANCIAL_SUPPORT');
      summary.financialSupport++;
    }

    // 6. Overdue Interventions
    const studentInterventions = interventions.filter(i => i.studentId === student.id);
    const now = new Date().toISOString();
    const overdue = studentInterventions.filter(i => i.status !== 'completed' && i.followUpDate && i.followUpDate < now);
    
    if (overdue.length > 0) {
      alerts.push('OVERDUE_INTERVENTION');
      summary.overdueInterventions++;
    }

    if (alerts.length > 0) {
      // Calculate Priority Score
      const normRiskChange = Math.min(100, Math.max(0, (riskChange / 30) * 100));
      const normAttDecline = Math.min(100, Math.max(0, (attendanceDecline / 25) * 100));
      const normAcadDecline = Math.min(100, Math.max(0, (academicDecline / 20) * 100));
      const interventionUrgency = overdue.length > 0 ? 100 : 0;

      priorityScore = 
        (riskScore * 0.40) +
        (normRiskChange * 0.20) +
        (normAttDecline * 0.15) +
        (normAcadDecline * 0.15) +
        (interventionUrgency * 0.10);

      priorityStudents.push({
        id: student.id,
        studentId: student.student_id,
        name: student.full_name,
        riskScore,
        riskLevel: prediction.riskCategory,
        priorityScore: Math.round(priorityScore),
        alerts,
        attendanceDecline: attendanceDecline > 0 ? attendanceDecline.toFixed(1) : 0,
        academicDecline: academicDecline > 0 ? academicDecline.toFixed(1) : 0,
        riskChange: riskChange > 0 ? riskChange.toFixed(1) : 0,
      });
    }
  }

  // Sort by priority score DESC
  priorityStudents.sort((a, b) => b.priorityScore - a.priorityScore);

  let filteredStudents = priorityStudents;
  if (filter !== 'all') {
    const filterToAlert: Record<string, string> = {
      'critical-risk': 'CRITICAL_RISK',
      'risk-increasing': 'RISK_INCREASING',
      'attendance-decline': 'ATTENDANCE_DECLINE',
      'academic-decline': 'ACADEMIC_DECLINE',
      'financial-support': 'FINANCIAL_SUPPORT',
      'overdue': 'OVERDUE_INTERVENTION',
    };
    const targetAlert = filterToAlert[filter];
    if (targetAlert) {
      filteredStudents = priorityStudents.filter(s => s.alerts.includes(targetAlert));
    }
  }

  const paginated = filteredStudents.slice((page - 1) * limit, page * limit);

  return NextResponse.json({
    summary,
    priorityStudents: paginated,
    total: filteredStudents.length,
  });
}
