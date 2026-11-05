import AppIcon from "@/components/AppIcon";
import AppText from "@/components/AppText";
import { useBottomSheet } from "@/providers/BottomSheet";
import { useTheme } from "@/providers/Theme";
import { setCollectionCover } from "@/services/api/collections";
import { uploadErrorKind, uploadImage } from "@/services/media";
import { pickImage } from "@/utils/pickImage";
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

type Props = {
  userCollectionId: string;
  hasOwnCover: boolean;
  /** Server đã nhận ảnh bìa mới (null = về ảnh tự động). Màn chi tiết ghi vào SQLite và làm mới: sheet nằm ngoài SQLiteProvider nên không tự làm. */
  onApplied: (image: string | null) => Promise<void>;
};

const ERROR_TEXT = {
  quota: "Hôm nay bạn đã tải lên đủ số ảnh cho phép.",
  too_large: "Ảnh quá lớn, chọn ảnh khác.",
  invalid: "Không dùng được ảnh này, chọn ảnh khác.",
  offline: "Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.",
  unknown: "Có lỗi xảy ra, thử lại sau.",
} as const;

const Option = ({ icon, label, hint, onPress, disabled }: { icon: any; label: string; hint?: string; onPress: () => void; disabled?: boolean }) => {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="flex-row items-center gap-3 p-3 rounded-2xl"
      style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, opacity: disabled ? 0.5 : 1 }}
    >
      <View className="h-10 w-10 rounded-full items-center justify-center" style={{ backgroundColor: theme.primary + "14" }}>
        <AppIcon branch="feather" name={icon} size={18} color={theme.primary} />
      </View>
      <View className="flex-1">
        <AppText weight="bold" color="title">
          {label}
        </AppText>
        {hint ? (
          <AppText size="xs" color="subText2">
            {hint}
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
};

/** Đổi ảnh bìa bộ: chọn từ thư viện (tải lên server) hoặc quay về ảnh tự động (lấy từ nghĩa trong bộ). */
const CoverSheet = ({ userCollectionId, hasOwnCover, onApplied }: Props) => {
  const { close } = useBottomSheet();
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = async (image: string) => {
    const saved = await setCollectionCover(userCollectionId, image);
    await onApplied(saved);
    close();
  };

  const run = async (job: () => Promise<void>) => {
    setError(null);
    setBusy(true);
    try {
      await job();
    } catch (e: any) {
      const status = e?.response?.status;
      setError(status === 403 || status === 409 ? "Bạn không đổi được ảnh bìa của bộ này." : ERROR_TEXT[uploadErrorKind(e)]);
    } finally {
      setBusy(false);
    }
  };

  const fromLibrary = () =>
    run(async () => {
      const picked = await pickImage([16, 9]);
      if (!picked?.uri) return; // người dùng huỷ
      const media = await uploadImage(picked.uri);
      await apply(media.key);
    });

  return (
    <View className="gap-3 pb-6">
      <Option icon="image" label="Chọn từ thư viện" hint="Ảnh được tải lên và nén gọn" onPress={fromLibrary} disabled={busy} />
      {hasOwnCover ? (
        <Option
          icon="refresh-cw"
          label="Dùng ảnh tự động"
          hint="Lấy ảnh từ các nghĩa trong bộ"
          onPress={() => run(() => apply(""))}
          disabled={busy}
        />
      ) : null}
      {busy ? (
        <View className="flex-row items-center gap-2 justify-center pt-1">
          <ActivityIndicator size="small" color={theme.primary} />
          <AppText size="sm" color="subText2">
            Đang xử lý...
          </AppText>
        </View>
      ) : null}
      {error ? (
        <AppText size="sm" style={{ color: theme.error }} textAlign="center">
          {error}
        </AppText>
      ) : null}
    </View>
  );
};

export default CoverSheet;
