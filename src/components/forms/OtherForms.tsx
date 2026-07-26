import { Trash2, X } from "lucide-react";
import { useStore } from "../../store";
import { Section } from "../ui/Section";
import { Input, Textarea, BulletsEditor, TagsInput, Select } from "../ui/Field";
import { useT } from "../../i18n";
import { useConfirm } from "../../ui-state/useConfirm";
import type {
  Certification,
  Education,
  Project,
  SkillGroup,
} from "../../types";

/* -------------------------- helpers --------------------------------------- */

const nonEmpty = (s: string | undefined) => !!s && s.trim().length > 0;

const isEducationEmpty = (e: Education) =>
  !nonEmpty(e.credential) &&
  !nonEmpty(e.institution) &&
  !nonEmpty(e.location) &&
  !nonEmpty(e.start) &&
  !nonEmpty(e.end) &&
  !nonEmpty(e.notes);

const isProjectEmpty = (p: Project) =>
  !nonEmpty(p.name) &&
  !nonEmpty(p.tagline) &&
  !nonEmpty(p.link) &&
  p.stack.length === 0 &&
  p.highlights.every((h) => !nonEmpty(h));

const isCertEmpty = (c: Certification) =>
  !nonEmpty(c.name) && !nonEmpty(c.issuer) && !nonEmpty(c.year) && !nonEmpty(c.link);

const isSkillGroupEmpty = (g: SkillGroup) =>
  (!nonEmpty(g.label) || g.label === "New group") && g.items.length === 0;

/* -------------------------- EDUCATION ------------------------------------ */

export function EducationForm() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const items = useStore((s) => s.cv.education);
  const add = useStore((s) => s.addEducation);
  const upd = useStore((s) => s.updateEducation);
  const rm = useStore((s) => s.removeEducation);

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
    rm(e.id);
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
              onChange={(ev) => upd(e.id, { credential: ev.target.value })}
            />
            <Input
              label={t("field.institution")}
              value={e.institution}
              onChange={(ev) => upd(e.id, { institution: ev.target.value })}
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
              />
              <Input
                label={t("field.end")}
                value={e.end}
                onChange={(ev) => upd(e.id, { end: ev.target.value })}
              />
            </div>
          </div>
          <Textarea
            label={t("field.notes")}
            rows={2}
            value={e.notes ?? ""}
            onChange={(ev) => upd(e.id, { notes: ev.target.value })}
          />
        </div>
      ))}
    </Section>
  );
}

/* -------------------------- SKILLS --------------------------------------- */

export function SkillsForm() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const items = useStore((s) => s.cv.skills);
  const add = useStore((s) => s.addSkillGroup);
  const upd = useStore((s) => s.updateSkillGroup);
  const rm = useStore((s) => s.removeSkillGroup);

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
    rm(g.id);
  };

  return (
    <Section title={t("sec.skills")} onAdd={add} addLabel={t("btn.add.group")}>
      {items.map((g) => (
        <div key={g.id} className="rounded-lg border border-ink-800 bg-ink-950/40 p-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Input
              label={t("field.groupLabel")}
              value={g.label}
              onChange={(e) => upd(g.id, { label: e.target.value })}
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
            onChange={(items) => upd(g.id, { items })}
            placeholder="React, TypeScript, Tailwind"
          />
        </div>
      ))}
    </Section>
  );
}

/* -------------------------- PROJECTS ------------------------------------- */

export function ProjectsForm() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const items = useStore((s) => s.cv.projects);
  const add = useStore((s) => s.addProject);
  const upd = useStore((s) => s.updateProject);
  const rm = useStore((s) => s.removeProject);

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
    rm(p.id);
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
              onChange={(e) => upd(p.id, { name: e.target.value })}
            />
            <Input
              label={t("field.link")}
              value={p.link ?? ""}
              onChange={(e) => upd(p.id, { link: e.target.value })}
              placeholder="github.com/yourname/project"
            />
          </div>
          <Input
            label={t("field.tagline")}
            value={p.tagline}
            onChange={(e) => upd(p.id, { tagline: e.target.value })}
          />
          <TagsInput
            label={t("field.stack")}
            value={p.stack}
            onChange={(stack) => upd(p.id, { stack })}
          />
          <BulletsEditor
            label={t("field.highlights")}
            value={p.highlights}
            onChange={(highlights) => upd(p.id, { highlights })}
          />
        </div>
      ))}
    </Section>
  );
}

/* -------------------------- CERTIFICATIONS ------------------------------- */

export function CertificationsForm() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const items = useStore((s) => s.cv.certifications);
  const add = useStore((s) => s.addCertification);
  const upd = useStore((s) => s.updateCertification);
  const rm = useStore((s) => s.removeCertification);

  const handleRemove = async (c: Certification) => {
    if (!isCertEmpty(c)) {
      const ok = await ask({
        title: t("confirm.deleteCertification.title"),
        message: t("confirm.deleteCertification.message", { label: c.name || "—" }),
        confirmLabel: t("confirm.action.delete"),
        cancelLabel: t("btn.cancel"),
        danger: true,
      });
      if (!ok) return;
    }
    rm(c.id);
  };

  return (
    <Section title={t("sec.certifications")} onAdd={add} addLabel={t("btn.add.entry")}>
      {items.map((c) => (
        <div key={c.id} className="rounded-lg border border-ink-800 bg-ink-950/40 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2.5">
            <Input
              label={t("field.name")}
              value={c.name}
              onChange={(e) => upd(c.id, { name: e.target.value })}
            />
            <Input
              label={t("field.issuer")}
              value={c.issuer}
              onChange={(e) => upd(c.id, { issuer: e.target.value })}
            />
            <Input
              label={t("field.year")}
              value={c.year}
              onChange={(e) => upd(c.id, { year: e.target.value })}
            />
            <Input
              label={t("field.link")}
              value={c.link ?? ""}
              onChange={(e) => upd(c.id, { link: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => handleRemove(c)}
              className="btn btn-danger !py-1 !px-1.5"
              title={t("btn.delete")}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </Section>
  );
}

/* -------------------------- LANGUAGES ------------------------------------ */

export function LanguagesForm() {
  const t = useT();
  const items = useStore((s) => s.cv.languages);
  const add = useStore((s) => s.addLanguage);
  const upd = useStore((s) => s.updateLanguage);
  const rm = useStore((s) => s.removeLanguage);

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
              onChange={(e) => upd(l.id, { name: e.target.value })}
            />
            <Select
              label={t("field.level")}
              value={l.level}
              onChange={(e) => upd(l.id, { level: e.target.value as typeof l.level })}
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
              onChange={(e) => upd(l.id, { cefr: e.target.value as typeof l.cefr })}
            >
              <option value="">—</option>
              {CEFR.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <button
              onClick={() => rm(l.id)}
              className="btn btn-danger !py-1 !px-1.5 mb-0.5"
              title={t("btn.delete")}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <Input
            label={t("field.certificate")}
            value={l.certificate ?? ""}
            onChange={(e) => upd(l.id, { certificate: e.target.value })}
            placeholder="Cambridge C1, DELF B2, …"
          />
        </div>
      ))}
    </Section>
  );
}

/* -------------------------- INTERESTS ------------------------------------ */

export function InterestsForm() {
  const t = useT();
  const items = useStore((s) => s.cv.interests);
  const add = useStore((s) => s.addInterest);
  const upd = useStore((s) => s.updateInterest);
  const rm = useStore((s) => s.removeInterest);

  return (
    <Section title={t("sec.interests")} onAdd={() => add("")} addLabel={t("btn.add.tag")}>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex items-center gap-1 rounded-full border border-ink-800 bg-ink-950/60 pl-3 pr-1 py-1"
          >
            <input
              value={i.label}
              onChange={(e) => upd(i.id, { label: e.target.value })}
              className="bg-transparent text-[12.5px] text-ink-100 outline-none w-32"
            />
            <button
              onClick={() => rm(i.id)}
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
