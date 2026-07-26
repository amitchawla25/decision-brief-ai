import crypto from "crypto";

/**
 * HARD-CODED APP URL (launch-safe)
 * No trailing slash
 */
const APP_URL = "https://decision-brief-ai.vercel.app";

/**
 * Every origin this app may legitimately be served from.
 *
 * The production URL alone is not enough: a Vercel preview deployment, a custom
 * domain, or `npm run dev` on localhost all send a different Origin header, and
 * every request from them would be rejected with a 403.
 */
function getAllowedOrigins(): string[] {
  const origins = [APP_URL];

  // Custom domain / alternate production URL
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) {
    origins.push(configured.replace(/\/$/, ""));
  }

  // The current deployment's own immutable URL (set by Vercel on every deploy).
  if (process.env.VERCEL_URL) {
    origins.push(`https://${process.env.VERCEL_URL}`);
  }

  // The branch-alias preview URL (e.g. <project>-git-<branch>-<team>.vercel.app).
  // This differs from VERCEL_URL and is the URL Vercel usually links to, so
  // without it Generate/Share 403 on branch previews.
  if (process.env.VERCEL_BRANCH_URL) {
    origins.push(`https://${process.env.VERCEL_BRANCH_URL}`);
  }

  // The stable production alias, in case APP_URL ever drifts from it.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  // Local development
  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }

  return origins;
}

/**
 * Allow only requests coming from your own site
 */
export function assertAllowedOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const allowed = getAllowedOrigins();

  // If Origin header exists, it must match one of our origins exactly
  if (origin && !allowed.includes(origin)) {
    throw new Error("ORIGIN_NOT_ALLOWED");
  }

  // If Referer header exists, it must start with one of our origins
  if (referer && !allowed.some((url) => referer.startsWith(url))) {
    throw new Error("REFERER_NOT_ALLOWED");
  }
}

/**
 * Lightweight API token gate to prevent public quota abuse
 * Client must send: x-app-token
 */
export function assertAppToken(req: Request) {
  const token = req.headers.get("x-app-token");
  if (!token) {
    throw new Error("MISSING_APP_TOKEN");
  }

  const secret = process.env.API_SHARED_SECRET;
  if (!secret) {
    throw new Error("API_SHARED_SECRET not configured");
  }

  const a = Buffer.from(token);
  const b = Buffer.from(secret);

  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error("INVALID_APP_TOKEN");
  }
}
