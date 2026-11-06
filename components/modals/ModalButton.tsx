import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { useGuardedPress } from "@/hooks/useGuardedPress";
import { ActivityIndicator, Pressable } from "react-native";

type Props = {
  label: string;
  /** Trả Promise thì nút khoá + hiện vòng xoay tới khi xong (chống bấm nhiều lần). */
  onPress: () => void | Promise<void>;
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
  const { press, busy } = useGuardedPress(onPress, 400);
  const isLoading = loading || busy;
  const filled = variant !== "ghost";
  const bg =
    variant === "danger" ? theme.error : variant === "primary" ? theme.primary : theme.card;

  return (
    <Pressable
      disabled={disabled || isLoading}
      onPress={() => press()}
      android_ripple={{ color: "#00000014" }}
      className="h-12 rounded-2xl items-center justify-center px-5"
      style={{ backgroundColor: bg, opacity: disabled ? 0.5 : 1, flex: flex ? 1 : undefined }}
    >
      {isLoading ? (
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
