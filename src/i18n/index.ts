import { useStore } from "../store";
import { LOCALES, translate, type Locale } from "./translations";

export { LOCALES, translate };
export type { Locale };

/** Hook returning a memoised t() bound to the current locale. */
export function useT() {
  const locale = useStore((s) => s.cv.meta.locale ?? "en");
  return (key: string, vars?: Record<string, string>) => translate(locale, key, vars);
}

/** Read the current locale (non-reactive, e.g. for export pipelines). */
export function currentLocale(): Locale {
  return useStore.getState().cv.meta.locale ?? "en";
}
