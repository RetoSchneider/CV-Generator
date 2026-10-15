import { useStore } from "../../store";
import { LayoutSection } from "./LayoutSection";
import { Textarea } from "../ui/Field";
import { useT } from "../../i18n";

export function SummaryForm() {
  const t = useT();
  const summary = useStore((s) => s.cv.summary);
  const setSummary = useStore((s) => s.setSummary);

  return (
    <LayoutSection sectionKey="summary" title={t("sec.summary")} hint={t("sec.summary.hint")}>
      <Textarea
        label={t("field.summary")}
        rows={6}
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
      />
    </LayoutSection>
  );
}
