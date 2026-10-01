import { eq } from 'drizzle-orm';
import { getDb } from '../db/client';
import { microMarkets, projects, scrapeRuns, type SourceId } from '../db/schema';
import { analyzeNotice } from '../ai/analyze-notice';
import { enqueuePendingUpdate } from '../data/repo';
import { bpassSource, reraSource } from './sources/portal';
import { ftlSource, igrSource } from './sources/ftl-igr';
import { simulateSource } from './sources/simulate';
import type { Finding, IngestMode, SourceAdapter, SourceContext } from './types';

const LIVE_SOURCES: Record<Exclude<SourceId, 'MANUAL'>, SourceAdapter> = {
  TG_RERA: reraSource,
  TS_BPASS: bpassSource,
  HYDRAA_FTL: ftlSource,
  IGR: igrSource,
};

/** Document types worth a reviewer's time even when no tracked field changed. */
const ALWAYS_REVIEW = new Set(['PENALTY_NOTICE', 'OCCUPANCY_CERTIFICATE', 'RERA_QUARTERLY_DISCLOSURE']);

export interface RunOptions {
  mode?: IngestMode;
  sources?: SourceId[];
  trigger: 'cron' | 'admin' | 'cli';
}

export interface RunResult {
  runId: string;
  mode: IngestMode;
  findings: number;
  queued: number;
  duplicates: number;
  skippedNoChange: number;
  errors: string[];
  log: string[];
}

export function defaultMode(): IngestMode {
  const m = process.env.INGEST_MODE;
  if (m === 'live' || m === 'simulate') return m;
  return process.env.NODE_ENV === 'production' ? 'live' : 'simulate';
}

export async function runIngestion(opts: RunOptions): Promise<RunResult> {
  const db = await getDb();
  const mode = opts.mode ?? defaultMode();
  const log: string[] = [];
  const errors: string[] = [];
  const [run] = await db.insert(scrapeRuns).values({ trigger: opts.trigger, mode }).returning();

  const ctx: SourceContext = {
    db,
    mode,
    projects: await db.select().from(projects).where(eq(projects.isLive, true)),
    markets: await db.select().from(microMarkets),
    log: (m) => {
      log.push(m);
      console.log(m);
    },
  };

  const adapters: SourceAdapter[] =
    mode === 'simulate'
      ? [simulateSource]
      : (opts.sources?.length ? opts.sources : (Object.keys(LIVE_SOURCES) as SourceId[]))
          .filter((s): s is Exclude<SourceId, 'MANUAL'> => s in LIVE_SOURCES)
          .map((s) => LIVE_SOURCES[s]);

  const findings: Finding[] = [];
  for (const a of adapters) {
    try {
      const f = await a.run(ctx);
      ctx.log(`[${a.id}] ${f.length} finding(s)`);
      findings.push(...f);
    } catch (err) {
      const msg = `[${a.id}] ${(err as Error).message}`;
      errors.push(msg);
      ctx.log(msg);
    }
  }

  let queued = 0;
  let duplicates = 0;
  let skippedNoChange = 0;
  const byId = new Map(ctx.projects.map((p) => [p.id, p]));

  for (const f of findings) {
    try {
      if (f.kind === 'structured') {
        const row = await enqueuePendingUpdate(
          {
            targetType: f.targetType,
            projectId: f.projectId,
            marketName: f.marketName,
            source: f.source,
            documentType: f.documentType,
            sourceUrl: f.sourceUrl,
            rawTitle: f.rawTitle,
            rawPayload: f.rawPayload,
            contentHash: f.contentHash,
            proposedChanges: f.proposedChanges,
            whatChanged: f.whatChanged,
            whatItMeans: f.whatItMeans,
            recommendedStatus: null,
            confidenceScore: f.confidenceScore,
            analyzer: 'structured',
          },
          db
        );
        if (row) queued++;
        else duplicates++;
        continue;
      }

      const project = byId.get(f.projectId);
      if (!project) continue;
      const { analysis, proposedChanges, analyzer } = await analyzeNotice({
        project,
        rawTitle: f.rawTitle,
        rawText: f.rawText,
        sourceHint: f.source,
      });

      if (Object.keys(proposedChanges).length === 0 && !ALWAYS_REVIEW.has(analysis.documentType)) {
        skippedNoChange++;
        continue;
      }

      const row = await enqueuePendingUpdate(
        {
          targetType: 'project',
          projectId: project.id,
          source: f.source,
          documentType: analysis.documentType,
          sourceUrl: f.sourceUrl,
          rawTitle: analysis.rawTitle || f.rawTitle,
          rawPayload: { excerpt: f.rawText.slice(0, 4000), eventDate: analysis.eventDate ?? null, analysis },
          contentHash: f.contentHash,
          proposedChanges,
          whatChanged: analysis.whatChanged,
          whatItMeans: analysis.whatItMeans,
          recommendedStatus: analysis.recommendedStatus,
          confidenceScore: analysis.confidenceScore,
          analyzer,
        },
        db
      );
      if (row) queued++;
      else duplicates++;
    } catch (err) {
      errors.push(`[${f.source}] ${(err as Error).message}`);
    }
  }

  await db
    .update(scrapeRuns)
    .set({
      finishedAt: new Date(),
      stats: { findings: findings.length, queued, duplicates, skippedNoChange },
      errors,
    })
    .where(eq(scrapeRuns.id, run.id));

  return { runId: run.id, mode, findings: findings.length, queued, duplicates, skippedNoChange, errors, log };
}
