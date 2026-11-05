import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { Pressable, View } from "react-native";

type Props = {
  /** 0..1 */
  progress: number;
  onClose: () => void;
  /** Chữ nhỏ bên phải thanh tiến độ, vd "3 / 12". */
  label?: string;
};

/** Đầu màn học: nút thoát + thanh tiến độ của phiên. */
const SessionHeader = ({ progress, onClose, label }: Props) => {
  const { theme } = useTheme();
  return (
    <View className="flex-row items-center gap-3 px-4 h-14">
      <Pressable
        onPress={onClose}
        hitSlop={10}
        className="h-10 w-10 rounded-full items-center justify-center"
        style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
        accessibilityLabel="Thoát phiên học"
      >
        <AppIcon branch="feather" name="x" size={20} color={theme.text} />
      </Pressable>
      <View className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: theme.background2 }}>
        <View style={{ width: `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`, height: "100%", backgroundColor: theme.primary, borderRadius: 999 }} />
      </View>
      {!!label && (
        <AppText size="xs" weight="semibold" color="subText2">
          {label}
        </AppText>
      )}
    </View>
  );
};

export default SessionHeader;
