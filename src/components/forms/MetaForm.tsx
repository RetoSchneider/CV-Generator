import { useStore } from "../../store";
import { Section } from "../ui/Section";
import type { AccentTone } from "../../types";
import { LOCALES, useT } from "../../i18n";

const ACCENTS: { id: AccentTone; hex: string; label: string }[] = [
  { id: "cyan", hex: "#22d3ee", label: "Cyan" },
  { id: "violet", hex: "#a78bfa", label: "Violet" },
  { id: "emerald", hex: "#34d399", label: "Emerald" },
  { id: "amber", hex: "#f59e0b", label: "Amber" },
  { id: "rose", hex: "#fb7185", label: "Rose" },
];

export function MetaForm() {
  const t = useT();
  const meta = useStore((s) => s.cv.meta);
  const patchMeta = useStore((s) => s.patchMeta);
  const setLocale = useStore((s) => s.setLocale);
  const currentLocale = meta.locale ?? "en";

  return (
    <Section title={t("sec.theme")} defaultOpen>
      <div className="space-y-3">
        {/* Language */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 mb-1.5">
            {t("theme.language")}
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {LOCALES.map((l) => {
              const active = currentLocale === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => setLocale(l.id)}
                  title={l.native}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 transition ${
                    active
                      ? "border-accent bg-accent/10 text-white"
                      : "border-ink-800 bg-ink-950/40 text-ink-300 hover:border-ink-700"
                  }`}
                >
                  <span className="text-[14px] leading-none">{l.flag}</span>
                  <span className="text-[12px] font-mono">{l.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 mb-1.5">
            {t("theme.accent")}
          </div>
          <div className="flex gap-2">
            {ACCENTS.map((a) => {
              const active = meta.accent === a.id;
              return (
                <button
                  key={a.id}
                  title={a.label}
                  onClick={() => patchMeta({ accent: a.id })}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    active ? "border-white scale-110" : "border-ink-800"
                  }`}
                  style={{ background: a.hex }}
                />
              );
            })}
          </div>
        </div>

        <label className="flex items-center gap-2 text-[12px] text-ink-300 select-none">
          <input
            type="checkbox"
            checked={meta.showPhotoMonogram}
            onChange={(e) => patchMeta({ showPhotoMonogram: e.target.checked })}
            className="accent-cyan-400"
          />
          {t("theme.showPhoto")}
        </label>
      </div>
    </Section>
  );
}
