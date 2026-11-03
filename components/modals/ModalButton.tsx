import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { ActivityIndicator, Pressable } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  /** true: chiếm đều chiều ngang (cặp nút Huỷ / OK). */
  flex?: boolean;
};

/** Nút dùng chung cho mọi modal: cao 48, bo 14, màu theo theme. */
const ModalButton = ({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  flex = true,
}: Props) => {
  const { theme } = useTheme();
  const filled = variant !== "ghost";
  const bg =
    variant === "danger" ? theme.error : variant === "primary" ? theme.primary : theme.card;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      android_ripple={{ color: "#00000014" }}
      className="h-12 rounded-2xl items-center justify-center px-5"
      style={{ backgroundColor: bg, opacity: disabled ? 0.5 : 1, flex: flex ? 1 : undefined }}
    >
      {loading ? (
        <ActivityIndicator color={filled ? "white" : theme.text} />
      ) : (
        <AppText font="MulishBold" color={filled ? "white" : "subText1"}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
};

export default ModalButton;
