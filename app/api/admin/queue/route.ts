import { NextResponse } from 'next/server';
import { getAdminStats, listQueue, recentNotifications } from '@/lib/data/repo';
import type { PendingStatus } from '@/lib/db/schema';

export const dynamic = 'force-dynamic';

/** GET /api/admin/queue?status=pending,flagged */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get('status') ?? 'pending,flagged';
  const allowed: PendingStatus[] = ['pending', 'flagged', 'approved', 'rejected'];
  const statuses = raw.split(',').filter((s): s is PendingStatus => allowed.includes(s as PendingStatus));
  const [items, stats, notifications] = await Promise.all([
    listQueue(statuses.length ? statuses : ['pending', 'flagged']),
    getAdminStats(),
    recentNotifications(10),
  ]);
  return NextResponse.json({ items, stats, notifications }, { headers: { 'cache-control': 'no-store' } });
}
