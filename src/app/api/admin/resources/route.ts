import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

// Global in-memory store for resources
declare global {
  // eslint-disable-next-line no-var
  var __PRISM_RESOURCES_DB: any[] | undefined;
}

if (!globalThis.__PRISM_RESOURCES_DB) {
  globalThis.__PRISM_RESOURCES_DB = [];
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

