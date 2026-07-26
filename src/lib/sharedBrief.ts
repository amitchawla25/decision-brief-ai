/**
 * Shape and storage conventions for a publicly shared brief. Shared between the
 * share API route (writer) and the /b/[id] page (reader) so the key format and
 * payload stay in sync.
 */

export type SharedBrief = {
  brief: string;
  lens: string;
  createdAt: number;
};

/** Shared briefs expire after 90 days of no access. */
export const SHARED_BRIEF_TTL_SECONDS = 60 * 60 * 24 * 90;

export function sharedBriefKey(id: string): string {
  return `brief:${id}`;
}
