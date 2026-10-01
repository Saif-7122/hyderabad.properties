import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runIngestion } from '@/lib/ingest/run';
import { badRequest } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const Body = z.object({
  mode: z.enum(['live', 'simulate']).optional(),
  sources: z.array(z.enum(['TG_RERA', 'TS_BPASS', 'HYDRAA_FTL', 'IGR'])).optional(),
});

/** POST /api/admin/scrape-trigger: run the ingestion worker now. */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return badRequest('Invalid request', parsed.error.flatten());
  const result = await runIngestion({ trigger: 'admin', ...parsed.data });
  return NextResponse.json(result);
}
