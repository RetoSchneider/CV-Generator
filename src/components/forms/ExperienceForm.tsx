import { useStore } from "../../store";
import { Section } from "../ui/Section";
import { Input, BulletsEditor, TagsInput } from "../ui/Field";
import { ArrowDown, ArrowUp, Coffee, Trash2 } from "lucide-react";
import { useT } from "../../i18n";
import { useConfirm } from "../../ui-state/useConfirm";
import type { Experience } from "../../types";

function isExperienceEmpty(e: Experience) {
  return (
    !e.role.trim() &&
    !e.company.trim() &&
    !e.location.trim() &&
    !e.start.trim() &&
    !e.end.trim() &&
    e.stack.length === 0 &&
    e.highlights.every((h) => !h.trim())
  );
}

export function ExperienceForm() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const items = useStore((s) => s.cv.experience);
  const add = useStore((s) => s.addExperience);
  const upd = useStore((s) => s.updateExperience);
  const rm = useStore((s) => s.removeExperience);
  const move = useStore((s) => s.moveExperience);

  const handleRemove = async (e: Experience) => {
    if (!isExperienceEmpty(e)) {
      const label = `${e.role || "—"}${e.company ? " · " + e.company : ""}`;
      const ok = await ask({
        title: t("confirm.deleteExperience.title"),
        message: t("confirm.deleteExperience.message", { label }),
        confirmLabel: t("confirm.action.delete"),
        cancelLabel: t("btn.cancel"),
        danger: true,
      });
      if (!ok) return;
    }
    rm(e.id);
  };

  return (
    <Section title={t("sec.experience")} onAdd={add} addLabel={t("btn.add.entry")}>
      {items.map((e, idx) => (
        <div
          key={e.id}
          className={`rounded-lg border p-3 space-y-2 ${
            e.isBreak ? "border-amber-900/40 bg-amber-950/10" : "border-ink-800 bg-ink-950/40"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-ink-500">
                #{String(idx + 1).padStart(2, "0")}
              </span>
              {e.isBreak && (
                <span className="inline-flex items-center gap-1 rounded bg-amber-900/30 text-amber-300 text-[10px] px-1.5 py-0.5 font-mono uppercase tracking-wider">
                  <Coffee size={11} />
                  {t("cv.break")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => move(e.id, -1)}
                className="btn btn-ghost !py-1 !px-1.5"
                title={t("btn.up")}
              >
                <ArrowUp size={13} />
              </button>
              <button
                onClick={() => move(e.id, 1)}
                className="btn btn-ghost !py-1 !px-1.5"
                title={t("btn.down")}
              >
                <ArrowDown size={13} />
              </button>
              <button
                onClick={() => handleRemove(e)}
                className="btn btn-danger !py-1 !px-1.5"
                title={t("btn.delete")}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Input
              label={t("field.role")}
              value={e.role}
              onChange={(ev) => upd(e.id, { role: ev.target.value })}
            />
            <Input
              label={t("field.company")}
              value={e.company}
              onChange={(ev) => upd(e.id, { company: ev.target.value })}
            />
            <Input
              label={t("field.location")}
              value={e.location}
              onChange={(ev) => upd(e.id, { location: ev.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label={t("field.start")}
                value={e.start}
                onChange={(ev) => upd(e.id, { start: ev.target.value })}
                placeholder="2022-08"
              />
              <Input
                label={t("field.end")}
                value={e.end}
                onChange={(ev) => upd(e.id, { end: ev.target.value })}
                placeholder={t("cv.present")}
              />
            </div>
          </div>

          <TagsInput
            label={t("field.stack")}
            value={e.stack}
            onChange={(stack) => upd(e.id, { stack })}
            placeholder="TypeScript, React, Playwright"
          />

          <BulletsEditor
            label={t("field.highlights")}
            hint={t("field.highlights.hint")}
            value={e.highlights}
            onChange={(highlights) => upd(e.id, { highlights })}
          />

          <label className="flex items-center gap-2 text-[12px] text-ink-400 select-none">
            <input
              type="checkbox"
              checked={!!e.isBreak}
              onChange={(ev) => upd(e.id, { isBreak: ev.target.checked })}
              className="accent-amber-400"
            />
            {t("field.markBreak")}
          </label>
        </div>
      ))}
    </Section>
  );
}
