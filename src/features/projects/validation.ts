/**
 * Project form validation (screen 25). Delivery dates may be in the past — a
 * tailor can log a job that is already late — but the date must be real.
 */
import { z } from 'zod';

import { isRealISODate, todayISO } from '@/lib/date';
import { zodFieldErrors, type FieldErrors } from '@/lib/forms';

const TEXT_MAX = 500;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const projectFormSchema = z.object({
  name: z.string().trim().min(2, 'Give the job a name').max(80, 'Keep the name under 80 characters'),
  expectedDeliveryAt: z
    .string()
    .trim()
    .min(1, 'Choose a delivery date')
    .refine((value) => ISO_DATE.test(value), { error: 'Use the date picker' })
    .refine((value) => isRealISODate(value), { error: 'That date does not exist' }),
  description: z.string().trim().max(TEXT_MAX, `Keep the description under ${TEXT_MAX} characters`),
  instructions: z.string().trim().max(TEXT_MAX, `Keep the instructions under ${TEXT_MAX} characters`),
  notes: z.string().trim().max(TEXT_MAX, `Keep notes under ${TEXT_MAX} characters`),
});

export type ProjectFormValues = z.input<typeof projectFormSchema>;
export type ValidProjectForm = z.output<typeof projectFormSchema>;

export const EMPTY_PROJECT_FORM: ProjectFormValues = {
  name: '',
  expectedDeliveryAt: '',
  description: '',
  instructions: '',
  notes: '',
};

export function validateProjectForm(values: ProjectFormValues):
  | { success: true; data: ValidProjectForm }
  | { success: false; errors: FieldErrors } {
  const result = projectFormSchema.safeParse(values);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: zodFieldErrors(result.error) };
}

/** Repository input. Status is left to the repository (`pending`) and `measurementId` is linked by the screen. */
export function toNewProject(customerId: string, values: ValidProjectForm, measurementId?: string) {
  return {
    customerId,
    name: values.name,
    measurementId: measurementId || undefined,
    orderReceivedAt: todayISO(),
    expectedDeliveryAt: values.expectedDeliveryAt,
    description: values.description || undefined,
    instructions: values.instructions || undefined,
    notes: values.notes || undefined,
  };
}


/** Prefill the edit form from a stored project. */
export function toProjectFormValues(project: {
  name: string;
  expectedDeliveryAt: string;
  description?: string;
  instructions?: string;
  notes?: string;
}): ProjectFormValues {
  return {
    name: project.name,
    expectedDeliveryAt: project.expectedDeliveryAt,
    description: project.description ?? '',
    instructions: project.instructions ?? '',
    notes: project.notes ?? '',
  };
}
