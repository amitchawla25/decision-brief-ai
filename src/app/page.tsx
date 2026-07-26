import Link from 'next/link';

  export default function LandingPage() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="text-xl font-bold text-slate-900">
              Decision Brief AI
            </div>
            <Link 
              href="/app"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try It Free
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 text-balance">
            Paste any meeting. Get a
            <span className="text-blue-600"> decision memo your exec will actually read.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto text-balance">
            Drop in a messy transcript, PRD, or strategy thread and get a structured 1-page decision brief — the decision, options, tradeoffs, recommendation, owner, risks, and next actions — in 30 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/app"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Generate Your First Brief
            </Link>
            <Link
              href="/app?sample=1"
              className="px-8 py-4 bg-white text-slate-700 text-lg font-semibold rounded-lg hover:bg-slate-50 transition-colors border-2 border-slate-200"
            >
              See a sample brief →
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="mt-8 text-sm text-slate-500">
            From meeting → decision → action in 30 seconds • No signup required
          </p>

          {/* What every brief contains — surface the differentiator above the fold */}
          <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
            {[
              'Decision being made',
              'Options considered',
              'Tradeoffs',
              'Recommended decision',
              'Decision owner',
              'Risks & watchouts',
              'Next 3 actions',
            ].map((label) => (
              <span
                key={label}
                className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-full shadow-sm"
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Decision Extraction</h3>
              <p className="text-slate-600 text-sm">
                Automatically identifies the core decision, options considered, and tradeoffs from your meetings and docs.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Clear Recommendations</h3>
              <p className="text-slate-600 text-sm">
                Get opinionated recommendations with reasoning, decision owners, and timelines - not just summaries.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Meeting Transcripts</h3>
              <p className="text-slate-600 text-sm">
                Works with Zoom, Google Meet, Teams transcripts, plus PRDs, strategy docs, and Slack threads.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2
   0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Action-Oriented Output</h3>
              <p className="text-slate-600 text-sm">
                Every brief includes decision owner, risk assessment, and 3 concrete next actions with timelines.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
              <p className="text-xl text-slate-600">Three simple steps to your decision document</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  1
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Paste Your Content</h3>
                <p className="text-slate-600">
                  Copy your meeting transcript (Zoom, Meet, Teams), PRD, strategy doc, or Slack thread.
                </p>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  2
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Choose Your Lens</h3>
                <p className="text-slate-600">
                  Select Product, Revenue, Ops, Customer, or Risk perspective to color the analysis.
                </p>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                  3
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Get Your Decision Doc</h3>
                <p className="text-slate-600">
                  Receive a 1-page brief with the decision, options, tradeoffs, recommendation, owner, risks, and actions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Perfect For</h2>
            <p className="text-xl text-slate-600">Who benefits from Decision Brief AI</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">📊 Product Leaders</h3>
              <p className="text-slate-600 text-sm">
                Turn roadmap discussions, feature debates, and prioritization meetings into clear go/no-go decisions.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">💼 Consulting Teams</h3>
              <p className="text-slate-600 text-sm">
                Compress client discovery calls and workshop outputs into executive-ready decision memos.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">🚀 Founders</h3>
              <p className="text-slate-600 text-sm">
                Cut through Slack chaos and endless meetings - extract decisions from discussions instantly.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">🎯 Strategy Teams</h3>
              <p className="text-slate-600 text-sm">
                Transform long strategy memos and scenario planning into crisp decision frameworks.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to compress your decisions?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Start generating decision documents in seconds. No signup required.
            </p>
            <Link 
              href="/app"
              className="inline-block px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-slate-50 transition-colors shadow-xl"
            >
              Generate Your First Brief →
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-lg font-semibold text-white mb-2">Decision Brief AI</p>
                <p className="text-sm">Turn meetings into decision documents.</p>
              </div>
              <div className="flex gap-6 text-sm">
                <a href="https://github.com/amitchawla25/decision-brief-ai" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  GitHub
                </a>
                <Link href="/app" className="hover:text-white transition-colors">
                  Launch App
                </Link>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
              <p>Powered by GPT-4o-mini via OpenRouter & Next.js • Built with ❤️</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }
