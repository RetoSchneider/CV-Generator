import { X } from "lucide-react";
import { useStore } from "../../store";
import { Section } from "../ui/Section";
import { useT } from "../../i18n";

export function InterestsForm() {
  const t = useT();
  const items = useStore((s) => s.cv.interests);
  const add = useStore((s) => s.addInterest);
  const update = useStore((s) => s.updateInterest);
  const remove = useStore((s) => s.removeInterest);

  return (
    <Section title={t("sec.interests")} onAdd={() => add("")} addLabel={t("btn.add.tag")}>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex items-center gap-1 rounded-full border border-ink-800 bg-ink-950/60 pl-3 pr-1 py-1"
          >
            <input
              aria-label={t("field.name")}
              value={i.label}
              onChange={(e) => update(i.id, { label: e.target.value })}
              className="bg-transparent text-[12.5px] text-ink-100 outline-none w-32"
            />
            <button
              aria-label={t("btn.delete")}
              onClick={() => remove(i.id)}
              className="text-ink-500 hover:text-red-400 p-1 rounded"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </Section>
  );
}
