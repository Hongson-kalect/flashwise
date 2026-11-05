import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useSync } from "@/providers/Sync";
import { useTheme } from "@/providers/Theme";
import { ActivityIndicator, Pressable, View } from "react-native";

const timeText = (ms: number) => new Date(ms).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

/** Thẻ trạng thái đồng bộ: đang gửi / đã đồng bộ lúc... / còn N thay đổi chưa gửi / offline / lỗi, kèm nút "Đồng bộ ngay". */
const SyncStatus = () => {
  const { theme } = useTheme();
  const { status, pending, lastSyncedAt, error, lastReport, syncNow } = useSync();
  const rejected = lastReport?.rejected.length ?? 0;
  const tone = status === "error" ? theme.error : status === "offline" || pending > 0 ? theme.warning : theme.success;
  const title =
    status === "syncing" ? "Đang đồng bộ..." : status === "offline" ? "Chưa có mạng" : status === "error" ? "Chưa đồng bộ được" : pending > 0 ? `${pending} thay đổi chưa gửi` : "Đã đồng bộ";
  const detail =
    status === "error" ? error : lastSyncedAt ? `Lần gần nhất ${timeText(lastSyncedAt)}${lastReport?.pulled ? ` · kéo về ${lastReport.pulled} mục` : ""}` : "Tiến độ học lưu trên máy, tự gửi lên khi có mạng.";

  return (
    <View className="flex-row items-center gap-3 p-3 rounded-2xl" style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}>
      <View className="h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: tone + "1F" }}>
        {status === "syncing" ? <ActivityIndicator size="small" color={tone} /> : <AppIcon branch="feather" name={status === "offline" ? "wifi-off" : status === "error" ? "alert-circle" : "cloud"} size={18} color={tone} />}
      </View>
      <View className="flex-1">
        <AppText weight="bold" color="title">
          {title}
        </AppText>
        {!!detail && (
          <AppText size="xs" color="subText2" numberOfLines={2}>
            {detail}
          </AppText>
        )}
        {rejected > 0 && (
          <AppText size="xs" style={{ color: theme.warning }}>
            {rejected} mục bị server từ chối
          </AppText>
        )}
      </View>
      <Pressable onPress={syncNow} disabled={status === "syncing"} className="px-3 h-9 rounded-full items-center justify-center" style={{ backgroundColor: theme.primary + "14", opacity: status === "syncing" ? 0.5 : 1 }}>
        <AppText size="sm" weight="bold" color="primary">
          Đồng bộ
        </AppText>
      </Pressable>
    </View>
  );
};

export default SyncStatus;
