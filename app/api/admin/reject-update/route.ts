import { NextResponse } from 'next/server';
import { z } from 'zod';
import { QueueConflictError, rejectUpdate } from '@/lib/data/repo';
import { badRequest } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

const Body = z.object({
  id: z.string().uuid(),
  action: z.enum(['reject', 'flag']),
  note: z.string().trim().max(1000).optional(),
});

/** POST /api/admin/reject-update: dismiss a false positive or flag it for paralegal / survey review. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest('Invalid request', parsed.error.flatten());
  const reviewer = req.headers.get('x-admin-user') ?? 'admin';
  try {
    const row = await rejectUpdate(parsed.data.id, parsed.data.action, reviewer, parsed.data.note);
    return NextResponse.json({ ok: true, status: row.status });
  } catch (err) {
    if (err instanceof QueueConflictError) return NextResponse.json({ error: err.message }, { status: 409 });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
