# DIOKS FashionSuite — app

Phone-first Expo (SDK 58) app. One codebase → web PWA, iOS and Android.

Planning docs are versioned in [`docs/`](docs/): **`docs/DIOKS_FashionSuite_Design_and_Dev_Plan.md`** carries the live build status (header box, §7.1 per-phase ticks, §7.0b session log) — read that first when picking the project up. Scope/deferrals: `docs/DIOKS_Tailors_MVP_Scope_Deferrals_and_V1.1.md`. Raw briefs: `docs/prd.txt`, `docs/srf.txt`, `docs/pcd.txt`.

## Run it

```bash
npm install
npm start          # Expo dev server — press w for web, or scan the QR with Expo Go
npm run web        # web only
npm run typecheck  # tsc --noEmit
npm test           # vitest (pure logic: dates, auth validation)
npm run build:web  # production SPA export into dist/
```

On a real phone: `npm start`, then scan the QR code (same Wi-Fi).

> **Typed routes gotcha:** after adding or renaming a route file, run `npm start` once — Expo regenerates `.expo/types/router.d.ts`. Until then `npm run typecheck` reports valid new paths as type errors.

## What exists today (P0–P3, mock data)

Phase status, gate caveats and the next task live in `docs/DIOKS_FashionSuite_Design_and_Dev_Plan.md` (§7.1 + §7.0b). Summary: **P4 is under way — foundations (units, zod schemas, data hooks, UI primitives) are in; the six customer/measurement screens are next.**

| Area | State |
|---|---|
| Expo SDK 58 project, TypeScript strict, `@/*` alias | done |
| `app.json`: SPA output (`web.output: "single"`), scheme `dioksfashionsuite`, bundle IDs | done |
| Design tokens (`src/theme/tokens.ts`) — colour, type, spacing, radius, elevation (e0–e3 + ambient/brand/focus/top depth), ambience washes, motion | done |
| Phone shell `AppFrame` — 430px max, centred frame on desktop, full-bleed on phones, backdrop glow | done |
| Components: `AppText`, `Button`, `Card`, `StatusPill`, `Avatar`, `Screen`, `Wash`, `BrandMark`, `TextField`, `Checkbox`, `Stepper` | done |
| Landing screen (`src/app/(public)/index.tsx`) | done (Phase 1) |
| Auth: login / register / forgot / reset (`src/app/(auth)`) | done — Phase 2, mock accounts |
| Session provider + guards (`(app)/_layout.tsx`, `(onboarding)/_layout.tsx`) | done |
| Onboarding: welcome → business → unit/template → referral → done | done — creates the profile, seeds the chosen template, starts the 14-day trial |
| Logo upload with client-side compression (`expo-image-manipulator`, 512px / 70%) | done |
| 5-tab shell: Home · Customers · Projects · Due · Settings (5 inline SVG icons, ~2 KB) | done |
| Home dashboard: 4 stats, trial banner, deliveries this week, celebrations with 1-tap WhatsApp, recent customers | done |
| Due tab grouped Overdue / Today / This week | done — read-only |
| Customers & Projects tabs | read-only previews — full CRUD in Phases 4–5 |
| Settings: business card, subscription, referral code, sign out | done — editable settings in Phase 7 |
| Mock repository: auth, business, customers, measurements, templates, projects, reminders, subscription | done — AsyncStorage-persisted, 350–700 ms latency, expiry gate |
| Component gallery (`/dev/gallery`) | done — used for design review |
| PWA manifest, icons, `_redirects`, `vercel.json` | done |
| Email verification screen | Phase 11 (needs real Supabase email confirmation) |
| Customer / measurement / project screens | Phase 4–6 |

## Demo accounts (mock data)

Password for all three: `demo1234`

| Email | What it shows |
|---|---|
| `adaeze@dioks.app` | Active studio, 9-day trial, 6 customers, 8 projects, 2 measurement versions |
| `expired@dioks.app` | Expired subscription — writes are rejected by the repository (read-only demo) |
| `new@dioks.app` | No business profile yet — run the full onboarding flow (business → unit/template → referral → done) |

After onboarding, the dashboard shows the seeded studio data; a brand-new signup starts with empty states instead.


Reset the demo data at any time from a dev build with `resetMockDatabase()` (`src/data/mock/mockRepository.ts`).


## Structure

```
src/
  app/            # expo-router routes: (public), (auth), (app), (admin), dev
  components/
    layout/       # AppFrame, Screen
    ui/           # AppText, Button, Card, StatusPill, Avatar, Wash, BrandMark, …
  theme/          # tokens.ts (single source of truth)
public/           # index.html template, manifest, icons, _redirects
```

## Non-negotiables (from the plan)

- Content never exceeds **430px**; no desktop layout exists.
- No hard-coded colours — add a token in `src/theme/tokens.ts`.
- Touch targets ≥44px, contrast ≥4.5:1, text scales to 130%.
- Screens never call Supabase directly: `screen → hook → repository → mock | supabase`.
- Every list needs loading, empty, error and offline states.

## Deployment

- **Vercel**: build `npm run build:web`, output `dist` (rewrites in `vercel.json`).
- **Cloudflare Pages**: same build, output `dist` (`public/_redirects` handles the SPA fallback).
