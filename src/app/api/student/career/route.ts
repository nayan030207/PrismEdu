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

  const dept = student?.department || 'Computer Engineering';
  const cgpa = student ? (student.academic_cgpa ?? student.previous_gpa ?? 7.5) : 7.5;
  const backlogs = student ? (student.academic_backlogs ?? student.previous_backlogs ?? 0) : 0;

  // Telemetry: record career opportunities interaction
  await activityService.recordEvent({
    student_id: session.entityId,
    event_type: 'JOB_VIEWED',
    event_data: { section: 'career_opportunities', timestamp: new Date().toISOString() },
  });

  const isEligibleForPlacements = cgpa >= 6.0 && backlogs === 0;

  const jobs = [
    {
      id: 'job-1',
      title: 'Junior Software Development Engineer (SDE)',
      company: 'TCS / Infosys Campus Placement Drive',
      location: 'Pune / Hybrid',
      minCgpa: 6.0,
      isEligible: isEligibleForPlacements,
      eligibilityReason: isEligibleForPlacements
        ? 'Eligible: CGPA >= 6.0 with 0 active backlogs.'
        : 'Requires minimum 6.0 CGPA and 0 active backlogs.',
      skillsRequired: ['Data Structures', 'Java/Python', 'SQL'],
    },
  ];

  const internships = [
    {
      id: 'intern-1',
      title: 'Software Development & Data Engineering Intern',
      company: 'Persistent Systems / Tech Mahindra',
      duration: '6 Months',
      stipend: '₹20,000 / month',
      isEligible: true,
      skillsRequired: ['Python', 'SQL', 'Git'],
    },
  ];

  const certifications = [
    {
      id: 'cert-1',
      title: 'AWS Certified Cloud Practitioner',
      provider: 'AWS Training & Certification',
      estimatedDuration: '4 Weeks',
      recommendedFor: dept,
    },
  ];

  const skillRecommendations = [
    {
      id: 'skill-1',
      skillName: 'System Design & Database Indexing',
      category: 'Core Computer Science',
      priority: cgpa < 7.0 ? 'High' : 'Medium',
    },
  ];

  return NextResponse.json({
    jobs,
    internships,
    certifications,
    skillRecommendations,
  });
}

