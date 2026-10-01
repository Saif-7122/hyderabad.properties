import { getLiveSnapshot } from './repo';
import { MICRO_MARKETS, MOCK_PROJECTS, type LiveSnapshot } from '../mock-data';

/** Live snapshot from the database, falling back to the bundled demo data if the database is unreachable. */
export async function getSnapshotSafe(): Promise<LiveSnapshot> {
  try {
    return await getLiveSnapshot();
  } catch (err) {
    console.error('[snapshot] database unavailable, serving bundled data:', err);
    return {
      projects: MOCK_PROJECTS,
      markets: MICRO_MARKETS,
      alerts: [],
      version: 'fallback',
      generatedAt: new Date().toISOString(),
    };
  }
}
