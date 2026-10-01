import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

// Global in-memory store for resources
declare global {
  // eslint-disable-next-line no-var
  var __PRISM_RESOURCES_DB: any[] | undefined;
}

if (!globalThis.__PRISM_RESOURCES_DB) {
  globalThis.__PRISM_RESOURCES_DB = [
    // Learning
    { id: 'l1', category: 'learning', title: 'DBMS Normalization Notes (1NF to BCNF)', type: 'pdf', subject: 'Database Management Systems', provider: 'CS Department', active: true, description: 'Comprehensive notes covering all normal forms.' },
    { id: 'l2', category: 'learning', title: 'SQL Indexing & Query Plan Guide', type: 'video', subject: 'Database Management Systems', provider: 'Dr. Smith', active: true, description: 'Video guide on query optimization.' },
    { id: 'l3', category: 'learning', title: 'Dijkstra & Graph Shortest Path Question Bank', type: 'pdf', subject: 'Data Structures & Algorithms', provider: 'Prof. David Reynolds', active: true, description: 'Practice problem set with solutions for mid-semester exam prep.' },
    { id: 'l4', category: 'learning', title: 'Structural Analysis Formula Sheet & Lab Manual', type: 'pdf', subject: 'Structural Mechanics', provider: 'Dr. Rajesh Verma', active: true, description: 'Comprehensive formula cheat sheet and deflection calculations.' },
    // Financial
    { id: 'f1', category: 'financial', title: 'Merit-cum-Means Post-Matric Scholarship', type: 'scholarship', provider: 'Ministry of Higher Education', benefit: '₹70,000/yr tuition fee waiver', active: true, description: 'Government scholarship for outstanding students.' },
    { id: 'f2', category: 'financial', title: 'Vidya Lakshmi Education Loan Scheme', type: 'loan', provider: 'State Bank of India', benefit: 'Up to ₹15 Lakhs at 8.65% interest', active: true, description: 'Subsidized education loan.' },
    // Support
    { id: 's1', category: 'support', title: 'Dr. Aruna Sharma, Ph.D. - Student Counseling', type: 'counseling', specialization: 'Student Wellness, Anxiety & Stress Management', provider: 'PRISM Wellness Center', contact: 'wellness.counsellor@prismedu.com', active: true, description: 'Confidential counseling sessions.' },
    // Career
    { id: 'c1', category: 'career', title: 'Full Stack Software Engineering Intern', type: 'internship', organization: 'ThoughtWorks Technologies', provider: 'ThoughtWorks', active: true, description: 'Summer internship for pre-final year students.' },
    { id: 'c2', category: 'career', title: 'AWS Certified Cloud Practitioner', type: 'certification', organization: 'Amazon Web Services', provider: 'AWS Academy', active: true, description: 'Entry level cloud certification.' },
  ];
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'all';

  let list = globalThis.__PRISM_RESOURCES_DB || [];
  if (category !== 'all') {
    list = list.filter((r) => r.category === category);
  }

  return NextResponse.json({ resources: list });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const data = await req.json();
    const newResource = {
      id: `res-${Date.now()}`,
      ...data,
      category: data.category || 'learning',
      uploaded_by: session.name || 'Admin User',
      active: true,
      created_at: new Date().toISOString()
    };
    
    if (!globalThis.__PRISM_RESOURCES_DB) {
      globalThis.__PRISM_RESOURCES_DB = [];
    }
    globalThis.__PRISM_RESOURCES_DB.unshift(newResource);
    return NextResponse.json({ success: true, resource: newResource });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id && globalThis.__PRISM_RESOURCES_DB) {
    globalThis.__PRISM_RESOURCES_DB = globalThis.__PRISM_RESOURCES_DB.filter(r => r.id !== id);
  }

  return NextResponse.json({ success: true });
}

