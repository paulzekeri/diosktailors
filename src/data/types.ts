/**
 * Domain types — single source of truth for the app.
 * Mirrors the hardened database schema in DIOKS_FashionSuite_Design_and_Dev_Plan.md §9.
 */

export type Unit = 'inches' | 'cm';
export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'delivered' | 'archived';
export type FieldGroup = 'upper' | 'lower' | 'length' | 'custom';
export type SubscriptionStatus = 'trialing' | 'active' | 'expired' | 'cancelled';
export type Gender = 'female' | 'male' | 'other';

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  logoUrl?: string;
  phoneNumber?: string;
  whatsappNumber: string;
  email?: string;
  address?: string;
  socialMedia: SocialLinks;
  registrationInfo?: string;
  preferredUnit: Unit;
  referralCode: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  fullName: string;
  phoneE164: string;
  whatsappE164?: string;
  email?: string;
  photoUrl?: string;
  gender?: Gender;
  birthday?: string;
  anniversary?: string;
  notes?: string;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateField {
  id: string;
  label: string;
  group: FieldGroup;
  type: 'number' | 'text';
  unit?: Unit;
  required?: boolean;
  hint?: string;
  order: number;
}

export interface Template {
  id: string;
  businessId: string;
  name: string;
  isDefault: boolean;
  fields: TemplateField[];
  createdAt: string;
}

export interface Measurement {
  id: string;
  customerId: string;
  businessId: string;
  version: number;
  data: Record<string, number | string | null>;
  unit: Unit;
  isCurrent: boolean;
  notes?: string;
  recordedAt: string;
}

export type AttachmentKind = 'photo' | 'reference' | 'wa_screenshot' | 'voice';

export interface Attachment {
  id: string;
  kind: AttachmentKind;
  url: string;
  caption?: string;
  width?: number;
  height?: number;
  sort: number;
}

export interface Project {
  id: string;
  customerId: string;
  businessId: string;
  name: string;
  measurementId?: string;
  status: ProjectStatus;
  orderReceivedAt: string;
  expectedDeliveryAt: string;
  collectedAt?: string;
  description?: string;
  instructions?: string;
  notes?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  businessId: string;
  status: SubscriptionStatus;
  planName: string;
  trialEndsAt: string;
  currentPeriodEnd?: string;
}

export type ReminderKind = 'delivery' | 'follow_up' | 'birthday' | 'anniversary';

export interface Reminder {
  id: string;
  kind: ReminderKind;
  customerId: string;
  customerName: string;
  projectId?: string;
  projectName?: string;
  dueOn: string;
  daysUntil: number;
  phoneE164: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  businessId: string | null;
  hasProfile: boolean;
}

export interface NewBusinessProfile {
  businessName: string;
  /** E.164, e.g. +2348031234567 */
  whatsappNumber: string;
  phoneNumber?: string;
  email?: string;
  logoUrl?: string;
  address?: string;
  socialMedia: SocialLinks;
  registrationInfo?: string;
  preferredUnit: Unit;
  templateKey: 'women' | 'men' | 'children' | 'blank';
  /** Code of the business that invited this one (optional). */
  referrerCode?: string;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  referralCode?: string;
  acceptedTerms: boolean;
}

export interface SignInInput {
  email: string;
  password: string;
}

export type NewCustomer = Omit<Customer, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

export type NewProject = Omit<
  Project,
  'id' | 'businessId' | 'attachments' | 'createdAt' | 'updatedAt' | 'status'
> & {
  status?: ProjectStatus;
  attachmentIds?: string[];
};

export interface NewMeasurement {
  customerId: string;
  data: Measurement['data'];
  unit: Unit;
  notes?: string;
}
