# Life OS

> Your personal discipline, fitness, faith and business tracker. Built for Janco.

A full-featured, mobile-first personal tracking app with a 90s neon-disco aesthetic. 100% local — all data lives in your browser's `localStorage`, no account needed.

## Features

- **Dashboard** — daily goals, progress ring, streaks, motivational quotes
- **Weekly Goals** — separate jog + sprint tracker, resets every Monday
- **Calendar** — monthly view with completion dots, day drawer with notes
- **Fitness** — lift logging with PR tracking, Epley 1RM charts, bodyweight history
- **Nutrition** — natural-language food logging ("5 bananas and 200g chicken"), custom food DB, macro rings
- **Timer** — countdown, stopwatch, gym rest presets, focus presets
- **Settings** — edit all goals, targets, schedule, custom foods, import/export data

## Stack

- Next.js 15 (App Router)
- TypeScript strict
- Tailwind CSS
- Framer Motion
- Zustand (localStorage persistence)
- Recharts
- date-fns

## Setup

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. No environment variables needed — deploy as-is

## Data

All data is stored in `localStorage` under the key `life-os:v1`.

- **Export**: Settings → Data → Export JSON
- **Import**: Settings → Data → Import JSON
- **Wipe**: Settings → Data → type `WIPE`

## Default targets (per your profile)

| Metric | Target |
|--------|--------|
| Calories | 2,900 kcal |
| Protein | 170g |
| Carbs | 350g |
| Fat | 78g |
| Water | 2.5L |
| Steps | 10,000 |
| Sleep | 8h |
