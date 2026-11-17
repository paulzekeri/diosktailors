import AsyncStorage from '@react-native-async-storage/async-storage';

import { daysUntil, nextOccurrence, toISODate } from '@/lib/date';
import { canTransition } from '@/lib/projectStatus';
import { matchesCustomerQuery } from '@/lib/search';
import { RepositoryError, type ProjectFilter, type Repository } from '../repository';
import type {
  AuthSession,
  BusinessProfile,
  Customer,
  Measurement,
  NewBusinessProfile,
  NewCustomer,
  NewMeasurement,
  NewProject,
  Project,
  ProjectStatus,
  Reminder,
  SignInInput,
  SignUpInput,
  Subscription,
  Template,
} from '../types';
import { createSeedDatabase, MOCK_VERSION, type MockDatabase } from './seed';
import { STANDARD_TEMPLATES } from '../templates';

const DB_KEY = 'dioks.mock.db.v1';
const SESSION_KEY = 'dioks.mock.session.v1';
const LATENCY_MIN = 350;
const LATENCY_MAX = 700;

let db: MockDatabase | null = null;
let session: AuthSession | null = null;
let hydrated = false;

const uid = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
const nowISO = () => new Date().toISOString();

const sleep = () =>
  new Promise<void>((resolve) => {
    const ms = LATENCY_MIN + Math.random() * (LATENCY_MAX - LATENCY_MIN);
    setTimeout(resolve, ms);
  });

async function hydrate(): Promise<void> {
  if (hydrated) return;
  const [rawDb, rawSession] = await Promise.all([
    AsyncStorage.getItem(DB_KEY),
    AsyncStorage.getItem(SESSION_KEY),
  ]);

  if (rawDb) {
    try {
      const parsed = JSON.parse(rawDb) as MockDatabase;
      db = parsed.version === MOCK_VERSION ? parsed : createSeedDatabase();
    } catch {
      db = createSeedDatabase();
    }
  } else {
    db = createSeedDatabase();
  }

  session = rawSession ? (JSON.parse(rawSession) as AuthSession) : null;
  hydrated = true;

  if (!rawDb) await persistDb();
}

async function persistDb(): Promise<void> {
  if (!db) return;
  await AsyncStorage.setItem(DB_KEY, JSON.stringify(db));
}

async function persistSession(): Promise<void> {
  if (session) {
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    await AsyncStorage.removeItem(SESSION_KEY);
  }
}

function requireDb(): MockDatabase {
  if (!db) throw new RepositoryError('unknown', 'Mock database not hydrated');
  return db;
}

function requireBusinessId(): string {
  const businessId = session?.businessId;
  if (!businessId) throw new RepositoryError('not_authenticated', 'No business profile yet');
  return businessId;
}

function subscriptionFor(businessId: string): Subscription {
  const database = requireDb();
  const found = database.subscriptions.find((s) => s.businessId === businessId);
  if (found) return found;
  const created: Subscription = {
    businessId,
    status: 'trialing',
    planName: 'MVP Regular',
    trialEndsAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
  };
  database.subscriptions.push(created);
  return created;
}

function isSubscriptionActive(businessId: string): boolean {
  const sub = subscriptionFor(businessId);
  const now = Date.now();
  if (sub.status === 'trialing') return new Date(sub.trialEndsAt).getTime() > now;
  if (sub.status === 'active') {
    return !sub.currentPeriodEnd || new Date(sub.currentPeriodEnd).getTime() > now;
  }
  return false;
}

/** Mirrors the database rule: expired subscriptions may read, never write. */
function assertWritable(businessId: string): void {
  if (!isSubscriptionActive(businessId)) {
    throw new RepositoryError('subscription_expired');
  }
}

function sessionFor(userId: string, email: string, fullName: string): AuthSession {
  const database = requireDb();
  const profile = database.businesses.find((b) => b.userId === userId);
  return {
    userId,
    email,
    fullName,
    businessId: profile?.id ?? null,
    hasProfile: Boolean(profile),
  };
}

const REFERRAL_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateReferralCode(database: MockDatabase): string {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    let suffix = '';
    for (let index = 0; index < 4; index += 1) {
      suffix += REFERRAL_ALPHABET[Math.floor(Math.random() * REFERRAL_ALPHABET.length)];
    }
    const code = `DIOKS-${suffix}`;
    if (!database.businesses.some((business) => business.referralCode === code)) return code;
  }
  return `DIOKS-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}

export const mockRepository: Repository = {
  auth: {
    async getSession() {
      await hydrate();
      if (!session) return null;
      const restored = sessionFor(session.userId, session.email, session.fullName);
      session = restored;
      return restored;
    },

    async signIn(input: SignInInput) {
      await sleep();
      await hydrate();
      const database = requireDb();
      const email = input.email.trim().toLowerCase();
      const credential = database.credentials.find((c) => c.email.toLowerCase() === email);

      if (!credential || credential.password !== input.password) {
        throw new RepositoryError('invalid_credentials');
      }

      session = sessionFor(credential.userId, credential.email, credential.fullName);
      await persistSession();
      return session;
    },

    async signUp(input: SignUpInput) {
      await sleep();
      await hydrate();
      const database = requireDb();
      const email = input.email.trim().toLowerCase();

      if (database.credentials.some((c) => c.email.toLowerCase() === email)) {
        throw new RepositoryError('email_taken');
      }

      const userId = uid('usr');
      database.credentials.push({
        userId,
        email,
        password: input.password,
        fullName: input.fullName.trim(),
      });
      await persistDb();

      session = { userId, email, fullName: input.fullName.trim(), businessId: null, hasProfile: false };
      await persistSession();
      return session;
    },

    async signOut() {
      await hydrate();
      session = null;
      await persistSession();
    },

    async requestPasswordReset(email: string) {
      await sleep();
      await hydrate();
      // Never reveal whether an account exists (same behaviour as Supabase).
      const database = requireDb();
      database.credentials.some((c) => c.email.toLowerCase() === email.trim().toLowerCase());
    },

    async resetPassword(token: string, password: string) {
      await sleep();
      await hydrate();
      if (token.length < 6 || password.length < 8) {
        throw new RepositoryError('unknown', 'invalid_reset_token');
      }
      const database = requireDb();
      const first = database.credentials[0];
      if (first) {
        first.password = password;
        await persistDb();
      }
    },
  },

  business: {
    async create(input: NewBusinessProfile) {
      await sleep();
      await hydrate();
      const current = session;
      if (!current) throw new RepositoryError('not_authenticated');
      const database = requireDb();

      if (database.businesses.some((business) => business.userId === current.userId)) {
        throw new RepositoryError('profile_exists');
      }

      const created: BusinessProfile = {
        id: uid('biz'),
        userId: current.userId,
        businessName: input.businessName.trim(),
        whatsappNumber: input.whatsappNumber,
        phoneNumber: input.phoneNumber,
        email: input.email ?? current.email,
        logoUrl: input.logoUrl,
        address: input.address,
        socialMedia: input.socialMedia,
        registrationInfo: input.registrationInfo,
        preferredUnit: input.preferredUnit,
        referralCode: generateReferralCode(database),
        timezone: 'Africa/Lagos',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      database.businesses.push(created);

      // 14-day trial starts the moment the profile exists (mirrors create_business_profile()).
      database.subscriptions.push({
        businessId: created.id,
        status: 'trialing',
        planName: 'MVP Regular',
        trialEndsAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
      });

      const starter =
        STANDARD_TEMPLATES.find((template) => template.key === input.templateKey) ?? STANDARD_TEMPLATES[0];
      database.templates.push({
        id: uid('tpl'),
        businessId: created.id,
        name: starter.name,
        isDefault: true,
        fields: starter.fields,
        createdAt: nowISO(),
      });

      await persistDb();
      session = { ...current, businessId: created.id, hasProfile: true };
      await persistSession();
      return created;
    },

    async get() {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      const profile = database.businesses.find((b) => b.id === businessId);
      if (!profile) throw new RepositoryError('not_found');
      return profile;
    },

    async save(patch: Partial<BusinessProfile>) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      const index = database.businesses.findIndex((b) => b.id === businessId);
      if (index < 0) throw new RepositoryError('not_found');

      const updated: BusinessProfile = {
        ...database.businesses[index],
        ...patch,
        id: businessId,
        updatedAt: nowISO(),
      };
      database.businesses[index] = updated;
      await persistDb();
      return updated;
    },
  },

  customers: {
    async list(query?: string) {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();

      return database.customers
        .filter((c) => c.businessId === businessId && !c.deletedAt)
        .filter((c) => matchesCustomerQuery(c, query ?? ''))
        .sort((a, b) => a.fullName.localeCompare(b.fullName));
    },

    async get(id: string) {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      const found = database.customers.find((c) => c.id === id && c.businessId === businessId);
      if (!found) throw new RepositoryError('not_found');
      return found;
    },

    async create(input: NewCustomer) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();

      const created: Customer = {
        ...input,
        id: uid('cus'),
        businessId,
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      database.customers.push(created);
      await persistDb();
      return created;
    },

    async update(id: string, patch: Partial<Customer>) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();
      const index = database.customers.findIndex((c) => c.id === id && c.businessId === businessId);
      if (index < 0) throw new RepositoryError('not_found');

      const updated: Customer = {
        ...database.customers[index],
        ...patch,
        id,
        businessId,
        updatedAt: nowISO(),
      };
      database.customers[index] = updated;
      await persistDb();
      return updated;
    },

    async softDelete(id: string) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();
      const found = database.customers.find((c) => c.id === id && c.businessId === businessId);
      if (!found) throw new RepositoryError('not_found');
      found.deletedAt = nowISO();
      found.updatedAt = nowISO();
      await persistDb();
    },

    async restore(id: string) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();
      const found = database.customers.find((c) => c.id === id && c.businessId === businessId);
      if (!found) throw new RepositoryError('not_found');
      found.deletedAt = undefined;
      found.updatedAt = nowISO();
      await persistDb();
    },

    async listDeleted() {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      return database.customers
        .filter((c) => c.businessId === businessId && c.deletedAt)
        .sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? ''));
    },
  },

  measurements: {
    async listVersions(customerId: string) {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      return database.measurements
        .filter((m) => m.customerId === customerId && m.businessId === businessId)
        .sort((a, b) => b.version - a.version);
    },

    async current(customerId: string) {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      return (
        database.measurements.find(
          (m) => m.customerId === customerId && m.businessId === businessId && m.isCurrent,
        ) ?? null
      );
    },

    async saveVersion(input: NewMeasurement) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();

      database.measurements
        .filter((m) => m.customerId === input.customerId && m.isCurrent)
        .forEach((m) => {
          m.isCurrent = false;
        });

      const versions = database.measurements.filter((m) => m.customerId === input.customerId);
      const nextVersion = versions.reduce((max, m) => Math.max(max, m.version), 0) + 1;

      const created: Measurement = {
        id: uid('mea'),
        businessId,
        customerId: input.customerId,
        version: nextVersion,
        data: input.data,
        unit: input.unit,
        isCurrent: true,
        notes: input.notes,
        recordedAt: nowISO(),
      };
      database.measurements.push(created);
      await persistDb();
      return created;
    },

    async setCurrent(customerId: string, measurementId: string) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();
      const target = database.measurements.find(
        (m) => m.id === measurementId && m.customerId === customerId && m.businessId === businessId,
      );
      if (!target) throw new RepositoryError('not_found');

      database.measurements
        .filter((m) => m.customerId === customerId)
        .forEach((m) => {
          m.isCurrent = m.id === measurementId;
        });
      await persistDb();
    },
  },

  templates: {
    async list() {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      return database.templates
        .filter((t) => t.businessId === businessId)
        .sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name));
    },

    async save(template: Template) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();

      if (template.isDefault) {
        database.templates
          .filter((t) => t.businessId === businessId)
          .forEach((t) => {
            t.isDefault = false;
          });
      }

      const index = database.templates.findIndex((t) => t.id === template.id);
      const saved: Template = { ...template, businessId };
      if (index >= 0) {
        database.templates[index] = saved;
      } else {
        database.templates.push(saved);
      }
      await persistDb();
      return saved;
    },

    async remove(id: string) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();
      database.templates = database.templates.filter((t) => !(t.id === id && t.businessId === businessId));
      await persistDb();
    },
  },

  projects: {
    async list(filter: ProjectFilter = 'active') {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      const scoped = database.projects.filter((p) => p.businessId === businessId);

      const filtered = scoped.filter((p) => {
        switch (filter) {
          case 'active':
            return p.status === 'pending' || p.status === 'in_progress' || p.status === 'completed';
          case 'completed':
            return p.status === 'completed';
          case 'delivered':
            return p.status === 'delivered';
          case 'archived':
            return p.status === 'archived';
          case 'all':
            return true;
        }
      });

      return filtered.sort((a, b) => a.expectedDeliveryAt.localeCompare(b.expectedDeliveryAt));
    },

    async byCustomer(customerId: string) {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      return database.projects
        .filter((p) => p.businessId === businessId && p.customerId === customerId)
        .sort((a, b) => b.expectedDeliveryAt.localeCompare(a.expectedDeliveryAt));
    },

    async get(id: string) {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      const found = database.projects.find((p) => p.id === id && p.businessId === businessId);
      if (!found) throw new RepositoryError('not_found');
      return found;
    },

    async create(input: NewProject) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();

      const created: Project = {
        id: uid('prj'),
        businessId,
        customerId: input.customerId,
        name: input.name,
        measurementId: input.measurementId,
        status: input.status ?? 'pending',
        orderReceivedAt: input.orderReceivedAt,
        expectedDeliveryAt: input.expectedDeliveryAt,
        collectedAt: input.collectedAt,
        description: input.description,
        instructions: input.instructions,
        notes: input.notes,
        attachments: [],
        createdAt: nowISO(),
        updatedAt: nowISO(),
      };
      database.projects.push(created);
      await persistDb();
      return created;
    },

    async update(id: string, patch: Partial<Project>) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();
      const index = database.projects.findIndex((p) => p.id === id && p.businessId === businessId);
      if (index < 0) throw new RepositoryError('not_found');

      const updated: Project = {
        ...database.projects[index],
        ...patch,
        id,
        businessId,
        updatedAt: nowISO(),
      };
      database.projects[index] = updated;
      await persistDb();
      return updated;
    },

    async setStatus(id: string, status: ProjectStatus) {
      await sleep();
      await hydrate();
      const businessId = requireBusinessId();
      assertWritable(businessId);
      const database = requireDb();
      const index = database.projects.findIndex((p) => p.id === id && p.businessId === businessId);
      if (index < 0) throw new RepositoryError('not_found');

      const current = database.projects[index];
      if (!canTransition(current.status, status)) {
        // Same rule the Postgres trigger will enforce in P10: the UI only offers
        // legal moves, and the data layer refuses anything else.
        throw new RepositoryError(
          'invalid_transition',
          `Cannot move a job from ${current.status} to ${status}.`,
        );
      }

      const updated: Project = {
        ...current,
        status,
        collectedAt:
          status === 'delivered' && !current.collectedAt ? toISODate(new Date()) : current.collectedAt,
        updatedAt: nowISO(),
      };
      database.projects[index] = updated;
      await persistDb();
      return updated;
    },
  },

  reminders: {
    async due(windowDays = 7) {
      await hydrate();
      const businessId = requireBusinessId();
      const database = requireDb();
      const today = new Date();
      const items: Reminder[] = [];

      const customersById = new Map(
        database.customers.filter((c) => c.businessId === businessId).map((c) => [c.id, c]),
      );

      database.projects
        .filter((p) => p.businessId === businessId && (p.status === 'pending' || p.status === 'in_progress'))
        .forEach((p) => {
          const days = daysUntil(p.expectedDeliveryAt, today);
          if (days > windowDays) return;
          const customer = customersById.get(p.customerId);
          items.push({
            id: `delivery_${p.id}`,
            kind: 'delivery',
            customerId: p.customerId,
            customerName: customer?.fullName ?? 'Customer',
            projectId: p.id,
            projectName: p.name,
            dueOn: p.expectedDeliveryAt,
            daysUntil: days,
            phoneE164: customer?.whatsappE164 ?? customer?.phoneE164 ?? '',
          });
        });

      const pushCustomerDate = (kind: 'birthday' | 'anniversary', customerId: string, isoDate?: string) => {
        if (!isoDate) return;
        const customer = customersById.get(customerId);
        if (!customer || customer.deletedAt) return;
        const next = nextOccurrence(isoDate, today);
        const days = daysUntil(toISODate(next), today);
        if (days > windowDays) return;
        items.push({
          id: `${kind}_${customerId}`,
          kind,
          customerId,
          customerName: customer.fullName,
          dueOn: toISODate(next),
          daysUntil: days,
          phoneE164: customer.whatsappE164 ?? customer.phoneE164,
        });
      };

      customersById.forEach((c) => {
        pushCustomerDate('birthday', c.id, c.birthday);
        pushCustomerDate('anniversary', c.id, c.anniversary);
      });

      return items.sort((a, b) => a.daysUntil - b.daysUntil);
    },
  },

  subscription: {
    async get() {
      await hydrate();
      const businessId = requireBusinessId();
      return subscriptionFor(businessId);
    },

    async startCheckout() {
      await sleep();
      // Phase 13 replaces this with a Paystack checkout URL from an Edge Function.
      return { url: 'https://paystack.com/mock-checkout' };
    },
  },
};

/** Dev helper — restores the demo dataset and signs out. */
export async function resetMockDatabase(): Promise<void> {
  db = createSeedDatabase();
  session = null;
  hydrated = true;
  await persistDb();
  await persistSession();
}

/** Dev helper — wipes persisted mock state so the next read re-seeds. */
export async function clearMockDatabase(): Promise<void> {
  db = null;
  session = null;
  hydrated = false;
  await AsyncStorage.multiRemove([DB_KEY, SESSION_KEY]);
}




