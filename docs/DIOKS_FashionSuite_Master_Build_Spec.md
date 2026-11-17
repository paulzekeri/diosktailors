# DIOKS FASHIONSUITE – MASTER BUILD SPECIFICATION (MVP V1.0)

**Product Name:** DIOKS FashionSuite  
**Company:** DIOKS TAILORS  
**Architecture:** Cross-Platform PWA & Mobile App (React Native with Expo) \+ Managed PostgreSQL (Supabase) \+ Static Hosting (Cloudflare Pages / Vercel)  
**Target Deployment:** Web PWA, Android, and iOS

---

## SECTION 1: ARCHITECTURE & TECH STACK OVERVIEW

1. **Frontend Framework:** React Native using **Expo (Expo Router)**. This allows a single codebase to deploy as a Progressive Web App (PWA) on browsers and build natively for iOS and Android app stores.  
2. **Backend & Database:** **Supabase** (Managed PostgreSQL database, Row Level Security, Auth, and Storage Buckets).  
3. **Image Management:** Client-side compression using `expo-image-manipulator` and caching using `expo-image` to stay well within Supabase's free tier limits (\~80–120 KB per image).  
4. **Offline Support:** `@tanstack/react-query` paired with `@react-native-async-storage/async-storage` so tailors can view saved measurements and queue entries offline in areas with poor network reception.  
5. **Web PWA Hosting:** Static export (`npx expo export -p web`) deployed to **Cloudflare Pages** or **Vercel** with SPA fallback routing rules.

---

## SECTION 2: DATABASE SCHEMA (SUPABASE POSTGRESQL)

Run the following SQL migration script in your Supabase SQL Editor to set up all tables, foreign keys, referral fields, and Row Level Security (RLS) policies.

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. BUSINESS PROFILES TABLE (Includes Single-Tier Referral Fields)
create table public.business_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  business_name text not null,
  logo_url text,
  phone_number text,
  whatsapp_number text,
  email text,
  social_media jsonb default '{}'::jsonb,
  business_address text,
  registration_info text,
  preferred_unit text check (preferred_unit in ('inches', 'cm')) default 'inches',
  referral_code text unique not null,
  referred_by_id uuid references public.business_profiles(id),
  referral_credit_balance numeric(10, 2) default 0.00 not null,
  role text check (role in ('user', 'admin')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. CUSTOMERS TABLE (Includes 30-day soft delete support)
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_profiles(id) on delete cascade not null,
  full_name text not null,
  phone_number text not null,
  whatsapp_number text,
  email text,
  photograph_url text,
  gender text check (gender in ('female', 'male', 'other')),
  birthday date,
  wedding_anniversary date,
  notes text,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. MEASUREMENT TEMPLATES TABLE (Customizable fields per business)
create table public.measurement_templates (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_profiles(id) on delete cascade not null,
  template_name text default 'Standard Template',
  fields_definition jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. CUSTOMER MEASUREMENTS TABLE (Versioning history)
create table public.customer_measurements (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  business_id uuid references public.business_profiles(id) on delete cascade not null,
  measurements_data jsonb not null default '{}'::jsonb,
  version_number integer default 1,
  unit text check (unit in ('inches', 'cm')) default 'inches',
  is_current boolean default true,
  notes text,
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CUSTOMER PROJECTS TABLE
create table public.customer_projects (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers(id) on delete cascade not null,
  business_id uuid references public.business_profiles(id) on delete cascade not null,
  project_name text not null,
  linked_measurement_id uuid references public.customer_measurements(id),
  design_photos text[] default '{}',
  job_description text,
  customer_instructions text,
  special_notes text,
  order_received_date date default current_date,
  expected_delivery_date date not null,
  collection_or_delivery_date date,
  status text check (status in ('pending', 'in_progress', 'completed', 'delivered', 'archived')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. SUBSCRIPTIONS TABLE
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid references public.business_profiles(id) on delete cascade not null unique,
  plan_name text default 'MVP Regular',
  status text check (status in ('trialing', 'active', 'expired', 'cancelled')) default 'trialing',
  trial_ends_at timestamp with time zone default (now() + interval '14 days') not null,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. REFERRAL REWARDS LOG TABLE (Tracks one-time service credits)
create table public.referral_rewards (
  id uuid primary key default uuid_generate_v4(),
  referrer_business_id uuid references public.business_profiles(id) on delete cascade not null,
  referred_business_id uuid references public.business_profiles(id) on delete cascade not null unique,
  credit_amount numeric(10, 2) not null,
  status text check (status in ('pending_payment', 'credited')) default 'pending_payment',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE ROW LEVEL SECURITY (RLS)
alter table public.business_profiles enable row level security;
alter table public.customers enable row level security;
alter table public.measurement_templates enable row level security;
alter table public.customer_measurements enable row level security;
alter table public.customer_projects enable row level security;
alter table public.subscriptions enable row level security;
alter table public.referral_rewards enable row level security;

-- RLS POLICIES: Users can only access rows belonging to their business profile
create policy "Users can CRUD own business profile" on public.business_profiles
  for all using (auth.uid() = user_id);

create policy "Users can CRUD own customers" on public.customers
  for all using (business_id in (select id from public.business_profiles where user_id = auth.uid()));

create policy "Users can CRUD own templates" on public.measurement_templates
  for all using (business_id in (select id from public.business_profiles where user_id = auth.uid()));

create policy "Users can CRUD own measurements" on public.customer_measurements
  for all using (business_id in (select id from public.business_profiles where user_id = auth.uid()));

create policy "Users can CRUD own projects" on public.customer_projects
  for all using (business_id in (select id from public.business_profiles where user_id = auth.uid()));

create policy "Users can read/update own subscription" on public.subscriptions
  for all using (business_id in (select id from public.business_profiles where user_id = auth.uid()));

create policy "Users can view own referral rewards" on public.referral_rewards
  for select using (referrer_business_id in (select id from public.business_profiles where user_id = auth.uid()));
```

---

## SECTION 3: CORE MVP FEATURE REQUIREMENTS

### 1\. Authentication, Onboarding & Subscription Lockout

* Email/Password registration and Forgot Password recovery via Supabase Auth.  
* Upon first login, guide the user through creating their `business_profile` (Business Name, WhatsApp Number, Compressed Logo upload, optional Referral Code input).  
* Automatically generate a unique `referral_code` (e.g., `DIOKS-XXXX`) for the new business and start a **14-day Free Trial** in `subscriptions`.  
* **Subscription Expiry Rule:** If `status == 'expired'`, display a renewal paywall locking creation/editing screens, **never** deleting user data. Full access restores automatically upon payment confirmation.

### 2\. Single-Tier Service-Credit Referral System (V1)

* **Mechanics:** Strictly single-tier (\$A \\rightarrow B\$), one-time reward per referred business, paid strictly as **non-withdrawable service credit** toward future subscription renewals (zero cash payouts).  
* **Flow:**  
  1. Tailor A shares their unique `referral_code` or invite link via WhatsApp.  
  2. Tailor B enters Tailor A's code during registration (`referred_by_id` links to Tailor A, and a `pending_payment` row is created in `referral_rewards`).  
  3. When Tailor B completes their first paid annual subscription (e.g., via Paystack webhook), the backend marks the reward as `credited` and adds the configured credit bonus (e.g., ₦500) to Tailor A's `referral_credit_balance`.  
  4. When Tailor A renews their own subscription, their `referral_credit_balance` is automatically deducted from their renewal invoice total.  
* **UI:** Include a "Refer & Earn Free Subscription" card in Settings showing their referral code, a 1-tap "Share via WhatsApp" button, total friends referred, and available credit balance.

### 3\. Digital Customer Measurement Book

* **Customizable Fields:** Tailors can add, rename, or delete measurement fields stored as JSONB in `measurement_templates`.  
* **Quick Entry Helpers:** Include one-tap fraction buttons (`+¼`, `+½`, `+¾`) alongside numeric inputs and an `inches` / `cm` toggle.  
* **Version Control:** Updating measurements creates a new record in `customer_measurements` with an incremented `version_number` (`is_current = true`), allowing tailors to compare past vs. current measurements.

### 4\. Customer & Project Management

* Searchable customer directory with name, phone, and profile photo, plus a 30-day "Recently Deleted" restore bin (`deleted_at`).  
* Dashboard Home card highlighting **Upcoming Birthdays & Anniversaries** (next 7 days) with a 1-tap WhatsApp greeting button.  
* Multiple projects per customer acting as job diaries (`Pending` \$\\rightarrow\$ `In Progress` \$\\rightarrow\$ `Completed` \$\\rightarrow\$ `Delivered` \$\\rightarrow\$ `Archived`).  
* **Delivery Workflow:** `Completed` and `Delivered` remain distinct statuses. Marking a project as `Delivered` triggers a confirmation modal and reminds the tailor to archive it (never auto-archived).

### 5\. Client-Side Image Optimization

* Install `expo-image-manipulator` and `expo-image`.  
* Before uploading customer portraits or style photos to Supabase Storage buckets, compress them on-device to max **800px width at 70% JPEG quality** (\~80–120 KB per photo).

### 6\. WhatsApp Business Integration

* Prominent WhatsApp action buttons (`#25D366`) using `Linking.openURL('https://wa.me/<number>?text=...')` with pre-filled status messages (e.g., fitting ready, order completed).  
* Use `expo-sharing` to share project design reference images directly to WhatsApp Business.

### 7\. Privacy-Restricted Admin Dashboard

* Accessible only when `business_profiles.role === 'admin'`.  
* Admins can view platform-wide user counts, active subscriptions, payment logs, and configure referral credit amounts—but **RLS policies must strictly prevent admins from reading private customer records, measurements, or project photos**.

---

## SECTION 4: WEB PWA & HOSTING DEPLOYMENT GUIDE

### 1\. Expo PWA Configuration (`app.json`)

Ensure your `app.json` includes static web output settings:

```json
{
  "expo": {
    "name": "DIOKS FashionSuite",
    "slug": "dioks-fashionsuite",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/favicon.png"
    }
  }
}
```

### 2\. Local Development vs. Live Deployment

1. **Local Testing (On Your Laptop):** Run `npx expo start` to preview and test the web app locally at `http://localhost:8081` while connected live to your cloud Supabase database.  
2. **Build Static Web Bundle for Production:**

```sh
npx expo export -p web
```

   This compiles your production-ready PWA into the `dist` folder.

   

3. **Live Hosting (Cloudflare Pages or Vercel):**  
   * Connect your GitHub repository to **Cloudflare Pages** (recommended for free commercial hosting) or **Vercel**.  
   * Build command: `npx expo export -p web`  
   * Output directory: `dist`  
4. **SPA Routing Fallback (Crucial):** Create a `_redirects` file inside your `public/` folder so refreshing deep links on the web doesn't throw a 404 error:

```
/*    /index.html   200
```

---

## SECTION 5: FUTURE-PROOFING FOR V2 EXPANSION

* **Multi-User / Staff Access:** All core tables are scoped to `business_id`, allowing future updates to add apprentice/staff logins and role permissions without rewriting core tables.  
* **Accounting, Inventory & Assets:** Relational tables for income/expenses, tailoring material sales, and workshop asset registers can be appended cleanly in V2 via foreign keys to `business_id` and `customer_projects`.