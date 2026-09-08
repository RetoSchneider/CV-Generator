import { Trash2 } from "lucide-react";
import { useStore } from "../../store";
import { Section } from "../ui/Section";
import { useT } from "../../i18n";
import { Input } from "../ui/Field";
import { useConfirm } from "../../ui-state/useConfirm";
import type { Certification } from "../../types";

const nonEmpty = (value: string | undefined) => !!value?.trim();

const isCertificationEmpty = (c: Certification) =>
  !nonEmpty(c.name) && !nonEmpty(c.issuer) && !nonEmpty(c.year) && !nonEmpty(c.link);


export function CertificationsForm() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const items = useStore((s) => s.cv.certifications);
  const add = useStore((s) => s.addCertification);
  const update = useStore((s) => s.updateCertification);
  const remove = useStore((s) => s.removeCertification);

  const handleRemove = async (c: Certification) => {
    if (!isCertificationEmpty(c)) {
      const ok = await ask({
        title: t("confirm.deleteCertification.title"),
        message: t("confirm.deleteCertification.message", { label: c.name || "—" }),
        confirmLabel: t("confirm.action.delete"),
        cancelLabel: t("btn.cancel"),
        danger: true,
      });
      if (!ok) return;
    }
    remove(c.id);
  };

  return (
    <Section title={t("sec.certifications")} onAdd={add} addLabel={t("btn.add.entry")}>
      {items.map((c) => (
        <div key={c.id} className="rounded-lg border border-ink-800 bg-ink-950/40 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2.5">
            <Input
              label={t("field.name")}
              value={c.name}
              onChange={(e) => update(c.id, { name: e.target.value })}
            />
            <Input
              label={t("field.issuer")}
              value={c.issuer}
              onChange={(e) => update(c.id, { issuer: e.target.value })}
            />
            <Input
              label={t("field.year")}
              value={c.year}
              onChange={(e) => update(c.id, { year: e.target.value })}
            />
            <Input
              label={t("field.link")}
              value={c.link ?? ""}
              onChange={(e) => update(c.id, { link: e.target.value })}
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
