import { NextResponse } from 'next/server';
import { getProjectDetail } from '@/lib/data/repo';

export const dynamic = 'force-dynamic';

/** GET /api/projects/[id]: data for one project landing page. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getProjectDetail(id);
  if (!detail) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  return NextResponse.json(detail, { headers: { 'cache-control': 'no-store' } });
}
