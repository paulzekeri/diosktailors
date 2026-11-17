import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { StarterTemplateKey, Unit } from '@/data';
import { useAuth } from '@/features/auth/AuthProvider';

export interface OnboardingDraft {
  businessName: string;
  whatsappInput: string;
  phoneInput: string;
  email: string;
  logoUrl?: string;
  address: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  registrationInfo: string;
  unit: Unit;
  templateKey: StarterTemplateKey;
  referrerCode: string;
}

const EMPTY: OnboardingDraft = {
  businessName: '',
  whatsappInput: '',
  phoneInput: '',
  email: '',
  logoUrl: undefined,
  address: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  registrationInfo: '',
  unit: 'inches',
  templateKey: 'women',
  referrerCode: '',
};

interface OnboardingContextValue {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    ...EMPTY,
    email: session?.email ?? '',
  }));

  const value = useMemo<OnboardingContextValue>(
    () => ({
      draft,
      update: (patch) => setDraft((current) => ({ ...current, ...patch })),
      reset: () => setDraft({ ...EMPTY, email: session?.email ?? '' }),
    }),
    [draft, session?.email],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('useOnboarding must be used inside <OnboardingProvider>');
  return context;
}
