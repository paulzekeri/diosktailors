/**
 * The project status machine (§4.6) — one source of truth for what the UI may
 * offer and what a Phase 10 Postgres trigger will enforce.
 *
 *   pending → in_progress → completed → delivered → archived
 *   completed → in_progress        (rework, allowed)
 *
 * Two rules the gate cares about: `completed` and `delivered` are separate
 * actions, and nothing may reach `archived` except from `delivered` **and**
 * only after a second confirmation.
 */
import type { Project, ProjectStatus } from '@/data/types';
import { DAY_MS, daysUntil, startOfDay } from '@/lib/date';

const TRANSITIONS: Record<ProjectStatus, readonly ProjectStatus[]> = {
  pending: ['in_progress'],
  in_progress: ['completed'],
  completed: ['delivered', 'in_progress'],
  delivered: ['archived'],
  archived: [],
};

/** Lifecycle order, used by the timeline on the detail screen. */
export const STATUS_ORDER: readonly ProjectStatus[] = [
  'pending',
  'in_progress',
  'completed',
  'delivered',
  'archived',
];

export function canTransition(from: ProjectStatus, to: ProjectStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function nextStatuses(from: ProjectStatus): ProjectStatus[] {
  return [...(TRANSITIONS[from] ?? [])];
}

export interface StatusAction {
  to: ProjectStatus;
  label: string;
  /** Red button + destructive confirmation. */
  destructive?: boolean;
  /** Second tap required; copy is the consequence, never a generic "Are you sure?". */
  confirm?: { title: string; message: string; confirmLabel: string; destructive?: boolean };
  /** Toast after the move succeeds. */
  toast: string;
  /** Rendered under the primary action. */
  secondary?: boolean;
}

/**
 * Contextual actions for the detail screen's primary button. Only legal moves
 * are ever offered — an illegal transition has no button to press.
 */
export function actionsFor(status: ProjectStatus): StatusAction[] {
  switch (status) {
    case 'pending':
      return [{ to: 'in_progress', label: 'Start work', toast: 'Work started' }];
    case 'in_progress':
      return [{ to: 'completed', label: 'Mark completed', toast: 'Completed · deliver when it is collected' }];
    case 'completed':
      return [
        {
          to: 'delivered',
          label: 'Mark delivered',
          confirm: {
            title: 'Mark as delivered?',
            message: 'This does not archive the job. Archive when you have handed it over.',
            confirmLabel: 'Mark delivered',
          },
          toast: 'Delivered. Archive when you’ve handed it over.',
        },
        {
          to: 'in_progress',
          label: 'Return to in progress',
          secondary: true,
          confirm: {
            title: 'Reopen for rework?',
            message: 'The job goes back to in progress. Nothing is lost.',
            confirmLabel: 'Return to in progress',
          },
          toast: 'Back in progress',
        },
      ];
    case 'delivered':
      return [
        {
          to: 'archived',
          label: 'Archive job',
          destructive: true,
          confirm: {
            title: 'Archive this job?',
            message: 'Archiving hides it from active lists and the due reminders. Measurements, photos and history stay.',
            confirmLabel: 'Archive job',
            destructive: true,
          },
          toast: 'Archived',
        },
      ];
    case 'archived':
      return [];
  }
}

export type DueBucket = 'overdue' | 'today' | 'this_week' | 'later' | 'closed';

const CLOSED: readonly ProjectStatus[] = ['delivered', 'archived'];

export function isClosed(status: ProjectStatus): boolean {
  return CLOSED.includes(status);
}

/** Overdue = past its expected delivery date and not yet delivered/archived. */
export function dueBucket(
  project: Pick<Project, 'expectedDeliveryAt' | 'status'>,
  from: Date = new Date(),
): DueBucket {
  if (isClosed(project.status)) return 'closed';

  const days = daysUntil(project.expectedDeliveryAt, from);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days <= 7) return 'this_week';
  return 'later';
}

export function isOverdue(project: Pick<Project, 'expectedDeliveryAt' | 'status'>, from: Date = new Date()): boolean {
  return dueBucket(project, from) === 'overdue';
}

/** Whole days late; 0 when not late. */
export function daysLate(project: Pick<Project, 'expectedDeliveryAt' | 'status'>, from: Date = new Date()): number {
  if (isClosed(project.status)) return 0;
  return Math.max(0, Math.abs(Math.min(0, daysUntil(project.expectedDeliveryAt, from))));
}

/** What the row's pill should read: the real status, or `overdue` when late. */
export function pillStatus(
  project: Pick<Project, 'expectedDeliveryAt' | 'status'>,
  from: Date = new Date(),
): ProjectStatus | 'overdue' {
  return isOverdue(project, from) ? 'overdue' : project.status;
}

/** True when the job was delivered on or before the promised date. */
export function deliveredOnTime(project: Pick<Project, 'expectedDeliveryAt' | 'collectedAt'>): boolean | null {
  if (!project.collectedAt) return null;
  const expected = startOfDay(new Date(project.expectedDeliveryAt)).getTime();
  const collected = startOfDay(new Date(project.collectedAt)).getTime();
  return Math.round(collected - expected) / DAY_MS <= 0;
}
