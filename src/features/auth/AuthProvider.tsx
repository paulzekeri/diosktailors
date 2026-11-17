import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { repo, repositoryErrorCopy, toRepositoryError, type AuthSession, type SignUpInput } from '@/data';

type Status = 'loading' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: Status;
  session: AuthSession | null;
  busy: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<AuthSession>;
  signUp: (input: SignUpInput) => Promise<AuthSession>;
  signOut: () => Promise<void>;
  requestReset: (email: string) => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const restored = await repo.auth.getSession();
      setSession(restored);
      setStatus(restored ? 'signedIn' : 'signedOut');
    } catch {
      setSession(null);
      setStatus('signedOut');
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const signIn = useCallback(async (email: string, password: string) => {
    setBusy(true);
    setError(null);
    try {
      const next = await repo.auth.signIn({ email, password });
      setSession(next);
      setStatus('signedIn');
      return next;
    } catch (caught) {
      const mapped = toRepositoryError(caught);
      setError(repositoryErrorCopy[mapped.code]);
      throw mapped;
    } finally {
      setBusy(false);
    }
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    setBusy(true);
    setError(null);
    try {
      const next = await repo.auth.signUp(input);
      setSession(next);
      setStatus('signedIn');
      return next;
    } catch (caught) {
      const mapped = toRepositoryError(caught);
      setError(repositoryErrorCopy[mapped.code]);
      throw mapped;
    } finally {
      setBusy(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setBusy(true);
    try {
      await repo.auth.signOut();
    } finally {
      setSession(null);
      setStatus('signedOut');
      setBusy(false);
      setError(null);
    }
  }, []);

  const requestReset = useCallback(async (email: string) => {
    setBusy(true);
    setError(null);
    try {
      await repo.auth.requestPasswordReset(email);
    } catch (caught) {
      const mapped = toRepositoryError(caught);
      setError(repositoryErrorCopy[mapped.code]);
      throw mapped;
    } finally {
      setBusy(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      busy,
      error,
      signIn,
      signUp,
      signOut,
      requestReset,
      refresh: load,
      clearError: () => setError(null),
    }),
    [status, session, busy, error, signIn, signUp, signOut, requestReset, load],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
