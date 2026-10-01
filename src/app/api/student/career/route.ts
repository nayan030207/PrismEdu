import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { activityService } from '@/lib/services/activity.service';

const JOBS = [
  {
    id: 'job1',
    title: 'Junior Backend Developer',
    organization: 'Persistent Systems',
    description: 'Design and build resilient REST APIs and relational database models using Python, PostgreSQL, and Docker.',
    required_skills: ['Python', 'SQL', 'PostgreSQL', 'FastAPI', 'Docker'],
    application_link: 'https://persistentsystems.com/careers',
    deadline: '2026-10-30',
  },
  {
    id: 'job2',
    title: 'Associate Software Development Engineer',
    organization: 'Tata Consultancy Services (Research & Innovations)',
    description: 'Work alongside lead architects building high-concurrency microservices, cloud applications, and automated testing pipelines.',
    required_skills: ['Java', 'Spring Boot', 'Data Structures', 'Git', 'Linux'],
    application_link: 'https://tcs.com/careers',
    deadline: '2026-11-15',
  },
];

const INTERNSHIPS = [
  {
    id: 'int1',
    title: 'Full Stack Software Engineering Intern',
    organization: 'ThoughtWorks Technologies',
    description: '6-month paid engineering internship. Collaborate on agile development teams building reactive web frontends and backend services with TypeScript.',
    required_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git'],
    application_link: 'https://thoughtworks.com/careers',
    deadline: '2026-10-20',
  },
  {
    id: 'int2',
    title: 'Database & Cloud Systems Intern',
    organization: 'Oracle India Development Centre',
    description: 'Hands-on internship assisting with database performance tuning, indexing optimization, and high-availability database cluster replication.',
    required_skills: ['SQL', 'DBMS', 'Query Optimization', 'Linux', 'Python'],
    application_link: 'https://oracle.com/careers',
    deadline: '2026-10-25',
  },
];

const CERTIFICATIONS = [
  {
    id: 'cert1',
    title: 'AWS Certified Cloud Practitioner (Academic Track)',
    provider: 'Amazon Web Services (AWS)',
    description: 'Fundamental cloud computing concepts, AWS security, core services, and deployment architectures with 50% institutional voucher discount.',
    skills: ['Cloud Computing', 'AWS Architecture', 'IAM Security', 'Networking'],
    application_link: 'https://aws.amazon.com/certification/certified-cloud-practitioner',
    deadline: '2026-12-31',
  },
  {
    id: 'cert2',
    title: 'PostgreSQL Professional Administrator & Developer',
    provider: 'PostgreSQL Global Development Group / Linux Foundation',
    description: 'Hands-on certification covering normalization, B-trees, WAL replication, MVCC, and advanced SQL window functions.',
    skills: ['PostgreSQL', 'Database Normalization', 'Indexing', 'Query Optimization'],
    application_link: 'https://postgresql.org/community/certification',
    deadline: '2026-11-30',
  },
];

const SKILL_RECOMMENDATIONS = [
  {
    id: 'rec1',
    skill: 'Database Schema Normalization & Query Tuning',
    reason: 'Recommended based on your current course (B.Tech CSE) and DBMS coursework activity.',
    resource: 'PRISM Masterclass: From 1NF to BCNF in Enterprise Architectures',
    link: '/student/learning',
  },
  {
    id: 'rec2',
    skill: 'Graph Data Structures & Algorithms (BFS/DFS/Dijkstra)',
    reason: 'Foundational algorithmic proficiency required for upcoming technical assessments.',
    resource: 'DSA Interactive Modules & Benchmark Practice Sets',
    link: '/student/learning',
  },
  {
    id: 'rec3',
    skill: 'Containerization & Docker Fundamentals',
    reason: 'Industry-standard skill for junior backend engineering roles in campus recruitment.',
    resource: 'Recommended Free Technical Labs on Docker Hub & FreeCodeCamp',
    link: 'https://docker.com',
  },
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Telemetry: record career opportunities interaction (Section 17)
  await activityService.recordEvent({
    student_id: session.entityId,
    event_type: 'JOB_VIEWED',
    event_data: { section: 'career_opportunities', timestamp: new Date().toISOString() },
  });

  return NextResponse.json({
    jobs: JOBS,
    internships: INTERNSHIPS,
    certifications: CERTIFICATIONS,
    skillRecommendations: SKILL_RECOMMENDATIONS,
  });
}
