import { NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';
import { analyzeNotice } from '@/lib/ai/analyze-notice';
import { enqueuePendingUpdate } from '@/lib/data/repo';
import { fetchDoc, sha256 } from '@/lib/ingest/fetcher';
import { badRequest, getCaller, unauthorized } from '@/lib/server-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const Body = z
  .object({
    projectId: z.string().min(1),
    title: z.string().max(300).optional(),
    text: z.string().max(200_000).optional(),
    url: z.string().url().optional(),
    source: z.enum(['TG_RERA', 'TS_BPASS', 'HYDRAA_FTL', 'IGR', 'MANUAL']).default('MANUAL'),
    enqueue: z.boolean().default(true),
  })
  .refine((b) => b.text || b.url, { message: 'Provide notice text or a document URL.' });

/**
 * POST /api/ai/analyze-notice
 * Reads a legal notice (pasted text or a PDF / page URL), returns the structured
 * summary, and by default drops it into the admin review queue.
 */
export async function POST(req: Request) {
  const caller = await getCaller(req);
  if (!caller) return unauthorized();

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return badRequest('Invalid request', parsed.error.flatten());
  const b = parsed.data;

  const db = await getDb();
  const [project] = await db.select().from(projects).where(eq(projects.id, b.projectId)).limit(1);
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

  let text = b.text ?? '';
  if (b.url) {
    try {
      const doc = await fetchDoc(b.url, 40_000);
      text = `${text}\n${doc.text}`.trim();
    } catch (err) {
      if (!text) return NextResponse.json({ error: `Could not fetch document: ${(err as Error).message}` }, { status: 502 });
    }
  }
  const title = b.title?.trim() || (b.url ? b.url.split('/').pop()! : `Notice · ${project.name}`);

  const { analysis, proposedChanges, analyzer } = await analyzeNotice({ project, rawTitle: title, rawText: text, sourceHint: b.source });

  let pendingUpdateId: string | null = null;
  let duplicate = false;
  if (b.enqueue) {
    const row = await enqueuePendingUpdate({
      targetType: 'project',
      projectId: project.id,
      source: b.source,
      documentType: analysis.documentType,
      sourceUrl: b.url,
      rawTitle: title,
      rawPayload: { excerpt: text.slice(0, 4000), eventDate: analysis.eventDate ?? null, analysis, submittedBy: caller },
      contentHash: sha256(`manual:${project.id}:${text}`),
      proposedChanges,
      whatChanged: analysis.whatChanged,
      whatItMeans: analysis.whatItMeans,
      recommendedStatus: analysis.recommendedStatus,
      confidenceScore: analysis.confidenceScore,
      analyzer,
    });
    pendingUpdateId = row?.id ?? null;
    duplicate = !row;
  }

  return NextResponse.json({ ...analysis, analyzer, proposedChanges, pendingUpdateId, duplicate });
}
