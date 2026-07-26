import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SharedBrief } from "./sharedBrief";

/**
 * Shared-brief persistence, backed by Supabase (Postgres). Sharing is optional:
 * if the environment isn't configured, `isShareEnabled()` is false, callers
 * respond with a clear "not configured" message, and the rest of the app keeps
 * working. Everything here is server-only — it uses the service-role key, which
 * must never be exposed to the client.
 *
 * Requires a table:
 *   create table shared_briefs (
 *     id text primary key,
 *     brief text not null,
 *     lens text not null default 'Product',
 *     created_at timestamptz not null default now()
 *   );
 *   alter table shared_briefs enable row level security;
 * (RLS with no policies keeps the anon key out; the service role bypasses it.)
 */

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const TABLE = "shared_briefs";

let client: SupabaseClient | null = null;

/** True when Supabase is configured, i.e. brief sharing can work. */
export function isShareEnabled(): boolean {
  return Boolean(url && serviceKey);
}

function getClient(): SupabaseClient | null {
  if (!isShareEnabled()) return null;
  if (!client) {
    client = createClient(url as string, serviceKey as string, {
      auth: { persistSession: false },
    });
  }
  return client;
}

/**
 * Persist a brief under a caller-supplied id. Returns false when sharing isn't
 * configured or the write failed, so the route can surface a clear error.
 */
export async function saveSharedBrief(
  id: string,
  brief: string,
  lens: string
): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;

  const { error } = await supabase.from(TABLE).insert({ id, brief, lens });
  if (error) {
    console.error("Error saving shared brief:", error.message);
    return false;
  }
  return true;
}

/** Load a shared brief by id, or null if missing / unconfigured / on error. */
export async function getSharedBrief(id: string): Promise<SharedBrief | null> {
  const supabase = getClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select("brief, lens, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Error loading shared brief:", error.message);
    return null;
  }
  if (!data) return null;

  return {
    brief: data.brief,
    lens: data.lens,
    createdAt: data.created_at
      ? new Date(data.created_at).getTime()
      : Date.now(),
  };
}
