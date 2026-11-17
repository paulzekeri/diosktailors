import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Animated, Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { colors, layout, radius, shadows, spacing } from '@/theme';

export type ToastTone = 'default' | 'success' | 'danger';

export interface ToastOptions {
  message: string;
  /** Optional one-tap follow-up, e.g. "Archive" after marking delivered. */
  actionLabel?: string;
  onAction?: () => void;
  tone?: ToastTone;
  /** Auto-dismiss delay in ms; `0` keeps the toast until dismissed. */
  duration?: number;
}

interface ToastApi {
  show: (options: ToastOptions) => void;
  hide: () => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <ToastProvider>');
  return api;
}

const TONES: Record<ToastTone, { backgroundColor: string }> = {
  default: { backgroundColor: colors.ink },
  success: { backgroundColor: colors.success },
  danger: { backgroundColor: colors.danger },
};

const FADE_MS = 180;

/**
 * Single-slot toast host. Mount once inside `AppFrame` so it is clipped to the
 * phone shell and clears the tab bar. Messages never replace the platform's
 * own accessibility announcement — the toast is a live region.
 */
export function ToastProvider({ children, bottomOffset }: { children: ReactNode; bottomOffset?: number }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const animate = useCallback(
    (toValue: number) =>
      Animated.timing(progress, {
        toValue,
        duration: FADE_MS,
        useNativeDriver: Platform.OS !== 'web',
      }),
    [progress],
  );

  const hide = useCallback(() => {
    clearTimer();
    animate(0).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [animate, clearTimer]);

  const show = useCallback(
    (next: ToastOptions) => {
      clearTimer();
      setToast(next);
      progress.setValue(0);
      animate(1).start();
      if (next.duration !== 0) {
        timer.current = setTimeout(hide, next.duration ?? 4200);
      }
    },
    [animate, clearTimer, hide, progress],
  );

  useEffect(() => clearTimer, [clearTimer]);

  const api = useMemo(() => ({ show, hide }), [show, hide]);
  /** Clears the 64px tab bar and a ~110px sticky form footer, so a toast never hides a primary action. */
  const offset = bottomOffset ?? layout.tabBarHeight + spacing.huge;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
          <Animated.View
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[
              styles.toast,
              TONES[toast.tone ?? 'default'],
              { bottom: insets.bottom + offset },
              {
                opacity: progress,
                transform: [
                  { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
                ],
              },
            ]}
          >
            <AppText variant="body" color={colors.white} style={styles.message}>
              {toast.message}
            </AppText>
            {toast.actionLabel ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={toast.actionLabel}
                hitSlop={10}
                onPress={() => {
                  hide();
                  toast.onAction?.();
                }}
                style={styles.action}
              >
                <AppText variant="label" weight="semiBold" color={colors.gold}>
                  {toast.actionLabel}
                </AppText>
              </Pressable>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel="Dismiss" hitSlop={10} onPress={hide}>
                <AppText variant="label" color={colors.white}>
                  Close
                </AppText>
              </Pressable>
            )}
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    ...shadows.e3,
  },
  message: { flex: 1 },
  action: { paddingVertical: spacing.xs },
});
