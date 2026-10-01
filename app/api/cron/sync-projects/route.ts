import { NextResponse } from 'next/server';
import { isCronAuthorized } from '@/lib/auth';
import { runIngestion } from '@/lib/ingest/run';
import { unauthorized } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Scheduled sync. Call with `Authorization: Bearer $CRON_SECRET`
 * (Vercel Cron, Cloud Scheduler, GitHub Actions, or any uptime pinger).
 * Optional query: ?mode=live|simulate&sources=TG_RERA,TS_BPASS,HYDRAA_FTL,IGR
 */
async function handle(req: Request) {
  if (!isCronAuthorized(req.headers.get('authorization'))) return unauthorized();
  const url = new URL(req.url);
  const mode = url.searchParams.get('mode');
  const sources = url.searchParams.get('sources')?.split(',').filter(Boolean) as never;
  const result = await runIngestion({
    trigger: 'cron',
    mode: mode === 'live' || mode === 'simulate' ? mode : undefined,
    sources,
  });
  return NextResponse.json(result);
}

export const GET = handle;
export const POST = handle;
