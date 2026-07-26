# Decision Brief AI

Minimal Next.js + OpenRouter app that turns pasted text into a structured executive decision brief.

## Tech stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- OpenRouter (LLM backend)
- API route: `POST /api/chat`

## Local / Codespaces setup

1. Install dependencies:

```bash
npm install
```

Create .env.local in the project root:

```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Run the dev server:

```bash
npm run dev
```

Open the app at http://localhost:3000 (or the forwarded port in Codespaces).

Environment variables

OPENROUTER_API_KEY — required. Get it from your OpenRouter dashboard.

NEXT_PUBLIC_APP_URL — optional. Set this if you serve the app from a custom
domain. API routes reject requests whose `Origin` does not match a known URL for
this app; the production Vercel URL, the current deployment's `VERCEL_URL`, and
localhost during development are allowed automatically.

Note on models: OpenRouter model IDs are namespaced as `author/slug` (for
example `openai/gpt-4o-mini`). A bare slug such as `gpt-4o-mini` is rejected
with a 400.

Ensure `.env.local` is ignored by git (Next.js template usually already does this via `.gitignore`).
