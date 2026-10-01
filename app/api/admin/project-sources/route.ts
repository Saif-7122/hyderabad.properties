import { NextResponse } from 'next/server';
import { z } from 'zod';
import { listProjectSources, updateProjectSources } from '@/lib/data/repo';
import { badRequest } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ projects: await listProjectSources() });
}

const url = z.string().trim().url().or(z.literal('')).optional();
const Body = z.object({
  id: z.string().min(1),
  rera: url,
  bpass: url,
  siteLat: z.number().min(-90).max(90).nullable().optional(),
  siteLng: z.number().min(-180).max(180).nullable().optional(),
  surveyNumbers: z.string().trim().max(300).nullable().optional(),
});

/** POST /api/admin/project-sources: set the portal pages and site coordinate the worker should watch. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest('Invalid request', parsed.error.flatten());
  const { id, rera, bpass, ...rest } = parsed.data;
  const row = await updateProjectSources(id, {
    sourceUrls: { ...(rera ? { rera } : {}), ...(bpass ? { bpass } : {}) },
    ...rest,
  });
  if (!row) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
