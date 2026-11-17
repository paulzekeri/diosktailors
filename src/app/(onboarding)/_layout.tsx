import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/AuthProvider';
import { OnboardingProvider } from '@/features/onboarding/OnboardingProvider';

export default function OnboardingLayout() {
  const { status, session } = useAuth();

  if (status === 'loading') return null;
  if (status === 'signedOut' || !session) return <Redirect href="/(auth)/login" />;

  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
    </OnboardingProvider>
  );
}
