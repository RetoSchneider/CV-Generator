import { Trash2 } from "lucide-react";
import { useStore } from "../../store";
import { LayoutSection } from "./LayoutSection";
import { Input, TagsInput, Textarea } from "../ui/Field";
import { useT } from "../../i18n";
import { useConfirm } from "../../ui-state/useConfirm";
import { hasCustomContent } from "../../utils/cvPresentation";

export function CustomSectionForm({ id }: { id: string }) {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const section = useStore((s) => s.cv.customSections.find((c) => c.id === id));
  const title = useStore((s) => s.cv.meta.sectionTitles[id] ?? "");
  const update = useStore((s) => s.updateCustomSection);
  const remove = useStore((s) => s.removeCustomSection);
  const addEntry = useStore((s) => s.addCustomEntry);
  const updateEntry = useStore((s) => s.updateCustomEntry);
  const removeEntry = useStore((s) => s.removeCustomEntry);

  if (!section) return null;

  const label = title.trim() || t("cv.customSection");

  const handleRemove = async () => {
    if (hasCustomContent(section)) {
      const ok = await ask({
        title: t("confirm.deleteSection.title"),
        message: t("confirm.deleteSection.message", { label }),
        confirmLabel: t("confirm.action.delete"),
        cancelLabel: t("btn.cancel"),
        danger: true,
      });
      if (!ok) return;
    }
    remove(id);
  };

  return (
    <LayoutSection
      sectionKey={id}
      title={`// ${label}`}
      hint={t(`custom.kind.${section.kind}`)}
      onRemove={handleRemove}
      onAdd={section.kind === "entries" ? () => addEntry(id) : undefined}
      addLabel={t("btn.add.entry")}
    >
      {section.kind === "text" && (
        <Textarea
          label={t("custom.kind.text")}
          rows={4}
          value={section.text}
          onChange={(e) => update(id, { text: e.target.value })}
        />
      )}
      {section.kind === "list" && (
        <TagsInput
          label={t("custom.kind.list")}
          value={section.items}
          onChange={(items) => update(id, { items })}
        />
      )}
      {section.kind === "entries" &&
        section.entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-ink-800 bg-ink-950/40 p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2.5">
              <Input
                label={t("custom.entry.title")}
                value={entry.title}
                onChange={(e) => updateEntry(id, entry.id, { title: e.target.value })}
              />
              <Input
                label={t("custom.entry.subtitle")}
                value={entry.subtitle}
                onChange={(e) => updateEntry(id, entry.id, { subtitle: e.target.value })}
              />
              <Input
                label={t("custom.entry.period")}
                value={entry.period}
                onChange={(e) => updateEntry(id, entry.id, { period: e.target.value })}
                placeholder="2020 — 2023"
              />
            </div>
            <Textarea
              label={t("custom.entry.details")}
              rows={2}
              value={entry.details}
              onChange={(e) => updateEntry(id, entry.id, { details: e.target.value })}
            />
            <div className="flex justify-end">
              <button
                onClick={() => removeEntry(id, entry.id)}
                className="btn btn-danger !py-1 !px-1.5"
                title={t("btn.delete")}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
    </LayoutSection>
  );
}
