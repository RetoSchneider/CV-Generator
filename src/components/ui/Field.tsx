import type { TextareaHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useT } from "../../i18n";

interface Common {
  label: string;
  hint?: string;
}

export function Input({
  label,
  hint,
  ...rest
}: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="field">
      <label>{label}{hint && <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">· {hint}</span>}</label>
      <input {...rest} />
    </div>
  );
}

export function Textarea({
  label,
  hint,
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="field">
      <label>{label}{hint && <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">· {hint}</span>}</label>
      <textarea {...rest} />
    </div>
  );
}

export function Select({
  label,
  hint,
  children,
  ...rest
}: Common & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="field">
      <label>{label}{hint && <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">· {hint}</span>}</label>
      <select {...rest}>{children}</select>
    </div>
  );
}

export function TagsInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: Common & {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  // Keep a raw text buffer so the user can freely type commas/spaces (e.g.
  // "React, " mid-tag) without the parsed value collapsing them away. We only
  // resync the buffer when the value changes from the outside (reset/import).
  const [text, setText] = useState(value.join(", "));
  useEffect(() => {
    const parsed = text
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    if (parsed.join("\u0000") !== value.join("\u0000")) {
      setText(value.join(", "));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="field">
      <label>{label}{hint && <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">· {hint}</span>}</label>
      <input
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(
            e.target.value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
          );
        }}
        onBlur={() =>
          setText(
            value
              .join(", ")
          )
        }
        placeholder={placeholder ?? "Comma, separated, list"}
      />
    </div>
  );
}

export function BulletsEditor({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: Common & {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const t = useT();
  const update = (i: number, v: string) => {
    const next = [...value];
    next[i] = v;
    onChange(next);
  };
  const add = () => onChange([...value, ""]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="field">
      <label>{label}{hint && <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">· {hint}</span>}</label>
      <div className="space-y-1.5">
        {value.map((v, i) => (
          <div key={i} className="flex gap-1.5">
            <span className="text-ink-500 select-none pt-2 font-mono text-xs">›</span>
            <textarea
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              rows={2}
              style={{ minHeight: 38 }}
            />
            <button
              onClick={() => remove(i)}
              className="btn btn-ghost !py-1 !px-2 text-ink-500 hover:text-red-400"
              title={t("btn.delete")}
            >
              ×
            </button>
          </div>
        ))}
        <button onClick={add} className="btn btn-ghost !py-1 !px-2 text-[12px]">
          {t("btn.add.bullet")}
        </button>
      </div>
    </div>
  );
}
