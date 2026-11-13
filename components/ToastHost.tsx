import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import useModalStore from "@/stores/modalStore";
import useToastStore, { ToastType } from "@/stores/toastStore";
import { useEffect } from "react";
import { Pressable, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICON: Record<ToastType, "check-circle" | "alert-circle" | "info" | "alert-triangle"> = {
  success: "check-circle",
  error: "alert-circle",
  info: "info",
  warning: "alert-triangle",
};

type Props = {
  /** Bản đặt trong modal: cửa sổ modal của RN nằm trên mọi thứ khác nên cần một host riêng bên trong. */
  inModal?: boolean;
};

/**
 * Vẽ toast hiện tại ở đầu màn hình: tự đóng sau `duration`, chạm để đóng, không chặn chạm xuống nội dung bên dưới.
 * Gắn 1 bản ở gốc ứng dụng (app/_layout) và 1 bản trong ModalWrapper.
 */
export default function ToastHost({ inModal }: Props) {
  const toast = useToastStore((s) => s.toast);
  const hide = useToastStore((s) => s.hide);
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const modalOpen = useModalStore((s) => !!s.currentModal);

  useEffect(() => {
    if (!toast) return;
    const id = toast.id;
    const timer = setTimeout(() => hide(id), toast.duration);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- cố ý: chỉ chạy lại khi phụ thuộc liệt kê đổi (hàm / đối tượng còn lại đổi mỗi lần render hoặc đã ổn định)
  }, [toast?.id]);

  // Cửa sổ modal nằm trên mọi thứ: khi có modal chỉ bản trong modal vẽ, không thì chỉ bản ở gốc vẽ (tránh vẽ đôi)
  const visible = !!toast && (inModal ? modalOpen : !modalOpen);

  const color = toast ? { success: theme.success, error: theme.error, info: theme.primary, warning: theme.warning }[toast.type] : theme.primary;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: inModal ? 8 : insets.top + 8,
        left: inModal ? -12 : 0,
        right: inModal ? -12 : 0,
        alignItems: "center",
        zIndex: 9999,
        elevation: 9999,
      }}
    >
      {toast && visible && (
        <Animated.View key={toast.id} entering={FadeInUp.duration(180)} exiting={FadeOutUp.duration(160)} style={{ maxWidth: "92%" }}>
          <Pressable
            onPress={() => hide(toast.id)}
            className="flex-row items-center gap-2.5 rounded-2xl px-4 py-3"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: color + "55",
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}
          >
            <AppIcon branch="feather" name={ICON[toast.type]} size={20} color={color} />
            <AppText className="shrink" font="MulishSemiBold" color="text" numberOfLines={3}>
              {toast.text}
            </AppText>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
