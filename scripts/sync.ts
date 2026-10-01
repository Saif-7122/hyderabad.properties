/**
 * Worker entry point for running the ingestion outside Next.js
 * (Cloud Run job, GitHub Actions, crontab).
 *
 *   npm run worker:sync                  # INGEST_MODE or default
 *   npm run worker:sync -- --simulate
 *   npm run worker:sync -- --live --sources=TG_RERA,IGR
 */
import { runIngestion } from '../lib/ingest/run';
import type { SourceId } from '../lib/db/schema';

const args = process.argv.slice(2);
const mode = args.includes('--live') ? 'live' : args.includes('--simulate') ? 'simulate' : undefined;
const sources = args.find((a) => a.startsWith('--sources='))?.split('=')[1]?.split(',') as SourceId[] | undefined;

runIngestion({ trigger: 'cli', mode, sources })
  .then((r) => {
    console.log(JSON.stringify({ ...r, log: undefined }, null, 2));
    process.exit(r.errors.length && !r.queued ? 1 : 0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
