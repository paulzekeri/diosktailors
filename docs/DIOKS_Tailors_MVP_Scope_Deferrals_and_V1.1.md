# DIOKS TAILORS — MVP SCOPE DEFERRALS & V1.1 REGISTER

**Product:** DIOKS FashionSuite · **Company:** DIOKS TAILORS
**Purpose:** a single review sheet listing **everything I removed, reworded, or pushed out of the MVP**, so nothing is lost without your explicit approval.
**Companions:** `DIOKS_FashionSuite_Design_and_Dev_Plan.md` (v1.0), `prd.txt`, `pcd.txt`, `srf.txt`, `DIOKS_FashionSuite_Master_Build_Spec.md`
**Version:** 1.0 · **Date:** 14 November 2026

> ## ✅ STATUS: APPROVED — 14 NOVEMBER 2026
> **Client instruction (chat, 14 Nov 2026):** *"Go with your recommendation. The things flagged to move to V1.1 are fine. I did not answer all questions, but let's push them to V1.1."*
>
> **Recorded as:** every **DEFER** and **DROP** item in §1 is **approved as listed**; every unanswered decision (**D-01 … D-21**) defaults to the **recommended option**; **nothing is reinstated** into the MVP.
> **Formal signature** in §7 is for your records only — no item will be re-planned as "reinstated" without a written `R` instruction from you.

---

## 0. HOW TO REVIEW THIS DOCUMENT

Every row has a decision box. Mark exactly one per item:

- `[A]` **Approve deferral** — accept that it leaves the MVP and returns in V1.1 (default recommendation).
- `[R]` **Reinstate** — you want it in the MVP anyway; I re-estimate the phase and tell you the added days **before** building.
- `[X]` **Drop permanently** — remove it from the roadmap entirely.

Items marked **CHG** are wording changes only (the PRD currently promises something technically impossible or financially unsafe); they also need an `[A]` or `[R]`.

**Nothing is lost.** Every deferred item shows what the MVP does instead, why I moved it, what it costs to add later, and which phase it returns in.

---

## 1. AT-A-GLANCE REGISTER (33 items: 26 deferred · 7 permanently dropped)

`Type`: **DEFER** = pushed to V1.1 · **V2** = pushed to a later major version · **DROP** = removed permanently.

> **Decision recorded 14 Nov 2026:** all 33 rows stand **as listed** (approved). The boxes remain in place so you can still change your mind later — a single `R` on any row reinstates it, and §6 tells you exactly what that costs in days.

| ID | Item | Type | MVP does instead | Add-back effort | Your decision |
|---|---|---|---|---|---|
| DEF-01 | Referral **credit ledger, ₦ payouts, auto-discount at renewal** | DEFER | Referral code + 1-tap WhatsApp invite + "friends joined" counter (no money maths) | 3 days | [ ] A [ ] R [ ] X |
| DEF-02 | **Google Sign-In** (+ Apple Sign-In if Google ships) | DEFER | Email + password + password reset | 3 days | [ ] A [ ] R [ ] X |
| DEF-03 | **Server push notifications** (Expo Push) | DEFER | Local notifications on the installed app + in-app "Due" list on web | 4 days | [ ] A [ ] R [ ] X |
| DEF-04 | **Customer merge / duplicate consolidation** | DEFER | Warn on duplicate phone, with "open existing customer" | 2 days | [ ] A [ ] R [ ] X |
| DEF-05 | **Dark mode** | DEFER | Light theme only; colour tokens already structured for dark | 1.5 days | [ ] A [ ] R [ ] X |
| DEF-06 | **Multi-language UI** (Yoruba, Igbo, Hausa, Pidgin, French) | DEFER | English only (`en-NG`) | 4–6 days + translation cost | [ ] A [ ] R [ ] X |
| DEF-07 | **Voice notes** on projects | DEFER | Photo / reference / WhatsApp-screenshot attachments (schema already allows voice) | 2 days | [ ] A [ ] R [ ] X |
| DEF-08 | **Realtime multi-device sync** | DEFER | Pull-to-refresh + outbox; data correct, just not live-pushed | 3 days | [ ] A [ ] R [ ] X |
| DEF-09 | **PDF invoices / receipts / quotes** | DEFER | CSV + JSON export only | 5 days | [ ] A [ ] R [ ] X |
| DEF-10 | **Business insight charts** (revenue, repeat customers, busiest month) | DEFER | 4 dashboard counters (customers, active jobs, due, completed) | 4 days | [ ] A [ ] R [ ] X |
| DEF-11 | **Full offline conflict-resolution UI** | DEFER | Last-write-wins with a "changed on another device" warning | 5 days | [ ] A [ ] R [ ] X |
| DEF-12 | **Bulk / broadcast WhatsApp sending** | DEFER | One customer at a time, human-sent, from the tailor's own number | 4 days + policy risk | [ ] A [ ] R [ ] X |
| DEF-13 | **SMS gateway** (monthly/occasion wishes by text) | DEFER | 1-tap WhatsApp greeting from the celebrations card | 5–7 days + per-SMS cost | [ ] A [ ] R [ ] X |
| DEF-14 | **Fully automated celebration messages** (sent with no human tap) | V2 | Assisted: app drafts the message, tailor taps send | 6–8 days + Meta fees | [ ] A [ ] R [ ] X |
| DEF-15 | **Meta WhatsApp Cloud API** (auto-capture chats, auto-replies) | V2 | `wa.me` deep link; conversations stay in WhatsApp (as the PRD states) | 8–12 days + verification | [ ] A [ ] R [ ] X |
| DEF-16 | **Promo codes / trial extensions / trial credits** | DEFER | Fixed 14-day trial per account | 2 days | [ ] A [ ] R [ ] X |
| DEF-17 | **Multi-currency & localised pricing** | DEFER | NGN only, price read from config (never hardcoded) | 3 days | [ ] A [ ] R [ ] X |
| DEF-18 | **Point-in-time recovery (PITR) backups** | DEFER | Supabase Pro daily backups (7-day retention) + monthly export reminder | 1 day (add-on fee) | [ ] A [ ] R [ ] X |
| DEF-19 | **Excel (.xlsx) / PDF export** | DEFER | CSV set + JSON per customer (opens in Excel) | 2 days | [ ] A [ ] R [ ] X |
| DEF-20 | **Staff / apprentice seats with role permissions** | DEFER | One login per business (schema already scoped for multi-user) | 6–8 days | [ ] A [ ] R [ ] X |
| DEF-21 | **Customer-facing portal / booking link** | DEFER | Customers never install anything; tailor shares via WhatsApp | 8–10 days | [ ] A [ ] R [ ] X |
| DEF-22 | **Template marketplace / sharing templates between tailors** | DEFER | Each business owns its templates (can duplicate its own) | 5 days | [ ] A [ ] R [ ] X |
| DEF-23 | **Email notifications** (delivery due, payment failed) | DEFER | In-app + local notifications only | 2 days | [ ] A [ ] R [ ] X |
| DEF-24 | **International card payments** (Stripe/Paddle) | DEFER | Paystack only (NGN cards, transfer, USSD) | 4 days | [ ] A [ ] R [ ] X |
| DEF-25 | **Custom branding / white-label for Enterprise tier** | DEFER | DIOKS branding only | 6 days | [ ] A [ ] R [ ] X |
| DEF-26 | **SMS fallback for customers with no WhatsApp** | DEFER | Tailor taps "call" or sends manually | part of DEF-13 | [ ] A [ ] R [ ] X |
| DROP-01 | **Desktop / tablet / landscape layouts** | DROP | One 430px phone column, centred frame on large screens | — | [ ] A [ ] X |
| DROP-02 | **Forcing the WhatsApp *Business* app to open** | DROP | `wa.me` link; the phone OS chooses which WhatsApp opens | — | [ ] A [ ] X |
| DROP-03 | **Admin ability to read customer measurements/photos** | DROP | Admin sees counts and payments only, never PII | — | [ ] A [ ] X |
| DROP-04 | **Public photo URLs / unlimited free storage** | DROP | Private buckets + 1-hour signed links + compressed photos | — | [ ] A [ ] X |
| DROP-05 | **"Login as user" / admin impersonation** | DROP | Support answers questions without seeing private data | — | [ ] A [ ] X |
| DROP-06 | **Permanent hard delete with no recovery window** | DROP | 30-day Recently Deleted + export, then purge | — | [ ] A [ ] X |
| DROP-07 | **Unlimited free SMS to customers** | DROP | Paid SMS credits (V1.1) or free WhatsApp | — | [ ] A [ ] X |

**Important context:** **19 of the 26 deferred items were never in your PRD at all** (referral money, charts, marketplace, portal, white-label, multi-currency, dark mode, translations, voice notes, realtime sync…). Deferring them **protects** the MVP timeline instead of removing promised functionality. §5 lists what is **kept and built**.

---

## 2. THE BIGGEST CUTS IN DETAIL

### DEF-01 · Referral credit ledger & payouts

- **What it was:** Tailor A invites Tailor B; when B pays, A gets ₦500 credit automatically deducted from A's renewal.
- **Why deferred:** it is a **financial system** hiding inside a measurement app — ledger integrity, fraud (fake signups), refunds, disputes, tax treatment, and a second money path that must be reconciled with Paystack webhooks. It is **not in your PRD, PCD or SRS**.
- **MVP instead:** every business gets a `DIOKS-XXXX` code, a "Refer & earn" card, a 1-tap WhatsApp invite, and a count of friends who joined. No money maths, no liability.
- **Add later:** 3 days (P13B) — the database columns already exist, so nothing is thrown away.
- **Risk of deferring:** near zero. You can still measure referral demand in MVP (count of shares) and decide with data whether to fund credits.

### DEF-02 · Google Sign-In (and therefore Apple Sign-In)

- **What it was:** "Google sign-in may also be offered" (PRD §5.1).
- **Why deferred:** on iOS, offering Google without **Sign in with Apple** is a store-review rejection (Guideline 4.8). So one "nice to have" becomes two auth providers, two QA matrices, two support paths.
- **MVP instead:** email + password + reset. Tailors register once; the app is used daily, so login friction is a one-time cost.
- **Add later:** 3 days (P11) for both together.

### DEF-03 · Server-side push notifications

- **What it was:** the app pushing "delivery tomorrow" alerts from a server.
- **Why deferred:** push needs a dev build (Android, SDK 53+), an Expo push token pipeline, a server scheduler and a device-token table — real work for a benefit local notifications already deliver.
- **MVP instead:** the app computes what's due (In-app **Due** tab, badge, dashboard card) and schedules **local** notifications for the nearest 20 items. Works offline, no server, no cost.
- **Add later:** 4 days. **Web users get no background alerts in either case** (installed PWAs on iOS cannot schedule notifications), so push mainly serves native users who forgot to open the app.

### DEF-12 · Bulk / broadcast WhatsApp

- **Why deferred:** WhatsApp treats unsolicited bulk and automated sending as a ban-worthy offence, and a ban would hit the tailor's **business number** — the channel their customers know. Also unbuildable via `wa.me` (one chat at a time is all the link supports).
- **MVP instead:** one-to-one, human-sent, from the tailor's own number, with a preview sheet.
- **Add later:** only through the official Cloud API (DEF-15), with opt-in records and approved templates — not through unofficial libraries, ever.

### DEF-13 / DEF-26 · SMS gateway and SMS fallback

**Full analysis in §3.** Summary: valuable, but it is a **paid add-on**, not a free MVP feature; it should be **occasion-based**, not monthly.

### DEF-14 / DEF-15 · Fully automated messages & Meta Cloud API

- **Why deferred:** automation requires Meta business verification, pre-approved message templates, per-message fees, and — critically — **verifiable per-customer opt-in**. The PRD itself says WhatsApp conversations stay in WhatsApp during the MVP.
- **MVP instead:** assisted sending (app drafts → tailor taps → message opens in WhatsApp).
- **Add later:** 8–12 days for Cloud API; it also unlocks automatic delivery notifications and conversation capture. This is the correct **V2** headline feature.

### DEF-20 · Staff / apprentice seats

- **Why deferred:** multi-user means invitations, roles, per-row "who did this", and permission tests across every screen. Your target user is an **independent tailor** with one phone.
- **MVP instead:** one login per business. Every table is already scoped by `business_id`, so seats can be added without redesign.
- **Add later:** 6–8 days.

### DEF-21 · Customer-facing portal / booking link

- **Why deferred:** it is a second product (public pages, customer identity, booking rules, abuse handling) with no evidence of demand yet.
- **MVP instead:** the tailor shares measurements, design references and status updates through WhatsApp — which is exactly where the customer already is. PRD §9.3 explicitly says customers must not need to install anything.

### DEF-04 · Customer merge (vs "open existing")

- **Why deferred:** merging two customer records with measurement versions, projects and photos is destructive, needs a full audit trail and an undo, and is only needed once duplicates exist.
- **MVP instead:** block/warn at creation on the same `phone_e164`, and offer "Open the existing customer instead".
- **Add later:** 2 days, once you see how often duplicates actually happen.

---

## 3. YOUR QUESTION: SMS WISHES vs WHATSAPP WISHES — MY RECOMMENDATION

### 3.1 What you proposed

1. Tailors register their customers, and the app is connected to an **SMS API** to send monthly wishes automatically.
2. Or the tailor **triggers a WhatsApp message** wishing the customer well.

### 3.2 Verdict

| Idea | Verdict | Where it lands |
|---|---|---|
| **1-tap WhatsApp greeting triggered by the tailor** | **Yes — build it in the MVP.** Highest value per naira, zero per-message cost, and it comes from the tailor's own number so it reads as personal, not corporate. | **MVP (P8)** |
| **Monthly "wish everyone" SMS** | **No as designed** — expensive, spam-like, and blocked by Nigerian DND rules for promotional traffic. | Change to **occasion-based** (§3.5) |
| **Occasion-based SMS (birthday, anniversary, festive, order ready)** | **Yes — as a paid add-on with consent.** Good revenue line, real retention tool. | **V1.1 (DEF-13)** |
| **Fully automatic sending (no human tap)** | **Not in V1/V1.1.** Requires the Meta Cloud API + template approval + verified opt-in, and WhatsApp bans numbers for unsolicited automation — that would destroy the tailor's business number. | **V2 (DEF-14/15)** |

**One-line answer:** *keep WhatsApp for the MVP, add SMS later as a priced add-on, and replace "monthly" with "on the occasion".* The reason is not technical — it is unit economics.

### 3.3 Why WhatsApp-first is the right MVP choice

| Factor | WhatsApp (1-tap from tailor's phone) | SMS (via API) |
|---|---|---|
| Cost per message | **₦0** | ≈ **₦3–₦5** per message (aggregator pricing; verify at signup) |
| Sender identity | The tailor's **own business number** — customers recognise it | Shared/short-code or registered sender ID; often looks corporate or unfamiliar |
| Replies | Land back in the tailor's chat → more reorders, easier follow-up | Replies go nowhere; the conversation is lost |
| Opt-in / DND | Customer already has the tailor saved; no gateway filtering | Promotional traffic can be filtered by **NCC DND** rules; needs opt-in records |
| Setup effort | Already built | Sender-ID registration, aggregator contract, credit top-ups, delivery logs |
| Failure modes | Message simply opens; human can adjust wording | Failed sends, wrong numbers, per-network variance, refunds for undelivered |
| Regulatory weight | Light (user sends it themselves) | Marketing consent, opt-out keywords, NDPR processing records |

Add the numbers: a tailor with 150 customers sending one SMS a month spends 1,800 messages a year ≈ **₦5,400–₦9,000**. At ₦2,500/month (₦30,000/year), free SMS would consume **18–30% of the subscription revenue** before any profit — and it grows every time the tailor adds customers. That is why SMS must be a **paid add-on**, not a bundled freebie.

### 3.4 What SMS genuinely does better (so don't dismiss it)

- Reaches customers who **don't use WhatsApp** or whose number isn't on WhatsApp — real in parts of the market.
- Reaches customers who **never saved** the tailor's number (a `wa.me` message from an unknown number can be ignored as spam; an SMS arrives in the inbox).
- Works on **feature phones** and when data is off.
- Feels more formal for a **delivery notice** ("Your order is ready for collection").

So: SMS has a place — just not as "monthly wishes to everyone", and not for free.

### 3.5 Monthly vs occasion-based (the important design change)

Your instinct is culturally right — **"Happy new month" is a real Nigerian social ritual**, and tailors who already do it by hand will want help. The problem is the *machine* version: a paid SMS to every customer every month.

| Approach | Yearly messages (150 customers) | Yearly cost | Customer reaction |
|---|---|---|---|
| Monthly SMS to everyone | 1,800 | ₦5,400–₦9,000 | "Stop texting me" — opt-outs climb, and you still pay for them |
| Occasion-based (2 relational + transactional) | ~300 + order messages | ₦900–₦1,500 | "She remembered my birthday" — feels personal |
| Monthly **tailor digest** (free, in-app) | 0 outbound | ₦0 | Tailor acts; app does the remembering |

**Recommended calendar of occasions** (only where the data exists):
`birthday` · `wedding anniversary` · `order ready for collection` · `thank-you 2 days after delivery` · `win-back at 6 months without an order` · festive: **New Year, Easter, Eid al-Fitr, Eid al-Adha, Independence Day (1 Oct), Christmas** · business anniversary.

**Cap:** maximum **two relational messages per customer per year** (birthday + one festive), unlimited transactional messages. This keeps costs predictable and opt-outs near zero.

Replace "monthly wish to customers" with **"this month's wish queue"** for the tailor: on the 1st, the Due tab shows "4 birthdays, 2 anniversaries, Christmas in 18 days" with a tap-through list. Same habit, no spam, no cost.

### 3.6 Recommended build sequence

| When | What gets built | Effort |
|---|---|---|
| **MVP (already planned)** | Celebrations card + Due tab → 1-tap WhatsApp greeting, 6 editable templates, preview sheet, "last wished" guard so nobody gets wished twice | in P8 |
| **MVP tiny addition (recommended)** | Consent + wish-log columns and the `wish_log` table, **no UI beyond one checkbox** at customer creation. Costs half a day now, saves a data migration later | +0.5 day in P10 |
| **V1.1 (DEF-13)** | SMS add-on: aggregator abstraction in an Edge Function, credit packs, per-month cap, delivery log, opt-out keyword, occasion templates only | 5–7 days |
| **V2 (DEF-14/15)** | Official WhatsApp Cloud API: automated order-ready and delivery messages, approved templates, automatic conversation capture | 8–12 days + Meta fees |

```sql
-- the half-day future-proofing (P10). Nothing here sends anything by itself.
alter table public.customers
  add column if not exists relational_opt_in boolean not null default true,   -- birthday/anniversary/festive
  add column if not exists sms_opt_in        boolean not null default false,  -- explicit, costs money
  add column if not exists marketing_opt_in  boolean not null default false,  -- promos only
  add column if not exists opt_in_at         timestamptz,
  add column if not exists last_wished_at    timestamptz;

create table if not exists public.wish_log (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  channel text not null check (channel in ('whatsapp','sms','call')),
  occasion text not null check (occasion in ('birthday','anniversary','festive','order_ready','thank_you','win_back','other')),
  template_key text,
  status text not null default 'sent',
  sent_at timestamptz not null default now()
);
```

Why the log matters commercially: when SMS arrives in V1.1 you will be able to answer *"did wishing actually cause reorders?"* with real data — `wish_log` joined to the next `customer_projects` row. Without it you are guessing whether to charge for SMS at all.

### 3.7 Decisions I need from you (SMS/wishes)

| ID | Question | My recommendation | Your call |
|---|---|---|---|
| D-16 | Channel priority | WhatsApp in MVP; SMS as a paid add-on in V1.1 | [ ] Agree [ ] Change |
| D-17 | Cadence | Occasion-based, max 2 relational/customer/year; no monthly blasts | [ ] Agree [ ] Change |
| D-18 | SMS pricing | Credit packs, e.g. **₦1,000 = 200 SMS** (≈₦5/msg), or bundled into a Professional tier | [ ] Agree [ ] Change |
| D-19 | SMS sender ID | Start with the aggregator's default/short code; register **DIOKS** or per-tailor brand later (needs CAC documents, 1–4 weeks) | [ ] Agree [ ] Change |
| D-20 | Consent defaults | Birthday/anniversary wishes **on** when the customer's date is provided; promos **off** until the customer opts in | [ ] Agree [ ] Change |
| D-21 | Add the consent columns + `wish_log` to the MVP schema | Yes (+0.5 day, avoids a later migration) | [ ] Agree [ ] Skip |

**Also worth knowing:** SMS is the only feature here with a **variable cost per action**, so it needs: a spending cap per tailor, a top-up flow, refunds for failed sends, and a monthly reconciliation report. Budget roughly **3–4 extra days** of admin/back-office work in V1.1 beyond the 5–7 days of sending code, or the first month of SMS will be an accounting headache.

### 3.8 One more idea worth considering instead of monthly SMS

**"Wish queue + voice note"** — the tailor taps once and records a 10-second WhatsApp voice note ("Happy birthday ma, God bless you. Your gown is ready"). It costs nothing, carries far more warmth than any template, and is something an SMS API can never do. It is also uniquely defensible: no competitor's automated system can replicate a human voice from the person who sewed the dress.

---

## 4. REWORDED, NOT REMOVED (PRD statements that need a language change)

These are promises the current PRD makes that are either technically impossible or commercially unsafe. The **feature stays**; the sentence changes.

| ID | Current PRD wording | Why it must change | Proposed wording | Your call |
|---|---|---|---|---|
| CHG-01 | §6.3 "…and, where technically supported and authorized, **automated** celebratory messages" | Automated sending needs the Meta Cloud API, template approval and verified opt-in — a V2 build, and risky for the tailor's number | "…the system shall **assist** the tailor to send a greeting with one tap; fully automated sending is planned for a later release" | [ ] A [ ] R |
| CHG-02 | §9.2 "Selecting the icon should open the tailor's **WhatsApp Business** application" | Neither iOS nor Android lets an app choose between WhatsApp and WhatsApp Business | "…shall open WhatsApp with a pre-filled message; the operating system decides which installed WhatsApp app handles it" | [ ] A [ ] R |
| CHG-03 | §10.4 "Subscription expiry shall **restrict access** to the application and its stored business records" | If read access is blocked, the promise "records are never lost" becomes untrue in practice | "…shall block creating and editing while preserving read, export and deletion rights" | [ ] A [ ] R |
| CHG-04 | §5.1 "Google sign-in **may also be offered**" | Optional in the PRD, but it forces Sign in with Apple on iOS | "Google and Apple sign-in are planned for V1.1" | [ ] A [ ] R |
| CHG-05 | §7.1 "The application shall provide **an initial standard** measurement template" | One template cannot serve women's, men's and children's tailoring | "…shall provide four seeded starter templates (Women 18 fields, Men 14, Children 10, Blank), each fully editable" | [ ] A [ ] R |
| CHG-06 | §12 "Administrators shall be able to **manage user accounts**" | Ambiguous enough to imply reading private customer data | "…shall manage subscription status and account suspension; administrators shall have no access to customer records, measurements, photographs or projects" | [ ] A [ ] R |
| CHG-07 | §8.4 "Delivery dates shall **trigger reminders**" | Reminders are in-app + local device notifications in MVP; server push is V1.1 | "…shall generate in-app reminders and, on installed mobile apps, local notifications; server-sent push is planned for V1.1" | [ ] A [ ] R |
| CHG-08 | §11.2 "**14-day** free trial" | Keep as is — just confirming | No change | [ ] A [ ] R |
| CHG-09 | §14 "At least 80% of pilot users can create a project within **10 minutes**" | Keep, but it needs analytics to be provable (added in MVP) | No change to the target; measurement added | [ ] A [ ] R |

---

## 5. WHAT IS *NOT* BEING REMOVED (so you can see nothing essential was cut)

Every item from PRD §4 (MVP scope) is still built, plus seven hardenings that the Master Spec was missing:

| Kept in MVP | Phase | Note |
|---|---|---|
| Registration, login, password reset, account recovery on a new device | P2, P11 | Recovery tested on a real phone |
| Business profile (logo, WhatsApp, socials, address, registration info) | P3, P11 | |
| Customer list, search, profiles, photos, birthdays, anniversaries | P4 | |
| Digital measurement book with **customisable** fields | P4, P6 | Four starter templates |
| Measurement history, versioning and comparison | P4, P6 | New version, never overwrite |
| Multiple projects per customer with full details | P5 | |
| Status flow `Pending → In Progress → Completed → Delivered → Archived` | P5 | Completed ≠ Delivered, manual archive |
| Delivery confirmation prompt + archive reminder | P5, P8 | |
| Project photos/attachments + captions | P5, P12 | Now a proper table, not an array |
| Project archiving, with archived items reachable under the customer | P5 | |
| WhatsApp Business access + design sharing | P8 | 1-tap, pre-filled, preview sheet |
| Secure private cloud storage | P12 | Private buckets, signed URLs |
| Per-tailor data isolation | P10 | Enforced in Postgres, proven by tests |
| Subscription + **14-day trial** + expiry lockout that never deletes data | P7, P13 | |
| Renewal restores access to everything | P13 | Tested explicitly |
| Administrative dashboard | P14 | Aggregates only, no private data |
| **Added:** reminders / Due tab | P8 | Was missing from the spec |
| **Added:** data export (CSV + JSON) | P15 | Was missing (PRD §10.5) |
| **Added:** 30-day Recently Deleted + restore | P7, P15 | Was missing |
| **Added:** status history timeline | P11 | Was missing |
| **Added:** phone normalisation so WhatsApp links work | P4 | Critical for `wa.me` |
| **Added:** funnel analytics to prove PRD §14 targets | P15 | Was missing |
| **Added:** project attachments table, payment ledger, admin roles | P10–P14 | Security/correctness fixes |

---

## 6. WHAT REINSTATING AN ITEM COSTS (so you can decide with numbers)

Baseline: **70 working days to pilot** (P0–P16), of which 38 days is the mock front end you review before any backend work.

| Item | Inserts into | Extra days | New pilot total |
|---|---|---|---|
| DEF-05 dark mode | P1 | +1.5 | 71.5 |
| DEF-18 PITR backups | ops | +1 | 71 |
| DEF-04 customer merge | P4 | +2 | 72 |
| DEF-07 voice notes | P5 | +2 | 72 |
| DEF-19 Excel/PDF export | P15 | +2 | 72 |
| DEF-16 promo codes | P13 | +2 | 72 |
| DEF-23 email notifications | P12 | +2 | 72 |
| DEF-01 referral credits | P13 | +3 | 73 |
| DEF-02 Google + Apple sign-in | P11 | +3 | 73 |
| DEF-08 realtime sync | P12 | +3 | 73 |
| DEF-17 multi-currency | P13 | +3 | 73 |
| DEF-03 server push | P12 | +4 | 74 |
| DEF-09 PDF invoices | P15 | +5 | 75 |
| DEF-10 insight charts | P15 | +4 | 74 |
| DEF-11 conflict-resolution UI | P12 | +5 | 75 |
| DEF-06 multi-language | all phases | +5 | 75 |
| DEF-20 staff seats | P11 | +7 | 77 |
| DEF-21 customer portal | after P16 | +9 | 79 |
| DEF-13 SMS add-on | V1.1 | +8–11 | — |
| DEF-14/15 WhatsApp Cloud API | V2 | +10–14 | — |
| DEF-25 white-label | V1.1 | +6 | — |
| DEF-22 template marketplace | V1.1 | +5 | — |
| DEF-24 Stripe/Paddle | V1.1 | +4 | — |
| DEF-12 bulk WhatsApp | V2 only (policy risk) | +4 | — |

**Reading the table:** reinstating **one** small item (≤3 days) is harmless — tell me and I will fold it into that phase. Reinstating **two or more items above 4 days** pushes the pilot by **1–2 weeks** and delays store submission.

**My recommendation:** approve the deferrals as listed, ship the MVP, then let **the first 20 paying tailors** choose the V1.1 order. Five real users' complaints will rank the roadmap better than any planning session — and DEF-13 (SMS) is a feature you can sell, so it will pay for itself the moment there is demand.

---

## 7. SIGN-OFF

Reply in one line, for example:
`DEF-01 A, DEF-02 A, DEF-03 A, DEF-12 X, DEF-13 A, DEF-14 A, CHG-02 A, D-16 Agree, D-21 Agree`

Anything left blank is treated as **A (approve deferral)** for planning purposes, and can be reinstated later without rework.

**If you approve only five things, approve these:**

| Priority | Item | Reason |
|---|---|---|
| 1 | **DEF-01** defer referral **money** | Financial liability + it is not in your PRD |
| 2 | **DEF-02** defer social sign-in | Avoids Apple rejection risk and doubles auth testing |
| 3 | **DEF-03** defer server push | Local + in-app reminders already deliver the daily value |
| 4 | **DEF-13** move SMS to V1.1 **as a paid add-on** | Protects margin; becomes a revenue line instead of a cost |
| 5 | **DROP-03 + DROP-04** keep admin out of private data | This is the trust promise the whole product rests on |

| Field | Entry |
|---|---|
| Reviewed by | Client — DIOKS TAILORS (decision given by chat) |
| Date | 14 November 2026 |
| Approved as listed (Y/N) | **Y — approved as listed** |
| Items to **reinstate** | None |
| Items to **drop permanently** | DROP-01 … DROP-07 as listed |
| Formal signature | ______________________________ *(pending, for records)* |

---

## 8. V1.1 RELEASE DEFINITION (approved scope, in build order)

**Entry criteria:** MVP live ≥ 4 weeks, ≥ 20 paying tailors, no open P0 bugs, and `wish_log` data available so SMS demand is judged on evidence rather than opinion.

| Order | What gets built | IDs | Estimate |
|---|---|---|---|
| 1 | **Occasion-based SMS add-on** — credit packs, monthly cap, opt-out keyword, delivery log, aggregator abstraction | DEF-13, DEF-26 | 8–11 days |
| 2 | **Server push notifications** (order-ready, delivery, payment failed) | DEF-03 | 4 days |
| 3 | **Customer merge** (with undo + audit) | DEF-04 | 2 days |
| 4 | **Excel/PDF export + dark mode** | DEF-19, DEF-05 | 3.5 days |
| 5 | **Google + Apple sign-in** (together, to satisfy Apple 4.8) | DEF-02 | 3 days |
| 6 | **Promo codes / trial extensions** | DEF-16 | 2 days |

**V1.1 total ≈ 23–26 working days (~5–6 weeks).**

**On-demand only** (build when data justifies it, not on a calendar): referral credits (DEF-01), realtime sync (DEF-08), voice notes (DEF-07), email notifications (DEF-23), PITR backups (DEF-18), multi-currency (DEF-17), template marketplace (DEF-22), white-label (DEF-25), Stripe/Paddle (DEF-24).

**V2 headline:** official **WhatsApp Cloud API** automation (DEF-14/15) plus the accounting / inventory / invoicing modules from PRD §13 — only after V1.1 proves the revenue.

**SMS decisions recorded — all "Agree", 14 Nov 2026:**
- **D-16** WhatsApp-first in MVP; SMS as a paid V1.1 add-on.
- **D-17** Occasion-based; maximum 2 relational messages per customer per year; no monthly blasts.
- **D-18** Credit packs (₦1,000 ≈ 200 SMS) — **validate against the aggregator's live rate before publishing a pack price**.
- **D-19** Aggregator's default sender ID first; branded sender ID later (needs CAC documents, 1–4 weeks).
- **D-20** Relational wishes on when the date is provided; marketing/promos off until the customer opts in.
- **D-21** Consent columns + `wish_log` added in **P10** (+0.5 day, absorbed inside P10's allowance).

> **Revisit at V1.1 kickoff:** the ₦3–₦5 per-SMS figure is an estimate. Sign with an aggregator (Termii / Africa's Talking / a local provider), then re-run the margin maths on a 150-customer tailor before you set the pack price.

---

### Change log

| Version | Date | Change |
|---|---|---|
| 1.1 | 14 Nov 2026 | **Approved by client**: all 33 rows stand as listed, all unanswered decisions defaulted, nothing reinstated. Added §8 V1.1 release definition (23–26 days) and recorded the SMS decisions D-16…D-21 |
| 1.0 | 14 Nov 2026 | First register: 26 deferrals, 7 permanent drops, 9 wording changes, SMS/WhatsApp wishes analysis, reinstatement cost table |






