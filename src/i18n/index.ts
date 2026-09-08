import { useStore } from "../store";
import { LOCALES, translate, type Locale } from "./translations";

export { LOCALES, translate };
export type { Locale };

export function useT() {
  const locale = useStore((s) => s.cv.meta.locale ?? "en");
  return (key: string, vars?: Record<string, string>) => translate(locale, key, vars);
}
