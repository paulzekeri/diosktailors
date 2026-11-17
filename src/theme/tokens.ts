import type { TextStyle, ViewStyle } from 'react-native';

/**
 * DIOKS FashionSuite design tokens — light theme (V1).
 * Source of truth: DIOKS_FashionSuite_Design_and_Dev_Plan.md §4.2–4.4
 * Do not hard-code colours in screens; add a token here instead.
 */
export const colors = {
  // surfaces
  canvas: '#FBF9F6',
  backdrop: '#EDE7DF',
  surface: '#FFFFFF',
  surfaceMuted: '#F3EEE8',
  border: '#E8E1D9',
  borderStrong: '#D8CEC3',
  frameBorder: '#E2D9CE',
  hairline: '#F2EBE3',
  highlight: '#FFFFFF',
  canvasDeep: '#F6F1EA',
  surfaceRaised: '#FFFDFB',
  surfaceWell: '#FCF9F5',

  // text
  ink: '#14110F',
  inkMuted: '#6B625B',
  inkSubtle: '#9A9088',
  white: '#FFFFFF',

  // brand
  primary: '#7B2D43',
  primaryPressed: '#63202F',
  primaryDeep: '#4E1725',
  primarySoft: '#F7E8EC',
  primaryTint: '#FBF2F4',
  gold: '#C8A15A',
  goldSoft: '#FBF6EC',

  // semantic
  success: '#1F7A5C',
  successSoft: '#E8F3EE',
  warning: '#B4690E',
  warningSoft: '#FBF0E2',
  danger: '#B3261E',
  dangerSoft: '#FCECEA',
  info: '#2F5DA8',
  infoSoft: '#EAF0FA',
  violet: '#4B3FA0',
  violetSoft: '#EFEDFA',

  // third party brand use only
  whatsapp: '#25D366',
  whatsappDeep: '#128C7E',

  // skeleton shimmer
  skeleton: '#EFE9E2',
  skeletonHighlight: '#F7F3EE',

  // presence
  online: '#3EA76A',
} as const;

export type ColorToken = keyof typeof colors;

/**
 * Bottom tab bar — deep wine surface, lighter active pill, cream tints.
 * Docked flush to the phone frame: the frame's own `overflow: hidden` + 28px
 * radius is what rounds the bar's bottom corners, so no radius is set here.
 */
export const tabBarTheme = {
  background: colors.primaryDeep,
  activePill: colors.primary,
  activeTint: colors.canvas,
  inactiveTint: 'rgba(251, 249, 246, 0.66)',
} as const;

/** Fine diagonal weave for paper-like surfaces. Very low contrast on purpose. */
export const texture = {
  line: 'rgba(123, 45, 67, 0.05)',
  spacing: 7,
} as const;


export type ProjectStatus = 'pending' | 'in_progress' | 'completed' | 'delivered' | 'archived' | 'overdue';

export const statusTheme: Record<ProjectStatus, { label: string; fg: string; bg: string }> = {
  pending: { label: 'Pending', fg: colors.warning, bg: colors.warningSoft },
  in_progress: { label: 'In progress', fg: colors.info, bg: colors.infoSoft },
  completed: { label: 'Completed', fg: colors.success, bg: colors.successSoft },
  delivered: { label: 'Delivered', fg: colors.violet, bg: colors.violetSoft },
  archived: { label: 'Archived', fg: colors.inkMuted, bg: colors.surfaceMuted },
  overdue: { label: 'Overdue', fg: colors.danger, bg: colors.dangerSoft },
};

/** 4-point spacing scale. */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,
} as const;

export const radius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  frame: 28,
  full: 999,
} as const;

export type TextVariant = 'display' | 'h1' | 'h2' | 'h3' | 'bodyLg' | 'body' | 'label' | 'caption' | 'micro';

export const typography: Record<TextVariant, TextStyle> = {
  display: { fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  h2: { fontSize: 22, lineHeight: 28 },
  h3: { fontSize: 18, lineHeight: 24 },
  bodyLg: { fontSize: 16, lineHeight: 24 },
  body: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  micro: { fontSize: 11, lineHeight: 14, letterSpacing: 0.4, textTransform: 'uppercase' },
};

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export type FontWeightToken = keyof typeof fontFamily;

/** Font family per type variant (avoids fontWeight + custom-family clashes on Android). */
export const variantFont: Record<TextVariant, FontWeightToken> = {
  display: 'bold',
  h1: 'bold',
  h2: 'semiBold',
  h3: 'semiBold',
  bodyLg: 'regular',
  body: 'regular',
  label: 'semiBold',
  caption: 'medium',
  micro: 'semiBold',
};

/**
 * Elevation. `e0–e3` are the documented contract values (§4.3);
 * `ambient`, `brand`, `focus` and `top` are the layered depth tokens
 * that keep surfaces from reading flat. Shadows are tinted warm, never grey.
 */
export const shadows: Record<
  'e0' | 'e1' | 'e2' | 'e3' | 'ambient' | 'brand' | 'brandSoft' | 'focus' | 'top',
  ViewStyle
> = {
  e0: {},
  e1: {
    shadowColor: '#14110F',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  e2: {
    shadowColor: '#14110F',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  e3: {
    shadowColor: '#14110F',
    shadowOpacity: 0.18,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: -4 },
    elevation: 6,
  },
  /** Default resting depth for cards and list rows. */
  ambient: {
    shadowColor: '#3B1F14',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  /** Primary actions and brand marks — a wine-tinted lift. */
  brand: {
    shadowColor: colors.primary,
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  brandSoft: {
    shadowColor: colors.primary,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  /** Focus halo on inputs. */
  focus: {
    shadowColor: colors.primary,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  /** Sticky chrome that floats above scrolling content. */
  top: {
    shadowColor: '#3B1F14',
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
};

/** Derive a translucent colour from any hex token (used for hairline tints). */
export function alpha(hex: string, opacity: number) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((part) => part + part).join('') : value;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Ambience washes — decorative only, always behind content and never
 * carrying meaning. `screen` is the whisper used on every screen; `hero`
 * is the stronger blush for landing/auth; `glow` sits behind the desktop frame.
 */
export const wash = {
  screen: {
    top: 'rgba(123, 45, 67, 0.08)',
    mid: 'rgba(123, 45, 67, 0.022)',
    edge: 'rgba(251, 249, 246, 0)',
  },
  hero: {
    top: 'rgba(123, 45, 67, 0.15)',
    mid: 'rgba(200, 161, 90, 0.05)',
    edge: 'rgba(251, 249, 246, 0)',
  },
  glow: {
    center: 'rgba(123, 45, 67, 0.18)',
    mid: 'rgba(123, 45, 67, 0.05)',
    edge: 'rgba(123, 45, 67, 0)',
  },
  heroGlow: {
    center: 'rgba(123, 45, 67, 0.1)',
    edge: 'rgba(123, 45, 67, 0)',
  },
} as const;

/** The phone-only contract. Content never exceeds `maxWidth`. */
export const layout = {
  maxWidth: 430,
  desktopBreakpoint: 480,
  frameMaxHeight: 932,
  gutter: 16,
  gutterSmall: 14,
  smallPhoneWidth: 360,
  headerHeight: 56,
  tabBarHeight: 64,
  rowHeight: 72,
  buttonHeight: 52,
  inputHeight: 52,
  touchTarget: 44,
} as const;

export const motion = { fast: 120, base: 180, slow: 240 } as const;
