import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { activityService } from '@/lib/services/activity.service';
import { getDemoStudents } from '@/lib/store/demo-students';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const students = getDemoStudents();
  const normEmail = (session.email || '').toLowerCase().trim();

  const student = students.find(
    (s) =>
      (s.email && s.email.toLowerCase().trim() === normEmail) ||
      s.id === session.entityId ||
      s.student_id === session.entityId
  );

  const income = student?.family_income || 0;
  const finAssistRequired = student?.financial_assistance === 'required' || (income > 0 && income < 90000);
  const tenthPct = student?.tenth_percentage || 0;
  const twelfthPct = student?.twelfth_percentage || 0;

  // Telemetry: record viewing of financial support portal
  await activityService.recordEvent({
    student_id: session.entityId,
    event_type: 'SCHOLARSHIP_VIEWED',
    event_data: { section: 'financial_portal', timestamp: new Date().toISOString() },
  });

  const scholarships = [
    {
      id: 'sch-1',
      title: 'EBC / Economically Backward Class Tuition Assistance',
      offeredBy: 'State Higher Education Department',
      amount: '50% Fee Concession',
      incomeLimit: '₹8,00,000 / year',
      isEligible: finAssistRequired || income <= 800000,
      eligibilityReason: finAssistRequired || income <= 800000
        ? 'Matched: Family income criterion met based on uploaded profile.'
        : 'Income exceeds threshold limit.',
    },
    {
      id: 'sch-2',
      title: 'Merit-Cum-Means Higher Education Support Scheme',
      offeredBy: 'Institutional Endowments Trust',
      amount: '₹35,000 / year',
      incomeLimit: '₹2,50,000 / year',
      isEligible: (twelfthPct >= 75 || tenthPct >= 75) && (income <= 250000 || finAssistRequired),
      eligibilityReason: (twelfthPct >= 75 || tenthPct >= 75)
        ? 'Matched: Secondary academic marks criterion (>= 75%) satisfied.'
        : 'Requires minimum 75% marks in 10th or 12th.',
    },
  ];

  const educationalLoans = [
    {
      id: 'loan-1',
      bankName: 'State Bank of India (SBI)',
      schemeName: 'Vidya Lakshmi National Student Education Loan',
      maxAmount: 'Up to ₹7.5 Lakhs (Collateral Free)',
      interestRate: '8.15% p.a.',
      repaymentPeriod: '15 Years (Moratorium Period included)',
    },
  ];

  return NextResponse.json({
    scholarships,
    educationalLoans,
    disclaimer: 'Note: Potential eligibility tags are advisory indicators based on your uploaded admission profile. Final approvals are determined by official awarding bodies.',
  });
}

