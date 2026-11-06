import useToastStore, { LONG, SHORT, ToastType } from "@/stores/toastStore";

type Options = {
  /** Chữ dài (hiện lâu hơn). */
  long?: boolean;
  duration?: number;
};

const show = (type: ToastType, text: string, opts?: Options) =>
  useToastStore.getState().show({ type, text, duration: opts?.duration ?? (opts?.long ? LONG : SHORT) });

/**
 * Thông báo ngắn tự đóng, hiện ở đầu màn hình (hiện được cả khi đang mở modal), không chặn thao tác.
 * Dùng thay ToastAndroid (chỉ có Android, hiện ở cuối màn hình).
 */
export const toast = {
  show: (text: string, opts?: Options) => show("info", text, opts),
  success: (text: string, opts?: Options) => show("success", text, opts),
  error: (text: string, opts?: Options) => show("error", text, opts),
  info: (text: string, opts?: Options) => show("info", text, opts),
  warning: (text: string, opts?: Options) => show("warning", text, opts),
  hide: () => useToastStore.getState().hide(),
};

export default toast;
