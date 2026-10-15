import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useStore } from "../../store";
import { Section, type SectionProps } from "../ui/Section";
import { Input } from "../ui/Field";
import { useT } from "../../i18n";
import { columnOf } from "../../data/sections";
import { defaultSectionTitle } from "../../utils/cvPresentation";

interface Props extends Omit<SectionProps, "actions"> {
  sectionKey: string;
  onRemove?: () => void;
}

export function LayoutSection({ sectionKey, onRemove, children, ...props }: Props) {
  const t = useT();
  const locale = useStore((s) => s.cv.meta.locale ?? "en");
  const order = useStore((s) => s.cv.meta.sectionOrder);
  const heading = useStore((s) => s.cv.meta.sectionTitles[sectionKey] ?? "");
  const moveSection = useStore((s) => s.moveSection);
  const renameSection = useStore((s) => s.renameSection);

  const column = columnOf(order, sectionKey);
  const keys = column ? order[column] : [];
  const index = keys.indexOf(sectionKey);

  return (
    <Section
      {...props}
      actions={
        <>
          <button
            onClick={() => moveSection(sectionKey, -1)}
            disabled={index <= 0}
            className="btn btn-ghost !py-1 !px-1.5 disabled:opacity-30 disabled:pointer-events-none"
            title={t("btn.sectionUp")}
          >
            <ArrowUp size={13} />
          </button>
          <button
            onClick={() => moveSection(sectionKey, 1)}
            disabled={index === keys.length - 1}
            className="btn btn-ghost !py-1 !px-1.5 disabled:opacity-30 disabled:pointer-events-none"
            title={t("btn.sectionDown")}
          >
            <ArrowDown size={13} />
          </button>
          {onRemove && (
            <button onClick={onRemove} className="btn btn-danger !py-1 !px-1.5" title={t("btn.deleteSection")}>
              <Trash2 size={13} />
            </button>
          )}
        </>
      }
    >
      <Input
        label={t("section.heading")}
        value={heading}
        onChange={(e) => renameSection(sectionKey, e.target.value)}
        placeholder={defaultSectionTitle(sectionKey, locale)}
      />
      {children}
    </Section>
  );
}
