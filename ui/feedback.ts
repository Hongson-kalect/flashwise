import * as Haptics from "expo-haptics";
import { uiConfig } from "./config";

export type HapticKind =
  | "light"
  | "medium"
  | "heavy"
  | "selection"
  | "success"
  | "warning"
  | "error";

/** Rung phản hồi, tôn trọng configureUI({ haptics }). Lỗi (máy không hỗ trợ) bị bỏ qua. */
export const haptic = (kind: HapticKind = "light") => {
  if (!uiConfig.haptics) return;
  const run = () => {
    switch (kind) {
      case "light":
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case "medium":
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case "heavy":
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      case "selection":
        return Haptics.selectionAsync();
      case "success":
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      case "warning":
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      case "error":
        return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };
  Promise.resolve(run()).catch(() => {});
};
