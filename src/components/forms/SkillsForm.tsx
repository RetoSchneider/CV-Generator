import { Trash2 } from "lucide-react";
import { useStore } from "../../store";
import { Section } from "../ui/Section";
import { useT } from "../../i18n";
import { Input, TagsInput } from "../ui/Field";
import { useConfirm } from "../../ui-state/useConfirm";
import type { SkillGroup } from "../../types";

const nonEmpty = (value: string | undefined) => !!value?.trim();

const isSkillGroupEmpty = (g: SkillGroup) =>
  (!nonEmpty(g.label) || g.label === "New group") && g.items.length === 0;


export function SkillsForm() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const items = useStore((s) => s.cv.skills);
  const add = useStore((s) => s.addSkillGroup);
  const update = useStore((s) => s.updateSkillGroup);
  const remove = useStore((s) => s.removeSkillGroup);

  const handleRemove = async (g: SkillGroup) => {
    if (!isSkillGroupEmpty(g)) {
      const ok = await ask({
        title: t("confirm.deleteSkillGroup.title"),
        message: t("confirm.deleteSkillGroup.message", { label: g.label || "—" }),
        confirmLabel: t("confirm.action.delete"),
        cancelLabel: t("btn.cancel"),
        danger: true,
      });
      if (!ok) return;
    }
    remove(g.id);
  };

  return (
    <Section title={t("sec.skills")} onAdd={add} addLabel={t("btn.add.group")}>
      {items.map((g) => (
        <div key={g.id} className="rounded-lg border border-ink-800 bg-ink-950/40 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Input
              label={t("field.groupLabel")}
              value={g.label}
              onChange={(e) => update(g.id, { label: e.target.value })}
            />
            <button
              onClick={() => handleRemove(g)}
              className="btn btn-danger !py-1 !px-1.5 mt-5"
              title={t("btn.delete")}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <TagsInput
            label={t("field.items")}
            value={g.items}
            onChange={(items) => update(g.id, { items })}
            placeholder="React, TypeScript, Tailwind"
          />
        </div>
      ))}
    </Section>
  );
}
