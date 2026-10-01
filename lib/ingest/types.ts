import type { DB } from '../db/client';
import type { DocumentType, MicroMarketRow, ProjectRow, ProposedChanges, SourceId } from '../db/schema';

export type IngestMode = 'live' | 'simulate';

/** A document or observation that needs AI reading before it can become a pending update. */
export interface ProjectFinding {
  kind: 'project';
  source: SourceId;
  projectId: string;
  sourceUrl?: string;
  rawTitle: string;
  rawText: string;
  contentHash: string;
  documentTypeHint?: DocumentType;
}

/** A structured observation that is already machine-readable (no AI needed). */
export interface StructuredFinding {
  kind: 'structured';
  source: SourceId;
  targetType: 'project' | 'market';
  projectId?: string;
  marketName?: string;
  sourceUrl?: string;
  documentType: DocumentType;
  rawTitle: string;
  rawPayload: Record<string, unknown>;
  contentHash: string;
  proposedChanges: ProposedChanges;
  whatChanged: string;
  whatItMeans: string;
  confidenceScore: number;
}

export type Finding = ProjectFinding | StructuredFinding;

export interface SourceContext {
  db: DB;
  mode: IngestMode;
  projects: ProjectRow[];
  markets: MicroMarketRow[];
  log: (msg: string) => void;
}

export interface SourceAdapter {
  id: SourceId;
  label: string;
  run(ctx: SourceContext): Promise<Finding[]>;
}
