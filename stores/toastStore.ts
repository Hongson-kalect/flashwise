import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastData {
  id: number;
  type: ToastType;
  text: string;
  /** Thời gian hiện (ms). */
  duration: number;
}

interface ToastState {
  toast: ToastData | null;
  show: (t: { type?: ToastType; text: string; duration?: number }) => void;
  hide: (id?: number) => void;
}

let seq = 0;

export const SHORT = 2200;
export const LONG = 3800;

/** Một toast tại một thời điểm: toast mới thay toast cũ (không xếp hàng, vì chỉ là thông báo ngắn). */
const useToastStore = create<ToastState>((set, get) => ({
  toast: null,
  show: ({ type = "info", text, duration = SHORT }) => {
    if (!text) return;
    set({ toast: { id: ++seq, type, text, duration } });
  },
  hide: (id) => {
    // id: chỉ ẩn đúng toast đó (timer cũ không được ẩn toast mới hơn)
    if (id !== undefined && get().toast?.id !== id) return;
    set({ toast: null });
  },
}));

export default useToastStore;
