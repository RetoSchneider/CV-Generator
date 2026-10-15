import { ChevronRight, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";

export interface SectionProps {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  actions?: ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
}

export function Section({
  title,
  hint,
  defaultOpen = true,
  actions,
  onAdd,
  addLabel = "Add",
  children,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-ink-800 bg-ink-900/40 backdrop-blur">
      <header className="flex items-center justify-between gap-2 px-3 py-2.5">
        <button
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1.5 text-ink-100 hover:text-white"
        >
          <ChevronRight
            size={14}
            className={`transition-transform ${open ? "rotate-90" : ""} text-ink-400`}
          />
          <span className="text-[12px] font-mono uppercase tracking-[0.18em] text-ink-300">
            {title}
          </span>
          {hint && <span className="text-[11px] text-ink-500 ml-1">{hint}</span>}
        </button>
        <div className="flex items-center gap-1">
          {actions}
          {onAdd && (
            <button onClick={onAdd} className="btn btn-ghost !py-1 !px-2 text-[12px]">
              <Plus size={13} />
              {addLabel}
            </button>
          )}
        </div>
      </header>
      {open && <div className="px-3 pb-3 pt-1 space-y-3">{children}</div>}
    </section>
  );
}
