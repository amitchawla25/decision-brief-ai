import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { assertAllowedOrigin } from "@/lib/security";
import { getRedis, isShareEnabled } from "@/lib/redis";
import {
  SHARED_BRIEF_TTL_SECONDS,
  sharedBriefKey,
  type SharedBrief,
} from "@/lib/sharedBrief";

const MAX_BRIEF_LENGTH = 20000;
const VALID_LENSES = ["Product", "Revenue", "Ops", "Customer", "Risk"];

/**
 * Persist a generated brief and return a short id that maps to a public,
 * read-only page at /b/<id>. Sharing is optional: without Upstash configured
 * this returns 501 and the client keeps the rest of the app working.
 */
export async function POST(req: NextRequest) {
  try {
    assertAllowedOrigin(req);

    if (!isShareEnabled()) {
      return NextResponse.json(
        { error: "Sharing is not configured on this deployment." },
        { status: 501 }
      );
    }

    const { brief, lens = "Product" } = await req.json();

    if (!brief || typeof brief !== "string") {
      return NextResponse.json({ error: "Brief is required" }, { status: 400 });
    }

    if (brief.length > MAX_BRIEF_LENGTH) {
      return NextResponse.json({ error: "Brief too large" }, { status: 400 });
    }

    const safeLens = VALID_LENSES.includes(lens) ? lens : "Product";

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json(
        { error: "Sharing is not configured on this deployment." },
        { status: 501 }
      );
    }

    // 8-char url-safe id from 6 random bytes (~2.8e14 space, collision-safe here).
    const id = crypto.randomBytes(6).toString("base64url");

    const payload: SharedBrief = {
      brief,
      lens: safeLens,
      createdAt: Date.now(),
    };

    await redis.set(sharedBriefKey(id), payload, {
      ex: SHARED_BRIEF_TTL_SECONDS,
    });

    return NextResponse.json({ id });
  } catch (error: any) {
    if (
      error?.message === "ORIGIN_NOT_ALLOWED" ||
      error?.message === "REFERER_NOT_ALLOWED"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    console.error("Error in share route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
