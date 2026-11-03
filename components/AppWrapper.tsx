import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { isColorDark } from "@/utils/color";
import { wordSocket } from "@/utils/socket";
import { fetchAppConfig, ensureSession, isVersionLower } from "@/services/auth";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useEffect, useMemo } from "react";
import { Platform, StatusBar, View } from "react-native";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const barStyle = useMemo(() => {
    if (isColorDark(theme.background)) return "light-content";
    return "dark-content";
  }, [theme]);

  const db = useSQLiteContext();
  const { bootstrapAppData, setServerConfig } = useAppStore();

  useEffect(() => {
    if (db) {
      (async () => {
        const success = await bootstrapAppData(db);
        if (!success) router.replace("/screens/Start/screen");

        // Không chặn học offline: lỗi mạng thì bỏ qua, lần sau thử lại.
        const [session, cfg] = await Promise.allSettled([
          ensureSession(),
          fetchAppConfig(),
        ]);
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
      })();
    }

    wordSocket.connect();

    return () => {
      wordSocket.disconnect();
    };
  }, [db]);

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      {/* View giả lập vùng status bar */}
      <View
        style={{
          height: Platform.OS === "android" ? StatusBar.currentHeight : 40,
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
