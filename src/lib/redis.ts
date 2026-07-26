import { Redis } from "@upstash/redis";

/**
 * Shared-brief persistence lives in Upstash Redis. It is optional: if the
 * environment isn't configured, sharing is disabled and the rest of the app
 * keeps working. Everything here degrades gracefully rather than throwing at
 * import time.
 */

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

let client: Redis | null = null;

/**
 * True when both Upstash credentials are present, i.e. brief sharing can work.
 */
export function isShareEnabled(): boolean {
  return Boolean(url && token);
}

/**
 * Lazily construct the Upstash client. Returns null when sharing isn't
 * configured so callers can respond with a clear "not configured" message.
 */
export function getRedis(): Redis | null {
  if (!isShareEnabled()) {
    return null;
  }
  if (!client) {
    client = new Redis({ url: url as string, token: token as string });
  }
  return client;
}
