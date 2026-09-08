import { useEffect, useId, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { useConfirm } from "../../ui-state/useConfirm";

export function ConfirmDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();
  const open = useConfirm((s) => s.open);
  const title = useConfirm((s) => s.title);
  const message = useConfirm((s) => s.message);
  const confirmLabel = useConfirm((s) => s.confirmLabel);
  const cancelLabel = useConfirm((s) => s.cancelLabel);
  const danger = useConfirm((s) => s.danger);
  const resolve = useConfirm((s) => s.resolve);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={message ? messageId : undefined}
      className="m-auto p-0 bg-transparent text-inherit backdrop:bg-black/60 backdrop:backdrop-blur-sm"
      onCancel={(event) => {
        event.preventDefault();
        resolve(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) resolve(false);
      }}
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
            <div id={titleId} className="text-[14px] font-semibold text-white">{title}</div>
            {message && (
              <div id={messageId} className="mt-1 text-[12.5px] text-ink-300 leading-[1.55]">{message}</div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-ink-800 bg-ink-950/80 rounded-b-2xl">
          <button autoFocus onClick={() => resolve(false)} className="btn btn-ghost">
            {cancelLabel}
          </button>
          <button
            onClick={() => resolve(true)}
            className={`btn ${danger ? "btn-danger !bg-red-500/15 !border-red-500/40 !text-red-200 hover:!bg-red-500/25" : "btn-primary"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
