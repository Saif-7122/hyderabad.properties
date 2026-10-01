import { NextResponse } from 'next/server';
import { getLiveSnapshot } from '@/lib/data/repo';

export const dynamic = 'force-dynamic';

/** GET /api/projects: every live, verified project plus markets and the latest alerts. */
export async function GET() {
  const snapshot = await getLiveSnapshot();
  return NextResponse.json(snapshot, { headers: { 'cache-control': 'no-store' } });
}
