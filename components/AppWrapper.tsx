import { useHabitCheck } from "@/hooks/useHabitCheck";
import { useReminderSync } from "@/hooks/useReminderSync";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { isColorDark } from "@/utils/color";
import { wordSocket } from "@/utils/socket";
import { fetchAppConfig, ensureSession, isVersionLower } from "@/services/auth";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useMemo } from "react";
import { Platform, StatusBar, View } from "react-native";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const barStyle = useMemo(() => {
    if (isColorDark(theme.background)) return "light-content";
    return "dark-content";
  }, [theme]);

  const db = useSQLiteContext();
  const insets = useSafeAreaInsets(); // iOS: tai thỏ / Dynamic Island, không cố định 40
  const bootstrapAppData = useAppStore((s) => s.bootstrapAppData);
  const setServerConfig = useAppStore((s) => s.setServerConfig);
  useHabitCheck();
  useReminderSync();

  useEffect(() => {
    let offNet: (() => void) | null = null;
    if (db) {
      // Không chặn học offline: lỗi mạng thì bỏ qua và thử lại khi có mạng (không thì không có token tới lần mở sau).
      let connecting = false;
      const connectServer = async (): Promise<boolean> => {
        if (connecting) return false;
        connecting = true;
        try {
          const [session, cfg] = await Promise.allSettled([ensureSession(), fetchAppConfig()]);
          if (cfg.status === "fulfilled") {
            setServerConfig({
              mediaBaseUrl: cfg.value.media_base_url ?? "",
              forceUpdate: isVersionLower(
                Constants.expoConfig?.version ?? "1.0.0",
                cfg.value.min_version || "0",
              ),
            });
          }
          if (session.status === "fulfilled" && session.value === "login_required") {
            // Máy đã gắn tài khoản thật: phải đăng nhập lại.
            router.push("/screens/Login/screen");
          }
          return cfg.status === "fulfilled" && session.status === "fulfilled" && session.value !== "offline";
        } finally {
          connecting = false;
        }
      };
      (async () => {
        const success = await bootstrapAppData(db);
        if (!success) router.replace("/screens/Start/screen");
        if (await connectServer()) return;
        offNet = NetInfo.addEventListener(async (s) => {
          if (s.isConnected && (await connectServer())) {
            offNet?.();
            offNet = null;
          }
        });
      })();
    }

    wordSocket.connect();

    return () => {
      offNet?.();
      wordSocket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, [db]);

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      {/* View giả lập vùng status bar */}
      <View
        style={{
          height: Platform.OS === "android" ? StatusBar.currentHeight : insets.top,
          backgroundColor: "transparent",
        }}
      />
      <StatusBar
        translucent
        backgroundColor={"transparent"}
        barStyle={barStyle}
      />
      {children}
    </View>
  );
};
