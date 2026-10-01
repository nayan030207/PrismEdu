import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { activityService } from '@/lib/services/activity.service';

const SCHOLARSHIPS = [
  {
    id: 'sch1',
    name: 'Merit-cum-Means Post-Matric Scholarship',
    provider: 'Ministry of Higher Education / State Welfare Board',
    eligibility: 'Undergraduate engineering/technical students scoring ≥ 65% in 12th/polytechnic with annual family income under ₹2,50,000.',
    benefits: '100% tuition fee waiver up to ₹70,000 per academic year plus ₹10,000 maintenance grant.',
    deadline: '2026-10-31',
    required_documents: [
      'Verified Annual Income Certificate from Revenue Authority',
      'Previous Year Academic Marksheet (10th/12th/Degree)',
      'Institutional Bonafide Certificate & ID Card',
      'Aadhaar Seeded Bank Account Passbook Copy',
    ],
    application_link: 'https://scholarships.gov.in',
    min_percentage: 65,
    max_income: 250000,
    isPotentiallyEligible: true, // For student2 (Priya Patel: 68%, income 180k)
  },
  {
    id: 'sch2',
    name: 'National Science & Engineering Merit Award',
    provider: 'National Science Foundation',
    eligibility: 'Full-time technical students with 12th percentage ≥ 80% and current GPA ≥ 7.5.',
    benefits: '₹50,000 per year towards research books, equipment, and laptop support.',
    deadline: '2026-11-15',
    required_documents: [
      '12th Grade Official Marksheet',
      'Current Semester Transcript',
      'Faculty Recommendation Letter',
    ],
    application_link: 'https://scholarships.gov.in/science',
    min_percentage: 80,
    max_income: 800000,
    isPotentiallyEligible: false,
  },
  {
    id: 'sch3',
    name: 'Pragati Scholarship Scheme for Female Engineers',
    provider: 'AICTE (All India Council for Technical Education)',
    eligibility: 'Female students admitted to 1st or 2nd year technical degree through centralized counselling with annual family income ≤ ₹8,00,000.',
    benefits: '₹50,000 per annum towards college fee, books, equipment, and hostel expenses.',
    deadline: '2026-10-15',
    required_documents: [
      'State Income Certificate',
      'Centralized Admission Allocation Letter',
      'Tuition Fee Payment Receipt',
      'Parent/Guardian Declaration',
    ],
    application_link: 'https://www.aicte-india.org/schemes/students-development-schemes/Pragati',
    min_percentage: 60,
    max_income: 800000,
    isPotentiallyEligible: true, // Priya is female, income 180k <= 800k, enrolled 2nd yr
  },
];

const EDUCATIONAL_LOANS = [
  {
    id: 'loan1',
    name: 'Vidya Lakshmi Education Loan Scheme',
    provider: 'State Bank of India / NSDL Education Portal',
    loan_info: 'Comprehensive student loan covering tuition fees, examination, library, lab charges, and hostel expenses with zero margin for loans up to ₹4 Lakhs.',
    eligibility: 'Indian national enrolled in an approved technical college via merit/entrance examination.',
    interest_rate: 8.65,
    max_amount: 1500000,
    important_conditions: 'No collateral or third-party guarantee required for loans up to ₹7.5 Lakhs. 1-year repayment moratorium after graduation.',
    application_link: 'https://www.vidyalakshmi.co.in',
  },
  {
    id: 'loan2',
    name: 'PM Vidya Lakshmi Subsidized Student Support Loan',
    provider: 'Canara Bank / Nationalized Banks Consortium',
    loan_info: 'Special low-interest student facility with full government interest subsidy during course study and moratorium period for economically weaker sections.',
    eligibility: 'Technical undergraduate students with verified family income ≤ ₹4.5 Lakhs.',
    interest_rate: 8.25,
    max_amount: 1000000,
    important_conditions: 'Complete central interest subsidy during moratorium period (course length + 1 year). Simple repayment over 15 years.',
    application_link: 'https://www.canarabank.com/education-loan',
  },
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Telemetry: record viewing of financial support portal (Section 17)
  await activityService.recordEvent({
    student_id: session.entityId,
    event_type: 'SCHOLARSHIP_VIEWED',
    event_data: { section: 'financial_portal', timestamp: new Date().toISOString() },
  });

  return NextResponse.json({
    scholarships: SCHOLARSHIPS,
    educationalLoans: EDUCATIONAL_LOANS,
    disclaimer: 'Note: Potential eligibility tags are advisory indicators based on your admission profile. Final eligibility and approvals are strictly determined by the official awarding bodies.',
  });
}
