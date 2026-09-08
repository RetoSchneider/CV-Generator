import type { TextareaHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { useEffect, useId, useState } from "react";
import { useT } from "../../i18n";

interface FieldLabelProps {
  label: string;
  hint?: string;
}

export function Input({
  label,
  hint,
  ...rest
}: FieldLabelProps & InputHTMLAttributes<HTMLInputElement>) {
  const generatedId = useId();
  const id = rest.id ?? generatedId;
  return (
    <div className="field">
      <label htmlFor={id}>{label}{hint && <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">· {hint}</span>}</label>
      <input {...rest} id={id} />
    </div>
  );
}

export function Textarea({
  label,
  hint,
  ...rest
}: FieldLabelProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generatedId = useId();
  const id = rest.id ?? generatedId;
  return (
    <div className="field">
      <label htmlFor={id}>{label}{hint && <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">· {hint}</span>}</label>
      <textarea {...rest} id={id} />
    </div>
  );
}

export function Select({
  label,
  hint,
  children,
  ...rest
}: FieldLabelProps & SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  const generatedId = useId();
  const id = rest.id ?? generatedId;
  return (
    <div className="field">
      <label htmlFor={id}>{label}{hint && <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">· {hint}</span>}</label>
      <select {...rest} id={id}>{children}</select>
    </div>
  );
}

export function TagsInput({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: FieldLabelProps & {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {

  const id = useId();
  const [text, setText] = useState(value.join(", "));
  useEffect(() => {
    setText((current) => {
      const parsed = parseTags(current);
      return parsed.length === value.length && parsed.every((tag, index) => tag === value[index])
        ? current
        : value.join(", ");
    });
  }, [value]);

  return (
    <div className="field">
      <label htmlFor={id}>{label}{hint && <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">· {hint}</span>}</label>
      <input
        id={id}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(parseTags(e.target.value));
        }}
        onBlur={() => setText(value.join(", "))}
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
}: FieldLabelProps & {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const t = useT();
  const id = useId();
  const update = (i: number, v: string) => {
    const next = [...value];
    next[i] = v;
    onChange(next);
  };
  const add = () => onChange([...value, ""]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="field">
      <label htmlFor={id}>{label}{hint && <span className="text-ink-500 normal-case font-normal tracking-normal ml-1">· {hint}</span>}</label>
      <div className="space-y-1.5">
        {value.map((v, i) => (
          <div key={i} className="flex gap-1.5">
            <span className="text-ink-500 select-none pt-2 font-mono text-xs">›</span>
            <textarea
              id={i === 0 ? id : undefined}
              aria-label={`${label} ${i + 1}`}
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

function parseTags(text: string): string[] {
  return text.split(",").map((tag) => tag.trim()).filter(Boolean);
}
