import { addDaysISO } from '@/lib/date';

import { CHILDREN_FIELDS, MEN_FIELDS, WOMEN_FIELDS } from '../templates';
import type {
  BusinessProfile,
  Customer,
  Measurement,
  Project,
  Subscription,
  Template,
} from '../types';

export const MOCK_VERSION = 1;

export interface MockCredential {
  userId: string;
  password: string;
  fullName: string;
  email: string;
}

export interface MockDatabase {
  version: number;
  businesses: BusinessProfile[];
  subscriptions: Subscription[];
  customers: Customer[];
  templates: Template[];
  measurements: Measurement[];
  projects: Project[];
  credentials: MockCredential[];
}

export const DEMO_PASSWORD = 'demo1234';

export const DEMO_ACCOUNTS = [
  { key: 'trialing', email: 'adaeze@dioks.app', label: 'Active studio', hint: '9-day trial · full data' },
  { key: 'expired', email: 'expired@dioks.app', label: 'Expired', hint: 'read-only paywall demo' },
  { key: 'new', email: 'new@dioks.app', label: 'Brand new', hint: 'empty state demo' },
] as const;

const now = () => new Date().toISOString();
const iso = (days: number) => addDaysISO(days);
const stamp = (days: number) => `${iso(days)}T09:00:00.000Z`;

function business(
  overrides: Partial<BusinessProfile> & Pick<BusinessProfile, 'id' | 'userId' | 'businessName'>,
): BusinessProfile {
  return {
    whatsappNumber: '+2348030000000',
    socialMedia: {},
    preferredUnit: 'inches',
    referralCode: 'DIOKS-DEMO',
    timezone: 'Africa/Lagos',
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

function customer(
  index: number,
  businessId: string,
  fullName: string,
  phoneE164: string,
  extra: Partial<Customer> = {},
): Customer {
  return {
    id: `cus_${index}`,
    businessId,
    fullName,
    phoneE164,
    createdAt: now(),
    updatedAt: now(),
    ...extra,
  };
}

function project(
  index: number,
  businessId: string,
  customerId: string,
  name: string,
  status: Project['status'],
  expectedInDays: number,
  extra: Partial<Project> = {},
): Project {
  return {
    id: `prj_${index}`,
    businessId,
    customerId,
    name,
    status,
    orderReceivedAt: iso(expectedInDays - 14),
    expectedDeliveryAt: iso(expectedInDays),
    attachments: [],
    createdAt: now(),
    updatedAt: now(),
    ...extra,
  };
}

export function createSeedDatabase(): MockDatabase {
  const b1: BusinessProfile = business({
    id: 'biz_adaeze',
    userId: 'usr_adaeze',
    businessName: 'Adaeze Couture',
    whatsappNumber: '+2348031234567',
    phoneNumber: '+2348031234567',
    email: 'adaeze@dioks.app',
    address: 'Lekki Phase 1, Lagos',
    socialMedia: { instagram: '@adaezecouture', tiktok: '@adaezecouture' },
    referralCode: 'DIOKS-ADAE',
  });

  const b2: BusinessProfile = business({
    id: 'biz_expired',
    userId: 'usr_expired',
    businessName: 'Bola Threads',
    whatsappNumber: '+2348059876543',
    email: 'expired@dioks.app',
    referralCode: 'DIOKS-BOLA',
  });

  const customers: Customer[] = [
    customer(1, b1.id, 'Adaeze Okafor', '+2348031234567', {
      birthday: iso(3),
      gender: 'female',
      notes: 'Prefers fitted bodices. Allergic to raw lace.',
    }),
    customer(2, b1.id, 'Bola Adeyemi', '+2348052345678', {
      birthday: iso(6),
      gender: 'female',
      anniversary: iso(28),
    }),
    customer(3, b1.id, 'Chidinma Eze', '+2348073456789', { gender: 'female' }),
    customer(4, b1.id, 'Funke Balogun', '+2348094567890', { gender: 'female', birthday: iso(40) }),
    customer(5, b1.id, 'Ngozi Ibe', '+2348025678901', { gender: 'female' }),
    customer(6, b1.id, 'Yetunde Salami', '+2348066789012', { gender: 'female' }),
    customer(7, b2.id, 'Grace Okon', '+2348087890123', { gender: 'female' }),
    customer(8, b2.id, 'Halima Bello', '+2348038901234', { gender: 'female' }),
  ];

  const templates: Template[] = [
    {
      id: 'tpl_women',
      businessId: b1.id,
      name: 'Women — Standard',
      isDefault: true,
      fields: WOMEN_FIELDS,
      createdAt: now(),
    },
    {
      id: 'tpl_men',
      businessId: b1.id,
      name: 'Men — Standard',
      isDefault: false,
      fields: MEN_FIELDS,
      createdAt: now(),
    },
    {
      id: 'tpl_children',
      businessId: b1.id,
      name: 'Children — Standard',
      isDefault: false,
      fields: CHILDREN_FIELDS,
      createdAt: now(),
    },
  ];

  const womenValues: Record<string, number> = {
    neck: 14,
    shoulder: 15.5,
    bust: 38,
    under_bust: 32,
    waist: 32.5,
    hip: 41,
    sleeve_length: 23,
    bicep: 12,
    armhole: 17,
    wrist: 6.25,
    back_length: 16,
    front_length: 17.5,
    gown_length: 58,
    skirt_length: 41,
    thigh: 24,
    knee: 15,
    trouser_length: 40,
    inseam: 30,
  };

  const measurements: Measurement[] = [
    {
      id: 'mea_1_v1',
      businessId: b1.id,
      customerId: 'cus_1',
      version: 1,
      data: { ...womenValues, waist: 31, hip: 40 },
      unit: 'inches',
      isCurrent: false,
      recordedAt: stamp(-120),
    },
    {
      id: 'mea_1_v2',
      businessId: b1.id,
      customerId: 'cus_1',
      version: 2,
      data: womenValues,
      unit: 'inches',
      isCurrent: true,
      notes: 'Re-measured after fitting.',
      recordedAt: stamp(-12),
    },
    {
      id: 'mea_2_v1',
      businessId: b1.id,
      customerId: 'cus_2',
      version: 1,
      data: { ...womenValues, bust: 36, waist: 30, hip: 39 },
      unit: 'inches',
      isCurrent: true,
      recordedAt: stamp(-30),
    },
  ];

  const projects: Project[] = [
    project(1, b1.id, 'cus_1', 'Wedding gown', 'in_progress', 5, {
      measurementId: 'mea_1_v2',
      description: 'Ivory duchess satin, corset bodice, cathedral train.',
      instructions: 'Beading on the bodice only. Pick-up 4pm Saturday.',
    }),
    project(2, b1.id, 'cus_2', 'Aso-ebi set (6 yards)', 'pending', 12, {
      measurementId: 'mea_2_v1',
      description: 'Coral lace with matching gele.',
    }),
    project(3, b1.id, 'cus_3', 'Kaftan', 'completed', -2, {
      instructions: 'Awaiting customer pick-up.',
    }),
    project(4, b1.id, 'cus_4', 'Two-piece suit', 'delivered', -10, { collectedAt: iso(-9) }),
    project(5, b1.id, 'cus_5', 'Bridesmaid dress', 'archived', -40, { collectedAt: iso(-38) }),
    project(6, b1.id, 'cus_6', 'Corporate shirt', 'pending', -1, { notes: 'Fabric delivered late.' }),
    project(7, b1.id, 'cus_1', 'Ankara jumpsuit', 'in_progress', 2),
    project(8, b1.id, 'cus_2', 'Agbada set', 'completed', 1),
    project(9, b2.id, 'cus_7', 'School uniform batch', 'in_progress', 4),
    project(10, b2.id, 'cus_8', 'Blouse', 'pending', 9),
  ];

  const subscriptions: Subscription[] = [
    { businessId: b1.id, status: 'trialing', planName: 'MVP Regular', trialEndsAt: stamp(9) },
    {
      businessId: b2.id,
      status: 'expired',
      planName: 'MVP Regular',
      trialEndsAt: stamp(-30),
      currentPeriodEnd: stamp(-5),
    },
  ];

  const credentials: MockCredential[] = [
    { userId: 'usr_adaeze', email: 'adaeze@dioks.app', password: DEMO_PASSWORD, fullName: 'Adaeze Okafor' },
    { userId: 'usr_expired', email: 'expired@dioks.app', password: DEMO_PASSWORD, fullName: 'Bola Adeyemi' },
    { userId: 'usr_new', email: 'new@dioks.app', password: DEMO_PASSWORD, fullName: 'New Tailor' },
  ];

  return {
    version: MOCK_VERSION,
    businesses: [b1, b2],
    subscriptions,
    customers,
    templates,
    measurements,
    projects,
    credentials,
  };
}

