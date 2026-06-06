import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { isColorDark } from "@/utils/color";
import { wordSocket } from "@/utils/socket";
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
  const { bootstrapAppData, isLoadingData, userProfile } = useAppStore();

  useEffect(() => {
    if (db) {
      const success = bootstrapAppData(db);
      if (!success) {
        router.replace("/screens/Start/screen");
      }
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
