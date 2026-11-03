import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useTheme } from "@/providers/Theme";
import { WordError, WordState } from "../../type";
import { ActivityIndicator, Pressable, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

const ERROR_TEXT: Record<WordError["code"], { title: string; hint: string }> = {
  rejected: {
    title: "Không thêm được mục này",
    hint: "Từ điển chỉ nhận từ, cụm từ, thành ngữ và tục ngữ có thật. Câu bất kỳ, từ sai chính tả hoặc không có nghĩa sẽ bị từ chối. Kiểm tra lại rồi thử lại.",
  },
  throttled: {
    title: "Bạn tra từ mới hơi nhiều",
    hint: "Mỗi giờ chỉ tạo được một số từ mới. Thử lại sau ít phút.",
  },
  failed: {
    title: "Tạo từ chưa thành công",
    hint: "Gặp lỗi khi tạo từ này.",
  },
  unavailable: {
    title: "Máy chủ đang bận",
    hint: "Hàng đợi tạo từ tạm thời không nhận thêm. Thử lại sau.",
  },
  offline: {
    title: "Không có kết nối",
    hint: "Kiểm tra mạng rồi thử lại.",
  },
};

/**
 * Trạng thái tra từ: lỗi có nút thử lại, hoặc "đang khởi tạo" (chỉ khi từ chưa có trong máy; từ đã lưu hiện ngay, làm mới nền thì không báo).
 */
const WordStatus = ({
  state,
  hadLocal,
  onRetry,
}: {
  state: WordState;
  hadLocal: boolean;
  onRetry: () => void;
}) => {
  const { theme } = useTheme();

  if (state.error) {
    const t = ERROR_TEXT[state.error.code];
    return (
      <Animated.View
        entering={FadeIn}
        className="mx-3 mt-2 p-4 rounded-2xl"
        style={{ backgroundColor: theme.error + "14" }}
      >
        <View className="flex-row items-center gap-2">
          <AppIcon branch="feather" name="alert-circle" size={18} color={theme.error} />
          <AppText font="MulishBold" color="error">
            {t.title}
          </AppText>
        </View>
        <AppText size="sm" color="subText1" style={{ marginTop: 4 }}>
          {state.error.message || t.hint}
          {state.error.retryAfter ? ` (thử lại sau ${state.error.retryAfter}s)` : ""}
        </AppText>
        {state.error.code !== "rejected" && (
          <Pressable
            onPress={onRetry}
            className="self-start mt-3 px-4 py-2 rounded-xl"
            style={{ backgroundColor: theme.primary }}
          >
            <AppText color="white" size="sm" font="MulishBold">
              Thử lại
            </AppText>
          </Pressable>
        )}
      </Animated.View>
    );
  }

  if (!state.isLoading || hadLocal) return null;

  return (
    <Animated.View
      entering={FadeIn}
      className="mx-3 mt-2 px-4 py-3 rounded-2xl flex-row items-center gap-3"
      style={{ backgroundColor: theme.tertiary + "66" }}
    >
      <ActivityIndicator size="small" color={theme.primary} />
      <View className="flex-1">
        <AppText size="sm" font="MulishSemiBold" color="primary">
          Từ đang được khởi tạo…
        </AppText>
      </View>
    </Animated.View>
  );
};

export default WordStatus;
