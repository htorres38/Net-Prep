# Net Prep

**Live preview:** https://prep-net.vercel.app/

A local-first CCNA certification study app with an AI tutor, built with PowerSync for offline-capable progress sync.

---

## Features

- Structured lessons across all CCNA exam domains
- Hands-on lab exercises with step-by-step walkthroughs
- Practice exams with scoring
- AI tutor powered by Gemini — ask questions in context of any lesson or slide
- Progress tracking synced locally via PowerSync (works offline)
- Notes per lesson, study streak tracking

---

## Stack

| | |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Neon (PostgreSQL) |
| Sync | PowerSync |
| Auth | Supabase Auth |
| AI | Google Gemini |

---

## Architecture

Progress data (lesson completions, lab scores, notes, streaks) is written to Neon via a server-side API route and synced to the client through PowerSync's local SQLite layer. This means the app stays responsive and functional offline — state is stored locally first and synced when connectivity is available.

The AI tutor has full context of the current lesson and slide, enabling targeted answers rather than generic responses.

---

## Local Setup

```bash
npm install
npm run dev
```

Required environment variables in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_POWERSYNC_URL=
NEON_DATABASE_URL=
GEMINI_API_KEY=
```
