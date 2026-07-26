import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { parseBrief } from "@/lib/briefParser";
import BriefSection from "@/components/BriefSection";
import { getRedis } from "@/lib/redis";
import { sharedBriefKey, type SharedBrief } from "@/lib/sharedBrief";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getSharedBrief(id: string): Promise<SharedBrief | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return await redis.get<SharedBrief>(sharedBriefKey(id));
  } catch (error) {
    console.error("Error loading shared brief:", error);
    return null;
  }
}

/**
 * Pull a short, human-readable summary for the social card. The decision itself
 * is the most compelling thing to show, so use the DECISION BEING MADE section.
 */
function briefDescription(brief: string): string {
  const decision = parseBrief(brief).find((s) => s.id === "decision");
  const text = (decision?.content || brief)
    .replace(/[•\-\*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 180 ? `${text.slice(0, 177)}…` : text;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const shared = await getSharedBrief(id);

  if (!shared) {
    return { title: "Brief not found — Decision Brief AI" };
  }

  const title = `${shared.lens} Decision Brief — Decision Brief AI`;
  const description = briefDescription(shared.brief);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharedBriefPage({ params }: PageProps) {
  const { id } = await params;
  const shared = await getSharedBrief(id);

  if (!shared) {
    notFound();
  }

  const sections = parseBrief(shared.brief);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-slate-900 hover:text-blue-600 transition-colors"
          >
            Decision Brief AI
          </Link>
          <Link
            href="/app"
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Make your own brief →
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Decision Brief</h1>
          <span className="px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-700 rounded-full border border-blue-200">
            {shared.lens} Lens
          </span>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <BriefSection
              key={section.id}
              section={section}
              isFirst={index === 0}
            />
          ))}
        </div>

        {/* Conversion CTA — this page is the top of the funnel for shared links */}
        <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Turn your own meeting into a decision brief
          </h2>
          <p className="text-blue-100 mb-6">
            Paste any transcript, PRD, or strategy doc and get a 1-page decision
            memo in 30 seconds. No signup required.
          </p>
          <Link
            href="/app"
            className="inline-block px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-lg"
          >
            Generate your first brief →
          </Link>
        </div>
      </main>
    </div>
  );
}
