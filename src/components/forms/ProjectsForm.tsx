import { Trash2 } from "lucide-react";
import { useStore } from "../../store";
import { Section } from "../ui/Section";
import { useT } from "../../i18n";
import { Input, TagsInput, BulletsEditor } from "../ui/Field";
import { useConfirm } from "../../ui-state/useConfirm";
import type { Project } from "../../types";

const nonEmpty = (value: string | undefined) => !!value?.trim();

const isProjectEmpty = (p: Project) =>
  !nonEmpty(p.name) &&
  !nonEmpty(p.tagline) &&
  !nonEmpty(p.link) &&
  p.stack.length === 0 &&
  p.highlights.every((h) => !nonEmpty(h));


export function ProjectsForm() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const items = useStore((s) => s.cv.projects);
  const add = useStore((s) => s.addProject);
  const update = useStore((s) => s.updateProject);
  const remove = useStore((s) => s.removeProject);

  const handleRemove = async (p: Project) => {
    if (!isProjectEmpty(p)) {
      const ok = await ask({
        title: t("confirm.deleteProject.title"),
        message: t("confirm.deleteProject.message", { label: p.name || "—" }),
        confirmLabel: t("confirm.action.delete"),
        cancelLabel: t("btn.cancel"),
        danger: true,
      });
      if (!ok) return;
    }
    remove(p.id);
  };

  return (
    <Section title={t("sec.projects")} onAdd={add} addLabel={t("btn.add.entry")}>
      {items.map((p) => (
        <div key={p.id} className="rounded-lg border border-ink-800 bg-ink-950/40 p-3 space-y-2">
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleRemove(p)}
              className="btn btn-danger !py-1 !px-1.5"
              title={t("btn.delete")}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Input
              label={t("field.name")}
              value={p.name}
              onChange={(e) => update(p.id, { name: e.target.value })}
            />
            <Input
              label={t("field.link")}
              value={p.link ?? ""}
              onChange={(e) => update(p.id, { link: e.target.value })}
              placeholder="github.com/yourname/project"
            />
          </div>
          <Input
            label={t("field.tagline")}
            value={p.tagline}
            onChange={(e) => update(p.id, { tagline: e.target.value })}
          />
          <TagsInput
            label={t("field.stack")}
            value={p.stack}
            onChange={(stack) => update(p.id, { stack })}
          />
          <BulletsEditor
            label={t("field.highlights")}
            value={p.highlights}
            onChange={(highlights) => update(p.id, { highlights })}
          />
        </div>
      ))}
    </Section>
  );
}
