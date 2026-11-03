import { colorScheme, vars } from "nativewind";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useColorScheme, View } from "react-native";
import { themeToCssVars, UITheme } from "../tokens";

export type ThemeMode = "system" | "light" | "dark";

export type UIThemeContext<T extends UITheme = UITheme> = {
  theme: T;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
};

const Ctx = createContext<UIThemeContext | undefined>(undefined);

type Props<T extends UITheme> = {
  light: T;
  dark: T;
  /** Chế độ hiện tại (controlled): app đọc từ store / setting của mình. */
  mode: ThemeMode;
  /** Gọi khi code đổi chế độ (setMode): app lưu vào store / DB. */
  onModeChange?: (mode: ThemeMode) => void;
  children: React.ReactNode;
};

/**
 * Chọn bảng màu sáng / tối, đổ vào biến CSS (--c-*) cho class Tailwind, và cấp useUITheme().
 * Không biết gì về store hay DB của app: chế độ đi vào qua props `mode`.
 */
export function UIThemeProvider<T extends UITheme>({
  light,
  dark,
  mode,
  onModeChange,
  children,
}: Props<T>) {
  const system = useColorScheme();
  const isDark = mode === "dark" || (mode === "system" && system === "dark");
  const theme = isDark ? dark : light;
  const cssVars = useMemo(() => vars(themeToCssVars(theme)), [theme]);

  useEffect(() => {
    // "system" trả quyền cho hệ điều hành (nếu ép light/dark mãi thì useColorScheme không đổi theo máy)
    colorScheme.set(mode);
  }, [mode]);

  const setMode = useCallback(
    (next: ThemeMode) => onModeChange?.(next),
    [onModeChange],
  );
  const value = useMemo(
    () => ({ theme, mode, isDark, setMode }),
    [theme, mode, isDark, setMode],
  );

  return (
    <Ctx.Provider value={value}>
      <View style={[{ flex: 1, backgroundColor: theme.background }, cssVars]}>
        {children}
      </View>
    </Ctx.Provider>
  );
}

export const useUITheme = <T extends UITheme = UITheme>() => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUITheme phải nằm trong <UIThemeProvider>");
  return ctx as unknown as UIThemeContext<T>;
};
