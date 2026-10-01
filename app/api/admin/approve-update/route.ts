import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { approveUpdate, QueueConflictError } from '@/lib/data/repo';
import { badRequest } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

const Body = z.object({
  id: z.string().uuid(),
  whatChanged: z.string().trim().min(5).max(600).optional(),
  whatItMeans: z.string().trim().min(5).max(800).optional(),
  status: z.enum(['verified', 'caution', 'risk']).optional(),
  score: z.number().int().min(0).max(100).optional(),
  summary: z.string().trim().max(1200).optional(),
  notify: z.boolean().default(true),
});

/**
 * POST /api/admin/approve-update: Approve & Push Live.
 * Atomically writes the project + timeline alert, then notifies watchers.
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest('Invalid request', parsed.error.flatten());
  const reviewer = req.headers.get('x-admin-user') ?? 'admin';
  try {
    const result = await approveUpdate({ ...parsed.data, reviewer });
    revalidatePath('/');
    revalidatePath('/project');
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof QueueConflictError) return NextResponse.json({ error: err.message }, { status: 409 });
    console.error('[approve-update]', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
