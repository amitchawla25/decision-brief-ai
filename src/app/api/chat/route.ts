import { NextRequest, NextResponse } from "next/server";
import { buildExecSystemPrompt } from "@/lib/execPrompt";
// Note: assertAppToken() exists in @/lib/security but is not wired up here.
// The x-app-token header is currently never verified on this route.
import { assertAllowedOrigin } from "@/lib/security";
import { rateLimitOrThrow } from "@/lib/rateLimit";

const VALID_LENSES = ["Product", "Revenue", "Ops", "Customer", "Risk"] as const;
const MAX_CONTENT_LENGTH = 50000;

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    // 1) Security gates (launch-blocking)
    assertAllowedOrigin(req);

    // 2) Durable rate limit: 10 briefs per day
    await rateLimitOrThrow({
      req,
      keyPrefix: "chat",
      limit: 10,
      windowSeconds: 60 * 60 * 24, // 24 hours
    });

    // 3) Parse + validate input
    const { content: rawContent, lens = "Product" } = await req.json();

    if (!rawContent || typeof rawContent !== "string") {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    if (rawContent.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: "Content too large (max 50KB)" },
        { status: 400 }
      );
    }

    if (!VALID_LENSES.includes(lens as any)) {
      return NextResponse.json(
        { error: "Invalid lens parameter" },
        { status: 400 }
      );
    }

    // 4) OpenRouter call
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not configured");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    const systemPrompt = buildExecSystemPrompt(lens);
    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: rawContent },
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://decision-brief-ai.vercel.app",
          "X-Title": "Decision Brief AI",
        },
        body: JSON.stringify({
          // OpenRouter requires namespaced model slugs ("author/slug").
          // A bare "gpt-4o-mini" is rejected with a 400.
          model: "openai/gpt-4o-mini",
          messages,
        }),
      }
    );

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("OpenRouter API error:", response.status, detail);
      return NextResponse.json(
        { error: "AI service unavailable" },
        { status: 503 }
      );
    }

    const data = await response.json();
    const briefText = data.choices?.[0]?.message?.content;

    if (!briefText) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    // Formatting drift (a missing or reworded heading) is not a reason to throw
    // away a brief the user already paid for. Return it and flag it instead.
    const missingSections = findMissingSections(briefText);
    if (missingSections.length > 0) {
      console.warn("Brief missing sections:", missingSections.join(", "));
    }

    return NextResponse.json(
      {
        brief: briefText,
        lens,
        ...(missingSections.length > 0 ? { missingSections } : {}),
      },
      {
        headers: {
          "X-RateLimit-Limit": "10",
        },
      }
    );
  } catch (error: any) {
    if (error?.message === "RATE_LIMITED") {
      return NextResponse.json(
        { error: "Daily limit reached (10 briefs/day)." },
        { status: 429 }
      );
    }

    if (
      error?.message === "ORIGIN_NOT_ALLOWED" ||
      error?.message === "REFERER_NOT_ALLOWED"
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      error?.message === "MISSING_APP_TOKEN" ||
      error?.message === "INVALID_APP_TOKEN"
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const REQUIRED_HEADINGS = [
  "DECISION BEING MADE",
  "OPTIONS CONSIDERED",
  "TRADEOFFS",
  "RECOMMENDED DECISION",
  "DECISION OWNER",
  "RISKS & WATCHOUTS",
  "NEXT 3 ACTIONS",
];

/**
 * Models drift on punctuation ("RISKS AND WATCHOUTS") and sometimes bold the
 * headings despite the plain-text rule, so compare on a normalized form.
 */
function normalizeHeadings(text: string): string {
  return text
    .toUpperCase()
    .replace(/[*#_`]/g, "")
    .replace(/&/g, "AND")
    .replace(/\s+/g, " ");
}

function findMissingSections(text: string): string[] {
  const normalized = normalizeHeadings(text);
  return REQUIRED_HEADINGS.filter(
    (heading) => !normalized.includes(normalizeHeadings(heading))
  );
}
