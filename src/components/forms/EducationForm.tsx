import { Trash2 } from "lucide-react";
import { useStore } from "../../store";
import { Section } from "../ui/Section";
import { useT } from "../../i18n";
import { Input, Textarea } from "../ui/Field";
import { useConfirm } from "../../ui-state/useConfirm";
import type { Education } from "../../types";

const nonEmpty = (value: string | undefined) => !!value?.trim();

const isEducationEmpty = (e: Education) =>
  !nonEmpty(e.credential) &&
  !nonEmpty(e.institution) &&
  !nonEmpty(e.location) &&
  !nonEmpty(e.start) &&
  !nonEmpty(e.end) &&
  !nonEmpty(e.notes);


export function EducationForm() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const items = useStore((s) => s.cv.education);
  const add = useStore((s) => s.addEducation);
  const update = useStore((s) => s.updateEducation);
  const remove = useStore((s) => s.removeEducation);

  const handleRemove = async (e: Education) => {
    if (!isEducationEmpty(e)) {
      const label = `${e.credential || "—"}${e.institution ? " · " + e.institution : ""}`;
      const ok = await ask({
        title: t("confirm.deleteEducation.title"),
        message: t("confirm.deleteEducation.message", { label }),
        confirmLabel: t("confirm.action.delete"),
        cancelLabel: t("btn.cancel"),
        danger: true,
      });
      if (!ok) return;
    }
    remove(e.id);
  };

  return (
    <Section title={t("sec.education")} onAdd={add} addLabel={t("btn.add.entry")}>
      {items.map((e) => (
        <div key={e.id} className="rounded-lg border border-ink-800 bg-ink-950/40 p-3 space-y-2">
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleRemove(e)}
              className="btn btn-danger !py-1 !px-1.5"
              title={t("btn.delete")}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Input
              label={t("field.credential")}
              value={e.credential}
              onChange={(ev) => update(e.id, { credential: ev.target.value })}
            />
            <Input
              label={t("field.institution")}
              value={e.institution}
              onChange={(ev) => update(e.id, { institution: ev.target.value })}
            />
            <Input
              label={t("field.location")}
              value={e.location}
              onChange={(ev) => update(e.id, { location: ev.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label={t("field.start")}
                value={e.start}
                onChange={(ev) => update(e.id, { start: ev.target.value })}
              />
              <Input
                label={t("field.end")}
                value={e.end}
                onChange={(ev) => update(e.id, { end: ev.target.value })}
              />
            </div>
          </div>
          <Textarea
            label={t("field.notes")}
            rows={2}
            value={e.notes ?? ""}
            onChange={(ev) => update(e.id, { notes: ev.target.value })}
          />
        </div>
      ))}
    </Section>
  );
}
