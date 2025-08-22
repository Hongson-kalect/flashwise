import { useTheme } from "@/providers/Theme";
import { isColorDark } from "@/utils/color";
import { useMemo } from "react";
import { Platform, StatusBar, View } from "react-native";

export const AppWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  const barStyle = useMemo(() => {
    if (isColorDark(theme.background)) return "light-content";
    return "dark-content";
  }, [theme]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* View giả lập vùng status bar */}
      <View
        style={{
          height: Platform.OS === "android" ? StatusBar.currentHeight : 40,
          backgroundColor: theme.background,
        }}
      />
      <StatusBar
        translucent
        backgroundColor={theme.background}
        barStyle={barStyle}
      />
      {children}
    </View>
  );
};
