import { and, eq } from 'drizzle-orm';
import { sourceSnapshots, type ProjectRow, type SourceId } from '../../db/schema';
import { extractPdfLinks, fetchDoc, sha256 } from '../fetcher';
import type { Finding, SourceAdapter, SourceContext } from '../types';

const MAX_PDFS_PER_PAGE = Number(process.env.INGEST_MAX_PDFS_PER_PAGE ?? 8);
const BACKFILL_PDFS = process.env.INGEST_BACKFILL_PDFS === 'true';

async function getSnapshot(ctx: SourceContext, source: SourceId, url: string) {
  const rows = await ctx.db
    .select()
    .from(sourceSnapshots)
    .where(and(eq(sourceSnapshots.source, source), eq(sourceSnapshots.url, url)))
    .limit(1);
  return rows[0];
}

async function putSnapshot(ctx: SourceContext, source: SourceId, url: string, projectId: string, hash: string) {
  await ctx.db
    .insert(sourceSnapshots)
    .values({ source, url, projectId, contentHash: hash })
    .onConflictDoUpdate({
      target: [sourceSnapshots.source, sourceSnapshots.url],
      set: { contentHash: hash, fetchedAt: new Date() },
    });
}

/**
 * Generic change detector for a government portal page.
 * The page text is hashed (hidden form state stripped); when it changes, the page
 * and any newly linked PDFs (orders, QPRs, certificates) become findings that the
 * AI analyzer reads. No site-specific CSS selectors, so layout changes on the
 * portal do not break ingestion.
 */
export async function watchPortalPage(
  ctx: SourceContext,
  source: SourceId,
  project: ProjectRow,
  url: string
): Promise<Finding[]> {
  const findings: Finding[] = [];
  const doc = await fetchDoc(url);
  const prev = await getSnapshot(ctx, source, url);
  const firstSeen = !prev;

  if (prev?.contentHash !== doc.hash) {
    await putSnapshot(ctx, source, url, project.id, doc.hash);
    findings.push({
      kind: 'project',
      source,
      projectId: project.id,
      sourceUrl: url,
      rawTitle: `${source === 'TG_RERA' ? 'TG-RERA project page' : 'TS-bPASS permit page'} · ${project.name}`,
      rawText: doc.text,
      contentHash: sha256(`${source}:${url}:${doc.hash}`),
    });
  }

  if (doc.html) {
    const pdfs = extractPdfLinks(doc.html, url).slice(0, MAX_PDFS_PER_PAGE);
    for (const pdf of pdfs) {
      const seen = await getSnapshot(ctx, source, pdf.url);
      if (seen) continue;
      if (firstSeen && !BACKFILL_PDFS) {
        // Baseline only: remember existing documents so only new ones get analysed.
        await putSnapshot(ctx, source, pdf.url, project.id, sha256(pdf.url));
        continue;
      }
      try {
        const pdfDoc = await fetchDoc(pdf.url, 40_000);
        await putSnapshot(ctx, source, pdf.url, project.id, pdfDoc.hash);
        findings.push({
          kind: 'project',
          source,
          projectId: project.id,
          sourceUrl: pdf.url,
          rawTitle: pdf.label,
          rawText: pdfDoc.text,
          contentHash: sha256(`${source}:${pdf.url}:${pdfDoc.hash}`),
        });
      } catch (err) {
        ctx.log(`[${source}] PDF failed ${pdf.url}: ${(err as Error).message}`);
      }
    }
  }
  return findings;
}

function fill(template: string | undefined, vars: Record<string, string | null | undefined>): string | undefined {
  if (!template) return undefined;
  let missing = false;
  const out = template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    if (!v) missing = true;
    return encodeURIComponent(v ?? '');
  });
  return missing ? undefined : out;
}

export const reraSource: SourceAdapter = {
  id: 'TG_RERA',
  label: 'TG-RERA (rera.telangana.gov.in)',
  async run(ctx) {
    const out: Finding[] = [];
    for (const p of ctx.projects) {
      const url = p.sourceUrls.rera ?? fill(process.env.RERA_PROJECT_URL_TEMPLATE, { reraId: p.reraId });
      if (!url) continue;
      try {
        out.push(...(await watchPortalPage(ctx, 'TG_RERA', p, url)));
      } catch (err) {
        ctx.log(`[TG_RERA] ${p.id}: ${(err as Error).message}`);
      }
    }
    return out;
  },
};

export const bpassSource: SourceAdapter = {
  id: 'TS_BPASS',
  label: 'TS-bPASS / HMDA / GHMC (tsbpass.telangana.gov.in)',
  async run(ctx) {
    const out: Finding[] = [];
    for (const p of ctx.projects) {
      const url = p.sourceUrls.bpass ?? fill(process.env.BPASS_PERMIT_URL_TEMPLATE, { permitNo: p.permitNo });
      if (!url) continue;
      try {
        out.push(...(await watchPortalPage(ctx, 'TS_BPASS', p, url)));
      } catch (err) {
        ctx.log(`[TS_BPASS] ${p.id}: ${(err as Error).message}`);
      }
    }
    return out;
  },
};
