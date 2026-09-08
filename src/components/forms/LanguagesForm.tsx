import { Trash2 } from "lucide-react";
import { useStore } from "../../store";
import { Section } from "../ui/Section";
import { useT } from "../../i18n";
import { Input, Select } from "../ui/Field";

export function LanguagesForm() {
  const t = useT();
  const items = useStore((s) => s.cv.languages);
  const add = useStore((s) => s.addLanguage);
  const update = useStore((s) => s.updateLanguage);
  const remove = useStore((s) => s.removeLanguage);

  const LEVELS: { id: "Native" | "Fluent" | "Professional" | "Intermediate" | "Basic" }[] = [
    { id: "Native" },
    { id: "Fluent" },
    { id: "Professional" },
    { id: "Intermediate" },
    { id: "Basic" },
  ];

  const CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

  return (
    <Section title={t("sec.languages")} onAdd={add} addLabel={t("btn.add.lang")}>
      {items.map((l) => (
        <div
          key={l.id}
          className="rounded-lg border border-ink-800 bg-ink-950/40 p-3 space-y-2"
        >
          <div className="grid grid-cols-[1fr_150px_110px_auto] gap-2 items-end">
            <Input
              label={t("field.language")}
              value={l.name}
              onChange={(e) => update(l.id, { name: e.target.value })}
            />
            <Select
              label={t("field.level")}
              value={l.level}
              onChange={(e) => update(l.id, { level: e.target.value as typeof l.level })}
            >
              {LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {t(`level.${lvl.id}`)}
                </option>
              ))}
            </Select>
            <Select
              label={t("field.cefr")}
              value={l.cefr ?? ""}
              onChange={(e) => update(l.id, { cefr: e.target.value as typeof l.cefr })}
            >
              <option value="">—</option>
              {CEFR.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <button
              onClick={() => remove(l.id)}
              className="btn btn-danger !py-1 !px-1.5 mb-0.5"
              title={t("btn.delete")}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <Input
            label={t("field.certificate")}
            value={l.certificate ?? ""}
            onChange={(e) => update(l.id, { certificate: e.target.value })}
            placeholder="Cambridge C1, DELF B2, …"
          />
        </div>
      ))}
    </Section>
  );
}
