type Listener = () => void;
const listeners = new Set<Listener>();

/** Nơi nào vừa ghi dữ liệu học (xong phiên, đổi cài đặt...) gọi hàm này; SyncProvider gom lại và đồng bộ sau một nhịp ngắn. */
export const requestSync = () => listeners.forEach((fn) => fn());

export const onSyncRequest = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
