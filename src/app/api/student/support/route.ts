import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

const COUNSELLORS = [
  {
    id: 'c1',
    name: 'Dr. Aruna Sharma, Ph.D.',
    specialization: 'Student Wellness, Anxiety & Stress Management',
    email: 'wellness.counsellor@prismedu.com',
    mobile: '+91 9822334455',
    availability: 'Monday – Friday: 10:00 AM – 4:00 PM (In-person & Confidential Video Call)',
    office_location: 'Student Welfare Centre, Block B, Room 204',
  },
  {
    id: 'c2',
    name: 'Prof. Rajesh Ramanathan',
    specialization: 'Academic Stress, Transition Guidance & Career Mentorship',
    email: 'mentorship@prismedu.com',
    mobile: '+91 9822334456',
    availability: 'Tuesday, Thursday, Saturday: 2:00 PM – 5:00 PM',
    office_location: 'Academic Block C, Room 112',
  },
];

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    counsellors: COUNSELLORS,
    aiSupportDisclaimer: 'The PRISM Support AI assistant provides supportive institutional guidance and connects students to on-campus wellness services. It is NOT a substitute for licensed counsellors or medical providers.',
  });
}
