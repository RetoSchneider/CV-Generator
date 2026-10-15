import { useStore } from "../../store";
import { Section } from "../ui/Section";
import { Input } from "../ui/Field";
import { PhotoUploader } from "../ui/PhotoUploader";
import { useT } from "../../i18n";
import { useConfirm } from "../../ui-state/useConfirm";

export function PersonalForm() {
  const t = useT();
  const ask = useConfirm((s) => s.ask);
  const p = useStore((s) => s.cv.personal);
  const documentRevision = useStore((s) => s.documentRevision);
  const patchPersonal = useStore((s) => s.patchPersonal);

  const handlePhotoChange = async (photo: string | undefined) => {
    if (photo === undefined && p.photo) {
      const ok = await ask({
        title: t("confirm.removePhoto.title"),
        message: t("confirm.removePhoto.message"),
        confirmLabel: t("photo.remove"),
        cancelLabel: t("btn.cancel"),
        danger: true,
      });
      if (!ok) return;
    }
    patchPersonal({ photo });
  };

  return (
    <Section title={t("sec.identity")}>
      <PhotoUploader
        key={documentRevision}
        value={p.photo}
        shape={p.photoShape ?? "circle"}
        onChange={handlePhotoChange}
        onShapeChange={(photoShape) => patchPersonal({ photoShape })}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("field.fullName")}
          value={p.fullName}
          onChange={(e) => patchPersonal({ fullName: e.target.value })}
          placeholder={t("placeholder.fullName")}
        />
        <Input
          label={t("field.title")}
          value={p.title}
          onChange={(e) => patchPersonal({ title: e.target.value })}
          placeholder={t("placeholder.title")}
        />
        <Input
          label={t("field.location")}
          value={p.location}
          onChange={(e) => patchPersonal({ location: e.target.value })}
          placeholder={t("placeholder.location")}
        />
        <Input
          label={t("field.pronouns")}
          hint={t("field.optional")}
          value={p.pronouns ?? ""}
          onChange={(e) => patchPersonal({ pronouns: e.target.value })}
          placeholder={t("placeholder.pronouns")}
        />
        <Input
          label={t("field.email")}
          value={p.email}
          onChange={(e) => patchPersonal({ email: e.target.value })}
          placeholder={t("placeholder.email")}
        />
        <Input
          label={t("field.phone")}
          value={p.phone}
          onChange={(e) => patchPersonal({ phone: e.target.value })}
          placeholder="+00 000 000 0000"
        />
        <Input
          label={t("field.website")}
          value={p.website}
          onChange={(e) => patchPersonal({ website: e.target.value })}
          placeholder={t("placeholder.website")}
        />
        <Input
          label={t("field.github")}
          value={p.github}
          onChange={(e) => patchPersonal({ github: e.target.value })}
          placeholder={t("placeholder.github")}
        />
        <Input
          label={t("field.linkedin")}
          value={p.linkedin}
          onChange={(e) => patchPersonal({ linkedin: e.target.value })}
          placeholder={t("placeholder.linkedin")}
        />
      </div>
    </Section>
  );
}
