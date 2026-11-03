// Cửa vào duy nhất của UI kit: import { Text, Button, Skeleton, ... } from "@/ui";
export { configureUI, uiConfig } from "./config";
export type { FontWeightKey, UIConfig } from "./config";
export { cssVarName, themeToCssVars, TOKEN_KEYS } from "./tokens";
export type { TokenKey, UITheme } from "./tokens";
export { Opacity, TextSize, TextWeight } from "./typography";
export type { OpacityKey, TextSizeKey } from "./typography";
export { UIThemeProvider, useUITheme } from "./theme/ThemeProvider";
export type { ThemeMode, UIThemeContext } from "./theme/ThemeProvider";
export { haptic } from "./feedback";
export type { HapticKind } from "./feedback";

export { default as Button } from "./components/Button";
export { default as Card } from "./components/Card";
export { default as Chip } from "./components/Chip";
export { default as Divider } from "./components/Divider";
export { default as ProgressRing } from "./components/ProgressRing";
export { default as SectionTitle } from "./components/SectionTitle";
export { Skeleton, SkeletonCircle, SkeletonText } from "./components/Skeleton";
export { default as Surface } from "./components/Surface";
export { default as Text } from "./components/Text";
export type { UITextProps } from "./components/Text";

export { useDebounce } from "./hooks/useDebounce";
export { useSwitchFade } from "./hooks/useSwitchFade";
