import { darkTheme, lightTheme, Theme } from "@/configs/theme";
import { useAppStore } from "@/stores/appStore";
import { configureUI, ThemeMode, UIThemeProvider, useUITheme } from "@/ui";
import React, { useEffect, useMemo } from "react";
import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
} from "react-native-paper";

export type { ThemeMode };

interface ThemeContextProps {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  /** Đổi chế độ sáng / tối / theo hệ thống; lưu vào user_settings.theme. */
  setMode: (mode: ThemeMode) => void;
  /** Tương thích code cũ: setTheme("light" | "dark"). */
  setTheme: (mode: "light" | "dark") => void;
}

const persistMode = (mode: ThemeMode) => {
  const { updateSetting, dbService } = useAppStore.getState();
  updateSetting({ theme: mode });
  dbService?.setSetting("theme", mode);
};

/**
 * Lớp mỏng nối UI kit (ui/) với app này: đọc chế độ từ setting `theme`, lưu lại khi đổi,
 * và đồng bộ thêm cho Paper + code cũ còn đọc themeObj.color_palette.
 * Mặc định là SÁNG; "dark" / "system" chỉ khi người dùng chọn.
 */
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const stored = useAppStore((s) => s.settings?.theme) as ThemeMode | undefined;
  const mode: ThemeMode =
    stored === "dark" || stored === "system" ? stored : "light";

  return (
    <UIThemeProvider
      light={lightTheme}
      dark={darkTheme}
      mode={mode}
      onModeChange={persistMode}
    >
      <AppThemeBridge>{children}</AppThemeBridge>
    </UIThemeProvider>
  );
};

const AppThemeBridge = ({ children }: { children: React.ReactNode }) => {
  const { theme, isDark } = useUITheme<Theme>();
  // Cài đặt "Rung khi chạm" (user_settings.haptics, mặc định bật) áp cho cả kit
  const haptics = useAppStore((s) => s.settings?.haptics);
  useEffect(() => {
    configureUI({ haptics: haptics !== false });
  }, [haptics]);

  useEffect(() => {
    // Cầu nối cho code cũ còn đọc useAppStore().themeObj.color_palette
    useAppStore.setState((s) => ({
      themeObj: s.themeObj ? { ...s.themeObj, color_palette: theme } : s.themeObj,
    }));
  }, [theme]);

  // Paper (Divider, Card, ...) dùng cùng bảng màu
  const paperTheme = useMemo(() => {
    const base = isDark ? MD3DarkTheme : MD3LightTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.primary,
        background: theme.background,
        surface: theme.card,
        onSurface: theme.text,
        outline: theme.border,
        secondaryContainer: theme.tertiary,
      },
    };
  }, [isDark, theme]);

  return <PaperProvider theme={paperTheme}>{children}</PaperProvider>;
};

export const useTheme = (): ThemeContextProps => {
  const ctx = useUITheme<Theme>();
  return {
    ...ctx,
    setTheme: (m) => ctx.setMode(m),
  };
};
