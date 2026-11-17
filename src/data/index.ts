import type { Repository } from './repository';
import { mockRepository } from './mock/mockRepository';

export * from './types';
export { STANDARD_TEMPLATES } from './templates';
export type { StarterTemplateKey } from './templates';
export { RepositoryError, repositoryErrorCopy, toRepositoryError } from './repository';
export type { ProjectFilter, Repository } from './repository';

/** Demo accounts + password are exported so the mocked login screen can offer them. */
export { DEMO_ACCOUNTS, DEMO_PASSWORD } from './mock/seed';

/**
 * Swap point: `EXPO_PUBLIC_DATA_SOURCE=supabase` in Phase 10.
 * Screens never import this directly — they use feature hooks.
 */
export const repo: Repository = mockRepository;

export const isMockData = true;

