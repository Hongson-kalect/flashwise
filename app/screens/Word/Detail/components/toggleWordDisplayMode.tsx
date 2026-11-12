import AppIcon from "@/components/AppIcon";
import { useTheme } from "@/providers/Theme";
import { useAppStore } from "@/stores/appStore";
import { Pressable } from "react-native";

/**
 * Nút bật / tắt hiển thị bản dịch (show_translation) trên trang từ, không đổi ngôn ngữ của trang:
 * bật = nền màu chính, biểu tượng dịch trắng; tắt = nền nhạt, biểu tượng xám. Đổi ngôn ngữ ở Cá nhân → Ngôn ngữ.
 */
const ToggleWordDisplayMode = () => {
  const { settings, dbService, updateSetting } = useAppStore();
  const { theme } = useTheme();
  const on = !!settings?.show_translation;

  const toggle = () => {
    dbService?.setShowTranslation(!on);
    updateSetting({ show_translation: !on });
  };

  return (
    <Pressable
      onPress={toggle}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      accessibilityLabel="Hiện bản dịch"
      className="items-center justify-center"
      style={{
        height: 36,
        width: 36,
        borderRadius: 10,
        backgroundColor: on ? theme.primary : theme.card,
        borderWidth: 1,
        borderColor: on ? theme.primary : theme.border,
      }}
    >
      <AppIcon branch="mui" name="translate" size={20} color={on ? "white" : "subText2"} />
    </Pressable>
  );
};

export default ToggleWordDisplayMode;
