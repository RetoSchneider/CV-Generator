import { create } from "zustand";

export interface ConfirmRequest {
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
}

interface State extends Partial<ConfirmRequest> {
  open: boolean;
  resolver?: (ok: boolean) => void;
  ask: (req: ConfirmRequest) => Promise<boolean>;
  resolve: (ok: boolean) => void;
}

export const useConfirm = create<State>((set, get) => ({
  open: false,
  ask(req) {
    return new Promise<boolean>((resolve) => {
      set({ ...req, open: true, resolver: resolve });
    });
  },
  resolve(ok) {
    const r = get().resolver;
    set({ open: false, resolver: undefined });
    r?.(ok);
  },
}));
