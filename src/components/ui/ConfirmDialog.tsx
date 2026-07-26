import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { useConfirm } from "../../ui-state/useConfirm";

export function ConfirmDialog() {
  const open = useConfirm((s) => s.open);
  const title = useConfirm((s) => s.title);
  const message = useConfirm((s) => s.message);
  const confirmLabel = useConfirm((s) => s.confirmLabel);
  const cancelLabel = useConfirm((s) => s.cancelLabel);
  const danger = useConfirm((s) => s.danger);
  const resolve = useConfirm((s) => s.resolve);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") resolve(false);
      if (e.key === "Enter") resolve(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, resolve]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm"
      onClick={() => resolve(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-ink-800 bg-ink-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5">
          <div
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
              danger ? "bg-red-500/15 text-red-400" : "bg-cyan-500/15 text-cyan-400"
            }`}
          >
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1 leading-snug">
            <div className="text-[14px] font-semibold text-white">{title}</div>
            {message && (
              <div className="mt-1 text-[12.5px] text-ink-300 leading-[1.55]">{message}</div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-ink-800 bg-ink-950/80 rounded-b-2xl">
          <button onClick={() => resolve(false)} className="btn btn-ghost">
            {cancelLabel}
          </button>
          <button
            onClick={() => resolve(true)}
            autoFocus
            className={`btn ${danger ? "btn-danger !bg-red-500/15 !border-red-500/40 !text-red-200 hover:!bg-red-500/25" : "btn-primary"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
