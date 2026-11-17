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
} from './types';

export type ProjectFilter = 'active' | 'completed' | 'delivered' | 'archived' | 'all';

/**
 * The contract every data source satisfies.
 * Screens never import Supabase: screen → hook → repository → mock | supabase.
 */
export interface Repository {
  auth: {
    getSession(): Promise<AuthSession | null>;
    signIn(input: SignInInput): Promise<AuthSession>;
    signUp(input: SignUpInput): Promise<AuthSession>;
    signOut(): Promise<void>;
    requestPasswordReset(email: string): Promise<void>;
    resetPassword(token: string, password: string): Promise<void>;
  };
  business: {
    get(): Promise<BusinessProfile>;
    /** Onboarding only. Mirrors the `create_business_profile` RPC in Phase 10. */
    create(input: NewBusinessProfile): Promise<BusinessProfile>;
    save(patch: Partial<BusinessProfile>): Promise<BusinessProfile>;
  };
  customers: {
    list(query?: string): Promise<Customer[]>;
    get(id: string): Promise<Customer>;
    create(input: NewCustomer): Promise<Customer>;
    update(id: string, patch: Partial<Customer>): Promise<Customer>;
    softDelete(id: string): Promise<void>;
    restore(id: string): Promise<void>;
    listDeleted(): Promise<Customer[]>;
  };
  measurements: {
    listVersions(customerId: string): Promise<Measurement[]>;
    current(customerId: string): Promise<Measurement | null>;
    saveVersion(input: NewMeasurement): Promise<Measurement>;
    setCurrent(customerId: string, measurementId: string): Promise<void>;
  };
  templates: {
    list(): Promise<Template[]>;
    save(template: Template): Promise<Template>;
    remove(id: string): Promise<void>;
  };
  projects: {
    list(filter?: ProjectFilter): Promise<Project[]>;
    byCustomer(customerId: string): Promise<Project[]>;
    get(id: string): Promise<Project>;
    create(input: NewProject): Promise<Project>;
    update(id: string, patch: Partial<Project>): Promise<Project>;
    setStatus(id: string, status: ProjectStatus): Promise<Project>;
  };
  reminders: {
    due(windowDays?: number): Promise<Reminder[]>;
  };
  subscription: {
    get(): Promise<Subscription>;
    startCheckout(): Promise<{ url: string }>;
  };
}

export class RepositoryError extends Error {
  constructor(
    public code:
      | 'invalid_credentials'
      | 'email_taken'
      | 'profile_exists'
      | 'not_found'
      | 'not_authenticated'
      | 'subscription_expired'
      | 'invalid_transition'
      | 'network'
      | 'unknown',
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'RepositoryError';
  }
}

/** User-facing copy for repository failures (never show raw errors). */
export const repositoryErrorCopy: Record<RepositoryError['code'], string> = {
  invalid_credentials: 'That email and password do not match. Please try again.',
  email_taken: 'An account with this email already exists. Try signing in instead.',
  profile_exists: 'This account already has a business profile.',
  not_found: 'We could not find that record. It may have been deleted.',
  not_authenticated: 'Please sign in again to continue.',
  subscription_expired: 'Your subscription has ended. Renew to make changes — your records are safe.',
  invalid_transition: 'That status change is not allowed. Pull to refresh and try again.',
  network: 'No connection. Your changes are saved and will sync when you are back online.',
  unknown: 'Something went wrong. Please try again.',
};

export function toRepositoryError(error: unknown): RepositoryError {
  if (error instanceof RepositoryError) return error;
  return new RepositoryError('unknown', error instanceof Error ? error.message : undefined);
}
