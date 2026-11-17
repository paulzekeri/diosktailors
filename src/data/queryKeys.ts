/**
 * React Query cache keys — one namespace per entity, all factory functions so
 * invalidation can be as narrow (`detail(id)`) or as broad (`all`) as needed.
 * Lives in the data layer so customers/measurements/projects hooks share it.
 */
export const customerKeys = {
  all: ['customers'] as const,
  list: (query = '') => [...customerKeys.all, 'list', query] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
  deleted: () => [...customerKeys.all, 'deleted'] as const,
  measurements: (id: string) => [...customerKeys.all, 'measurements', id] as const,
  currentMeasurement: (id: string) => [...customerKeys.all, 'measurements', id, 'current'] as const,
};

export const projectKeys = {
  all: ['projects'] as const,
  list: (filter: string) => [...projectKeys.all, 'list', filter] as const,
  byCustomer: (customerId: string) => [...projectKeys.all, 'customer', customerId] as const,
  detail: (id: string) => [...projectKeys.all, 'detail', id] as const,
};

export const templateKeys = {
  all: ['templates'] as const,
  list: () => [...templateKeys.all, 'list'] as const,
};

export const reminderKeys = {
  all: ['reminders'] as const,
  due: (windowDays: number) => [...reminderKeys.all, 'due', windowDays] as const,
};

export const subscriptionKeys = {
  all: ['subscription'] as const,
};
