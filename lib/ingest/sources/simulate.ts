import { sha256 } from '../fetcher';
import type { Finding, SourceAdapter } from '../types';
import type { ProjectRow, SourceId } from '../../db/schema';

/**
 * Simulation source. Produces realistic notice text for the demo projects so the
 * whole pipeline (AI read, review queue, approve, notify) can be exercised without
 * hitting government portals. Every output still passes through the analyzer.
 */
type Template = { source: SourceId; title: (p: ProjectRow) => string; body: (p: ProjectRow, d: string) => string; when: (p: ProjectRow) => boolean };

const fmt = (d: Date) => `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;

const TEMPLATES: Template[] = [
  {
    source: 'TG_RERA',
    when: (p) => p.reraStatus === 'Active',
    title: (p) => `Penalty order · ${p.reraId}`,
    body: (p, d) => `TELANGANA REAL ESTATE REGULATORY AUTHORITY
Order dated ${d}
In the matter of: ${p.name}, Registration No. ${p.reraId}, Promoter: ${p.developer ?? 'the promoter'}
The promoter failed to upload the Quarterly Progress Report for the quarter ending 30.06.2026 within the time stipulated under Section 11(1) of the RE(R&D) Act, 2016.
A penalty of Rs. 2,50,000 (Rupees Two Lakh Fifty Thousand only) is hereby levied under Section 61. The promoter shall remit the penalty within 30 days.`,
  },
  {
    source: 'TG_RERA',
    when: (p) => p.reraStatus === 'Active',
    title: (p) => `Quarterly Progress Report · ${p.name}`,
    body: (p, d) => `Form B: Quarterly Progress Report filed on ${d}
Project: ${p.name} (${p.reraId})
Reporting period: Q1 FY2026-27
Tower A: 62% construction complete. Tower B: 48% construction complete.
Amount withdrawn from designated Escrow Account No. XXXXXX${p.escrowAccount?.match(/\d{4}/)?.[0] ?? '4417'} certified by CA as per Section 4(2)(l)(D).`,
  },
  {
    source: 'TG_RERA',
    when: (p) => !!p.reraValidUntil,
    title: (p) => `Extension of registration · ${p.reraId}`,
    body: (p, d) => `Order No. TGRERA/EXT/${p.reraId}/2026 dated ${d}
On application of the promoter under Section 6, the registration of the project ${p.name} bearing No. ${p.reraId} is extended. The registration shall be valid up to 31.12.2029.`,
  },
  {
    source: 'TG_RERA',
    when: (p) => p.reraStatus === 'Active' && p.status !== 'risk',
    title: (p) => `Registration status · ${p.reraId}`,
    body: (p, d) => `TG-RERA portal status as on ${d}
Project ${p.name}, Registration No. ${p.reraId}: Registration validity has lapsed. Extension application under Section 6 not yet disposed.`,
  },
  {
    source: 'TS_BPASS',
    when: (p) => p.buildingPlan === 'Pending',
    title: (p) => `Building permission order · ${p.name}`,
    body: (p, d) => `HYDERABAD METROPOLITAN DEVELOPMENT AUTHORITY
TS-bPASS Building Permit Order No. HMDA/BP/2026/0${Math.floor(Math.random() * 9000 + 1000)} dated ${d}
Building permission is hereby sanctioned for residential apartment complex ${p.name} at ${p.surveyNumbers ?? p.location} consisting of 2B+G+35 floors, subject to the conditions annexed.`,
  },
  {
    source: 'TS_BPASS',
    when: (p) => p.buildingPlan === 'Approved' && p.ocStatus !== 'Issued',
    title: (p) => `Occupancy certificate · ${p.name}`,
    body: (p, d) => `GREATER HYDERABAD MUNICIPAL CORPORATION
Occupancy Certificate issued on ${d} for ${p.name}, Permit No. ${p.permitNo ?? 'on record'}, sanctioned ${p.sanctionedConfig ?? ''} floors. The building is fit for occupation.`,
  },
  {
    source: 'HYDRAA_FTL',
    when: (p) => p.lakeBuffer === 'Clear' && (p.nearestLakeMeters ?? 999) < 100,
    title: (p) => `HYDRAA survey overlay · ${p.surveyNumbers ?? p.name}`,
    body: (p, d) => `HYDRAA joint survey with Irrigation Department dated ${d}.
Survey numbers ${p.surveyNumbers ?? 'under review'} superimposed on revised FTL map. A portion of the layout lies within 18 metres of the FTL boundary, inside the 30 m buffer.`,
  },
  {
    source: 'HYDRAA_FTL',
    when: (p) => p.lakeBuffer === 'Inside buffer zone',
    title: (p) => `FTL re-survey · ${p.name}`,
    body: (p, d) => `Irrigation Department re-survey dated ${d}. Revised FTL boundary for the adjoining tank places ${p.name} at 64 metres from the FTL line, outside the buffer. No overlap with the 30 m buffer zone.`,
  },
];

export function simulatedFindings(projects: ProjectRow[], count = 3): Finding[] {
  const today = fmt(new Date());
  const pool: { p: ProjectRow; t: Template }[] = [];
  for (const p of projects) for (const t of TEMPLATES) if (t.when(p)) pool.push({ p, t });

  const picked: { p: ProjectRow; t: Template }[] = [];
  const used = new Set<string>();
  while (picked.length < count && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    const [item] = pool.splice(i, 1);
    if (used.has(item.p.id)) continue; // one notice per project per run
    used.add(item.p.id);
    picked.push(item);
  }

  return picked.map(({ p, t }) => {
    const body = t.body(p, today);
    return {
      kind: 'project' as const,
      source: t.source,
      projectId: p.id,
      rawTitle: t.title(p),
      rawText: body,
      sourceUrl: undefined,
      contentHash: sha256(`sim:${p.id}:${body}:${Date.now()}`),
    };
  });
}

export const simulateSource: SourceAdapter = {
  id: 'MANUAL',
  label: 'Simulated notices (demo)',
  async run(ctx) {
    return simulatedFindings(ctx.projects, Number(process.env.SIMULATE_NOTICE_COUNT ?? 3));
  },
};
