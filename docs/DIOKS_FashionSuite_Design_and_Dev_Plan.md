# DIOKS FASHIONSUITE — UI/UX DESIGN & PHASED DEVELOPMENT PLAN

**Product:** DIOKS FashionSuite · **Company:** DIOKS TAILORS
**Document type:** Design Specification + Phased Build/Test Plan + Spec Audit
**Version:** 1.0 · **Date:** 14 November 2026
**Companions:** `prd.txt` (v1.0), `pcd.txt` (v1.0), `srf.txt` (v1.0, incomplete), `DIOKS_FashionSuite_Master_Build_Spec.md`, **`DIOKS_Tailors_MVP_Scope_Deferrals_and_V1.1.md`** (approved deferral register)
**Execution rule of this document:** the client approves the **entire mock-data front end (Phases 0–9)** before **any** backend wiring begins (Phase 10+).

> ### BUILD STATUS — last updated 16 Nov 2026
>
> | | |
> |---|---|
> | **Current phase** | **P4 · Customers + measurements** — ◐ list · new · profile done; edit + measurement screens next |
> | **Built** | P0–P3 (caveats in §7.1) + P4 foundations and screens 15/19/20 (§7.0b) — nothing is signed off |
> | **Runs today** | `cd app && npm start` (Expo web + Expo Go). Mock data, 3 demo accounts |
> | **Verified** | `npm run typecheck` clean · `npm test` 84/84 · `npm run build:web` exports |
> | **Read next** | §7.1 (per-gate status) → §7.0b (session log + known gaps) → §7.2 P4 |
>
> **Rule:** status is ticked in §7.1 and logged in §7.0b **in the same commit that passes a gate**. A new session must be able to resume from this file alone — no memory, no chat history.

---

## 0. EXECUTIVE SUMMARY — ANSWERS TO YOUR 9 QUESTIONS

| # | Your question | Short answer | Where |
|---|---|---|---|
| 1 | Is the Master Spec in order or does it need refinement? | **Architecture is right; it is not yet safe to build.** 6 P0 defects (mostly RLS/security), 1 missing feature (reminders), 1 scope-creep feature (referral credits), 1 technical mismatch (`web.output: "static"` + dynamic routes). Refined spec is in §9. | §1, §2, §9 |
| 2 | Working execution plan | 17 phases (P0–P16) with deliverables, exit gates, tests and day estimates. Front end to sign-off ≈ **6–8 weeks**; full MVP to pilot ≈ **11–15 weeks** (1 full-time dev). | §7 |
| 3 | Design UI/UX first with mock data, everything clickable | Correct order. A **mock data layer behind a repository interface** means Phase 10 swaps `mock` → `supabase` without touching screens. 44 screens specified with route, phase, states, mock dataset. | §5, §6, §7 |
| 4 | Reference design (`tcn-ikd-transport.vercel.app`) | Replicated: **430px centred phone shell**, `100dvh`, 14–16px gutters, 96px bottom padding for a fixed tab bar, 16–18px card radii, theme tokens, `viewport-fit=cover, user-scalable=no`. Re-skinned for a fashion/atelier brand. | §4 |
| 5 | Phone-sized app, not full screen | Hard design contract: content is **never** wider than 430px. Desktop/tablet = centred device frame on a warm backdrop; phone = full-bleed with safe areas. No desktop layout is designed. | §4.4 |
| 6 | Is the recommended stack perfect? | **Right spine, 6 corrections.** Expo SDK 58 + Expo Router + Supabase + Vercel is correct for one codebase → PWA + iOS + Android with offline needs. Corrections: SPA output mode, image API, notifications missing, RN Supabase client config, server-side money logic, tooling/tests. | §3 |
| 7 | Break into build/test phases | Every phase has a **build gate** and a **test gate**; backend phases add RLS negative tests and webhook replay tests. | §7, §8 |
| 8 | Gaps to bridge | 30 gaps in 3 severity bands (P0 build-blocking, P1 missing MVP behaviour, P2 scale/quality), each with a bridge decision and a phase. | §2 |
| 9 | Design + dev plan in one MD file | This file is that document. | whole file |

### 0.1 Verdict in one paragraph

The three source documents (PCD → PRD → SRS) are coherent and the Master Build Spec picks a pragmatic stack. What is missing is not vision — it is **security hardening, network/reminder reality, and sequencing discipline**. The most important sequencing change is the one you already asked for: **build the entire product against mock data, freeze the design, then wire Supabase once**. Doing it the other way round is what turns a "small measurement book" into 3× its estimate. Two hard truths to accept up front: (a) a tailor who currently uses a notebook will judge this app in the first 90 seconds, so **the measurement entry screen is the product**; (b) nothing running on the client can be trusted — every lockout, permission and money value must be enforced in Postgres, not in React.

---

## 1. SPEC AUDIT — IS IT IN ORDER?

**Verdict: ~72% ready.** Architecture, feature set and deployment path are sound and consistent with the PRD. Six P0 issues must be fixed before Phase 10; this plan assumes they are.

### 1.1 What is genuinely strong (keep as-is)

| Area | Assessment |
|---|---|
| One codebase → PWA + iOS + Android | Correct for a small team; no duplicate native builds; the web demo accelerates client approval. |
| Supabase as backend | Correct: Postgres + Auth + Storage + RLS + Edge Functions + pg_cron covers every MVP need with no custom server. |
| `business_id` scoping on every table | Correct long-term; enables staff/apprentice logins in V2 without migrations. |
| Measurement versioning (`is_current`, `version_number`) | Right model for a tailor who re-measures a customer months later. |
| `Completed` ≠ `Delivered` ≠ `Archived` | Matches the domain exactly (PRD §8.3/8.4). |
| Soft delete (`deleted_at`) | Correct for "I lost my phone" anxiety; enables a Recently Deleted bin. |
| Client-side image compression | Essential — it is the difference between 1 GB lasting 2 months or 2 years. |
| JSONB measurement fields | Correct: tailors rename/add/remove fields constantly; relational columns would mean a migration per change. |
| WhatsApp via `wa.me` deep links (not Meta Cloud API) | Correct MVP call: no approval friction, no per-message cost, customer needs no app. |
| Static hosting for the client shell | Cheap, fast, nothing to maintain. |

### 1.2 Defects that must be fixed

Severity: **P0** = build-blocking (security/data correctness) · **P1** = missing MVP behaviour · **P2** = scale/quality.

| ID | Sev | Defect in the Master Build Spec | Consequence if shipped | Fix |
|---|---|---|---|---|
| S-01 | **P0** | `business_profiles` RLS is `for all using (auth.uid() = user_id)` and that table holds `role` **and** `referral_credit_balance` | Any user can run `update business_profiles set role='admin'` or credit themselves ₦50,000 from the browser console. Privilege escalation + financial fraud. | Move `role` to `platform_admins` (no client write grant); move money to a ledger written only by Edge Functions. §9.1 |
| S-02 | **P0** | Subscription expiry is only a UI "renewal paywall" | The anon key is public; a lapsed user can still write to Postgres directly. PRD §10.4 lockout is unenforceable. | `subscription_is_active(business_id)` `SECURITY DEFINER`, required in every write policy's `with check`. §9.2 |
| S-03 | **P0** | No storage buckets and **no `storage.objects` RLS policies** in the migration | Photos are either public (PRD §10.3 breach) or uploads fail. | Private buckets + `{business_id}/{customer_id}/…` paths + 4 policies + signed URLs. §9.3 |
| S-04 | **P0** | No constraint preventing two `is_current = true` measurements per customer | History corrupts; "current measurement" becomes undefined; comparison screen shows garbage. | Partial unique index + `set_current_measurement()` RPC. §9.4 |
| S-05 | **P0** | `measurement_templates.fields_definition` is opaque JSONB with **no schema** and **no seeded standard template** | The template editor and measurement form cannot be built; PRD §7.1 unmet. | Versioned schema + 3 seed templates. §9.5 |
| S-06 | **P0** | Referral signup writes `referred_by_id` + a rewards row from the client; `referral_code` is `unique not null` with no generation strategy | Code-collision aborts signup; referral linkage is client-forgeable → free credits via fake signups. | `create_business_profile()` RPC only (retry, validate, write server-side). §9.6 |
| S-07 | P1 | **Reminders/notifications are absent from the spec**, yet PRD §8.4 (delivery reminders), §6.3 (celebrations) and MVP scope demand them | A core PRD promise is unbuilt, and "what's due today" is the #1 daily-return reason. | In-app due engine + `expo-notifications` local scheduling on native; web gets in-app + WhatsApp nudge. §9.7 |
| S-08 | P1 | `web.output: "static"` with dynamic routes (`/customers/[id]`) and auth | Static rendering emits one HTML file per route; dynamic routes 404 on refresh. A `_redirects` file does not fix `static` — it only matters for SPA output. | `web.output: "single"` + `public/index.html` + manifest + service worker. §3.2 C1 |
| S-09 | P1 | No payment implementation; only a passing mention of a "Paystack webhook" | The subscription lifecycle (trial → active → expired) has no source of truth; lockout can never be tested. | Paystack Plans + `verify-transaction` + signature-verified webhook + `payment_events` idempotency table. §9.8 |
| S-10 | P1 | Data export (PRD §10.5) is absent | A stated MVP/legal requirement is unmet. | Per-customer JSON + business-wide CSV ZIP via Edge Function. §9.9 |
| S-11 | P1 | Admin dashboard has no model beyond `role === 'admin'` | Contradicts PRD §12 ("admins must not read private customer data") — nothing prevents it. | Aggregate read-only views + admin Edge Function; admins have **no** RLS path to customers, measurements, projects or photos. §9.10 |
| S-12 | P1 | `customer_projects` stores only `design_photos text[]` | PRD §8.2 also wants saved WhatsApp messages/attachments; no captions, ordering, per-file deletion or file type. | `project_attachments` table (kind, caption, sort, storage_path); drop `design_photos` or keep as derived cache. |
| S-13 | P1 | No status history / audit trail | "Project status tracking" is one mutable column; no evidence that a job went Delivered→Archived, and no dispute record. | `project_status_events` append-only table written by trigger. |
| S-14 | P1 | No phone normalisation | `wa.me` needs international format; a customer saved as `0803…` yields a broken WhatsApp button — the app's most-used action. | Normalise to E.164 on input; store `phone_e164` + raw display value. |
| S-15 | P1 | Offline queue assumed but not designed | Duplicate records on retry, lost entries on conflict, silent data loss — the exact failure the product exists to prevent. | Outbox with client UUIDs + `upsert` idempotency + visible sync state. §9.12 |
| S-16 | P2 | No indexes, no `updated_at` triggers, no `search_path` hardening | Slow lists past ~500 customers; stale ordering; function search-path exposure. | §9.11 |
| S-17 | P2 | No analytics for PRD §14 success criteria | "80% of pilot users create a project within 10 minutes" is unmeasurable. | 12 privacy-safe funnel events (§8.6). |
| S-18 | P2 | No accessibility, performance or text-scaling requirements | Tailors work in bright workshops on older phones; contrast and 44px targets are not optional. | §8.4 budgets. |

### 1.3 Document-status conflicts to resolve

| Conflict | Detail | Recommendation |
|---|---|---|
| `srf.txt` is incomplete | Ends after **Section 1 (Introduction)**. Sections 2–6 (specific requirements, interfaces, data, constraints, acceptance criteria) do not exist. | Treat **this document + the hardened Master Spec** as working SRS v1.1. Do not write a separate SRS before design — it will be stale before the UI is approved. |
| Referral programme is in no source document | PRD/PCD/SRS never mention referrals, credits, Paystack or tiers. The Master Spec adds a single-tier credit referral system to the **MVP**. | Scope creep **with financial risk** (fraud, refunds, credit accounting, tax). Keep the `referral_code` column + "Share invite" button in MVP; **defer the credit ledger/payout logic to V1.1** unless explicitly funded. Scheduled as optional Phase 13B. |
| PRD §5.1 "Google sign-in may also be offered" | Shipping Google sign-in on iOS triggers Apple Guideline 4.8 → **Sign in with Apple** is also required. | MVP = email + password only. Add Google + Apple together in V1.1. Removes 2 auth paths, 2 QA matrices and 1 rejection risk. |
| PRD §6.3 "automated celebratory messages" | Impossible with `wa.me` links; automated sending requires the Meta WhatsApp Cloud API (business verification + per-message fees). | MVP = dashboard card + 1-tap pre-filled greeting (human sends). Reword PRD to "assisted", not "automated". |
| PRD §9.2 "open the tailor's WhatsApp **Business** app" | Neither OS lets an app force the Business variant; `whatsapp://` resolves to whichever app the user picks. | Document as a platform limitation. Use `https://wa.me/` (always works) and let the OS disambiguate. |
| PRD §10.6 "backup and recovery" | Supabase **Free** has no backups and **pauses projects after 1 week of inactivity** (verified on supabase.com/pricing, Nov 2026). | Move to **Pro ($25/mo)** before the pilot: daily backups (7-day retention), no pausing, 100 GB storage, 250 GB egress. Non-negotiable for a product promising "your records can never be lost". |

### 1.4 PRD → Master Spec coverage matrix (the audit answer)

| PRD ref | Requirement | Covered? | Note / action |
|---|---|---|---|
| §4 | Registration & login | ✅ | Supabase Auth. |
| §5.2 | Business profile (logo, WhatsApp, socials, reg. info) | ✅ | JSONB socials is fine. |
| §6.1–6.2 | Customer list, photo, search, profile + measurement/project sections | ✅ | Add duplicate-phone handling (G-16). |
| §6.3 | Birthday/anniversary reminders + celebrations | ⚠️ | Card + manual WhatsApp only; "automated" must be reworded. |
| §7.1 | **Standard** measurement template | ❌ | Not seeded; JSONB shape undefined (S-05). |
| §7.2 | Add/edit/rename/remove fields | ⚠️ | Stored, but editor UI + validation model undefined. |
| §7.3 | Measurement history & comparison | ⚠️ | Columns exist; uniqueness + compare UX missing (S-04). |
| §8.2 | Project info incl. saved WhatsApp messages/attachments | ⚠️ | `design_photos text[]` only (S-12). |
| §8.3–8.4 | Statuses, delivery confirmation, archive reminder | ✅ | Copy matches; needs a tested state machine. |
| §8.4 / §4 | **Delivery notifications and reminders** | ❌ | Entirely absent (S-07). |
| §9 | WhatsApp access & design sharing | ✅ | `wa.me` + `expo-sharing`; Business-app restriction documented. |
| §10.1 | Secure cloud storage | ⚠️ | No buckets/policies (S-03). |
| §10.2 | Account recovery across devices | ⚠️ | Needs native deep link + redirect allowlist (G-18). |
| §10.3 | Per-tailor privacy isolation | ⚠️ | RLS intent correct; role/credit columns break it (S-01). |
| §10.4 | Expiry locks access, **never** deletes data | ❌ | Client-side only (S-02). |
| §10.5 | Export + user-controlled deletion | ❌ | Export missing (S-10); delete is soft-only with no purge policy. |
| §10.6 | Backup & recovery | ⚠️ | Requires Supabase Pro before pilot. |
| §11 | Subscription, 14-day trial, future tiers | ⚠️ | Table only; no payment provider, no capability model for tiers. |
| §12 | Admin dashboard with restricted access | ❌ | No permission model; `role` self-escalation (S-01/S-11). |
| §14 | MVP success criteria measurable | ❌ | No analytics (S-17). |
| §15 | Cross-platform, security, performance, usability, maintainability | ⚠️ | Needs explicit budgets + device matrix (§8.4). |

**Score: 6 covered · 10 partial · 6 missing.** The six missing items are exactly the ones that make a demo look finished but fail a pilot — which is why Phases 9–15 exist.

---

## 2. GAP REGISTER — WHAT I WOULD BRIDGE, AND WHEN

30 gaps. "Bridge" is the decision taken in this plan; "Phase" is where it closes.

### 2.1 P0 — must close before any backend wiring

| ID | Gap | Bridge decision | Phase |
|---|---|---|---|
| G-01 | Admin escalation via `role` on a user-writable row | `platform_admins` table, service-role-only writes; admin UI gated by `is_platform_admin()` RPC | P10 |
| G-02 | Subscription gate only in the UI | SQL `subscription_is_active()` in every `with check`; paywall remains UX, not security | P10 |
| G-03 | Credit balance client-writable | `credit_ledger` append-only + `SECURITY DEFINER` balance function; zero client grants | P13B (if funded) |
| G-04 | Storage buckets & policies undefined | 2 private buckets (`customer-media`, `business-assets`), path `{business_id}/…`, signed URLs (1 h), 5 MB cap, MIME allowlist | P12 |
| G-05 | Multiple `is_current` measurements possible | Partial unique index + RPC that flips the flag transactionally | P10 |
| G-06 | Template JSON shape undefined | `TemplateV1` schema (§9.5) + one zod validator shared by form and DB check | P6 / P10 |
| G-07 | Referral code race + forgeable linkage | `create_business_profile()` RPC: `DIOKS-XXXX` with collision retry ×5, referrer validated server-side | P10 |
| G-08 | Soft-deleted rows leaking into lists | Central `v_customers` / `v_projects` views (`deleted_at is null`) + restore RPC; all screens read views | P10 |

### 2.2 P1 — required for a truthful MVP

| ID | Gap | Bridge decision | Phase |
|---|---|---|---|
| G-09 | Reminders/notifications | In-app "Due" engine is the source of truth (works on web + native) + local notifications on native + badge; web shows an "install for alerts" hint | P8 |
| G-10 | Data export | Per-customer JSON + business-wide CSV set zipped by Edge Function, signed link | P15 |
| G-11 | Payments | Paystack: 1 Plan, hosted checkout, server-side verify + webhook; no client entitlement | P13 |
| G-12 | Admin model | Read-only aggregates only (users, revenue, trials ending, abuse flags). No PII access by policy | P14 |
| G-13 | Project attachments | `project_attachments` (photo / reference / voice_note / wa_screenshot), caption, sort, storage_path, soft delete | P5 / P11 |
| G-14 | Status history | `project_status_events` (from, to, by, at) via trigger; rendered as a timeline | P11 |
| G-15 | Phone normalisation | Normaliser → E.164, default region NG; display local format; `wa.me` uses E.164 digits only | P4 |
| G-16 | Duplicate customers | Warn on same E.164 inside the business; "open existing" in MVP, merge in V1.1 | P4 |
| G-17 | Analytics for success criteria | 12 funnel events → `app_events` table (privacy-safe, no PII) | P15 |
| G-18 | Password reset on native | Scheme `dioksfashionsuite://reset-password`, universal links, Supabase redirect allowlist, reset screen handles `token_hash` | P11 |
| G-19 | Offline conflicts | Client UUIDv7 PKs, idempotent `upsert`, outbox, `updated_at` guard, per-row sync chip | P12 |
| G-20 | Retention/purge | 30-day `purge_deleted_records()` via pg_cron; immediate purge option; export offered first | P15 |
| G-21 | SRS incomplete | This doc + hardened spec = SRS v1.1; PRD remains the "what/why" source | now |
| G-22 | Legal/compliance (NDPR) | Privacy/terms pages, explicit consent at signup, no card data stored, export/delete honoured | P9 / P15 |

### 2.3 P2 — quality and scale

| ID | Gap | Bridge decision | Phase |
|---|---|---|---|
| G-23 | Missing indexes | `business_id`, `(business_id, deleted_at)`, `(customer_id, is_current)`, `status`, `expected_delivery_date`, phone trigram | P10 |
| G-24 | No `updated_at` triggers | One `set_updated_at()` trigger on 6 tables | P10 |
| G-25 | Image lifecycle | 800px / 70% JPEG ≈ 110 KB, store `width`/`height`, orphan sweep on delete | P12 |
| G-26 | Accessibility | ≥4.5:1 contrast, 44×44 targets, dynamic type to 130%, labelled inputs, `accessibilityRole` | every phase |
| G-27 | No token/component contract | §4 is the contract: one `theme.ts`, one component per pattern | P1 |
| G-28 | No test strategy | §8 (unit, component, web E2E, RLS negative, device matrix) | P1+ |
| G-29 | No loading/empty/error states | Every list: skeleton, empty+CTA, error+retry, offline banner | every phase |
| G-30 | Timezone/locale | Store `timezone` per business, compute reminders locally, `en-NG`, `dd MMM yyyy`, ₦ formatting | P8 |

---

## 3. STACK VERIFICATION

### 3.1 Verdict

**The recommended stack is correct for this product — keep it, with 6 corrections.** It is the only mainstream option that gives you, from one codebase: a web PWA you can demo in week 1, real iOS/Android apps with camera + notifications + offline storage, and a Postgres backend whose row-level security satisfies "no tailor can see another tailor's customers" *in the database*, not in the UI.

Versions verified against npm/docs on 14 Nov 2026:

| Layer | Package / service | Verified version | Verdict |
|---|---|---|---|
| Runtime | Node.js | 24.11.0 locally (Expo 58 requires ^22.13 ‖ ^24.3 ‖ ≥26) | ✅ compatible |
| App framework | `expo` (SDK 58) | 58.0.25 | ✅ |
| Navigation | `expo-router` | 58.0.31 | ✅ |
| UI engine | `react-native` / `react` | 0.88.1 / 19.3.0 | ✅ |
| Web target | `react-native-web` | 0.21.x | ✅ |
| Backend | Supabase (Postgres, Auth, Storage, Edge Functions, pg_cron) | hosted | ✅ |
| Client SDK | `@supabase/supabase-js` + `react-native-url-polyfill` + AsyncStorage adapter | latest 2.x | ✅ with C4 |
| Server state | `@tanstack/react-query` + persist-client + AsyncStorage persister | v5 | ✅ (use the persist package, not hand-rolled caching) |
| Images | `expo-image`, `expo-image-manipulator` | ~58.0.16 | ✅ with C2 |
| Lists | `@shopify/flash-list` | Expo-supported | ✅ for 500+ customers |
| Notifications | `expo-notifications` | ~58.1.9 | ✅ added (C3) |
| Hosting | Vercel previews → Cloudflare Pages optional | — | ✅ |
| Builds | EAS Build / Submit | — | ✅ |
| Errors | `@sentry/react-native` | latest | ✅ add in P1 |

### 3.2 The six corrections

**C1 — `web.output` must be `"single"`, not `"static"`.**
`static` pre-renders one HTML file per route; `/customers/[id]` cannot exist at build time, and auth screens should not be pre-rendered. `single` emits an SPA shell with client-side routing — what an authenticated app needs.

```json
{
  "expo": {
    "name": "DIOKS FashionSuite",
    "slug": "dioks-fashionsuite",
    "scheme": "dioksfashionsuite",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "web": { "bundler": "metro", "output": "single", "favicon": "./assets/favicon.png" },
    "plugins": ["expo-router", "expo-notifications", "expo-font"]
  }
}
```
For `single`: Vercel `rewrites: [{ "source": "/(.*)", "destination": "/index.html" }]`; Cloudflare Pages `_redirects` → `/*  /index.html  200`. The PWA manifest and service worker are **manual** in Expo (only the favicon is automatic): `public/manifest.webmanifest`, `public/icons/192.png|512.png|maskable.png`, linked from `public/index.html` (created with `npx expo customize public/index.html`), and `npx workbox-cli generateSW` in the build script. Source: Expo docs → *Progressive web apps* (verified 14 Nov 2026).

**C2 — `expo-image-manipulator` uses the new context API.** `manipulateAsync` is deprecated in SDK 58:

```ts
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export async function compressForUpload(uri: string, maxWidth = 800) {
  const ctx = ImageManipulator.manipulate(uri);
  ctx.resize({ width: maxWidth });            // height auto-preserved
  const image = await ctx.renderAsync();
  return image.saveAsync({ compress: 0.7, format: SaveFormat.JPEG });
}
```
Never upload the raw camera file (2–5 MB). Budget **≤120 KB/photo** — that is what makes 1 GB last ~9,000 photos and makes Supabase Pro's 100 GB effectively unlimited for this market.

**C3 — notifications must be added to the spec.** `expo-notifications` local scheduling works in Expo Go; **remote push on Android needs a development build since SDK 53**, so the MVP deliberately uses **local** scheduled notifications (no push server — also more reliable in poor networks):

```ts
await Notifications.scheduleNotificationAsync({
  content: { title: 'Delivery tomorrow', body: 'Adaeze Couture — Wedding gown', data: { projectId } },
  trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: dueAt },
});
```
Platform truths to design around: (a) iOS caps pending scheduled notifications (~64) → schedule only the nearest 20 and re-schedule on app open; (b) **installed PWAs on iOS cannot schedule notifications**, and web push needs iOS 16.4+ *and* home-screen installation → the **in-app "Due today" list is the source of truth on web**, notifications are an enhancement.

**C4 — the Supabase client needs explicit React Native config.** Per Supabase's RN quickstart: URL polyfill, AsyncStorage storage adapter, `detectSessionInUrl: false` on native, AppState-driven refresh:

```ts
import 'react-native-url-polyfill/auto';
export const supabase = createClient(url, anonKey, {
  auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
AppState.addEventListener('change', (s) =>
  s === 'active' ? supabase.auth.startAutoRefresh() : supabase.auth.stopAutoRefresh());
```
Use `getClaims()` to validate the session instead of trusting a locally decoded JWT.

**C5 — money and entitlements never run on the client.** Paystack verification, the webhook, the credit ledger, subscription state and export quota live in **Edge Functions** (service role). Postgres enforces the outcome via RLS. The app only displays state and requests actions.

**C6 — tooling that keeps 17 phases from rotting:** TypeScript `strict`, Expo ESLint config, Prettier, `jest-expo` + `@testing-library/react-native` (components), Vitest (pure logic: units, dates, phone, status machine), **Playwright** web E2E smoke on every PR, EAS development builds for device testing, Sentry for error visibility. Maestro optional once store builds exist.

### 3.3 Running-cost model (verified pricing, Nov 2026)

| Item | Cost | When |
|---|---|---|
| Supabase **Free** | $0 — 500 MB DB, 1 GB storage, 5 GB egress, 50k MAU, **2 projects**, **paused after 1 week idle**, no backups | Development only |
| Supabase **Pro** | **$25/mo** — 8 GB disk, 100 GB storage, 250 GB egress, 100k MAU, daily backups (7 days) | **Before pilot — mandatory** (G-04/PRD §10.6) |
| Vercel Hobby / Cloudflare Pages Free | $0 | Dev + pilot web |
| EAS Build | Free tier limited; paid from ~$19–99/mo | Store builds (P16) |
| Apple Developer Program | $99/yr | iOS submission |
| Google Play Console | $25 one-time | Android submission |
| Paystack | ~1.5% + ₦100 (local), no monthly fee | P13 |
| Domain | ~$12/yr | P16 |

Sizing math: 100 tailors × 150 customers × 2 photos × 110 KB ≈ 3.3 GB → comfortably inside Pro. At 1,000 tailors ≈ 33 GB → still Pro, with egress the real variable (list thumbnails must be cached and sized).

### 3.4 Alternatives considered and rejected

| Alternative | Why rejected |
|---|---|
| Next.js + Capacitor | Best web DX, but native camera/notifications/offline are bolt-ons; two environments to debug; worse native feel for a store app. |
| Flutter | Excellent UI control, but no code sharing with a web marketing site you can iterate in hours, and it would restart the entire design phase. |
| Bare React Native (no Expo) | Slower to first demo; you would hand-build navigation, fonts, image picking, builds. |
| Firebase | Weaker relational queries/reporting, and per-document security rules cannot express "business + subscription active" as cleanly as SQL + RLS. |
| Custom Node/Nest API + Postgres | Extra service to deploy, secure, monitor and pay for; duplicates what Supabase provides at MVP scale. |
| NativeWind / Tailwind on RN | Adds a build-config dependency and version coupling for zero MVP gain; a typed token object + `StyleSheet` gives exact control of the 430px shell. Revisit only if the team prefers Tailwind syntax. |

### 3.5 Deliberately **not** in MVP (prevents phase drift)

Google/Apple sign-in · referral credit payouts · Meta WhatsApp Cloud API · **SMS gateway (V1.1 paid add-on)** · **server push notifications (V1.1)** · real-time chat/collaboration · invoice/accounting (V2) · inventory (V2) · multi-staff seats (V1.1) · PDF invoices · tablet/desktop layouts · dark mode (tokens prepared, not shipped) · i18n beyond `en-NG`. Full register with reasons and reinstatement costs: `DIOKS_Tailors_MVP_Scope_Deferrals_and_V1.1.md`.

---

## 4. DESIGN SYSTEM — THE CONTRACT

### 4.1 Direction

**"Atelier, not admin panel."** The reference site (`tcn-ikd-transport`) gives the mechanics: a single 430px column, warm neutral canvas, calm cards, a fixed tab bar, no chrome, no clutter. DIOKS takes that skeleton and adds the emotional layer a fashion professional expects: a deep wine primary, warm paper background, generous type, and photography that is treated as the hero (customer portraits and design references are the content, not decoration).

Five rules that decide every screen:

1. **One column, 430px, always.** No table layouts, no sidebars, no desktop view.
2. **One primary action per screen**, bottom-anchored, 52px tall, thumb-reachable.
3. **Numbers are typography.** Measurements use tabular numerals, large, with the unit as a quiet suffix — never inside the input.
4. **Every list has a face.** Avatar or silhouette initials; a customer list without photos must still look human.
5. **The 90-second test.** A tailor must be able to add a customer, enter 6 measurements and create a project in under 90 seconds on first use, with one hand.

### 4.2 Colour tokens

Light theme only for MVP; tokens are structured so a `dark` map can be added in V1.1 without touching components.

| Token | Hex | Use | Contrast note |
|---|---|---|---|
| `canvas` | `#FBF9F6` | App background (warm paper) | — |
| `surface` | `#FFFFFF` | Cards, sheets, inputs | — |
| `surfaceMuted` | `#F3EEE8` | Section headers, chips, skeletons | — |
| `border` | `#E8E1D9` | Card borders, dividers | — |
| `borderStrong` | `#D8CEC3` | Inputs, selected outlines | — |
| `ink` | `#14110F` | Primary text | 16.6:1 on canvas ✅ |
| `inkMuted` | `#6B625B` | Secondary text, labels | 5.6:1 ✅ |
| `inkSubtle` | `#9A9088` | Placeholders, timestamps | 3.2:1 — **non-essential text only** |
| `primary` | `#7B2D43` | Primary actions, active tab, links | 9.1:1 with white ✅ |
| `primaryPressed` | `#63202F` | Pressed state | ✅ |
| `primarySoft` | `#F7E8EC` | Primary tint backgrounds, badges | — |
| `gold` | `#C8A15A` | **Decorative only** (wordmark rule, hero accents) | 2.2:1 — never for text |
| `success` / `soft` | `#1F7A5C` / `#E8F3EE` | Completed, paid, saved | 4.9:1 ✅ |
| `warning` / `soft` | `#B4690E` / `#FBF0E2` | Due soon, trial ending | 4.6:1 ✅ |
| `danger` / `soft` | `#B3261E` / `#FCECEA` | Destructive, overdue, expired | 6.2:1 ✅ |
| `info` / `soft` | `#2F5DA8` / `#EAF0FA` | In progress, tips | 5.3:1 ✅ |
| `violet` | `#4B3FA0` | Delivered (distinct from Completed) | 6.7:1 ✅ |
| `whatsapp` | `#25D366` | WhatsApp glyph/accent | decorative |
| `whatsappDeep` | `#128C7E` | WhatsApp **button fill** (white text passes) | 4.9:1 ✅ |

Project status → colour mapping (single source of truth in `theme.ts`):

| Status | Pill fg / bg | Label |
|---|---|---|
| `pending` | `#B4690E` / `#FBF0E2` | Pending |
| `in_progress` | `#2F5DA8` / `#EAF0FA` | In progress |
| `completed` | `#1F7A5C` / `#E8F3EE` | Completed |
| `delivered` | `#4B3FA0` / `#EFEDFA` | Delivered |
| `archived` | `#6B625B` / `#F3EEE8` | Archived |
| **overdue** (derived) | `#B3261E` / `#FCECEA` | Overdue |

### 4.3 Typography, spacing, shape, motion

**Fonts** (both SIL Open Font License, self-hosted via `expo-font`):
- UI + app: **Plus Jakarta Sans** (400/500/600/700) — geometric, friendly, excellent numerals.
- Landing/marketing only: **Fraunces** (600) for the wordmark and hero, optional.
- Measurement values: same font with `fontVariant: ['tabular-nums']`, size 22–28, weight 600.

**Type scale** (size / line-height / weight):

| Token | Size | LH | Weight | Use |
|---|---|---|---|---|
| `display` | 34 | 40 | 700 | Landing hero |
| `h1` | 28 | 34 | 700 | Screen titles ("Customers") |
| `h2` | 22 | 28 | 600 | Section titles |
| `h3` | 18 | 24 | 600 | Card titles |
| `bodyLg` | 16 | 24 | 400 | Inputs, primary body |
| `body` | 15 | 22 | 400 | Default |
| `label` | 13 | 18 | 600 | Field labels, tab labels |
| `caption` | 12 | 16 | 500 | Meta, counts |
| `micro` | 11 | 14 | 600 | Pills (uppercase, +0.4 tracking) |

**Spacing** (4-point): `2, 4, 8, 12, 16, 20, 24, 32, 40, 48`. Screen gutter **16** (14 at ≤360px width), card padding **16**, section gap **24**, list-row height **72**, tab bar **64 + safe area**.

**Radius:** `xs 8` chips · `sm 10` inputs · `md 14` buttons · `lg 18` cards · `xl 24` sheets · `full 999` avatars/pills.
**Elevation:** `e0` none · `e1` `shadowOpacity .06, radius 12, y 2` · `e2` `.10, radius 20, y 8` · `e3` sheets `.18, radius 28, y -4`.
**Motion:** `fast 120ms` (press) · `base 180ms` (tab, fade) · `slow 240ms` (sheet, page). Easing `ease-out`. Press = scale `.98` + opacity `.92`. Always respect `AccessibilityInfo.isReduceMotionEnabled`.

### 4.4 The phone-shell contract (requirement #5, made exact)

Measured from the reference implementation (`tcn-ikd-transport`): `.app { max-width:430px; min-height:100dvh; margin:0 auto; padding:14px 14px 96px }` with `viewport-fit=cover, user-scalable=no`. DIOKS adopts the same numbers and adds safe-area handling.

| Rule | Value |
|---|---|
| Content max width | **430px** (never exceeded, on any device) |
| Phone (<480px) | Full-bleed, edge-to-edge; `100dvh`; horizontal padding 16 (14 at ≤360px) |
| Desktop/tablet (≥480px) | Centred frame, radius 28, 1px `#E2D9CE` border, `e2` shadow, height `min(100dvh − 48, 932)`, page backdrop `#EDE7DF` |
| Bottom padding for tab bar | `64 + safeArea.bottom + 16` (= 96 baseline) |
| Top padding | `safeArea.top + 8` on phones; header 56px tall |
| Viewport meta | `width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no` |
| Scrolling | Vertical only; `overscroll-behavior: none` on web; no horizontal `ScrollView` except image carousels |
| Keyboard | `KeyboardAvoidingView` (padding/iOS, height/Android); sticky CTA rides above the keyboard |
| Store/native | No frame; full screen with safe areas; status bar `dark` on light canvas |

```tsx
// src/components/layout/AppFrame.tsx
const MAX_W = 430;
const FRAME_RADIUS = 28;

export function AppFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width >= 480;
  return (
    <View style={[s.page, framed && s.pageDesktop]}>
      <View style={[s.app, framed && { height: Math.min(height - 48, 932) }, framed && s.frame]}>
        {children}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.canvas },
  pageDesktop: { backgroundColor: colors.backdrop, alignItems: 'center', justifyContent: 'center' },
  app: { width: '100%', maxWidth: MAX_W, flex: 1, alignSelf: 'center', backgroundColor: colors.canvas, overflow: 'hidden' },
  frame: { borderRadius: FRAME_RADIUS, borderWidth: 1, borderColor: '#E2D9CE', ...shadows.e2 },
});
```

`public/index.html` (via `npx expo customize public/index.html`) must set the viewport meta, `<link rel="manifest" href="/manifest.webmanifest">`, `body { margin:0; background:#EDE7DF; overscroll-behavior:none }`, and disable input zoom (`maximum-scale=1`).

### 4.5 Component inventory (build once, reuse everywhere)

| Component | Variants / rules |
|---|---|
| `AppFrame` | Phone shell; wraps every route (including landing) |
| `Screen` | Safe-area + scroll container + optional sticky footer CTA |
| `AppHeader` | `large` (title 28 + subtitle), `compact` (back + title 18 + actions) |
| `TabBar` | 5 items, 64px + inset, active = primary icon + label, 1.5px top border, translucent surface |
| `Button` | `primary` (wine, 52px), `secondary` (surface + border), `ghost`, `danger`, `whatsapp`; loading spinner replaces label; `disabled` at 40% |
| `IconButton` | 44×44 minimum, 2px press feedback, always has `accessibilityLabel` |
| `Field` | Label (13/600) + input + helper/error; error text `danger`; focused border 1.5px `primary` |
| `MeasurementInput` | Numeric, decimal pad, fraction chips `+¼ +½ +¾`, unit suffix, "last: 34½" ghost, tabular numerals |
| `Avatar` | Photo or initials on `primarySoft`; sizes 32/40/56/96; ring for "due" |
| `Card` | `surface`, radius 18, border `border`, padding 16, optional press state |
| `ListItem` | 72px row: avatar → title/subtitle → value/chevron |
| `StatusPill` | Uppercase micro, soft bg + solid fg from status map |
| `SegmentedTabs` | 2–4 segments, 44px, sliding underline (customer profile: Measurements / Projects / Details) |
| `SearchBar` | 48px, leading icon, clear button, debounced 250ms |
| `Sheet` | Bottom sheet, radius 24 top, grabber, `e3`, max 90% height |
| `ConfirmDialog` | Title, body, cancel + destructive/primary; used for Delivered and Delete |
| `Toast` | Bottom above tab bar, 2.5s, undo action where relevant |
| `EmptyState` | Illustration glyph + one-line reason + primary CTA |
| `Skeleton` | Shimmer blocks matching final layout (lists, detail, dashboard) |
| `OfflineBanner` | `warningSoft`, "Offline — changes will sync", persistent until online |
| `SyncChip` | Per-row `pending`/`failed` state for outbox records |
| `PhotoGrid` | 3-up, square, `expo-image` with blurhash + compression badge |
| `ReminderRow` | Type icon, customer/project, due date, WhatsApp nudge button |
| `PaywallCard` | Plan, price, trial state, renew CTA, "your data is safe" reassurance |

### 4.6 Interaction patterns (non-negotiable behaviours)

**Navigation.** Five tabs: **Home · Customers · Projects · Due · Settings**. Create flows (`new customer`, `new project`, `new measurement`) open as **modals**, never tabs. Every modal has a close affordance and an unsaved-changes guard. Max depth: tab → detail → edit (3). Back returns to the previous scroll position.

**Status machine** (enforced identically in UI and DB trigger):

```
pending → in_progress → completed → delivered → archived
completed → in_progress        (allowed: rework)
delivered → archived           (only after confirmation + reminder)
```

- `Completed` and `Delivered` are **separate actions**; never a single "Done" button.
- **Mark delivered** → `ConfirmDialog`: "Mark as delivered? This does not archive the job." → on confirm, set `delivered`, then toast **"Delivered. Archive when you've handed it over."** with an `Archive` action. Archiving is always manual (PRD §8.4).
- Archiving requires a second confirmation; archived jobs stay reachable under the customer profile's Archived tab.

**Measurement entry — the hero screen.** This screen decides adoption, so it is specified fully:

1. Header: customer name + avatar, "Measurement v3", unit toggle `in | cm`.
2. Progress `12 of 18 filled`; fields grouped (Upper body / Lower body / Lengths / Custom).
3. Each row: label, `MeasurementInput` with decimal keypad, fraction chips, and a grey ghost of the last recorded value — tapping the ghost fills it ("same as last time").
4. Sticky footer: **Save new version** (primary) + **Save draft** (ghost). Drafts persist locally.
5. Saving creates a **new version** (`version_number + 1`, `is_current = true`, previous flipped false) — never an in-place overwrite. Toast: "Saved as v3 · v2 kept in history".
6. History: version list (date, count of changed fields) → **Compare** shows old vs new with deltas (`Waist 32 → 34 (+2)`); "revert to v2" creates a *new* version from old values — never destructive.
7. Empty state: "No measurements yet" + **Use standard template**.

**Forms.** One column, 16px gaps, label above input, helper text where unit/format matters. Validate on blur, not per keystroke. Errors inline in `danger`, announced via `accessibilityLiveRegion`. Sticky primary CTA, disabled until required fields are valid; on failure scroll to the first invalid field. Auto-save drafts on measurement and project forms.

**WhatsApp actions.** One reusable `openWhatsApp(phoneE164, template)`; templates are user-editable in Settings. Defaults: `fitting_ready`, `order_completed`, `delivery_reminder`, `birthday`, `anniversary`, `payment_reminder`. Always show a preview sheet first — once WhatsApp opens, the user sends it and it cannot be recalled.

**Search.** Debounced 250ms across name + normalised phone + project name; recent searches local; no results → "Add '<query>' as a customer".

**Offline.** Banner below the header, queued rows show `SyncChip`, measurement forms work fully offline with local drafts. Never block the UI on the network; never spin for >400ms without a skeleton.

**Paywall (expired).** Full-height, non-dismissible on any create/edit route: "Your subscription ended on 12 Nov 2026. Your records are safe and untouched." → **Renew** (primary) / **View records (read-only)** (secondary). Read-only mode hides all create/edit controls. UX only — the database enforces it (G-02).

### 4.7 Accessibility and text scaling

| Requirement | Rule |
|---|---|
| Touch targets | ≥44×44 (iOS) / 48×48 (Android); tab items 64px tall |
| Contrast | Body ≥4.5:1, large text ≥3:1 — palette pre-checked |
| Dynamic type | Layout survives 130% scaling; no fixed-height text containers; 2-line labels allowed |
| Labels | Every input has a visible label; every icon-only control has `accessibilityLabel` |
| Focus order | Logical top-to-bottom; modals trap focus and restore it on close |
| Motion | Honour reduce-motion; nothing longer than 240ms |
| Colour as signal | Status is never colour-only — pills always include text |
| Errors | Announced via live region and physically adjacent to the field |

---

## 5. INFORMATION ARCHITECTURE — EVERY SCREEN

### 5.1 Route map (Expo Router file structure)

```
src/app/
  _layout.tsx                      # providers: SafeArea, QueryClient, Theme, Auth, Toast
  index.tsx                        # boot redirect: session? onboarding? subscription?
  (public)/
    index.tsx                      # LANDING (marketing, inside the phone shell)
    pricing.tsx  legal/[doc].tsx   # privacy | terms | data-policy
  (auth)/
    login.tsx  register.tsx  forgot-password.tsx  reset-password.tsx  verify-email.tsx
  (onboarding)/
    welcome.tsx  business.tsx  unit-and-template.tsx  referral.tsx  done.tsx
  (app)/
    _layout.tsx                    # auth + onboarding + subscription guards + TabBar
    (tabs)/
      index.tsx                    # HOME dashboard
      customers.tsx  projects.tsx  due.tsx  settings.tsx
    customers/
      new.tsx  [id]/index.tsx  [id]/edit.tsx
      [id]/measurements/index.tsx  new.tsx  compare.tsx
      [id]/projects/new.tsx
    projects/
      [id]/index.tsx  [id]/edit.tsx  [id]/attachments.tsx
    templates/
      index.tsx  [id].tsx
    settings/
      business.tsx  preferences.tsx  whatsapp-templates.tsx
      subscription.tsx  referral.tsx  export.tsx  danger.tsx
    trash.tsx  paywall.tsx  archived.tsx
  (admin)/
    _layout.tsx  index.tsx  users.tsx  subscriptions.tsx
```

**Guards (`(app)/_layout.tsx`):** no session → `/(auth)/login`; session without `business_profile` → `/(onboarding)/welcome`; subscription `expired` → `/paywall` (read-only routes excepted); a `platform_admins` row shows the admin entry. Guards are convenience only — Postgres remains the authority.

### 5.2 Screen inventory (44 screens)

Columns: **P** = phase where it is built in the mock build · **States** = required variants.

| # | Screen | Route | P | Key content & actions | States |
|---|---|---|---|---|---|
| 1 | **Landing** | `/(public)` | 2 | Phone-shell hero: wordmark, "Your measurement book can't get lost", 3 benefits, scroll strip of 3 app screenshots, WhatsApp/demo CTA, "Free for 14 days", install hint, footer links | default, installed-PWA, reduced-motion |
| 2 | Pricing | `/(public)/pricing` | 2 | One plan card, ₦/month, 8 inclusion bullets, trial explanation, 4 FAQs, CTA to register | default |
| 3 | Legal | `/(public)/legal/[doc]` | 9 | Privacy, terms, data policy (NDPR-aligned) | loading, default |
| 4 | **Login** | `/(auth)/login` | 2 | Email, password (show/hide), **Sign in**, Forgot password, "New here? Create account" | idle, invalid, loading, wrong-creds, locked-out |
| 5 | **Register** | `/(auth)/register` | 2 | Name, email, password + strength, consent checkbox, optional referral code, **Create account** | idle, weak-password, email-taken, loading, consent-required |
| 6 | Forgot password | `/(auth)/forgot-password` | 2 | Email → "Check your inbox" | idle, sent, rate-limited |
| 7 | Reset password | `/(auth)/reset-password` | 2 | New + confirm password; handles deep-link token | valid-token, expired-token, success |
| 8 | Verify email | `/(auth)/verify-email` | 2 | Instruction, resend (60s cooldown) | waiting, resent, verified |
| 9 | Onboarding welcome | `/(onboarding)/welcome` | 3 | 3-slide value carousel, skip | default |
| 10 | **Business profile** | `/(onboarding)/business` | 3 | Brand name*, WhatsApp*, phone, email, logo (compress preview), address, socials, registration info (optional) | idle, uploading, error, saved |
| 11 | Units & template | `/(onboarding)/unit-and-template` | 3 | `inches`/`cm`, starter template (Women / Men / Children / Blank), 6-field preview | default |
| 12 | Referral | `/(onboarding)/referral` | 3 | "Were you invited?" code (validated live) or show own code | valid, invalid, skipped |
| 13 | Done / tour | `/(onboarding)/done` | 3 | "You're set" + 3 coach marks pointing at tabs | default |
| 14 | **Home dashboard** | `/(app)/(tabs)` | 3 | Greeting + avatar; trial banner; 4 stat tiles; **Due today** (3); **Celebrations this week**; recent customers; primary CTA "New customer" | loading skeleton, first-run empty, populated, offline, trial-ending, expired-banner |
| 15 | **Customers** | `/(app)/(tabs)/customers` | 4 | Search, A–Z sections, 72px rows (avatar, name, phone, active jobs) | loading, empty, no-results, populated, 500+ rows |
| 16 | **Projects** | `/(app)/(tabs)/projects` | 5 | Segmented filters (Active / Completed / Delivered / Archived), sorted by expected delivery, overdue highlighted | loading, empty per filter, populated |
| 17 | **Due** | `/(app)/(tabs)/due` | 8 | Overdue / Today / This week; deliveries, follow-ups, celebrations; 1-tap WhatsApp nudge | loading, all-clear, notifications-denied, populated |
| 18 | Settings hub | `/(app)/(tabs)/settings` | 7 | Business card, section list, subscription pill, version, sign out | default, expired |
| 19 | **New customer** | `/(app)/customers/new` | 4 | Name*, phone* (E.164 preview), WhatsApp, email, gender, birthday, anniversary, photo, notes; "Add measurements next" toggle | idle, duplicate-phone warning, saving, offline-queued |
| 20 | **Customer profile** | `/(app)/customers/[id]` | 4 | Photo, name, phone, WhatsApp + call buttons; action pills (New job, Measure, Edit); SegmentedTabs: **Measurements / Projects / Details** | loading, no-measurements, no-projects, deleted (restore) |
| 21 | Edit customer | `/(app)/customers/[id]/edit` | 4 | Prefilled form; Delete (soft) at the bottom in `danger` | idle, saving, confirm-delete |
| 22 | Measurements history | `/(app)/customers/[id]/measurements` | 4 | Current version card (grouped values), version list with dates, Compare, New measurement | loading, empty, single-version |
| 23 | **Measurement entry** | `/(app)/customers/[id]/measurements/new` | 4 | Grouped fields, fraction chips, ghost last-values, progress, unit toggle, sticky save | idle, draft-restored, invalid, saving, offline-queued |
| 24 | Compare versions | `/(app)/customers/[id]/measurements/compare` | 6 | Old vs new columns, deltas with arrows, changed-only filter, revert | no-differences, many-changes |
| 25 | **New project** | `/(app)/customers/[id]/projects/new` | 5 | Name*, linked measurement version, expected delivery* (date picker), job description, instructions, notes, photos (compress), status defaults `pending` | idle, no-measurement-linked warning, saving |
| 26 | **Project detail** | `/(app)/projects/[id]` | 5 | Status pill + timeline, dates (received / expected / collection), customer strip with WhatsApp, measurements summary (tap → full), description, notes, attachments grid, primary action that matches current status | loading, overdue, completed, delivered, archived |
| 27 | Edit project | `/(app)/projects/[id]/edit` | 5 | Prefilled; cannot change customer; delete (soft) | idle, saving |
| 28 | Status transition sheet | `/(app)/projects/[id]` (sheet) | 5 | Contextual next-step buttons + confirmation for Delivered + archive reminder | idle, confirming, success |
| 29 | Attachments | `/(app)/projects/[id]/attachments` | 5 | Grid + add (camera / library / file), caption, save-from-WhatsApp screenshot, delete one | empty, uploading, failed-retry |
| 30 | Archived projects | `/(app)/archived` | 5 | Archived only, grouped by year, search, "reopen" (admin-free, user action) | empty, populated |
| 31 | Templates list | `/(app)/templates` | 6 | Standard + custom templates, field counts, default badge, duplicate | empty, populated |
| 32 | **Template editor** | `/(app)/templates/[id]` | 6 | Reorder (drag), rename, add field (label/group/type/unit/required), delete with warning if measurements exist, live preview | dirty, validation-error, saving |
| 33 | Business profile (settings) | `/(app)/settings/business` | 7 | Same fields as onboarding + logo replace | idle, saving |
| 34 | Preferences | `/(app)/settings/preferences` | 7 | Units, default template, notification permission + time-of-day for reminders, theme (light only, disabled) | default, permission-denied |
| 35 | WhatsApp templates | `/(app)/settings/whatsapp-templates` | 7 | List of 6 templates, edit message with `{{name}} {{project}} {{date}}` tokens, preview | default, saved |
| 36 | Subscription | `/(app)/settings/subscription` | 7 → 13 | Plan, status, trial days left, renewal date, history, **Renew**, restore purchase note | trialing, active, expired, cancelled, processing, failed |
| 37 | Referral | `/(app)/settings/referral` | 7 → 13B | Own code, copy, share via WhatsApp, friends joined, credit balance, "how it works" | default, no-referrals, credit-available |
| 38 | Export data | `/(app)/settings/export` | 7 → 15 | Choose scope (all / one customer), format (CSV / JSON), "we'll email a link" | idle, preparing, ready, failed |
| 39 | Danger zone | `/(app)/settings/danger` | 7 → 15 | Sign out everywhere, delete account (typed confirmation), purge deleted now | idle, confirm, done |
| 40 | Recently deleted | `/(app)/trash` | 7 | 30-day list with days-left countdown, restore, delete now | empty, populated, expiring |
| 41 | **Paywall** | `/(app)/paywall` | 7 | Expired state, plan summary, renew, "view records read-only", reassurance copy | expired, processing, success |
| 42 | Admin overview | `/(admin)` | 14 | Counts (users, active subs, trials ending 7d, MRR), 30-day signup sparkline, recent payments table (no PII) | loading, empty |
| 43 | Admin users | `/(admin)/users` | 14 | Search by business name/email, status, trial end, last active, suspend/unsuspend (with reason) | loading, filtered, suspended |
| 44 | Admin subscriptions | `/(admin)/subscriptions` | 14 | Payments list, webhook failures, retry verify, plan config | loading, failed-events |

---

## 6. MOCK-DATA-FIRST ARCHITECTURE (why Phase 10 is a swap, not a rewrite)

### 6.1 The rule

**Screens never import Supabase. Screens use hooks. Hooks use a repository interface. The repository is chosen by one environment variable.** When the client signs off, `EXPO_PUBLIC_DATA_SOURCE` flips from `mock` to `supabase` and the screens remain untouched.

```
Screen  →  hook (useCustomers)  →  Repository interface  →  mockRepo  |  supabaseRepo
                                                              ↑ build now    ↑ build in P10–P13
```

```ts
// src/data/index.ts
export const repo: Repository =
  process.env.EXPO_PUBLIC_DATA_SOURCE === 'supabase' ? supabaseRepo : mockRepo;
```

### 6.2 Domain types (mirrored by the DB in P10)

```ts
export type Unit = 'inches' | 'cm';
export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'delivered' | 'archived';

export interface Customer {
  id: string; businessId: string;
  fullName: string; phoneE164: string; whatsappE164?: string; email?: string;
  photoUrl?: string; gender?: 'female' | 'male' | 'other';
  birthday?: string; anniversary?: string; notes?: string;
  deletedAt?: string; createdAt: string; updatedAt: string;
}

export interface TemplateField {
  id: string; label: string;
  group: 'upper' | 'lower' | 'length' | 'custom';
  type: 'number' | 'text'; unit?: Unit; required?: boolean; hint?: string;
}
export interface Template { id: string; businessId: string; name: string; isDefault: boolean; fields: TemplateField[] }

export interface Measurement {
  id: string; customerId: string; version: number;
  data: Record<string, number | string | null>;   // keyed by TemplateField.id
  unit: Unit; isCurrent: boolean; notes?: string; recordedAt: string;
}

export interface Attachment {
  id: string; kind: 'photo' | 'reference' | 'wa_screenshot' | 'voice';
  url: string; caption?: string; width?: number; height?: number; sort: number;
}
export interface Project {
  id: string; customerId: string; name: string; measurementId?: string;
  status: ProjectStatus;
  orderReceivedAt: string; expectedDeliveryAt: string; collectedAt?: string;
  description?: string; instructions?: string; notes?: string;
  attachments: Attachment[]; createdAt: string; updatedAt: string;
}

export interface Subscription {
  status: 'trialing' | 'active' | 'expired' | 'cancelled';
  planName: string; trialEndsAt: string; currentPeriodEnd?: string;
}
```

### 6.3 Repository interface (the contract both implementations satisfy)

```ts
export interface Repository {
  auth: {
    signIn(email: string, password: string): Promise<void>;
    signUp(input: { fullName: string; email: string; password: string; referralCode?: string }): Promise<void>;
    signOut(): Promise<void>;
    requestPasswordReset(email: string): Promise<void>;
  };
  business: { get(): Promise<BusinessProfile>; save(patch: Partial<BusinessProfile>): Promise<void> };
  customers: {
    list(query?: string): Promise<Customer[]>;
    get(id: string): Promise<Customer>;
    create(input: NewCustomer): Promise<Customer>;
    update(id: string, patch: Partial<Customer>): Promise<void>;
    softDelete(id: string): Promise<void>;
    restore(id: string): Promise<void>;
    listDeleted(): Promise<Customer[]>;
  };
  measurements: {
    listVersions(customerId: string): Promise<Measurement[]>;
    saveVersion(input: { customerId: string; data: Measurement['data']; unit: Unit }): Promise<Measurement>;
    setCurrent(customerId: string, measurementId: string): Promise<void>;
  };
  templates: { list(): Promise<Template[]>; save(t: Template): Promise<void>; remove(id: string): Promise<void> };
  projects: {
    list(filter: 'active' | 'completed' | 'delivered' | 'archived' | 'all'): Promise<Project[]>;
    byCustomer(customerId: string): Promise<Project[]>;
    get(id: string): Promise<Project>;
    create(input: NewProject): Promise<Project>;
    update(id: string, patch: Partial<Project>): Promise<void>;
    setStatus(id: string, status: ProjectStatus): Promise<void>;
  };
  reminders: { due(from: string, to: string): Promise<Reminder[]> };
  subscription: { get(): Promise<Subscription>; startCheckout(): Promise<{ url: string }> };
}

// Input aliases used by the interface above
type NewCustomer = Omit<Customer, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;
type NewProject = Omit<Project, 'id' | 'attachments' | 'createdAt' | 'updatedAt'> & { attachmentIds?: string[] };
type BusinessProfile = {
  id: string; businessName: string; logoUrl?: string; phoneNumber?: string;
  whatsappNumber: string; email?: string; address?: string;
  socialMedia: { instagram?: string; facebook?: string; tiktok?: string };
  registrationInfo?: string; preferredUnit: Unit; referralCode: string; timezone: string;
};
type Reminder = {
  id: string; kind: 'delivery' | 'follow_up' | 'birthday' | 'anniversary';
  customerId: string; customerName: string; projectId?: string; projectName?: string;
  dueOn: string; daysUntil: number; phoneE164: string;
};
```

**Why not MSW / fetch mocking?** With React Native + native builds, request interception is brittle. A typed repository is simpler, type-safe, and becomes the *real* implementation's shape — so Phase 10 is genuinely a swap.

### 6.4 Mock behaviours that make the demo believable

| Behaviour | Implementation |
|---|---|
| Latency | 350–700ms artificial delay on every read/write, so skeletons and spinners are designed rather than discovered later |
| Failure injection | Dev menu toggle: every 6th mutation rejects with a friendly error → exercises error + retry states |
| Persistence | Mock DB hydrated from `src/data/mock/seed.ts`, persisted to AsyncStorage; "Reset demo data" in the dev menu |
| Offline mode | Dev toggle simulates offline → banner, queued mutations, sync chips |
| Subscription states | 3 demo accounts: trialing (9 days left), expired, brand-new/empty |
| Time travel | Dev menu shifts "today" +30 days → tests overdue/reminders without waiting |
| Images | 12 bundled placeholder portraits (~40 KB each) + 6 design-reference images |

**Demo dataset `DEMO-B1` — "Adaeze Couture", Lagos:** 12 customers, 18 projects (3 pending, 4 in progress, 3 completed, 3 delivered, 5 archived, 1 overdue), 2 customers with 2 measurement versions each, "Women — Standard" template with 18 fields, 3 items due today, 2 birthdays this week, 1 anniversary.

**Client demo script (≈6 minutes, entirely mock):** landing → install hint → register → business profile with logo → pick template → populated dashboard → open a customer → enter measurements with fraction chips → save v2 → compare v1 vs v2 → create project → mark completed → mark delivered (confirmation) → archive reminder → Due tab → WhatsApp preview → settings → referral card → paywall (expired account) → back to the populated account.

---

## 7. PHASED BUILD & TEST PLAN

### 7.0 Rules that make the phases work

1. **No phase starts before the previous phase's test gate passes.** A phase is "done" only when its exit checklist is green (see §8.3).
2. **Every phase ends with a deployed preview URL** (Vercel) the client can open on a real phone. Mock data, real device.
3. **Design freeze at P9.** After sign-off, UI changes go through a change note (scope + estimate), not silently into the next sprint.
4. **Backend is built twice on purpose:** once as mock (P0–P9) and once against Postgres (P10+). The repository interface is the contract that makes the second build cheap.
5. **Every write path is tested with two accounts** from P11 onward (isolation), and with an expired subscription from P13.
6. **Estimates assume one full-time developer.** Add ~15% for client feedback loops; parallelise design review with build where possible.
7. **Tick the plan, not your memory.** Phase status lives in the `Status` column of §7.1, and every session appends to §7.0b. The commit that passes a gate flips `⬜` → `✅` — or `◐` when a caveat remains, with the caveat written out. Do not mark `✅` while a gate item is unmet; list the gap instead.

### 7.0a Scope lock — 14 November 2026

The client approved **every** deferral in `DIOKS_Tailors_MVP_Scope_Deferrals_and_V1.1.md` (33 rows: 26 deferred, 7 dropped) and left all unanswered decisions at their recommended defaults. Consequences for this plan:

- **P13B (referral credits) is descoped** from the MVP baseline — it returns in V1.1 only if funded. Baseline stays **70 working days**.
- **D-21** adds the consent columns + `wish_log` to P10 (+0.5 day) — absorbed inside P10's 5-day allowance, so the baseline does not move.
- **No feature will be added** to the MVP without a written `R` instruction against a register ID; anything raised in review is logged as V1.1 candidate instead.
- **Only D-03 (price) is still open** — a placeholder of ₦2,500/month is used in copy; the real figure is needed before P13, and it blocks nothing before that.

### 7.0b Build log — what is actually done (newest first)

One entry per working session. Facts only: what shipped, what was verified, what the next session should pick up. **Updated in the same commit that changes a gate.**

#### 2026-11-16 (session 3) · P4 screens 15, 19, 20 — customers list, new customer, profile

**Shipped / verified**

- **Customers list** (`(tabs)/customers.tsx`) rewritten on `SectionList` (virtualised for 500+ rows): sticky A–Z letter headers (`#` last, for names starting with a digit/symbol), 250 ms debounced search, 72px rows with avatar + name + local-format phone + "2 active jobs" badge, and all four states — skeleton list, error with retry, empty book, no-matches ("Add as a customer").
- **New customer** (`(app)/customers/new.tsx`, `presentation: 'modal'`): name*, phone* with live `Saves as +234…` preview, WhatsApp, email, gender chips, birthday, anniversary, notes, photo (picked + compressed to 512px via `lib/image.ts`), duplicate-number warning (G-16) instead of a block, sticky save footer, zod validation on blur, then toast → profile.
- **Customer profile** (`(app)/customers/[id].tsx`): identity, WhatsApp/Call deep links, `SegmentedTabs` (Measurements · Projects · Details) with counts, current version rendered **in template field order** and formatted by `lib/units.ts` (`32 1/2"`), version history, projects with `StatusPill`, details. Read-only: no action is shown before its route exists.
- **Bug fixed in the mock repository:** `customers.list()` returned *every* customer for any text query — `phone.replace(/\D/g,'').includes('')` is always true. Extracted `src/lib/search.ts` (`matchesCustomerQuery`) with 5 tests; it also normalises local form (`0803…`) against stored E.164 (`+234803…`), and falls back to the WhatsApp number.
- New pure modules + tests: `lib/search.ts`, `features/customers/list.ts` (sections, active-job counts, count/label copy), `features/projects/queries.ts`.
- `npm run typecheck` clean · `npm test` 84/84 (was 73) · `npm run build:web` exports · five screenshots verified at 430×932 (list, no-results, new-customer form, profile measurements, profile projects).

**Remaining in P4:** `[id]/edit` (prefilled form + soft delete via `ConfirmDialog` + restore from the deleted list), `[id]/measurements` (version list is already on the profile — needs its own screen when compare arrives in P6) and the **hero entry screen** `[id]/measurements/new` (grouped fields, fraction chips, ghost last-values, progress, unit toggle, sticky save, drafts). The profile shows no edit/measure actions until those routes exist.

#### 2026-11-16 (session 2) · P4 foundations — units, schemas, data hooks, UI primitives

**Shipped / verified**

- **`src/lib/units.ts`** + 17 tests: inches↔cm (`2.54`), eighth-inch rounding, fraction reduce/format (`32.5 → 32 1/2`), `parseMeasurement` for `32`, `32,5`, `32 1/2`, `32-1/2`, `32½`, `1/2`, `81 cm`, `32"` (rejects `321/2`), body-plausible bounds (0.5–120 in / 1–300 cm), compare deltas.
- **Validation (first use of `zod`, already a dependency):** `src/lib/forms.ts` (`FieldErrors`, `zodFieldErrors`, `firstErrorField`), `features/customers/validation.ts` (customer form → `NewCustomer`, E.164 normalisation, duplicate-phone guard, past-date rules), `features/measurements/validation.ts` (per-field parse/range, `filled of total`, required-missing count, draft ↔ unit conversion, `changedFieldIds`, `draftFromValues`). 27 tests.
- **Data hooks** (`screen → hook → repository`, ending the direct `repo.*` calls): `src/data/queryKeys.ts` + `features/customers/queries.ts` (list/detail/deleted/create/update/softDelete/restore/customerProjects) and `features/measurements/queries.ts` (versions/current/saveVersion/setCurrent/templates), with scoped invalidation.
- **Six UI primitives:** `Skeleton` (+ `SkeletonText`, `SkeletonRow`, `SkeletonList`), `Toast` (+ `ToastProvider` wired in `src/app/_layout.tsx`, action slot, live region), `SegmentedTabs` (44px, `role="tablist"`), `SearchField` (+ `useDebouncedValue` for the 250 ms search), `EmptyState`, `Sheet` + `ConfirmDialog`. Three new SVG icons (`Search`, `Close`, `Check`) — the icon set stays ~3 KB.
- **`vitest.config.ts`** adds the `@/*` → `src/*` alias so tests import the same specifiers as app code.
- Component gallery extended with all of the above, including a working toast and sheet.
- `npm run typecheck` clean · `npm test` 73/73 (was 29) · `npm run build:web` exports · visually verified in Chrome at 430×932 with 2× screenshots (skeleton, segmented tabs, search, empty/error states, toast, sheet).

**Fixed during review:** `SegmentedTabs` clipped its count (`Measurements · …`) — the same `numberOfLines` + flex-shrink trap as the tab bar. The count is now a separate caption node and the segment padding is tighter.

**Next session — start here.** The six P4 routes (§5 screens 15, 19–24), in dependency order: upgrade `(tabs)/customers` (A–Z sections, debounced search, active-job counts, loading/empty/no-results/error) → `(app)/customers/new` (modal, `Sheet`/stack `presentation: 'modal'`) → `(app)/customers/[id]` profile with `SegmentedTabs` → `[id]/edit` (soft delete + `ConfirmDialog`) → `[id]/measurements` (version list) → `[id]/measurements/new` (hero screen: grouped fields, fraction chips, ghosts, progress, unit toggle, sticky save, drafts). Compare screen stays in P6. Run `npm start` once after adding routes so `.expo/types/router.d.ts` regenerates before `npm run typecheck`.

#### 2026-11-16 · P0–P3 audited against their gates; tab-bar label clipping fixed

**Shipped / verified**

- Expo SDK 58 app in `app/`, TypeScript strict, `@/*` alias, SPA output (`web.output: "single"`), PWA manifest, `_redirects`, `vercel.json`.
- Design tokens (`src/theme/tokens.ts`), `AppFrame` (430px contract), `Screen`, component gallery at `/dev/gallery`.
- Landing (`(public)/index`); auth (`(auth)` login · register · forgot · reset, 3 mock accounts); onboarding (`(onboarding)` welcome → business → unit/template → referral → done); 5-tab shell + dashboard and read-only Customers/Projects/Due tabs. 20 screen files.
- Mock repository (`src/data/mock/mockRepository.ts` — AsyncStorage, 350–700 ms latency, expiry gate) implements the **entire** `Repository` interface: customers CRUD + `softDelete` / `restore` / `listDeleted`, `measurements.saveVersion` / `setCurrent`, projects, templates, reminders, subscription. The 18 women's/men's measurement fields already exist in `src/data/templates.ts`.
- **Fixed:** tab-bar labels were clipped on web. `Label` renders `<Text numberOfLines={1}>` → RNW sets `overflow: hidden`, and that text is a *shrinkable* flex child; the 64px bar's padding stack left 37px for 28px of icon slot + ~14px of line box, so the label shrank to 9px and lost its baseline. Padding trimmed in `(app)/(tabs)/_layout.tsx` (4/4 instead of 6/6, item padding removed). Verified by CDP geometry + 3× screenshots: 13px label box at 360×780, 430×932 and 1440×900.
- `npm run typecheck` clean · `npm test` 29/29 (date, phone, auth validation) · `npm run build:web` exports to `dist/`.

**Known gaps — do not assume these exist**

- **No CI.** `.github/` is absent and `eslint` is not installed, although `npm run lint` is scripted. No Vercel link, no preview URL. iOS/Android have never been booted on a device.
- **11 of the 24 P1 components.** Missing: `Skeleton`, `Sheet`/`ConfirmDialog`, `Toast`, `SegmentedTabs`, `SearchField`, `EmptyState`.
- `zod` is a dependency but **never imported**; there is no `src/lib/units.ts` (in↔cm, fractions).
- **No hooks layer:** screens call `repo.*` directly inside `useFocusEffect`, which breaks `screen → hook → repository`. The react-query provider exists and is unused.
- No `@testing-library/react-native`, no `@shopify/flash-list`, no Playwright.
- Landing has **no pricing block**; there is **no email-verification screen** (deferred to P11).
- `.tmp-shots/` is an untracked scratch harness (CDP screenshots, `measure-tabs.js` geometry probe).

**Next session — start here.** P4 foundations, in this order: `src/lib/units.ts` + tests → zod schemas for customer/measurement → `src/features/customers/queries.ts` (react-query over `Repository`) → the missing UI primitives → then the six P4 routes (§7.2 P4; §5 screens 15, 19–24). Remember the typed-routes gotcha: run `npm start` once after adding a route file, or `npm run typecheck` flags valid paths.

### 7.1 Overview

| Phase | Name | Days | Gate (exit criteria) | Status |
|---|---|---|---|---|
| P0 | Foundation & repo | 2 | App runs on web + iOS + Android; CI (typecheck, lint, test) green; preview URL auto-deploys on push | ◐ web ✅ · **no CI** (`.github/` absent, `eslint` not installed) · no preview URL · native never booted |
| P1 | Design system & shell | 3 | `theme.ts`, 24 shared components, `AppFrame`, component gallery route; 430px contract verified on 5 viewports | ◐ tokens · `AppFrame` · gallery ✅ · **11 of 24 components** · 430px verified at 360 / 430 / 1440 |
| P2 | Landing + auth (mock) | 4 | Landing, pricing, login, register, forgot/reset, verify — all navigable, no dead ends | ◐ landing + 4 auth screens ✅ · **no pricing block** · **no verify screen** (P11) |
| P3 | Onboarding + dashboard | 4 | New user reaches a populated demo dashboard in <60s; skeleton/empty/populated states | ◐ onboarding + dashboard ✅ · empty/populated ✅ · **no skeleton loading states** |
| P4 | Customers + measurements | 6 | Create/read/update/soft-delete customer; 18-field measurement entry; version history with persistence | ◐ screens 15 · 19 · 20 done (list, new, profile) · **edit + measurement entry next** |
| P5 | Projects + status flow | 5 | Full status machine with confirmations; attachments; archive; overdue derivation | ⬜ not started |
| P6 | Templates + compare | 4 | Editor with reorder/rename/add/delete + validation; compare with deltas and revert | ⬜ not started |
| P7 | Settings, paywall, referral UI | 4 | Subscription/expiry/referral/export/trash/danger screens with mock states | ⬜ not started |
| P8 | Due engine + WhatsApp + notifications | 3 | Due list correct across time-travel; WhatsApp preview + deep link; local notification scheduled | ⬜ not started |
| P9 | **Polish + DEMO + client sign-off** | 3 | All 44 screens reviewed on iPhone + Android; **written sign-off** recorded; design freeze | ⬜ not started |
| P10 | Supabase foundation & hardened schema | 5 | Migrations applied; RLS negative tests pass; buckets + policies; seed data; ERD matches §9 | ⬜ not started |
| P11 | Auth + real data wiring | 5 | Real signup/login/reset on web + native; onboarding writes business_profile; CRUD on all entities | ⬜ not started |
| P12 | Storage, images, offline outbox | 4 | Photos ≤120 KB, private access via signed URLs; offline create/sync with no duplicates | ⬜ not started |
| P13 | Payments + subscription enforcement | 5 | Paystack test-mode end-to-end; expired account blocked **at DB level**; renewal restores access | ⬜ not started |
| P13B | *Descoped:* referral credits | 3 | **Removed from the MVP baseline on 14 Nov 2026** — returns in V1.1 only if funded | ⬜ descoped |
| P14 | Admin console | 3 | Metrics correct; admin has zero PII access (proven by test) | ⬜ not started |
| P15 | Export, retention, analytics, QA | 5 | Export + purge + events; full QA matrix; a11y & perf budgets met | ⬜ not started |
| P16 | PWA release + store packaging + pilot | 5 | Live PWA on domain; EAS builds; store submissions; 3 pilot tailors onboarded | ⬜ not started |

**Legend:** ✅ gate met and proven · ◐ built, gate has the listed gap · ⬜ not started. **No phase is `✅` yet** — P0–P3 are functionally built and the gaps above are the remainder. Update this table and §7.0b in the same commit that closes a gap.

**Total:** ≈ **70 working days** to pilot (~14 weeks at 5 days/week, plus review buffer), **73** if the optional referral-credit phase (P13B) is funded. Of that, **P0–P9 = 38 working days (~7.5 weeks)** is the mock front end you want to see and approve first; backend, payments, QA and release are the remaining 32.

### 7.2 Detailed phases — build and test per phase

#### FRONT END (mock data) — ends with client sign-off

**P0 · Foundation & repo — 2 days**
- *Build:* `create-expo-app` (TypeScript, expo-router), folders (`src/app`, `src/components`, `src/features`, `src/data`, `src/lib`, `src/theme`), strict tsconfig, ESLint/Prettier, jest + RNTL + Vitest configs, `.env.example` (`EXPO_PUBLIC_DATA_SOURCE=mock`), Vercel project + SPA rewrite, `public/index.html` + `manifest.webmanifest` + icons, git repo with conventional commits.
- *Test:* `npm run typecheck && npm run lint && npm test` green in CI; `expo start` opens web at 430px; Android/iOS simulators boot; Vercel preview renders.
- *Exit:* pipeline green; a phone can load the preview URL.

**P1 · Design system & shell — 3 days**
- *Build:* `theme.ts` (colors, type, spacing, radius, shadows, motion), fonts via `expo-font`, `AppFrame`/`Screen`/`AppHeader`/`TabBar`, the 24 shared components (§4.5), `/dev/gallery` route showing every variant, icon set (Lucide via `react-native-svg`).
- *Test:* gallery verified at 320, 360, 390, 430, 768, 1280 widths; no horizontal overflow; contrast assertions on token pairs; 44px targets asserted in component tests; text scaling at 130% on iOS simulator.
- *Exit:* gallery approved internally; shell numbers match §4.4 exactly.

**P2 · Landing + auth screens (mock) — 4 days**
- *Build:* landing (hero, benefits, screenshot strip, install hint, footer), pricing, legal skeletons, login, register (+ consent + referral field), forgot/reset, verify email; mock auth with three demo accounts; form validation + error states; password strength meter.
- *Test:* RNTL tests for validation rules; Playwright smoke on all 6 routes; manual keyboard open/close, autofill, wrong password, expired token.
- *Exit:* a stranger can land → register → reach onboarding with no dead end; every state demoable.

**P3 · Onboarding + dashboard — 4 days**
- *Build:* welcome carousel, business profile (logo compression preview), units + starter template, referral step, done/tour; home dashboard (stats, due today, celebrations, recent customers, trial banner); first-run empty states; guard routing.
- *Test:* unit tests for trial-day maths; component tests for logo compression (mocked manipulator); reset-to-new-user flow; Playwright register → dashboard.
- *Exit:* new user → populated dashboard in <60s; empty state is presentable.

**P4 · Customers + measurements — 6 days**
- *Build:* customers list (sections, search, 500-row perf), new/edit customer, E.164 normaliser, duplicate warning, profile with segmented tabs, measurements history, measurement entry (§4.6) with fraction chips, ghost values, progress, drafts, save-as-version; soft delete + restore.
- *Test:* Vitest for phone normaliser, unit conversion (in↔cm, fractions), draft merge; RNTL for the measurement form; perf: 500-customer scroll on FlashList; Playwright: create customer → save measurements → reload persists.
- *Exit:* measurement entry works one-handed on a real phone; versions persist across reloads; delete/restore works.

**P5 · Projects + status flow — 5 days**
- *Build:* projects tab with filters, new project (measurement linking, date pickers), project detail, edit, status transition sheet with the full state machine, Delivered confirmation + archive reminder, archive screen, attachments grid (camera/library), overdue derivation.
- *Test:* Vitest for the status machine (all legal/illegal transitions), overdue/soon classifiers, date formatting; RNTL for confirmation dialogs; Playwright: create → complete → deliver → archive including the reminder toast.
- *Exit:* nothing can reach `archived` without passing `delivered` + confirmation; illegal transitions impossible in the UI.

**P6 · Templates + version comparison — 4 days**
- *Build:* templates list, editor (add / rename / reorder by drag / delete), field validation, delete warning when measurements exist, live preview, compare screen with deltas and "revert as new version".
- *Test:* zod schema unit tests (`TemplateV1`); renaming a field must not orphan history (stable field keys); RNTL for editor validation; compare maths including `null` values and unit switches.
- *Exit:* renaming a field never loses historical values; compare stays readable at 18 fields.

**P7 · Settings, paywall, referral, export UI — 4 days**
- *Build:* settings hub, business profile, preferences (units/notifications), WhatsApp templates editor with token preview, subscription screen, paywall, referral card, export screen, trash, danger zone.
- *Test:* token substitution unit tests; RNTL for destructive confirmations (typed confirmation); Playwright for paywall read-only mode across all tabs.
- *Exit:* every settings screen persists in mock; an expired account is read-only everywhere with no way around it in the UI.

**P8 · Due engine, WhatsApp, notifications — 3 days**
- *Build:* due engine (deliveries, follow-ups, birthdays, anniversaries) with timezone-aware day boundaries, Due tab + dashboard card, notification permission flow, local scheduling (nearest 20), `openWhatsApp()` with 6 editable templates + preview sheet, `expo-sharing` for design images.
- *Test:* Vitest for reminder windowing, timezone and DST edges; device test that a scheduled notification fires; permission-denied fallback; URL generation (`wa.me` digits only).
- *Exit:* reminders are correct when the mock clock moves +30 days; WhatsApp opens the right number with the right text on Android and iOS.

**P9 · Polish, demo build, client sign-off — 3 days**
- *Build:* final polish (spacing, copy, transitions), seed dataset frozen, dev menu hidden behind 7 taps and excluded from production, 2-minute walkthrough video, written sign-off form.
- *Test:* full manual regression on iPhone SE (small) + iPhone 13 + Pixel 6a + Safari + Chrome; all 44 screens in every specified state; Playwright full journey; accessibility pass.
- *Exit:* **written client sign-off.** Design frozen; P10 begins.

#### BACKEND AND RELEASE — only after sign-off

**P10 · Supabase foundation & hardened schema — 5 days**
- *Build:* project (Pro plan, EU/US region chosen for latency), migrations for the hardened schema (§9), `platform_admins`, `subscription_is_active()`, views, triggers, indexes, storage buckets + policies, seed script, `create_business_profile()` RPC.
- *Test:* RLS **negative** tests with two JWT users (A cannot read/write B's rows in all 6 tables); direct `update` of `role`/credit rejected; storage path traversal rejected; expired-subscription writes rejected; migration runs from scratch on an empty DB.
- *Exit:* the negative-test SQL suite passes; no table is readable by the anon key without a policy.

**P11 · Auth + real data wiring — 5 days**
- *Build:* `supabaseRepo` implementing the same interface; signup/login/logout/reset (web + native deep link + universal links), email verification, onboarding writes, CRUD for customers/measurements/projects/templates, status events, soft delete/restore.
- *Test:* parity suite — the same repository contract tests run against mock **and** Supabase; real-device password reset via email; two-account isolation re-run through the UI; session refresh across app backgrounding.
- *Exit:* `EXPO_PUBLIC_DATA_SOURCE=supabase` and the app behaves identically; no screen required a change.

**P12 · Storage, images, offline outbox — 4 days**
- *Build:* upload pipeline (compress → `{business_id}/{customer_id}/{uuid}.jpg` → store path + dimensions), signed URL caching (1 h) + thumbnails, orphan cleanup on delete, outbox queue with UUIDv7 ids, retry with backoff, sync indicator, conflict guard on `updated_at`.
- *Test:* 5 photos from a real phone → all ≤120 KB and load <1 s on 3G; airplane-mode create/update → reconnect → exactly one row each (no duplicates); delete customer → storage objects removed.
- *Exit:* no duplicate records after simulated flaky network; private photos unreadable by another account even with a guessed URL.

**P13 · Payments + subscription enforcement — 5 days**
- *Build:* Paystack plan, Edge Functions `start-checkout`, `verify-transaction`, `paystack-webhook` (signature verified, idempotent via `payment_events`), subscription state machine (`trialing → active → expired/cancelled`), renewal flow, webhook retry view for admins.
- *Test:* Paystack test mode: successful card, failed card, abandoned checkout, duplicate webhook delivery (idempotent), forged webhook signature (rejected); expired account: UI locked **and** direct API write rejected; renewal restores access with data intact.
- *Exit:* PRD §10.4 and §11 proven end-to-end, including the "expiry never deletes data" assertion.

**P13B · Referral credits (optional) — 3 days**
- *Build:* `credit_ledger`, balance function, credit-on-first-payment trigger, apply-at-renewal logic, referral screen wired to real data.
- *Test:* fake-referral attempts rejected; double credit prevented; balance cannot go negative; credit applied once per renewal.
- *Exit:* only if the client funds this feature; otherwise ship the share button with no ledger.

**P14 · Admin console — 3 days**
- *Build:* admin guard (`platform_admins`), overview metrics via SQL views, users list (business name, status, trial end, last active), suspend/unsuspend with reason, payments + webhook failures, plan/referral config.
- *Test:* admin account cannot select customer rows (policy test); non-admin cannot reach admin routes or RPCs; suspend blocks new writes but preserves reads/export.
- *Exit:* PRD §12 satisfied — platform oversight without private-data access.

**P15 · Export, retention, analytics, full QA — 5 days**
- *Build:* export Edge Function (CSV set + JSON per customer, zipped, signed link), purge cron (30 days), `app_events` (12 funnel events), Sentry release tagging, error/empty-state audit, accessibility fixes.
- *Test:* export round-trips (open CSV in Excel, JSON re-imports into a scratch DB); purge deletes only expired soft-deletes; analytics events fire once each; axe/contrast pass; full device matrix; 3G throttled load; 500 customers × 3,000 projects dataset.
- *Exit:* success criteria in PRD §14 are measurable from data, not opinion.

**P16 · PWA release, store packaging, pilot — 5 days**
- *Build:* production Supabase Pro + backups verified, custom domain, PWA install flow (manifest, icons, service worker, offline shell), privacy/terms live, EAS production builds (`eas build/submit`), store listings (screenshots, descriptions, privacy labels), pilot onboarding kit (WhatsApp script, 1-page guide).
- *Test:* Lighthouse mobile ≥90 performance/best-practices, PWA installable; cold install on a clean Android + iPhone; store review pre-check (icons, permissions, privacy manifest, no "empty shell" rejection risk); backup restore drill on a scratch project.
- *Exit:* PWA live, both builds submitted, **3 pilot tailors onboarded** and the PRD §14 pilot metrics started.

---

## 8. TESTING STRATEGY

### 8.1 Test pyramid (what gets automated, what stays manual)

| Level | Tool | What it covers | When |
|---|---|---|---|
| Unit (fast, many) | Vitest | Units & fraction maths, phone normalisation, date/reminder windows, timezone, templates schema, status machine, money/credit maths, token substitution | every phase |
| Component | `jest-expo` + RNTL | Forms, validation, dialogs, empty/error/skeleton states, accessibility labels, measurement input behaviour | every phase |
| Repository contract | Vitest (shared suite) | The same tests run against `mockRepo` and `supabaseRepo` — guarantees parity | P11 |
| Web E2E | Playwright (mobile viewport 390×844) | Landing → register → onboarding → customer → measurement → project → deliver → archive → paywall; deep links; refresh-on-route (SPA fallback) | P2 onward, every PR |
| Native E2E (optional) | Maestro | Login, create customer, save measurement, WhatsApp hand-off | P16 |
| Database security | SQL test script (two JWTs) | Isolation, admin escalation, storage path traversal, expired-subscription writes, soft-delete leakage | P10, re-run in P13/P15 |
| Payments | Edge Function tests + webhook replay | Signature verification, idempotency, state transitions | P13 |
| Manual device matrix | Real phones | iPhone SE / 13 / 15, Pixel 6a, low-end Android (2 GB RAM), Safari + Chrome | P9, P15, P16 |

### 8.2 Mandatory test cases (write these before the feature is "done")

1. Tailor B cannot read, write, delete or guess-URL any of Tailor A's customers, measurements, projects, photos.
2. A user cannot change their own `role` or `referral_credit_balance`.
3. Expired subscription: create/update rejected by **Postgres**, not just the UI; reads and export still work; renewal restores everything.
4. Two `is_current` measurements can never coexist for one customer.
5. Saving measurements always creates a new version; editing history is impossible; revert creates a new version.
6. `archived` is unreachable without `delivered` + a confirmation; archived items remain visible to their owner.
7. Offline create/update → reconnect → exactly one record (idempotency), with no lost edits.
8. Photo upload: ≤120 KB, private, wrong-business path rejected, deleted-with-parent.
9. Phone `0803 123 4567` → `+2348031234567` → `wa.me/2348031234567` (and the same for `+234…`, `234…`, with spaces/dashes).
10. Duplicate webhook delivery credits/activates exactly once.
11. Reminder boundaries: due yesterday = Overdue; due today = Today; due in 7 days = This week; birthday 29 Feb handled.
12. Renewal after 40 days of expiry shows all historical measurements (PRD §10.4).

### 8.3 Definition of Done (every phase)

- [ ] Feature works on web (390px), iOS and Android.
- [ ] Loading, empty, error and offline states implemented, not stubbed.
- [ ] Typecheck, lint, unit and component tests green; E2E for the phase's main journey.
- [ ] Accessibility: 44px targets, labels, contrast, 130% text scaling verified.
- [ ] Copy reviewed (no placeholder text, no "lorem", no "TODO").
- [ ] Analytics events for the phase fire once (from P15; instrumented earlier behind a no-op).
- [ ] Deployed preview URL shared with the client.
- [ ] No screen exceeds 430px; no horizontal scroll; back behaviour correct.

### 8.4 Performance and quality budgets

| Metric | Budget | Measured on |
|---|---|---|
| Initial JS (web, gzip) | ≤1.5 MB (target 900 KB) | `expo export -p web` + bundle analyser |
| LCP / TTI (web) | ≤2.5 s / ≤3.5 s | Moto G-class, 4G, throttled 3G check |
| Screen transition | ≤200 ms | device profiling |
| List scroll | ≥55 fps at 500 customers | FlashList + dev perf monitor |
| DB query (p95) | ≤150 ms | Supabase logs, from Lagos to chosen region |
| Photo payload | ≤120 KB, ≤800 px wide | upload inspector |
| Native cold start | ≤2.5 s | Pixel 6a / iPhone 13 |
| Crash-free sessions | ≥99.5% | Sentry (from P1) |
| Report/Export (3,000 projects) | ≤20 s | Edge Function timing |

Region note: pick the Supabase region with the lowest round-trip to Lagos (typically `eu-west-1`/`eu-central-1`), and **measure it before P16** rather than assuming. Mobile-first means latency perception is dominated by photos — hence the image budget.

### 8.5 Device matrix

| Class | Devices | Why |
|---|---|---|
| Small iPhone | iPhone SE (2nd/3rd gen), 375×667 | Smallest realistic viewport; keyboard overlap |
| Modern iPhone | iPhone 13 / 15 | Notch + safe areas + dynamic type |
| Android mid | Pixel 6a | Reference Android |
| Android low-end | 2 GB RAM, Android 10/11 | Real target market: slow CPU, camera compression time |
| Web | Chrome Android, Safari iOS, Chrome desktop (430 frame), Edge | PWA install, SPA refresh, `wa.me` hand-off |
| Tablet | iPad 768 (frame mode only) | Confirms the centred shell, not a tablet layout |

### 8.6 Analytics events (measurable success criteria)

`app_open` · `signup_started` · `signup_completed` · `business_profile_saved` · `template_selected` · `first_customer_created` · `first_measurement_saved` · `first_project_created` · `project_delivered` · `whatsapp_share` · `paywall_viewed` · `payment_succeeded`

Properties are counts/booleans only — **no customer names, phone numbers or photos**. `time_to_first_project = first_project_created.created_at − signup_completed.created_at` answers PRD §14's "80% within 10 minutes" directly. Note that with local notifications the app should log `reminder_opened` to prove reminders actually drive return visits.

---

## 9. BACKEND DELTA SPEC (the hardened version to build in P10–P15)

Everything below is a **change to the Master Build Spec's Section 2**, not a replacement for its spirit. Apply in this order; each block is idempotent.

### 9.1 Separate admins from businesses; make money columns unwritable

```sql
-- 1. role moves out of the user-writable row
alter table public.business_profiles drop column if exists role;
alter table public.business_profiles drop column if exists referral_credit_balance;

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
-- intentionally NO policies: only service_role touches this table

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.platform_admins a where a.user_id = auth.uid()) $$;

-- 2. column-level grants: the client may update profile fields, nothing else
revoke update on public.business_profiles from authenticated;
grant update (business_name, logo_url, phone_number, whatsapp_number, email,
              social_media, business_address, registration_info, preferred_unit, updated_at)
  on public.business_profiles to authenticated;
```

Credit balances, if built at all (P13B), live in an append-only `credit_ledger` with **no** client grants; balances are computed by a `SECURITY DEFINER` function.

### 9.2 Enforce the subscription lockout in Postgres

```sql
create or replace function public.current_business_id()
returns uuid language sql stable security definer set search_path = public
as $$ select id from public.business_profiles where user_id = auth.uid() limit 1 $$;

create or replace function public.subscription_is_active(p_business_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.subscriptions s
     where s.business_id = p_business_id
       and ( (s.status = 'trialing' and s.trial_ends_at > now())
          or (s.status = 'active'   and (s.current_period_end is null or s.current_period_end > now())) )
  );
$$;

create or replace function public.assert_subscription_active(p_business_id uuid)
returns void language plpgsql stable security definer set search_path = public
as $$
begin
  if not public.subscription_is_active(p_business_id) then
    raise exception 'subscription_expired' using errcode = 'P0001';
  end if;
end $$;
```

Every writable table gets **split policies** instead of the single `for all` policy:

```sql
-- repeat the pattern for customers, customer_measurements, customer_projects,
-- measurement_templates, project_attachments
drop policy if exists "Users can CRUD own customers" on public.customers;

create policy customers_read on public.customers
  for select to authenticated using (business_id = public.current_business_id());

create policy customers_insert on public.customers
  for insert to authenticated
  with check (business_id = public.current_business_id()
              and public.subscription_is_active(business_id));

create policy customers_update on public.customers
  for update to authenticated
  using (business_id = public.current_business_id()
         and public.subscription_is_active(business_id))
  with check (business_id = public.current_business_id());
```

Result: expired users keep **read + export** (PRD §10.4 says records must survive), but every write fails at the database — the paywall can no longer be bypassed.

### 9.3 Private storage buckets with path-scoped policies

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('customer-media', 'customer-media', false, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('business-assets', 'business-assets', false, 2097152,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- path convention: {business_id}/{customer_id}/{uuid}.jpg
create policy media_read on storage.objects for select to authenticated
  using (bucket_id in ('customer-media','business-assets')
         and (storage.foldername(name))[1] = public.current_business_id()::text);

create policy media_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('customer-media','business-assets')
              and (storage.foldername(name))[1] = public.current_business_id()::text);

create policy media_update on storage.objects for update to authenticated
  using (bucket_id in ('customer-media','business-assets')
         and (storage.foldername(name))[1] = public.current_business_id()::text);

create policy media_delete on storage.objects for delete to authenticated
  using (bucket_id in ('customer-media','business-assets')
         and (storage.foldername(name))[1] = public.current_business_id()::text);
```

Serve photos as **signed URLs (1 hour)** and store only the path in the database. Never construct public URLs. The `{business_id}` first folder is what makes the policy a one-liner.

### 9.4 One current measurement, versioned atomically

```sql
create unique index if not exists one_current_measurement_per_customer
  on public.customer_measurements (customer_id) where is_current;

create or replace function public.save_measurement_version(
  p_customer_id uuid, p_data jsonb, p_unit text, p_notes text default null
) returns public.customer_measurements
language plpgsql security definer set search_path = public as $$
declare v_business uuid; v_version int; v_row public.customer_measurements;
begin
  select business_id into v_business from public.customers where id = p_customer_id;
  if v_business is null or v_business <> public.current_business_id() then
    raise exception 'not_authorized';
  end if;
  perform public.assert_subscription_active(v_business);

  update public.customer_measurements set is_current = false
   where customer_id = p_customer_id and is_current;

  select coalesce(max(version_number), 0) + 1 into v_version
    from public.customer_measurements where customer_id = p_customer_id;

  insert into public.customer_measurements
    (customer_id, business_id, measurements_data, version_number, unit, is_current, notes)
  values (p_customer_id, v_business, p_data, v_version, p_unit, true, p_notes)
  returning * into v_row;

  return v_row;
end $$;
```

Direct `insert`/`update` on `customer_measurements` is revoked from `authenticated`; measurement writes go through this function only, which guarantees a single `is_current` row per customer.

### 9.5 Measurement template schema + seeded standard templates

The JSONB needs a **contract** so the editor, the form and the database agree. Version it from day one:

```json
{
  "v": 1,
  "fields": [
    { "id": "waist", "label": "Waist", "group": "upper", "type": "number", "unit": "inches", "required": true, "order": 5 },
    { "id": "hip",   "label": "Hip",   "group": "upper", "type": "number", "unit": "inches", "required": true, "order": 6 }
  ]
}
```

```sql
alter table public.measurement_templates
  add constraint fields_definition_is_v1
  check (fields_definition ? 'fields' and jsonb_typeof(fields_definition -> 'fields') = 'array');
```

**Golden rule:** `id` is the permanent key stored inside every `measurements_data` object; `label` is only what the tailor sees. Renaming "Bust" to "Chest" must therefore **not** change `id` — that is what makes measurement history survive template edits.

Seeded standards (PRD §7.1) — `id`s are stable, labels editable:

| Template | Fields |
|---|---|
| **Women — Standard (18)** | neck, shoulder, bust, under_bust, waist, hip, sleeve_length, bicep, armhole, wrist, back_length, front_length, gown_length, skirt_length, thigh, knee, trouser_length, inseam |
| **Men — Standard (14)** | neck, shoulder, chest, waist, hip, sleeve_length, bicep, wrist, shirt_length, jacket_length, trouser_length, thigh, knee, inseam |
| **Children — Standard (10)** | height, chest, waist, hip, shoulder, sleeve_length, top_length, trouser_length, neck, head |
| **Blank** | 0 fields (build your own) |

Groups: `upper`, `lower`, `length`, `custom`. Default unit follows `business_profiles.preferred_unit`; the measurement row still stores the unit it was entered in, so historical values never silently change meaning.

### 9.6 Atomic, fraud-resistant onboarding with a referral code

```sql
create or replace function public.create_business_profile(
  p_business_name text,
  p_whatsapp text,
  p_email text default null,
  p_logo_url text default null,
  p_unit text default 'inches',
  p_referral_code text default null
) returns public.business_profiles
language plpgsql security definer set search_path = public as $$
declare
  v_code text; v_attempt int := 0; v_row public.business_profiles; v_referrer uuid;
begin
  if exists (select 1 from public.business_profiles where user_id = auth.uid()) then
    raise exception 'profile_exists';
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_code := 'DIOKS-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
    begin
      insert into public.business_profiles
        (user_id, business_name, whatsapp_number, email, logo_url, preferred_unit, referral_code)
      values (auth.uid(), p_business_name, p_whatsapp, p_email, p_logo_url, p_unit, v_code)
      returning * into v_row;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  insert into public.subscriptions (business_id, status, trial_ends_at)
  values (v_row.id, 'trialing', now() + interval '14 days');

  if p_referral_code is not null then
    select id into v_referrer from public.business_profiles
     where referral_code = upper(trim(p_referral_code)) and id <> v_row.id;
    if v_referrer is not null then
      insert into public.referral_rewards
        (referrer_business_id, referred_business_id, credit_amount, status)
      values (v_referrer, v_row.id, 500, 'pending_payment')
      on conflict (referred_business_id) do nothing;
    end if;
  end if;

  return v_row;
end $$;

revoke all on function public.create_business_profile(text,text,text,text,text,text) from public;
grant execute on function public.create_business_profile(text,text,text,text,text,text) to authenticated;
```

Why this matters: the client can no longer choose its own `referral_code`, cannot insert a rewards row, and cannot link itself to an arbitrary referrer. The reward also stays `pending_payment` until an Edge Function sees a real successful payment (P13B).

### 9.7 Reminders model (PRD §8.4, §6.3 — previously missing)

```sql
alter table public.business_profiles
  add column if not exists timezone text default 'Africa/Lagos',
  add column if not exists reminder_prefs jsonb default '{"delivery_days_before":[3,1],"celebrations":true,"time_of_day":"08:00"}'::jsonb;

alter table public.customer_projects
  add column if not exists follow_up_at date,
  add column if not exists archived_at timestamptz;
```

- **Source of truth:** a client-side `buildDueItems()` selector over projects + customers (deliveries, follow-ups, birthdays, anniversaries) computed in the business timezone. It works on web, native and offline, and is unit-tested against boundary cases.
- **Native enhancement:** schedule local notifications for the nearest 20 due items, re-scheduling whenever the app opens or data changes.
- **Web:** a "Due today" card + badge; no false promise of background alerts (see C3).
- **No auto-archive** ever: `archived_at` is only set by an explicit user action.

### 9.8 Payments: the only source of truth for subscription state

```sql
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  provider text not null default 'paystack',
  provider_ref text not null unique,          -- transaction reference
  amount_kobo integer not null,
  currency text not null default 'NGN',
  status text not null check (status in ('pending','success','failed','refunded')),
  paid_at timestamptz,
  raw jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'paystack',
  event_id text not null unique,              -- webhook idempotency key
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  status text not null default 'received' check (status in ('received','processed','ignored','failed')),
  created_at timestamptz not null default now()
);

alter table public.payments enable row level security;
alter table public.payment_events enable row level security;
create policy payments_owner_read on public.payments
  for select to authenticated using (business_id = public.current_business_id());
-- no client insert/update on either table; only Edge Functions (service role)
```

Webhook handler order (always): verify the `x-paystack-signature` HMAC → insert into `payment_events` (`on conflict (event_id) do nothing`; if 0 rows affected, **return 200 and stop**) → verify the transaction with Paystack's API → upsert `payments` → update `subscriptions` (`status='active'`, `current_period_end = now() + interval '1 year'`) → mark the event processed. Never trust amounts or plan names coming from the client.

### 9.9 Data export (PRD §10.5)

Edge Function `export-data`: verify JWT → resolve `business_id` → read with the service role → build a ZIP (`customers.csv`, `measurements.csv`, `projects.csv`, `attachments.csv`, plus `json/customer-<id>.json`) → upload to an `exports` bucket → return a 24-hour signed URL. Export must work for an **expired** subscription too (data ownership beats lockout): allow reads, deny new work.

### 9.10 Admin metrics without PII access

Admin RPCs (`security definer`, gated by `is_platform_admin()`) return aggregates only:

```sql
create or replace function public.admin_metrics()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'not_authorized'; end if;
  return json_build_object(
    'businesses',       (select count(*) from public.business_profiles),
    'trialing',         (select count(*) from public.subscriptions where status = 'trialing'),
    'active',           (select count(*) from public.subscriptions where status = 'active'),
    'expired',          (select count(*) from public.subscriptions where status = 'expired'),
    'trials_ending_7d', (select count(*) from public.subscriptions
                          where status = 'trialing' and trial_ends_at between now() and now() + interval '7 days'),
    'revenue_30d_kobo', (select coalesce(sum(amount_kobo),0) from public.payments
                          where status = 'success' and paid_at > now() - interval '30 days')
  );
end $$;
```

No policy grants admins `select` on customers, measurements, projects, attachments or storage objects — that is how PRD §12 becomes true rather than aspirational.

### 9.11 Indexes, triggers and hardening

```sql
create index if not exists idx_customers_business    on public.customers (business_id, created_at desc);
create index if not exists idx_customers_phone       on public.customers (business_id, phone_e164);
create index if not exists idx_customers_deleted     on public.customers (business_id, deleted_at);
create index if not exists idx_measurements_customer on public.customer_measurements (customer_id, version_number desc);
create index if not exists idx_projects_business     on public.customer_projects (business_id, status, expected_delivery_date);
create index if not exists idx_projects_due          on public.customer_projects (business_id, expected_delivery_date)
  where status in ('pending','in_progress','completed');
create index if not exists idx_attachments_project   on public.project_attachments (project_id, sort);

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
-- attach to business_profiles, customers, customer_projects, measurement_templates,
-- project_attachments, subscriptions
```

Also: `set search_path = public` on every function (done above), `pg_cron` for the purge, and column-level grants wherever a column must never be client-writable.

### 9.12 Offline idempotency (client + schema)

- Client generates **UUIDv7** primary keys before the network call; inserts use `on conflict (id) do nothing`.
- Tables that need non-PK idempotency (status changes, attachment uploads) gain `client_mutation_id text unique` (nullable).
- Outbox row: `{ id, entity, op, payload, attempts, next_attempt_at, state }` in AsyncStorage (native) / IndexedDB via AsyncStorage (web); backoff 2s → 4s → 8s, max 5 attempts, then a visible "failed — retry" row.
- Conflict rule: last write wins **only** if the incoming `updated_at` is newer; otherwise show "changed on another device" rather than overwriting silently.

### 9.13 New tables and triggers (DDL)

```sql
-- phone normalisation
alter table public.customers add column if not exists phone_e164 text;
update public.customers set phone_e164 = phone_number where phone_e164 is null;

-- project media (replaces the design_photos text[] array)
create table if not exists public.project_attachments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.customer_projects(id) on delete cascade,
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  kind text not null check (kind in ('photo','reference','wa_screenshot','voice')),
  storage_path text not null,
  caption text,
  width integer, height integer,
  sort integer not null default 0,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

-- immutable status history
create table if not exists public.project_status_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.customer_projects(id) on delete cascade,
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create or replace function public.log_project_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.project_status_events
      (project_id, business_id, from_status, to_status, changed_by)
    values (new.id, new.business_id, old.status, new.status, auth.uid());
  end if;
  return new;
end $$;

create trigger trg_log_project_status after update of status on public.customer_projects
  for each row execute function public.log_project_status();

-- funnel analytics (no PII)
create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.business_profiles(id) on delete cascade,
  event text not null,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

Enable RLS on all three and reuse the split-policy pattern from §9.2 (`business_id = public.current_business_id()`; attachments additionally require an active subscription for insert/update). `app_events` accepts inserts from `authenticated` but is readable only through admin RPCs.

### 9.14 Schema change summary (delta from the Master Build Spec)

| Table | Change |
|---|---|
| `business_profiles` | drop `role` and `referral_credit_balance`; add `timezone`, `reminder_prefs`; column-level update grants |
| `platform_admins` | **new** — admin identity, service-role only |
| `customers` | add `phone_e164` (indexed); keep `phone_number` for display; `deleted_at` + filtered views |
| `customer_measurements` | partial unique index on `is_current`; writes only via `save_measurement_version()` |
| `measurement_templates` | JSONB check constraint; `is_default`; seeded standard templates |
| `customer_projects` | add `follow_up_at`, `archived_at`; replace `design_photos` with attachments |
| `project_attachments` | **new** — kind, caption, sort, width/height, storage_path, soft delete |
| `project_status_events` | **new** — append-only transitions |
| `payments`, `payment_events` | **new** — Paystack, idempotent |
| `app_events` | **new** — 12 funnel events |
| `credit_ledger` | **new** — only if P13B is funded |
| Storage | 2 private buckets + 4 path-scoped policies |
| Functions | `current_business_id`, `subscription_is_active`, `assert_subscription_active`, `save_measurement_version`, `create_business_profile`, `is_platform_admin`, `admin_metrics`, `purge_deleted_records` |
| Views | `v_customers`, `v_projects` (deleted filtered), `v_due_projects` |

---

## 10. DECISIONS REQUIRED (with a recommended default so nothing blocks)

| ID | Decision | Recommended default | Blocks |
|---|---|---|---|
| D-01 | Brand palette + wordmark | Wine `#7B2D43` on warm paper `#FBF9F6`, gold accents decorative only (§4.2) | P1 (visual) |
| D-02 | Typeface | Plus Jakarta Sans (OFL); Fraunces on landing only | P1 |
| D-03 | MVP price + billing period | ₦2,500/month or ₦24,000/year (2 months free), 14-day trial | P13 only |
| D-04 | Payment provider | Paystack (NGN, local cards, transfers, USSD) | P13 |
| D-05 | Referral credits in MVP? | **No** — ship the code + share button, defer ledger/payouts (P13B) | P13B |
| D-06 | Google/Apple sign-in | Neither in MVP (email + password) | P11 |
| D-07 | Export formats | CSV set + JSON per customer, zipped | P15 |
| D-08 | Recently-deleted retention | 30 days, then purge (export offered first) | P15 |
| D-09 | Admin permissions | Aggregates + suspend/unsuspend only; no PII | P14 |
| D-10 | Photo budget | ≤800 px wide, 70% JPEG, ≤120 KB | P12 |
| D-11 | Default unit | Inches (Nigeria), switchable per business | P3 |
| D-12 | Notification strategy | Local notifications on native; in-app Due list on web; push in V1.1 | P8 |
| D-13 | WhatsApp message copy | 6 templates drafted in P8 for your approval | P8 |
| D-14 | Accounts ownership | DIOKS TAILORS owns Vercel, Supabase, Paystack, Apple, Google accounts | P16 |
| D-15 | Privacy/terms + DPA | NDPR-aligned drafts reviewed by you before P16 | P9/P16 |

> **SMS / WhatsApp wishes** (your new question — monthly SMS vs 1-tap WhatsApp) is analysed separately in `DIOKS_Tailors_MVP_Scope_Deferrals_and_V1.1.md` §3, with decisions **D-16 … D-21**. Short answer: WhatsApp 1-tap in the MVP (free, personal, replies come back to the tailor), SMS as a **paid V1.1 add-on**, occasion-based instead of monthly, and no fully-automated sending before V2.
>
> **Status 14 Nov 2026 — approved:** D-01, D-02 and D-04 … D-15 stand as recommended; D-16 … D-21 approved per §8 of the register. **D-03 (price) remains a placeholder at ₦2,500/month** — it is needed before P13 and blocks nothing earlier.

---

## 11. RISK REGISTER

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Tailors find measurement entry slower than a notebook | Medium | **High** | The 90-second test (§4.1); fraction chips + ghost last-values; pilot with 3 real tailors at P9 **before** backend spend |
| App Store rejection as a "repackaged website" (Apple 4.2) | Medium | High | Native build with camera, offline, notifications, sharing — not a WebView wrapper; submit after P16 native features |
| Supabase Free project pauses / has no backups | High if unpaid | **High** | Pro plan before pilot; backup restore drill in P16 |
| WhatsApp Business app cannot be forced from a link | Certain | Low | Documented limitation; `wa.me` always works; message copy sets context |
| No background alerts on the web PWA | Certain | Medium | In-app Due card + badge; encourage native install; push in V1.1 |
| Referral/payment fraud (fake signups, forged webhooks) | Medium | Medium | Server-side RPC, signature verification, idempotency, credit only after verified payment — or defer referrals |
| Offline duplicates / lost edits | Medium | **High** | UUID PKs, outbox, idempotent writes, conflict guard, explicit test case #7 |
| Design drift during backend wiring | High | Medium | Design freeze at P9; change notes with estimates |
| Timeline slip from feedback loops | Medium | Medium | Phase gates + weekly deployed previews; P0–P9 is independently valuable |
| Currency/pricing changes | Medium | Low | Price in DB/config, never hardcoded in the app |
| Data-loss incident (the product's core promise) | Low | **Fatal** | Writes via functions, daily backups, export, purge discipline, restore drill |
| Device variability (low-end Android camera/compression) | Medium | Medium | Low-end device in the matrix; compression off the main thread; server-side size caps |

---

## 12. TRACEABILITY (PRD → screen → phase → proof)

| PRD requirement | Screens | Phase | Proof |
|---|---|---|---|
| §5.1 Register/login/recover | 4–8 | P2, P11 | Password reset on a real device; locked-out state |
| §5.2 Business profile | 10, 33 | P3, P11 | Profile saved; logo ≤120 KB |
| §6.1–6.2 Customers | 15, 19–21 | P4, P11 | Create/search/open/delete/restore |
| §7.1–7.2 Templates | 11, 31, 32 | P6, P11 | Rename does not orphan history |
| §7.3–7.4 History & retrieval | 22–24 | P4/P6, P11 | Test #4 and #5 |
| §8.1–8.3 Projects & statuses | 16, 25–28 | P5, P11 | Test #6 |
| §8.4 Delivery + archive reminder | 17, 28 | P5, P8 | Deliver → toast → archive manually |
| §9 WhatsApp access/sharing | 17, 20, 26 | P8 | Test #9 on both platforms |
| §10.1 Secure storage | all media | P12 | Test #8 |
| §10.2 Account recovery | 7 | P11 | New device sign-in shows all data |
| §10.3 Privacy isolation | all | P10 | Test #1 (two JWTs) |
| §10.4 Expiry ≠ deletion | 36, 41 | P13 | Test #3 and #12 |
| §10.5 Export/delete | 38–40 | P15 | Export opens in Excel; purge respects the window |
| §11 Subscription/trial | 36, 41 | P7, P13 | Trial countdown; renewal restores access |
| §12 Admin | 42–44 | P14 | Admin cannot select customer rows |
| §14 Success criteria | 14, 17 | P15 | Event funnel + time-to-first-project |
| §15 Non-functional | all | all | §8.4 budgets, device matrix, §4.7 accessibility |

---

## 13. FIRST FIVE WORKING DAYS (if approved today)

| Day | Action | Output you can open on your phone |
|---|---|---|
| 1 | Confirm D-01…D-05; create repo + Expo SDK 58 project; Vercel preview; lock tokens | Green pipeline + preview URL |
| 2 | `theme.ts`, `AppFrame`, `Screen`, `AppHeader`, `TabBar`; verify the 430px shell on 5 viewports | The phone shell itself |
| 3 | Buttons, fields, cards, pills, avatars, skeletons, sheets, toasts + `/dev/gallery` | Component gallery link |
| 4 | Landing page (hero, benefits, screenshots, install hint) + pricing | Landing page live |
| 5 | Login, register, forgot/reset with mock accounts + all validation states | Auth flow demoable end-to-end |

**What I need from you to start:** approval of this plan, decisions D-01…D-05, the logo/wordmark file (or permission to design one), and confirmation that the 430px phone-only contract is final.

---

### Change log

| Version | Date | Change |
|---|---|---|
| 1.0 | 14 Nov 2026 | Initial audit, design system, 44-screen IA, mock-data architecture, 17-phase plan, hardened backend delta spec |























