import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fetchDoc, sha256 } from '../fetcher';
import { nearestLake, parseLakes } from '../geo';
import type { Finding, SourceAdapter } from '../types';

async function loadResource(urlEnv: string | undefined, localFile: string): Promise<string | null> {
  if (urlEnv) {
    const res = await fetch(urlEnv, { signal: AbortSignal.timeout(30_000), cache: 'no-store' });
    if (!res.ok) throw new Error(`${urlEnv} responded ${res.status}`);
    return res.text();
  }
  try {
    return await readFile(path.join(process.cwd(), localFile), 'utf8');
  } catch {
    return null;
  }
}

/**
 * HYDRAA / Irrigation lake FTL check.
 * Needs FTL boundary polygons as GeoJSON (FTL_GEOJSON_URL or data/ftl-lakes.geojson)
 * and a site coordinate on each project. Computes distance from the site to the
 * nearest FTL edge and raises a finding when the Clear / Inside status flips.
 */
export const ftlSource: SourceAdapter = {
  id: 'HYDRAA_FTL',
  label: 'HYDRAA / Irrigation lake FTL buffer',
  async run(ctx) {
    const raw = await loadResource(process.env.FTL_GEOJSON_URL, 'data/ftl-lakes.geojson');
    if (!raw) {
      ctx.log('[HYDRAA_FTL] No FTL GeoJSON configured, skipping.');
      return [];
    }
    const lakes = parseLakes(JSON.parse(raw));
    const buffer = Number(process.env.FTL_BUFFER_METERS ?? 30);
    const datasetHash = sha256(raw).slice(0, 12);
    const out: Finding[] = [];

    for (const p of ctx.projects) {
      if (p.siteLat == null || p.siteLng == null) continue;
      const r = nearestLake(p.siteLat, p.siteLng, lakes, buffer);
      if (!r) continue;
      const status = r.insideBuffer ? 'Inside buffer zone' : 'Clear';
      if (status === p.lakeBuffer && Math.abs((p.nearestLakeMeters ?? r.distanceMeters) - r.distanceMeters) < 10) continue;

      const inside = status === 'Inside buffer zone';
      out.push({
        kind: 'structured',
        source: 'HYDRAA_FTL',
        targetType: 'project',
        projectId: p.id,
        sourceUrl: process.env.FTL_GEOJSON_URL,
        documentType: 'FTL_BUFFER_CHECK',
        rawTitle: `FTL overlay · ${p.name} vs ${r.lake}`,
        rawPayload: { ...r, bufferMeters: buffer, site: [p.siteLat, p.siteLng], surveyNumbers: p.surveyNumbers, datasetHash },
        contentHash: sha256(`ftl:${p.id}:${status}:${r.distanceMeters}:${datasetHash}`),
        proposedChanges: {
          ...(status !== p.lakeBuffer ? { lakeBuffer: status } : {}),
          nearestLakeMeters: r.distanceMeters,
        },
        whatChanged: inside
          ? `The site of ${p.name} is ${r.insideFtl ? 'inside the Full Tank Level of' : `${r.distanceMeters} m from the FTL edge of`} ${r.lake}, within the ${buffer} m buffer.`
          : `The site of ${p.name} is ${r.distanceMeters} m from the nearest FTL edge (${r.lake}), outside the ${buffer} m buffer.`,
        whatItMeans: inside
          ? 'Structures inside a lake buffer cannot be regularised and are being demolished. Do not pay an advance until a survey clears the plot.'
          : 'No lake buffer conflict at the site coordinate. Confirm your tower sits on the same survey number.',
        confidenceScore: 0.8,
      });
    }
    return out;
  },
};

/** Minimal CSV parser for "market,rate_per_sqft[,source]" files. */
export function parseRatesCsv(csv: string): { market: string; rate: number; source?: string }[] {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const rows: { market: string; rate: number; source?: string }[] = [];
  for (const line of lines.slice(1)) {
    const cells = line.match(/("([^"]|"")*"|[^,]*)(,|$)/g)?.map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim()) ?? [];
    const rate = Number((cells[1] ?? '').replace(/[,₹\s]/g, ''));
    if (cells[0] && Number.isFinite(rate) && rate > 0) rows.push({ market: cells[0], rate: Math.round(rate), source: cells[2] || undefined });
  }
  return rows;
}

/**
 * Telangana Registration & Stamps (IGR) guideline values.
 * Reads IGR_RATES_CSV_URL or data/igr-guideline-rates.csv and proposes a market
 * update whenever the benchmark moves by more than 1%.
 */
export const igrSource: SourceAdapter = {
  id: 'IGR',
  label: 'Telangana IGR guideline rates',
  async run(ctx) {
    const raw = await loadResource(process.env.IGR_RATES_CSV_URL, 'data/igr-guideline-rates.csv');
    if (!raw) {
      ctx.log('[IGR] No guideline rate file configured, skipping.');
      return [];
    }
    const out: Finding[] = [];
    for (const row of parseRatesCsv(raw)) {
      const market = ctx.markets.find((m) => m.name.toLowerCase() === row.market.toLowerCase());
      if (!market) {
        ctx.log(`[IGR] Unknown market "${row.market}", add it to micro_markets first.`);
        continue;
      }
      const prev = market.guidelineRatePerSqFt;
      if (prev && Math.abs(row.rate - prev) / prev < 0.01) continue;
      const pct = prev ? Math.round(((row.rate - prev) / prev) * 1000) / 10 : null;
      out.push({
        kind: 'structured',
        source: 'IGR',
        targetType: 'market',
        marketName: market.name,
        sourceUrl: process.env.IGR_RATES_CSV_URL ?? row.source,
        documentType: 'GUIDELINE_RATE',
        rawTitle: `IGR guideline value · ${market.name}`,
        rawPayload: { market: market.name, previous: prev, next: row.rate, source: row.source },
        contentHash: sha256(`igr:${market.name}:${row.rate}`),
        proposedChanges: { guidelineRatePerSqFt: row.rate },
        whatChanged: prev
          ? `IGR guideline value for ${market.name} moved from ₹${prev.toLocaleString('en-IN')} to ₹${row.rate.toLocaleString('en-IN')} per sq ft (${pct! > 0 ? '+' : ''}${pct}%).`
          : `IGR guideline value for ${market.name} recorded at ₹${row.rate.toLocaleString('en-IN')} per sq ft.`,
        whatItMeans: 'Stamp duty and registration are charged on the higher of your sale price and this guideline value. Budget your registration cost against it.',
        confidenceScore: 0.95,
      });
    }
    return out;
  },
};

// Re-export so the runner can fetch arbitrary notice URLs through one helper.
export { fetchDoc };
