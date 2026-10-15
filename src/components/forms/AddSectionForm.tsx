import { useState } from "react";
import { Plus } from "lucide-react";
import { useStore } from "../../store";
import { Input, Select } from "../ui/Field";
import { useT } from "../../i18n";
import { CUSTOM_SECTION_KINDS } from "../../data/sections";
import type { Column, CustomSectionKind } from "../../types";

export function AddSectionForm({ column }: { column: Column }) {
  const t = useT();
  const addCustomSection = useStore((s) => s.addCustomSection);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<CustomSectionKind>("entries");

  const add = () => {
    addCustomSection(column, kind, title.trim());
    setTitle("");
  };

  return (
    <div className="rounded-xl border border-dashed border-ink-800 px-3 py-2.5 grid grid-cols-[1fr_auto_auto] items-end gap-2">
      <Input
        label={t("custom.new")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") add();
        }}
        placeholder={t("custom.namePlaceholder")}
      />
      <Select
        label={t("custom.kind")}
        value={kind}
        onChange={(e) => setKind(CUSTOM_SECTION_KINDS.find((option) => option === e.target.value) ?? kind)}
      >
        {CUSTOM_SECTION_KINDS.map((option) => (
          <option key={option} value={option}>
            {t(`custom.kind.${option}`)}
          </option>
        ))}
      </Select>
      <button onClick={add} className="btn btn-ghost !py-[7px]">
        <Plus size={13} />
        {t("custom.add")}
      </button>
    </div>
  );
}
