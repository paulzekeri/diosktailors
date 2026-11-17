/**
 * A back action that always goes somewhere.
 *
 * Deep-linking (or refreshing the browser) produces **no history entry**, and
 * `router.back()` silently does nothing in that case — which looks like a broken
 * button. Every "back"/"close" affordance should use this with the screen's
 * logical parent as the fallback.
 */
/**
 * Structural shape of the pieces of expo-router's `Router` this helper needs.
 * (The exported `Router` type is generic, and only these three methods matter.)
 */
type BackCapable = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: never) => void;
};

export function goBack(router: BackCapable, fallback: string): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  /**
   * Typed routes cannot express a path assembled at runtime (`/customers/${id}`).
   * The fallback is always a real route; this is the only cast in the app's
   * navigation helpers, kept here so no screen needs `as never` for back.
   */
  router.replace(fallback as never);
}
