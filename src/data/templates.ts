import type { FieldGroup, TemplateField, Unit } from './types';

/**
 * Standard measurement fields (PRD §7.1). Domain-level, not mock-level, because
 * onboarding previews them before any business row exists.
 * `id` is permanent — measurement history is keyed by it. `label` stays editable.
 */

type FieldDef = [id: string, label: string, group: FieldGroup];

const fields = (defs: FieldDef[], unit: Unit): TemplateField[] =>
  defs.map(([id, label, group], order) => ({
    id,
    label,
    group,
    type: 'number',
    unit,
    required: order < 6,
    order,
  }));

export const WOMEN_FIELDS = fields(
  [
    ['neck', 'Neck', 'upper'],
    ['shoulder', 'Shoulder', 'upper'],
    ['bust', 'Bust', 'upper'],
    ['under_bust', 'Under bust', 'upper'],
    ['waist', 'Waist', 'upper'],
    ['hip', 'Hip', 'upper'],
    ['sleeve_length', 'Sleeve length', 'length'],
    ['bicep', 'Bicep', 'upper'],
    ['armhole', 'Armhole', 'upper'],
    ['wrist', 'Wrist', 'upper'],
    ['back_length', 'Back length', 'length'],
    ['front_length', 'Front length', 'length'],
    ['gown_length', 'Gown length', 'length'],
    ['skirt_length', 'Skirt length', 'length'],
    ['thigh', 'Thigh', 'lower'],
    ['knee', 'Knee', 'lower'],
    ['trouser_length', 'Trouser length', 'length'],
    ['inseam', 'Inseam', 'lower'],
  ],
  'inches',
);

export const MEN_FIELDS = fields(
  [
    ['neck', 'Neck', 'upper'],
    ['shoulder', 'Shoulder', 'upper'],
    ['chest', 'Chest', 'upper'],
    ['waist', 'Waist', 'upper'],
    ['hip', 'Hip', 'upper'],
    ['sleeve_length', 'Sleeve length', 'length'],
    ['bicep', 'Bicep', 'upper'],
    ['wrist', 'Wrist', 'upper'],
    ['shirt_length', 'Shirt length', 'length'],
    ['jacket_length', 'Jacket length', 'length'],
    ['trouser_length', 'Trouser length', 'length'],
    ['thigh', 'Thigh', 'lower'],
    ['knee', 'Knee', 'lower'],
    ['inseam', 'Inseam', 'lower'],
  ],
  'inches',
);

export const CHILDREN_FIELDS = fields(
  [
    ['height', 'Height', 'length'],
    ['chest', 'Chest', 'upper'],
    ['waist', 'Waist', 'upper'],
    ['hip', 'Hip', 'upper'],
    ['shoulder', 'Shoulder', 'upper'],
    ['sleeve_length', 'Sleeve length', 'length'],
    ['top_length', 'Top length', 'length'],
    ['trouser_length', 'Trouser length', 'length'],
    ['neck', 'Neck', 'upper'],
    ['head', 'Head', 'upper'],
  ],
  'inches',
);

export const BLANK_FIELDS: TemplateField[] = [];

export type StarterTemplateKey = 'women' | 'men' | 'children' | 'blank';

export const STANDARD_TEMPLATES: ReadonlyArray<{
  key: StarterTemplateKey;
  name: string;
  description: string;
  fields: TemplateField[];
}> = [
  {
    key: 'women',
    name: 'Women — Standard',
    description: 'Dresses, gowns, blouses, skirts and trousers.',
    fields: WOMEN_FIELDS,
  },
  {
    key: 'men',
    name: 'Men — Standard',
    description: 'Shirts, kaftans, suits and trousers.',
    fields: MEN_FIELDS,
  },
  {
    key: 'children',
    name: 'Children — Standard',
    description: 'School uniforms and everyday wear.',
    fields: CHILDREN_FIELDS,
  },
  {
    key: 'blank',
    name: 'Blank',
    description: 'Start empty and add your own fields.',
    fields: BLANK_FIELDS,
  },
];
