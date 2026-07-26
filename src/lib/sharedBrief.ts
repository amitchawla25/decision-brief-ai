/**
 * Shape of a publicly shared brief, shared between the share API route (writer)
 * and the /b/[id] page (reader).
 */
export type SharedBrief = {
  brief: string;
  lens: string;
  createdAt: number;
};
