/**
 * A hardcoded sample transcript + pre-generated brief. Powers the "Try a
 * sample" button so a cold visitor sees real, formatted output in ~1 second
 * with no API call and without needing a transcript of their own.
 *
 * The brief text is fixed on purpose (not generated at runtime) so the demo is
 * instant, free, and deterministic. It follows the exact 7-section format the
 * live model is instructed to produce.
 */

export const SAMPLE_LENS = "Product" as const;

export const SAMPLE_TRANSCRIPT = `Product sync — Mobile onboarding revamp
Attendees: Priya (PM), Dan (Eng lead), Marco (Design), Lena (Growth)

Priya: Activation is stuck at 34%. Most drop-off is on the 5-step signup. Growth wants to cut it down.
Lena: Data's clear — 41% of new installs bail before finishing step 3. Every extra step costs us roughly 8% completion.
Marco: I've prototyped a single-screen version. One email field, defer everything else to in-app. Tested well with 6 users.
Dan: Doable, but the deferred profile data feeds our recommendation engine. If we skip it at signup, first-session recs get worse for ~2 weeks until we backfill. That could hurt day-1 retention.
Lena: So it's activation vs. early retention. We don't have data on how much recs actually move day-1.
Priya: Could we ship the single-screen flow to 50% and hold the rest, measure both activation and day-1 retention for two weeks?
Dan: Yes. Roughly one sprint to build the flow behind a flag. Instrumentation is another few days.
Marco: I can have final designs by Friday.
Priya: Budget's fine, it's engineering time. We need to decide this week — the growth OKR is due end of quarter.
Lena: One risk — if we roll to 50% and recs tank retention, we've burned two weeks of new-user cohorts on a worse experience.
Priya: Agreed, let's cap the exposure and set a kill switch.`;

export const SAMPLE_BRIEF = `DECISION BEING MADE
• Should we replace the 5-step mobile signup with a single-screen flow to lift activation, given the risk that deferring profile data weakens early recommendations and day-1 retention?
• Decision needed this week to stay ahead of the end-of-quarter growth OKR.

OPTIONS CONSIDERED
Option 1: Ship the single-screen flow to 100% now — fastest activation win, no holdout to measure retention impact.
Option 2: Roll the single-screen flow to 50% behind a flag with instrumentation, measure activation and day-1 retention for two weeks, keep a kill switch.
Option 3: Keep the current 5-step flow (status quo) — protects recommendation quality but leaves activation stuck at 34%.

TRADEOFFS
Option 1: ✅ Maximum, immediate activation lift ✅ No engineering spent on holdout logic ❌ No data on retention impact ❌ Exposes 100% of new cohorts if recs tank retention
Option 2: ✅ Quantifies the activation vs. retention trade with real data ✅ Kill switch caps downside ❌ ~1 sprint + a few days instrumentation ❌ Half of new users still on the worse two-week rec experience
Option 3: ✅ Protects recommendation quality and day-1 retention ❌ Activation stays at 34% ❌ Misses the growth OKR

RECOMMENDED DECISION
• Go with Option 2: roll the single-screen flow to 50% behind a feature flag with a kill switch, and instrument both activation and day-1 retention for two weeks.
• This is the only option that resolves the core unknown — nobody knows how much recommendations actually move day-1 retention — while capping exposure. Optimizing for a reversible, data-backed decision over an irreversible bet.
• Mitigate the two-week degraded-recs window by prioritizing the profile-data backfill in parallel.

DECISION OWNER
• Priya (PM) owns the go/no-go decision, required this week ahead of the end-of-quarter growth OKR.
• Dan (Eng lead) signs off on feasibility and the kill-switch implementation.

RISKS & WATCHOUTS
• Recommendation quality drops for ~2 weeks post-signup until profile data is backfilled, which could depress day-1 retention.
• Rolling to 50% burns new-user cohorts on a worse experience if the kill switch isn't wired before launch.
• Two-week measurement window may not reach significance if install volume is low — validate the sample size up front.
• Instrumentation gaps could make activation and retention non-comparable across the two arms.
• Assumption that "each extra step costs ~8% completion" is from historical data and may not hold for the new flow.

NEXT 3 ACTIONS
• Marco (Design) - Deliver final single-screen designs - by Friday
• Dan (Eng) - Build the flow behind a flag with a kill switch plus activation/retention instrumentation - within one sprint
• Priya (PM) - Confirm the 50% rollout decision and define success thresholds for the two-week test - this week`;
