import type { DbProjectStatus, ProjectRow, ProposedChanges } from './db/schema';

/** Fields of a project a pending update is allowed to change. */
export const DIFF_FIELDS = [
  { key: 'reraStatus', label: 'RERA status' },
  { key: 'reraValidUntil', label: 'RERA valid until' },
  { key: 'escrowAccount', label: 'Escrow account' },
  { key: 'lastQprFiled', label: 'Last QPR filed' },
  { key: 'buildingPlan', label: 'Building plan' },
  { key: 'permitNo', label: 'Permit order no.' },
  { key: 'sanctionedConfig', label: 'Sanctioned config' },
  { key: 'sanctionedFloors', label: 'Sanctioned floors' },
  { key: 'ocStatus', label: 'Occupancy certificate' },
  { key: 'lakeBuffer', label: 'Lake buffer (FTL)' },
  { key: 'nearestLakeMeters', label: 'Nearest FTL edge (m)' },
  { key: 'ratePerSqFt', label: 'Rate per sq ft' },
] as const;

export type DiffKey = (typeof DIFF_FIELDS)[number]['key'];

type Snapshot = Pick<ProjectRow, DiffKey | 'keyConcerns' | 'status' | 'safetyScore'>;

export function applyChanges<T extends Snapshot>(current: T, changes: ProposedChanges): T {
  const next = { ...current };
  for (const { key } of DIFF_FIELDS) {
    const v = changes[key as keyof ProposedChanges];
    if (v !== undefined && v !== null && v !== '') {
      (next as Record<string, unknown>)[key] = v;
    }
  }
  if (changes.addKeyConcern && !next.keyConcerns.includes(changes.addKeyConcern)) {
    next.keyConcerns = [changes.addKeyConcern, ...next.keyConcerns].slice(0, 5);
  }
  return next;
}

/** Deterministic floor on the verdict. The admin can still override. */
export function suggestStatus(p: Snapshot, today: string = new Date().toISOString().slice(0, 10)): DbProjectStatus {
  if (p.lakeBuffer === 'Inside buffer zone') return 'risk';
  if (p.reraStatus === 'Not Found') return 'risk';
  if (p.reraStatus === 'Pending') return 'caution';
  if (p.buildingPlan === 'Pending') return 'caution';
  if (p.reraValidUntil && p.reraValidUntil < today) return 'caution';
  if (p.keyConcerns.some((c) => /penalt|show.?cause/i.test(c))) return 'caution';
  return 'verified';
}

const BANDS: Record<DbProjectStatus, [number, number]> = {
  verified: [85, 98],
  caution: [60, 79],
  risk: [30, 49],
};

/** Keep the existing score if it already sits in the right band, else move it into the band. */
export function suggestScore(currentScore: number, nextStatus: DbProjectStatus, currentStatus: DbProjectStatus): number {
  const [lo, hi] = BANDS[nextStatus];
  if (currentScore >= lo && currentScore <= hi) return currentScore;
  // Moving down lands at the top of the lower band, moving up lands mid band.
  const order: DbProjectStatus[] = ['risk', 'caution', 'verified'];
  const goingUp = order.indexOf(nextStatus) > order.indexOf(currentStatus);
  return goingUp ? Math.round((lo + hi) / 2) : hi - 3;
}

/** Short label shown in the public timeline. */
export function alertTypeLabel(documentType: string, changes: ProposedChanges, nextStatus: DbProjectStatus, prevStatus: DbProjectStatus): string {
  if (documentType === 'PENALTY_NOTICE') return 'Penalty added';
  if (changes.reraStatus === 'Pending' || changes.reraStatus === 'Not Found') return 'Registration lapsed';
  if (changes.reraStatus === 'Active' || (documentType === 'RERA_REGISTRATION' && changes.reraValidUntil)) return 'Registration renewed';
  if (changes.lakeBuffer === 'Inside buffer zone') return 'Buffer flag';
  if (changes.lakeBuffer === 'Clear') return 'Buffer cleared';
  if (documentType === 'OCCUPANCY_CERTIFICATE') return 'OC issued';
  if (documentType === 'SANCTION_ORDER') return nextStatus === 'verified' ? 'Approval granted' : 'Sanction update';
  if (documentType === 'RERA_QUARTERLY_DISCLOSURE') return 'Quarterly disclosure';
  if (documentType === 'GUIDELINE_RATE') return 'Rate update';
  if (nextStatus !== prevStatus) return nextStatus === 'verified' ? 'Status improved' : 'Status downgraded';
  return 'Record update';
}
