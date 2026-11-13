import { optimizeFsrs } from "@/services/api/learn";
import { syncApi } from "@/services/api/sync";
import { maybeOptimizeFsrs } from "@/services/fsrsParams";
import { Db, ensureSyncTracking, pendingCount, runSync, SyncReport } from "@/services/sync/engine";
import { onSyncRequest } from "@/services/sync/bus";
import { useAuthStore } from "@/stores/useAuthStore";
import { accountIdFromToken } from "@/utils/jwt";
import NetInfo from "@react-native-community/netinfo";
import { useQueryClient } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";

export type SyncStatus = "idle" | "syncing" | "offline" | "error";

interface SyncContextValue {
  status: SyncStatus;
  /** Số thay đổi trên máy chưa gửi lên server. */
  pending: number;
  lastSyncedAt: number | null;
  error: string | null;
  lastReport: SyncReport | null;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue>({
  status: "idle", pending: 0, lastSyncedAt: null, error: null, lastReport: null, syncNow: async () => {},
});

export const useSync = () => useContext(SyncContext);

const DEBOUNCE_MS = 2500;
const PERIODIC_MS = 5 * 60_000;

/**
 * Chạy đồng bộ nền (services/sync/engine): bật theo dõi thay đổi ngay khi mở DB, đồng bộ khi có tài khoản / có mạng trở lại /
 * app quay về foreground / vừa ghi dữ liệu học (gom 2,5s) / mỗi 5 phút. Offline thì bỏ qua, hàng đợi giữ trong SQLite.
 */
export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const db = useSQLiteContext() as unknown as Db; // expo-sqlite thoả giao diện Db (kiểu tham số bind khác nhau)
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  // Con trỏ kéo lưu theo tài khoản: lấy từ token (có ngay sau device-login, không đổi giữa "me" và id thật như `user` của store)
  const storeUserId = useAuthStore((s) => s.user?.id);
  const accountId = accountIdFromToken(token) ?? String(storeUserId ?? "me");
  const [state, setState] = useState<Omit<SyncContextValue, "syncNow">>({ status: "idle", pending: 0, lastSyncedAt: null, error: null, lastReport: null });
  const running = useRef(false);
  /** Có yêu cầu đồng bộ đến lúc đang chạy dở: chạy lại ngay sau lượt này (không chờ mốc 5 phút). */
  const again = useRef(false);
  const tracked = useRef<Promise<void> | null>(null);

  const refreshPending = useCallback(async () => {
    try {
      const n = await pendingCount(db);
      setState((s) => ({ ...s, pending: n }));
    } catch {}
  }, [db]);

  // Trigger theo dõi thay đổi phải có trước khi bất kỳ màn nào ghi dữ liệu học
  useEffect(() => {
    tracked.current = ensureSyncTracking(db).then(refreshPending, (e: any) => {
      // Không tạo được trigger thì thay đổi học không vào hàng đợi: báo lỗi chứ không im lặng
      console.warn("ensureSyncTracking", e);
      setState((s) => ({ ...s, status: "error", error: "Không bật được theo dõi đồng bộ" }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, [db]);

  const syncNow = useCallback(async () => {
    if (!token) return;
    if (running.current) {
      again.current = true;
      return;
    }
    running.current = true;
    again.current = false;
    try {
      await tracked.current;
      const net = await NetInfo.fetch();
      if (!net.isConnected) {
        setState((s) => ({ ...s, status: "offline" }));
        return;
      }
      setState((s) => ({ ...s, status: "syncing", error: null }));
      let report = await runSync(db, syncApi, accountId);
      // Đủ lượt ôn mới thì nhờ server tối ưu tham số FSRS riêng; có tham số mới thì kéo về ngay
      if (await maybeOptimizeFsrs(db, optimizeFsrs).catch(() => false)) {
        const again = await runSync(db, syncApi, accountId);
        report = { ...again, changed: again.changed || report.changed };
      }
      setState((s) => ({ ...s, status: "idle", lastSyncedAt: Date.now(), lastReport: report }));
      if (report.changed) queryClient.invalidateQueries();
    } catch (e: any) {
      setState((s) => ({ ...s, status: e?.response ? "error" : "offline", error: e?.response?.data?.detail ?? e?.message ?? "Không đồng bộ được" }));
    } finally {
      running.current = false;
      refreshPending();
      if (again.current) setTimeout(syncNow, 500);
    }
  }, [db, token, accountId, queryClient, refreshPending]);

  // Có tài khoản (device-login xong) thì đồng bộ ngay
  useEffect(() => {
    if (token) syncNow();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, [token, accountId]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const offRequest = onSyncRequest(() => {
      refreshPending();
      if (timer) clearTimeout(timer);
      timer = setTimeout(syncNow, DEBOUNCE_MS);
    });
    const offNet = NetInfo.addEventListener((s) => s.isConnected && syncNow());
    const offApp = AppState.addEventListener("change", (s) => s === "active" && syncNow());
    const interval = setInterval(syncNow, PERIODIC_MS);
    return () => {
      offRequest();
      offNet();
      offApp.remove();
      clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [syncNow, refreshPending]);

  const value = useMemo(() => ({ ...state, syncNow }), [state, syncNow]);
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};
