import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/features/auth/AuthProvider';

/**
 * Route guard (convenience only — Postgres is the authority in Phase 10+).
 * No session → login. Session without a business profile → onboarding.
 */
export default function AppLayout() {
  const { status, session } = useAuth();

  if (status === 'loading') return null;
  if (status === 'signedOut' || !session) return <Redirect href="/(auth)/login" />;
  if (!session.hasProfile) return <Redirect href="/(onboarding)/welcome" />;

  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />;
}
