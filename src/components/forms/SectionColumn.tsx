import type { ComponentType } from "react";
import { PanelLeft, PanelRight, type LucideIcon } from "lucide-react";
import { useStore } from "../../store";
import { useT } from "../../i18n";
import { isSectionId } from "../../data/sections";
import type { Column, SectionId } from "../../types";
import { SummaryForm } from "./SummaryForm";
import { ExperienceForm } from "./ExperienceForm";
import { ProjectsForm } from "./ProjectsForm";
import { EducationForm } from "./EducationForm";
import { SkillsForm } from "./SkillsForm";
import { LanguagesForm } from "./LanguagesForm";
import { InterestsForm } from "./InterestsForm";
import { CertificationsForm } from "./CertificationsForm";
import { CustomSectionForm } from "./CustomSectionForm";
import { AddSectionForm } from "./AddSectionForm";

const SECTION_FORMS: Record<SectionId, ComponentType> = {
  summary: SummaryForm,
  experience: ExperienceForm,
  projects: ProjectsForm,
  education: EducationForm,
  skills: SkillsForm,
  languages: LanguagesForm,
  interests: InterestsForm,
  certifications: CertificationsForm,
};

const COLUMN_ICONS: Record<Column, LucideIcon> = {
  main: PanelRight,
  sidebar: PanelLeft,
};

export function SectionColumn({ column }: { column: Column }) {
  const t = useT();
  const keys = useStore((s) => s.cv.meta.sectionOrder[column]);
  const Icon = COLUMN_ICONS[column];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1 pt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-300">
        <Icon size={14} className="text-cyan-400" />
        <span>{t(`layout.${column}`)}</span>
        <span className="h-px flex-1 bg-ink-800" />
      </div>
      {keys.map((key) => {
        if (!isSectionId(key)) return <CustomSectionForm key={key} id={key} />;
        const Form = SECTION_FORMS[key];
        return <Form key={key} />;
      })}
      <AddSectionForm column={column} />
    </div>
  );
}
